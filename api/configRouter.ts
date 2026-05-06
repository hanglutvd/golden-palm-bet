import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { siteConfig } from "../db/schema.js";
import { eq } from "drizzle-orm";

const CONFIG_KEY = "market_images";

export const configRouter = createRouter({
  getMarketImages: publicQuery.query(async () => {
    const db = getDb();
    const row = await db
      .select()
      .from(siteConfig)
      .where(eq(siteConfig.key, CONFIG_KEY))
      .limit(1);
    if (!row[0]?.value) return [] as string[];
    try {
      return JSON.parse(row[0].value) as string[];
    } catch {
      return [] as string[];
    }
  }),

  setMarketImages: publicQuery
    .input(z.object({ images: z.array(z.string().max(500)) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const value = JSON.stringify(input.images.filter(Boolean));

      // 使用底层 better-sqlite3 客户端直接执行原始 SQL，确保 ON CONFLICT 正确工作
      const client = (db as any).$client;
      if (client) {
        const stmt = client.prepare(
          `INSERT INTO site_config (key, value, updated_at)
           VALUES (?, ?, unixepoch())
           ON CONFLICT(key) DO UPDATE SET
             value = excluded.value,
             updated_at = unixepoch()`
        );
        stmt.run(CONFIG_KEY, value);
      } else {
        // 回退到 drizzle API
        await db
          .insert(siteConfig)
          .values({ key: CONFIG_KEY, value, updatedAt: new Date() })
          .onConflictDoUpdate({
            target: siteConfig.key,
            set: { value, updatedAt: new Date() },
          });
      }

      return { success: true };
    }),
});
