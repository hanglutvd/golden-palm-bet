import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import jwt from "jsonwebtoken";
import { env } from "./lib/env.js";
import { findUserById } from "./queries/users.js";
import type { User } from "../db/schema.js";

const JWT_SECRET = env.appSecret;

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = {
    req: opts.req,
    resHeaders: opts.resHeaders,
  };

  // Read auth token from cookie
  const cookie = opts.req.headers.get("cookie");
  if (cookie) {
    const tokenMatch = cookie.match(/auth-token=([^;]+)/);
    if (tokenMatch) {
      try {
        const decoded = jwt.verify(tokenMatch[1], JWT_SECRET) as unknown as { userId: number };
        const user = await findUserById(decoded.userId);
        if (user) {
          ctx.user = user;
        }
      } catch {
        // Invalid/expired token — ignore
      }
    }
  }

  return ctx;
}
