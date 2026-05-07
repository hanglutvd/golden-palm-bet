import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { findAllMovies, findMovieById, seedMovies, openMarketForAll, ensureMovieMarketOpen } from "./queries/movies.js";
import { findTransactionsByMovie } from "./queries/transactions.js";
import { getDb } from "./queries/connection.js";
import { holdings, transactions } from "../db/schema.js";
import { eq, and, count, sql, desc } from "drizzle-orm";

export const movieRouter = createRouter({
  list: publicQuery.query(async () => {
    await seedMovies();
    // Batch open market before returning
    await openMarketForAll();
    const all = await findAllMovies();
    return all.map((m, i) => ({
      id: m.id,
      rank: i + 1,
      name: m.name,
      director: m.director,
      price: Number(m.currentPrice),
      basePrice: Number(m.basePrice),
      change: Number((Number(m.currentPrice) - Number(m.basePrice)).toFixed(2)),
      changePercent: Number((((Number(m.currentPrice) - Number(m.basePrice)) / Number(m.basePrice)) * 100).toFixed(2)),
      trend: Number(m.currentPrice) > Number(m.basePrice) + 0.01 ? "up" as const : Number(m.currentPrice) < Number(m.basePrice) - 0.01 ? "down" as const : "flat" as const,
      premiereDate: m.premiereDate || undefined,
    }));
  }),

  detail: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const movie = await findMovieById(input.id);
      if (!movie) throw new Error("电影不存在");
      // Ensure market is open for this movie
      const opened = await ensureMovieMarketOpen(movie);
      return {
        id: opened.id,
        name: opened.name,
        director: opened.director,
        price: Number(opened.currentPrice),
        basePrice: Number(opened.basePrice),
        change: Number((Number(opened.currentPrice) - Number(opened.basePrice)).toFixed(2)),
        changePercent: Number((((Number(opened.currentPrice) - Number(opened.basePrice)) / Number(opened.basePrice)) * 100).toFixed(2)),
        trend: Number(opened.currentPrice) > Number(opened.basePrice) + 0.01 ? "up" as const : Number(opened.currentPrice) < Number(opened.basePrice) - 0.01 ? "down" as const : "flat" as const,
        premiereDate: opened.premiereDate || undefined,
      };
    }),

  history: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const txs = await findTransactionsByMovie(input.id, 30);
      return txs.map((t) => ({
        type: t.type,
        price: Number(t.price),
        quantity: Number(t.quantity),
        date: t.createdAt,
      }));
    }),

  marketHeat: publicQuery.query(async () => {
    const db = getDb();

    // 1. Holdings count per movie (number of unique holders)
    const holderCounts = await db
      .select({
        movieId: holdings.movieId,
        holderCount: count(holdings.userId),
        totalShares: sql<number>`SUM(${holdings.quantity})`,
      })
      .from(holdings)
      .where(sql`${holdings.quantity} > 0`)
      .groupBy(holdings.movieId);

    // 2. Today's transaction volume per movie
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayStart = new Date(`${todayStr}T00:00:00Z`);

    const txVolumes = await db
      .select({
        movieId: transactions.movieId,
        buyVolume: sql<number>`SUM(CASE WHEN ${transactions.type} = 'buy' THEN ${transactions.quantity} ELSE 0 END)`,
        sellVolume: sql<number>`SUM(CASE WHEN ${transactions.type} = 'sell' THEN ${transactions.quantity} ELSE 0 END)`,
        totalVolume: sql<number>`SUM(${transactions.quantity})`,
      })
      .from(transactions)
      .where(sql`${transactions.createdAt} >= ${todayStart}`)
      .groupBy(transactions.movieId);

    // 3. Get all movies for name mapping
    const allMovies = await findAllMovies();

    return allMovies.map((m) => {
      const holderInfo = holderCounts.find((h) => h.movieId === m.id);
      const txInfo = txVolumes.find((t) => t.movieId === m.id);
      return {
        movieId: m.id,
        movieName: m.name,
        holderCount: holderInfo?.holderCount || 0,
        totalShares: Number(holderInfo?.totalShares || 0),
        todayBuyVolume: Number(txInfo?.buyVolume || 0),
        todaySellVolume: Number(txInfo?.sellVolume || 0),
        todayTotalVolume: Number(txInfo?.totalVolume || 0),
        currentPrice: Number(m.currentPrice),
        changePercent: Number(
          (((Number(m.currentPrice) - Number(m.basePrice)) / Number(m.basePrice)) * 100).toFixed(2)
        ),
      };
    });
  }),
});
