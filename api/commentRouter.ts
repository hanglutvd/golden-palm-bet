import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware.js";
import { createComment, listComments, countComments, deleteComment } from "./queries/comments.js";
import { findUserById } from "./queries/users.js";

const MAX_COMMENT_LENGTH = 300;

export const commentRouter = createRouter({
  // Create a new comment (optionally with reply)
  create: publicQuery
    .input(
      z.object({
        content: z.string().min(1, "请输入内容").max(MAX_COMMENT_LENGTH, `内容最多${MAX_COMMENT_LENGTH}字`),
        replyTo: z.number().optional(),
        replyToUsername: z.string().optional(),
        replyToContent: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
      }

      const user = await findUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "用户不存在" });
      }

      const commentId = await createComment({
        userId: ctx.user.id,
        username: user.username,
        content: input.content.trim(),
        replyTo: input.replyTo,
        replyToUsername: input.replyToUsername,
        replyToContent: input.replyToContent,
      });

      return { success: true, id: commentId };
    }),

  // List comments (paginated)
  list: publicQuery
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional(),
          offset: z.number().min(0).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;
      const items = await listComments(limit, offset);
      const total = await countComments();
      return { items, total };
    }),

  // Delete a comment (admin or own comment)
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });
      }

      const user = await findUserById(ctx.user.id);
      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "只有管理员可以删除评论" });
      }

      await deleteComment(input.id);
      return { success: true };
    }),
});
