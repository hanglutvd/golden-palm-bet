import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users, holdings, movies } from "../db/schema.js";
import { desc } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    
    // Get all users
    const allUsers = await db.select().from(users);
    
    // Get all movies for price lookup
    const allMovies = await db.select().from(movies);
    const moviePrices: Record<number, number> = {};
    for (const m of allMovies) {
      moviePrices[m.id] = Number(m.currentPrice);
    }
    
    // Get all holdings
    const allHoldings = await db.select().from(holdings);
    
    // Calculate total assets for each user
    const userAssets = allUsers.map((u) => {
      const userHoldings = allHoldings.filter((h) => h.userId === u.id);
      const marketValue = userHoldings.reduce((sum, h) => {
        const price = moviePrices[h.movieId] || 0;
        return sum + price * h.quantity;
      }, 0);
      const balance = Number(u.balance);
      const totalAssets = balance + marketValue;
      
      return {
        id: u.id,
        username: u.username,
        balance,
        marketValue,
        totalAssets,
      };
    });
    
    // Sort by total assets descending
    userAssets.sort((a, b) => b.totalAssets - a.totalAssets);

    return userAssets.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      balance: u.balance,
      marketValue: u.marketValue,
      totalAssets: u.totalAssets,
      medal: idx === 0 ? "gold" as const : idx === 1 ? "silver" as const : idx === 2 ? "bronze" as const : undefined,
    }));
  }),
});
