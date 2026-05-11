import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { assertTradingHours, getCurrentSession, getBeijingDateStr, isPreLaunch } from "../contracts/market.js";
import { TRPCError } from "@trpc/server";
import { findMovieById, findAllMovies, incrementDailyNetVolume } from "./queries/movies.js";
import { findHolding, upsertHolding, findHoldingsByUser } from "./queries/holdings.js";
import { createTransaction, findTransactionsByUser } from "./queries/transactions.js";
import { findUserById } from "./queries/users.js";
import { getDb } from "./queries/connection.js";
import { users, transactions } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

const MAX_HOLDING_PER_MOVIE = 20;

async function checkSessionTradeLimit(
  userId: number,
  movieId: number,
  tradeType: "buy" | "sell"
) {
  const session = getCurrentSession();

  // Pre-launch: no trade limit (unlimited buys/sells)
  if (isPreLaunch()) {
    return session || "am";
  }

  if (!session) {
    throw new Error("当前为非交易时段");
  }

  const today = getBeijingDateStr();

  // Check if user already did this trade type on this movie in current session
  const existing = await getDb()
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.movieId, movieId),
        eq(transactions.session, session),
        eq(transactions.type, tradeType)
      )
    );

  // Filter to today's transactions by checking created_at
  const todayStart = new Date(`${today}T00:00:00+08:00`).getTime();
  const todayEnd = new Date(`${today}T23:59:59+08:00`).getTime();
  const todayTrades = existing.filter((t: typeof transactions.$inferSelect) => {
    const ts = new Date(t.createdAt).getTime();
    return ts >= todayStart && ts <= todayEnd;
  });

  if (todayTrades.length > 0) {
    const sessionLabel = session === "am" ? "上午" : "下午";
    const typeLabel = tradeType === "buy" ? "买入" : "卖出";
    throw new Error(
      `本${sessionLabel}时段已${typeLabel}过该电影，不可重复${typeLabel}（${session === "am" ? "15:00" : "明日09:00"}后可再次操作）`
    );
  }

  return session;
}

export const tradingRouter = createRouter({
  buy: publicQuery
    .input(z.object({
      movieId: z.number().positive(),
      quantity: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      assertTradingHours();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });

      const user = await findUserById(ctx.user.id);
      if (!user) throw new Error("用户不存在");

      const movie = await findMovieById(input.movieId);
      if (!movie) throw new Error("电影不存在");

      // Check session trade limit (buy: can buy once per movie per session)
      const session = await checkSessionTradeLimit(user.id, input.movieId, "buy");

      const price = Number(movie.currentPrice);
      const totalCost = price * input.quantity;

      // Security: do not expose current balance in error messages
      const userBalance = Number(user.balance);
      if (userBalance < totalCost) {
        throw new Error(`余额不足，需要 ${totalCost.toFixed(2)}`);
      }

      // Check holding limit
      const existingHolding = await findHolding(user.id, input.movieId);
      const currentQty = existingHolding ? Number(existingHolding.quantity) : 0;
      if (currentQty + input.quantity > MAX_HOLDING_PER_MOVIE) {
        throw new Error(`持股上限为 ${MAX_HOLDING_PER_MOVIE} 股，当前持有 ${currentQty} 股，最多可再买 ${MAX_HOLDING_PER_MOVIE - currentQty} 股`);
      }

      // Use atomic update to prevent race conditions
      const db = getDb();
      const newBalance = (userBalance - totalCost).toFixed(2);

      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, user.id));

      // Record holding
      await upsertHolding(user.id, input.movieId, input.quantity, price);

      // Record transaction with session
      await createTransaction({
        userId: user.id,
        movieId: input.movieId,
        type: "buy",
        quantity: input.quantity,
        price,
        totalAmount: totalCost,
        session,
      });

      // Accumulate daily net volume
      await incrementDailyNetVolume(input.movieId, input.quantity);

      return {
        success: true,
        message: `买入 ${input.quantity} 股「${movie.name}」成功`,
        price,
        totalCost,
        newBalance: Number(newBalance),
      };
    }),

  sell: publicQuery
    .input(z.object({
      movieId: z.number().positive(),
      quantity: z.number().positive(),
    }))
    .mutation(async ({ input, ctx }) => {
      assertTradingHours();
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });

      const user = await findUserById(ctx.user.id);
      if (!user) throw new Error("用户不存在");

      const movie = await findMovieById(input.movieId);
      if (!movie) throw new Error("电影不存在");

      // Check session trade limit (sell: can sell once per movie per session)
      const session = await checkSessionTradeLimit(user.id, input.movieId, "sell");

      const holding = await findHolding(user.id, input.movieId);
      if (!holding || Number(holding.quantity) < input.quantity) {
        throw new Error(`持股不足，持有 ${holding?.quantity || 0} 股，尝试卖出 ${input.quantity} 股`);
      }

      const price = Number(movie.currentPrice);
      const totalRevenue = price * input.quantity;

      // Use atomic update
      const db = getDb();
      const newBalance = (Number(user.balance) + totalRevenue).toFixed(2);

      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, user.id));

      // Reduce holding
      await upsertHolding(user.id, input.movieId, -input.quantity, price);

      // Record transaction with session
      await createTransaction({
        userId: user.id,
        movieId: input.movieId,
        type: "sell",
        quantity: input.quantity,
        price,
        totalAmount: totalRevenue,
        session,
      });

      // Accumulate daily net volume
      await incrementDailyNetVolume(input.movieId, -input.quantity);

      return {
        success: true,
        message: `卖出 ${input.quantity} 股「${movie.name}」成功`,
        price,
        totalRevenue,
        newBalance: Number(newBalance),
      };
    }),

  myHoldings: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
    const { findHoldingsByUser } = await import("./queries/holdings.js");
    const { findMovieById } = await import("./queries/movies.js");
    const hs = await findHoldingsByUser(ctx.user.id);
    const result = [];
    for (const h of hs) {
      const movie = await findMovieById(h.movieId);
      if (movie && h.quantity > 0) {
        result.push({
          movieId: h.movieId,
          movieName: movie.name,
          director: movie.director,
          quantity: h.quantity,
          avgBuyPrice: Number(h.avgBuyPrice),
          currentPrice: Number(movie.currentPrice),
          profit: (Number(movie.currentPrice) - Number(h.avgBuyPrice)) * h.quantity,
        });
      }
    }
    return result;
  }),

  myTransactions: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
    const txs = await findTransactionsByUser(ctx.user.id, 100);
    const { findAllMovies } = await import("./queries/movies.js");
    const movies = await findAllMovies();
    return txs.map((t) => ({
      id: t.id,
      movieName: movies.find((m) => m.id === Number(t.movieId))?.name || "未知",
      type: t.type as "buy" | "sell",
      quantity: Number(t.quantity),
      price: Number(t.price),
      totalAmount: Number(t.totalAmount),
      date: t.createdAt,
    }));
  }),

  portfolio: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
    const user = await findUserById(ctx.user.id);
    if (!user) throw new Error("用户不存在");

    const userHoldings = await findHoldingsByUser(user.id);
    const movies = await findAllMovies();

    const holdingsWithDetails = userHoldings
      .filter((h) => h.quantity > 0)
      .map((h) => {
        const movie = movies.find((m) => m.id === Number(h.movieId));
        const currentPrice = Number(movie?.currentPrice || 0);
        const avgPrice = Number(h.avgBuyPrice);
        const qty = Number(h.quantity);
        const marketValue = currentPrice * qty;
        const costBasis = avgPrice * qty;
        const pnl = marketValue - costBasis;
        const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        return {
          movieId: Number(h.movieId),
          movieName: movie?.name || "未知",
          director: movie?.director || "",
          quantity: qty,
          avgBuyPrice: avgPrice,
          currentPrice,
          marketValue,
          pnl,
          pnlPercent,
        };
      });

    const totalMarketValue = holdingsWithDetails.reduce((sum, h) => sum + h.marketValue, 0);
    const totalPnl = holdingsWithDetails.reduce((sum, h) => sum + h.pnl, 0);

    return {
      balance: Number(user.balance),
      totalMarketValue,
      totalPnl,
      totalAssets: Number(user.balance) + totalMarketValue,
      holdings: holdingsWithDetails,
    };
  }),
});