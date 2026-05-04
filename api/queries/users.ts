import { getDb } from "./connection.js";
import { users } from "../../db/schema.js";
import { eq, or, and, gt } from "drizzle-orm";

export async function findUserById(id: number) {
  return getDb().query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function findUserByEmail(email: string) {
  return getDb().query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function findUserByUsername(username: string) {
  return getDb().query.users.findFirst({
    where: eq(users.username, username),
  });
}

export async function findUserByEmailOrUsername(email: string, username: string) {
  const result = await getDb()
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  return result[0] as typeof users.$inferSelect | undefined;
}

export async function findUserByResetToken(token: string) {
  return getDb()
    .select()
    .from(users)
    .where(
      and(
        eq(users.resetToken, token),
        gt(users.resetTokenExpiry, new Date()),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] as typeof users.$inferSelect | undefined);
}

export async function createUser(data: {
  email: string;
  username: string;
  passwordHash: string;
  balance?: string;
}) {
  const [{ id }] = await getDb()
    .insert(users)
    .values(data)
    .$returningId();
  return findUserById(id);
}

export async function setResetToken(userId: number, token: string, expiry: Date) {
  await getDb()
    .update(users)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(users.id, userId));
}

export async function clearResetToken(userId: number) {
  await getDb()
    .update(users)
    .set({ resetToken: null, resetTokenExpiry: null })
    .where(eq(users.id, userId));
}

export async function updatePassword(userId: number, passwordHash: string) {
  await getDb()
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId));
}
