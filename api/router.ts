import { createRouter, publicQuery } from "./middleware.js";
import { authRouter } from "./authRouter.js";
import { leaderboardRouter } from "./leaderboardRouter.js";
import { movieRouter } from "./movieRouter.js";
import { tradingRouter } from "./tradingRouter.js";
import { diaryRouter } from "./diaryRouter.js";
import { adminRouter } from "./adminRouter.js";
import { configRouter } from "./configRouter.js";
import { commentRouter } from "./commentRouter.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  leaderboard: leaderboardRouter,
  movie: movieRouter,
  trading: tradingRouter,
  diary: diaryRouter,
  admin: adminRouter,
  config: configRouter,
  comment: commentRouter,
});

export type AppRouter = typeof appRouter;
