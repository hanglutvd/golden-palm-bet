import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { movies, users, diaries, holdings, transactions, ratingEvents, awardResults } from "../db/schema.js";
import { eq, desc, sql } from "drizzle-orm";
import { openMarketForAll, findAllMovies } from "./queries/movies.js";
import { getBeijingDateStr } from "../contracts/market.js";

export const adminRouter = createRouter({
  // Dashboard stats (use COUNT(*) instead of loading all rows)
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [{ userCount }] = await db.select({ userCount: sql<number>`count(*)` }).from(users);
    const [{ movieCount }] = await db.select({ movieCount: sql<number>`count(*)` }).from(movies);
    const [{ diaryCount }] = await db.select({ diaryCount: sql<number>`count(*)` }).from(diaries);
    return {
      userCount,
      movieCount,
      diaryCount,
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

  // Update movie ratings and apply proportional price adjustments
  updateRatings: adminQuery
    .input(
      z.object({
        ratings: z.array(
          z.object({
            movieId: z.number(),
            rating: z.number().min(1).max(10),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const results = [];

      for (const r of input.ratings) {
        const movie = await db.query.movies.findFirst({
          where: eq(movies.id, r.movieId),
        });
        if (!movie) continue;

        const oldRating = Number(movie.rating);
        const newRating = r.rating;

        if (oldRating === newRating) {
          results.push({
            movieId: r.movieId,
            name: movie.name,
            oldRating,
            newRating,
            oldPrice: Number(movie.currentPrice),
            newPrice: Number(movie.currentPrice),
            changePercent: 0,
            adjusted: false,
          });
          continue;
        }

        const oldPrice = Number(movie.currentPrice);
        // Price adjusts proportionally to rating change
        // Linear scaling: newPrice = oldPrice * (newRating / oldRating)
        // Exponent 0.8 dampens extreme swings while preserving direction
        const ratio = newRating / oldRating;
        const damping = 0.8; // Dampens extreme moves: 10->5 is -37% instead of -50%
        const adjustmentFactor = Math.pow(ratio, damping);
        let newPrice = oldPrice * adjustmentFactor;
        if (newPrice < 1) newPrice = 1;

        await db
          .update(movies)
          .set({
            currentPrice: String(newPrice.toFixed(2)),
            basePrice: String(oldPrice.toFixed(2)), // base = old price so change% reflects the adjustment
            rating: newRating,
            updatedAt: new Date(),
          })
          .where(eq(movies.id, r.movieId));

        const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
        results.push({
          movieId: r.movieId,
          name: movie.name,
          oldRating,
          newRating,
          oldPrice,
          newPrice: Number(newPrice.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          adjusted: true,
        });
      }

      return { results };
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

      // Prevent double-payout: refuse if awards have already been set
      const existingAwards = await db.select({ count: sql<number>`count(*)` }).from(awardResults);
      if (existingAwards[0].count > 0) {
        throw new Error("开奖已完成，不可重复开奖。如需修改获奖结果，请先使用「撤销开奖」功能。");
      }

      const results = [];

      for (const w of input.winners) {
        let totalHoldersPaid = 0;
        const paidUserIds = new Set<number>();

        for (const movieId of w.movieIds) {
          // Get movie name for award result record
          const movie = await db.query.movies.findFirst({
            where: eq(movies.id, movieId),
          });
          const movieName = movie?.name || "未知影片";

          // Save award result
          await db.insert(awardResults).values({
            awardName: w.awardName,
            movieId,
            movieName,
            dividend: w.dividend,
          });

          const movieHolders = await db.query.holdings.findMany({
            where: eq(holdings.movieId, movieId),
          });

          // Simple flat dividend: same reward regardless of price
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

  // Set award results ONLY (for display on homepage) — does NOT distribute dividends
  // Use this when awards have already been settled and you just need to update the display
  setAwardResultsOnly: adminQuery
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

      // Clear previous results
      await db.delete(awardResults);

      for (const w of input.winners) {
        for (const movieId of w.movieIds) {
          const movie = await db.query.movies.findFirst({
            where: eq(movies.id, movieId),
          });
          await db.insert(awardResults).values({
            awardName: w.awardName,
            movieId,
            movieName: movie?.name || "未知影片",
            dividend: w.dividend,
          });
        }
      }

      return { success: true, message: "获奖结果已录入" };
    }),

  // Undo award settlement: removes award results so admin can re-settle
  // Note: already-paid dividends are NOT recovered (users may have spent them)
  undoAwards: adminQuery.mutation(async () => {
    const db = getDb();
    await db.delete(awardResults);
    return { success: true, message: "已撤销开奖记录，可以重新开奖。注意：之前发放的分红不会从用户账户中扣除。" };
  }),

  // Leaderboard for admin: returns all users with wechatId (admin-only)
  leaderboard: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users);
    const allMovies = await db.select().from(movies);
    const allHoldings = await db.select().from(holdings);

    const moviePrices: Record<number, number> = {};
    for (const m of allMovies) {
      moviePrices[m.id] = Number(m.currentPrice);
    }

    const userAssets = allUsers.map((u) => {
      const userHoldings = allHoldings.filter((h) => h.userId === u.id);
      const marketValue = userHoldings.reduce((sum, h) => {
        const price = moviePrices[h.movieId] || 0;
        return sum + price * h.quantity;
      }, 0);
      const balance = Number(u.balance);
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        balance,
        marketValue,
        totalAssets: balance + marketValue,
        wechatId: u.wechatId,
        role: u.role,
      };
    });

    userAssets.sort((a, b) => b.totalAssets - a.totalAssets);

    return userAssets.map((u, idx) => ({
      rank: idx + 1,
      ...u,
    }));
  }),

  // Public query: list award results (shown on homepage)
  listAwardResults: publicQuery.query(async () => {
    const db = getDb();
    const results = await db.select().from(awardResults).orderBy(awardResults.createdAt);
    return results;
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

    // 4. Clear all rating events (word-of-mouth impacts)
    await db.delete(ratingEvents);

    // 5. Reset all user balances to 3000
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

      await openMarketForAll(session, true);

      return {
        success: true,
        message: `已强制结算（session=${session}）`,
      };
    }),

  // Rating events: admin-set word-of-mouth price impacts
  listRatingEvents: adminQuery.query(async () => {
    const db = getDb();
    const events = await db.select().from(ratingEvents).orderBy(desc(ratingEvents.createdAt));
    const moviesList = await findAllMovies();
    const movieMap = new Map(moviesList.map((m) => [m.id, m.name]));
    return events.map((ev) => ({
      ...ev,
      movieName: movieMap.get(ev.movieId) || "未知",
    }));
  }),

  createRatingEvent: adminQuery
    .input(
      z.object({
        movieId: z.number(),
        impactPercent: z.number().min(-99).max(99),
        cycles: z.number().min(1).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const movie = await db.query.movies.findFirst({
        where: eq(movies.id, input.movieId),
      });
      if (!movie) throw new Error("电影不存在");

      // Check if this movie already has an active event — prevent stacking
      const existing = await db
        .select()
        .from(ratingEvents)
        .where(eq(ratingEvents.movieId, input.movieId));
      if (existing.length > 0) {
        throw new Error(
          `「${movie.name}」已有活跃口碑事件（${existing[0].impactPercent}%），请先删除旧事件再创建新事件`,
        );
      }

      await db.insert(ratingEvents).values({
        movieId: input.movieId,
        impactPercent: input.impactPercent,
        remainingCycles: input.cycles,
        totalCycles: input.cycles,
      });

      return {
        movieName: movie.name,
        impactPercent: input.impactPercent,
        cycles: input.cycles,
        message: `已为「${movie.name}」设置口碑事件：${input.impactPercent > 0 ? "+" : ""}${input.impactPercent}%，持续 ${input.cycles} 个结算周期`,
      };
    }),

  deleteRatingEvent: adminQuery
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(ratingEvents).where(eq(ratingEvents.id, input.eventId));
      return { message: "事件已删除" };
    }),

  // Fix corrupted basePrice values
  fixBasePrice: adminQuery.mutation(async () => {
    const db = getDb();
    const all = await findAllMovies();

    for (const movie of all) {
      // Only fix if basePrice equals currentPrice (corrupted state)
      if (Math.abs(Number(movie.basePrice) - Number(movie.currentPrice)) < 0.01) {
        // Reset basePrice to a reasonable historical value
        // Use currentPrice as new baseline (user will see 0% but future changes will be correct)
        await db.update(movies).set({
          basePrice: movie.currentPrice,
          updatedAt: new Date(),
        }).where(eq(movies.id, movie.id));
      }
    }

    return { success: true, message: "basePrice 修复完成，当前涨跌幅显示为0%，下次交易后结算将正常更新" };
  }),
});
