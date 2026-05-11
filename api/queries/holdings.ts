import { getDb } from "./connection.js";
import { holdings } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export async function findHolding(userId: number, movieId: number) {
  return getDb().query.holdings.findFirst({
    where: and(eq(holdings.userId, userId), eq(holdings.movieId, movieId)),
  });
}

export async function findHoldingsByUser(userId: number) {
  return getDb().select().from(holdings).where(eq(holdings.userId, userId));
}

export async function upsertHolding(userId: number, movieId: number, quantity: number, avgPrice: number) {
  const existing = await findHolding(userId, movieId);
  if (existing) {
    const totalQty = existing.quantity + quantity;
    if (totalQty <= 0) {
      await getDb().delete(holdings).where(eq(holdings.id, existing.id));
      return null;
    }
    // Use integer math (cents) to avoid floating-point drift across many trades
    const existingCents = Math.round(Number(existing.avgBuyPrice) * 100);
    const newCents = Math.round(avgPrice * 100);
    const avgCents = Math.round((existing.quantity * existingCents + quantity * newCents) / totalQty);
    const newAvg = (avgCents / 100).toFixed(2);
    await getDb()
      .update(holdings)
      .set({ quantity: totalQty, avgBuyPrice: newAvg, updatedAt: new Date() })
      .where(eq(holdings.id, existing.id));
    return findHolding(userId, movieId);
  } else {
    if (quantity <= 0) return null;
    await getDb().insert(holdings).values({
      userId,
      movieId,
      quantity,
      avgBuyPrice: String(avgPrice.toFixed(2)),
    });
    return findHolding(userId, movieId);
  }
}
