import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { findAllMovies, findMovieById, seedMovies, openMarketForAll, ensureMovieMarketOpen } from "./queries/movies";
import { findTransactionsByMovie } from "./queries/transactions";

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
});
