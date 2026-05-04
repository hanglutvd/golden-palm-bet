import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { users } from "../db/schema.js";
import { desc, sql } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const topUsers = await db
      .select({
        id: users.id,
        username: users.username,
        balance: users.balance,
      })
      .from(users)
      .orderBy(desc(sql`${users.balance} + 0`))
      .limit(10);

    return topUsers.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      balance: Number(u.balance),
      medal: idx === 0 ? "gold" as const : idx === 1 ? "silver" as const : idx === 2 ? "bronze" as const : undefined,
    }));
  }),
});
