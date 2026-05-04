import { z } from "zod";
import { createRouter, publicQuery } from "./middleware.js";
import { getDb } from "./queries/connection.js";
import { diaries } from "../db/schema.js";
import { desc } from "drizzle-orm";

export const diaryRouter = createRouter({
  list: publicQuery.query(async () => {
    const all = await getDb().query.diaries.findMany({
      orderBy: desc(diaries.publishDate),
      limit: 50,
    });
    return all;
  }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(200),
        summary: z.string().max(500).optional(),
        coverImage: z.string().max(500).optional(),
        externalUrl: z.string().max(500).optional(),
        wechatArticleId: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [{ id }] = await getDb()
        .insert(diaries)
        .values({
          title: input.title,
          summary: input.summary || null,
          coverImage: input.coverImage || null,
          externalUrl: input.externalUrl || null,
          wechatArticleId: input.wechatArticleId || null,
        })
        .$returningId();

      const diary = await getDb().query.diaries.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });
      return diary;
    }),
});
