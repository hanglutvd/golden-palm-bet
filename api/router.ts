import { createRouter, publicQuery } from "./middleware";
import { authRouter } from "./authRouter";
import { leaderboardRouter } from "./leaderboardRouter";
import { movieRouter } from "./movieRouter";
import { tradingRouter } from "./tradingRouter";
import { diaryRouter } from "./diaryRouter";
import { adminRouter } from "./adminRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  leaderboard: leaderboardRouter,
  movie: movieRouter,
  trading: tradingRouter,
  diary: diaryRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
