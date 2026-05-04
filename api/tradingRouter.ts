import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { assertTradingHours } from "../contracts/market.js";
import { TRPCError } from "@trpc/server";
import { findMovieById, findAllMovies, incrementDailyNetVolume } from "./queries/movies.js";
import { findHolding, upsertHolding, findHoldingsByUser } from "./queries/holdings.js";
import { createTransaction, findTransactionsByUser } from "./queries/transactions.js";
import { findUserById } from "./queries/users.js";
import { getDb } from "./queries/connection.js";
import { users } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

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

      const price = Number(movie.currentPrice);
      const totalCost = price * input.quantity;

      if (Number(user.balance) < totalCost) {
        throw new Error(`余额不足，需要 ¥${totalCost.toFixed(2)}，当前余额 ¥${Number(user.balance).toFixed(2)}`);
      }

      // Deduct balance
      await getDb()
        .update(users)
        .set({ balance: String((Number(user.balance) - totalCost).toFixed(2)) })
        .where(eq(users.id, user.id));

      // Record holding
      await upsertHolding(user.id, input.movieId, input.quantity, price);

      // Record transaction
      await createTransaction({
        userId: user.id,
        movieId: input.movieId,
        type: "buy",
        quantity: input.quantity,
        price,
        totalAmount: totalCost,
      });

      // Accumulate daily net volume (price updated at next market open)
      await incrementDailyNetVolume(input.movieId, input.quantity);

      return {
        success: true,
        message: `买入 ${input.quantity} 股「${movie.name}」成功`,
        price,
        totalCost,
        newBalance: Number(user.balance) - totalCost,
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

      const holding = await findHolding(user.id, input.movieId);
      if (!holding || holding.quantity < input.quantity) {
        throw new Error(`持股不足，持有 ${holding?.quantity || 0} 股，尝试卖出 ${input.quantity} 股`);
      }

      const price = Number(movie.currentPrice);
      const totalRevenue = price * input.quantity;

      // Add balance
      await getDb()
        .update(users)
        .set({ balance: String((Number(user.balance) + totalRevenue).toFixed(2)) })
        .where(eq(users.id, user.id));

      // Reduce holding
      await upsertHolding(user.id, input.movieId, -input.quantity, price);

      // Record transaction
      await createTransaction({
        userId: user.id,
        movieId: input.movieId,
        type: "sell",
        quantity: input.quantity,
        price,
        totalAmount: totalRevenue,
      });

      // Accumulate daily net volume (negative = net sell)
      await incrementDailyNetVolume(input.movieId, -input.quantity);

      return {
        success: true,
        message: `卖出 ${input.quantity} 股「${movie.name}」成功`,
        price,
        totalRevenue,
        newBalance: Number(user.balance) + totalRevenue,
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
