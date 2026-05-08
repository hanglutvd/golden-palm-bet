import { z } from "zod";
import { createRouter, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { movies, users, diaries, holdings, transactions } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { openMarketForAll, findAllMovies } from "./queries/movies.js";
import { getBeijingDateStr } from "../contracts/market.js";

export const adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const totalUsers = await db.select().from(users);
    const totalMovies = await db.select().from(movies);
    const totalDiaries = await db.select().from(diaries);
    return {
      userCount: totalUsers.length,
      movieCount: totalMovies.length,
      diaryCount: totalDiaries.length,
    };
  }),

  // User management
  users: adminQuery.query(async () => {
    const all = await getDb().query.users.findMany({
      orderBy: desc(users.createdAt),
    });
    return all.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      balance: Number(u.balance),
      role: u.role,
      createdAt: u.createdAt,
    }));
  }),

  setAdmin: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  // Movie management
  createMovie: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        director: z.string().min(1).max(100),
        premiereDate: z.string().max(50).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(movies)
        .values({
          name: input.name,
          director: input.director,
          currentPrice: "100.00",
          basePrice: "100.00",
          totalVolume: "0",
          dailyNetVolume: 0,
          lastOpenDate: "",
          premiereDate: input.premiereDate || null,
        })
        .returning({ id: movies.id });
      return { id: result[0].id, ...input };
    }),

  deleteMovie: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(movies).where(eq(movies.id, input.id));
      return { success: true };
    }),

  updateMoviePrice: adminQuery
    .input(z.object({ id: z.number(), price: z.number().positive() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(movies)
        .set({ currentPrice: String(input.price.toFixed(2)) })
        .where(eq(movies.id, input.id));
      return { success: true };
    }),

  updateMoviePremiere: adminQuery
    .input(z.object({ id: z.number(), premiereDate: z.string().max(50).optional() }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(movies)
        .set({ premiereDate: input.premiereDate || null })
        .where(eq(movies.id, input.id));
      return { success: true };
    }),

  // Award management - set winners and distribute dividends
  setWinners: adminQuery
    .input(
      z.object({
        winners: z.array(
          z.object({
            awardName: z.string(),
            movieIds: z.array(z.number()),
            dividend: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const results = [];

      for (const w of input.winners) {
        let totalHoldersPaid = 0;
        const paidUserIds = new Set<number>();

        for (const movieId of w.movieIds) {
          const movieHolders = await db.query.holdings.findMany({
            where: eq(holdings.movieId, movieId),
          });

          for (const h of movieHolders) {
            const dividend = w.dividend * h.quantity;
            const user = await db.query.users.findFirst({
              where: eq(users.id, h.userId),
            });
            if (user) {
              await db
                .update(users)
                .set({
                  balance: String((Number(user.balance) + dividend).toFixed(2)),
                })
                .where(eq(users.id, h.userId));
              paidUserIds.add(user.id);
            }
          }

          totalHoldersPaid += movieHolders.length;
        }

        results.push({
          award: w.awardName,
          movieIds: w.movieIds,
          dividend: w.dividend,
          holdersPaid: totalHoldersPaid,
          uniqueUsersPaid: paidUserIds.size,
        });
      }

      return { success: true, results };
    }),

  // Diary management
  createDiary: adminQuery
    .input(
      z.object({
        title: z.string().min(1).max(200),
        summary: z.string().max(500).optional(),
        coverImage: z.string().max(500).optional(),
        coverImage2: z.string().max(500).optional(),
        coverImage3: z.string().max(500).optional(),
        externalUrl: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await getDb()
        .insert(diaries)
        .values({
          title: input.title,
          summary: input.summary || null,
          coverImage: input.coverImage || null,
          coverImage2: input.coverImage2 || null,
          coverImage3: input.coverImage3 || null,
          externalUrl: input.externalUrl || null,
        })
        .returning({ id: diaries.id });
      return { id: result[0].id };
    }),

  deleteDiary: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await getDb().delete(diaries).where(eq(diaries.id, input.id));
      return { success: true };
    }),

  // Reset all data for a new round (beta test reset)
  resetPrices: adminQuery.mutation(async () => {
    const db = getDb();

    // 1. Reset all movie prices to 100, clear volumes
    const allMovies = await db.select().from(movies);
    const today = getBeijingDateStr();
    for (const m of allMovies) {
      await db
        .update(movies)
        .set({
          currentPrice: "100.00",
          basePrice: "100.00",
          totalVolume: "0",
          dailyNetVolume: 0,
          lastOpenDate: today,
        })
        .where(eq(movies.id, m.id));
    }

    // 2. Clear all user holdings
    await db.delete(holdings);

    // 3. Clear all transaction records
    await db.delete(transactions);

    // 4. Reset all user balances to 3000
    await db
      .update(users)
      .set({ balance: "3000.00" });

    return { success: true, resetCount: allMovies.length };
  }),

  // Force settlement immediately (admin only) - for testing / fixing basePrice
  forceSettlement: adminQuery
    .input(z.object({ session: z.enum(["am", "pm"]).optional() }))
    .mutation(async ({ input }) => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const beijing = new Date(utc + 8 * 3600000);
      const session = input.session || (beijing.getHours() < 15 ? "am" : "pm");

      const before = await findAllMovies();
      await openMarketForAll(session, true); // force=true: always settle even if already settled
      const after = await findAllMovies();

      return {
        success: true,
        message: `已强制结算（session=${session}）`,
        diagnostics: after.map((m, i) => ({
          name: m.name,
          currentPrice: Number(m.currentPrice),
          basePrice: Number(m.basePrice),
          changePercent: Number((((Number(m.currentPrice) - Number(m.basePrice)) / Number(m.basePrice)) * 100).toFixed(2)),
          dailyNetVolume: m.dailyNetVolume,
          lastOpenDate: m.lastOpenDate,
        })),
      };
    }),
});
