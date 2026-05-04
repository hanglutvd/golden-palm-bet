import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createRouter, publicQuery } from "./middleware";
import { findUserByEmailOrUsername, findUserById, findUserByEmail, findUserByResetToken, createUser, setResetToken, clearResetToken, updatePassword } from "./queries/users";
import { sendPasswordResetEmail } from "./lib/email";
import { env } from "./lib/env";

const JWT_SECRET = env.appSecret;
const SALT_ROUNDS = 10;

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
        email: z.string().email("请输入有效的邮箱地址"),
        username: z
          .string()
          .min(2, "用户名至少2个字符")
          .max(50, "用户名最多50个字符")
          .regex(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, "用户名只能包含字母、数字、下划线和中文"),
        password: z.string().min(6, "密码至少6个字符"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByEmailOrUsername(input.email, input.username);
      if (existing) {
        if (existing.email === input.email) {
          throw new Error("该邮箱已被注册");
        }
        throw new Error("该用户名已被占用");
      }

      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      const user = await createUser({
        email: input.email,
        username: input.username,
        passwordHash,
        balance: "3000.00",
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
      const user = await findUserByEmailOrUsername(input.identifier, input.identifier);
      if (!user) {
        throw new Error("用户不存在");
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new Error("密码错误");
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
        throw new Error("该邮箱未注册");
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await setResetToken(user.id, token, expiry);

      // Try to send real email, fallback to returning token for testing
      const emailResult = await sendPasswordResetEmail(input.email, token);
      if (emailResult.success) {
        return { message: "重置邮件已发送，请查收邮箱" };
      }

      // Fallback: return token for manual reset (when email not configured)
      return {
        message: "邮件服务未配置，已生成重置令牌",
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
});
