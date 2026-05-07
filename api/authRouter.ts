import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware.js";
import { findUserByEmailOrUsername, findUserById, findUserByEmail, findUserByResetToken, findUserByUsername, createUser, setResetToken, clearResetToken, updatePassword, updateUsername, countUsers } from "./queries/users.js";
import { sendPasswordResetEmail } from "./lib/email.js";
import { env } from "./lib/env.js";

const JWT_SECRET = env.appSecret;
const SALT_ROUNDS = 10;

// Simple in-memory rate limiting for auth endpoints
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 10; // max requests per window

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  // Railway forwards client IP via X-Forwarded-For
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function setAuthCookie(resHeaders: Headers, userId: number) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
  const isProd = env.isProduction;
  resHeaders.append(
    "Set-Cookie",
    `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${isProd ? "; Secure" : ""}`,
  );
}

function clearAuthCookie(resHeaders: Headers) {
  resHeaders.append(
    "Set-Cookie",
    `auth-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

export const authRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        email: z.string().min(1, "请输入邮箱"),
        username: z.string().min(2, "用户名至少2个字符").max(50, "用户名最多50个字符"),
        password: z.string().min(6, "密码至少6个字符"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limit by IP
      const ip = getClientIP(ctx.req);
      if (!checkRateLimit(`register:${ip}`)) {
        throw new Error("请求过于频繁，请稍后再试");
      }

      const existing = await findUserByEmailOrUsername(input.email, input.username);
      if (existing) {
        // Security: do not reveal whether email or username is taken
        throw new Error("该邮箱或用户名已被注册");
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

      // First user becomes admin
      const userCount = await countUsers();
      const role = userCount === 0 ? "admin" : "user";

      const user = await createUser({
        email: input.email,
        username: input.username,
        passwordHash,
        balance: "3000.00",
        role,
      });

      if (!user) {
        throw new Error("注册失败，请重试");
      }

      setAuthCookie(ctx.resHeaders, user.id);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: Number(user.balance),
        role: user.role,
      };
    }),

  login: publicQuery
    .input(
      z.object({
        identifier: z.string().min(1, "请输入邮箱或用户名"),
        password: z.string().min(1, "请输入密码"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limit by IP
      const ip = getClientIP(ctx.req);
      if (!checkRateLimit(`login:${ip}`)) {
        throw new Error("请求过于频繁，请稍后再试");
      }

      const user = await findUserByEmailOrUsername(input.identifier, input.identifier);
      if (!user) {
        // Security: generic error to prevent user enumeration
        throw new Error("邮箱/用户名或密码错误");
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("邮箱/用户名或密码错误");
      }

      setAuthCookie(ctx.resHeaders, user.id);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: Number(user.balance),
        role: user.role,
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    // Refetch to get latest data
    const user = await findUserById(ctx.user.id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      balance: Number(user.balance),
      role: user.role,
    };
  }),

  logout: publicQuery.mutation(({ ctx }) => {
    clearAuthCookie(ctx.resHeaders);
    return { success: true };
  }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email("请输入有效的邮箱地址") }))
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        // Security: do not reveal whether email exists
        throw new Error("如果该邮箱已注册，重置邮件将发送");
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await setResetToken(user.id, token, expiry);

      // Try to send real email
      const emailResult = await sendPasswordResetEmail(input.email, token);
      if (emailResult.success) {
        return { message: "重置邮件已发送，请查收邮箱" };
      }

      // Security: never return token in production
      if (env.isProduction) {
        return { message: "邮件发送失败，请联系管理员" };
      }

      // Fallback only for development/testing
      return {
        message: "邮件服务未配置，已生成重置令牌（仅开发环境）",
        token,
      };
    }),

  resetPassword: publicQuery
    .input(
      z.object({
        token: z.string().min(1, "请输入重置令牌"),
        password: z.string().min(6, "密码至少6个字符"),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      if (!user) {
        throw new Error("重置链接已过期或无效");
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      await updatePassword(user.id, passwordHash);
      await clearResetToken(user.id);

      return { message: "密码重置成功" };
    }),

  verifyResetToken: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      return { valid: !!user };
    }),

  // Update profile (username)
  updateProfile: publicQuery
    .input(
      z.object({
        username: z.string().min(2).max(50),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });

      // Check if username is taken
      const existing = await findUserByUsername(input.username);
      if (existing && existing.id !== ctx.user.id) {
        throw new Error("该昵称已被使用");
      }

      await updateUsername(ctx.user.id, input.username);
      return { message: "昵称修改成功" };
    }),

  // Change password
  changePassword: publicQuery
    .input(
      z.object({
        oldPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "请先登录" });

      const user = await findUserById(ctx.user.id);
      if (!user) throw new Error("用户不存在");

      // Verify old password
      const valid = await bcrypt.compare(input.oldPassword, user.passwordHash);
      if (!valid) {
        throw new Error("原密码错误");
      }

      const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
      await updatePassword(user.id, passwordHash);

      return { message: "密码修改成功" };
    }),
});
