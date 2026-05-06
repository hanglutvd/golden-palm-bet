import { getDb } from "./connection.js";
import { transactions } from "../../db/schema.js";
import { desc, eq } from "drizzle-orm";

export async function createTransaction(data: {
  userId: number;
  movieId: number;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalAmount: number;
  session?: string;
}) {
  await getDb().insert(transactions).values({
    userId: data.userId,
    movieId: data.movieId,
    type: data.type,
    quantity: data.quantity,
    price: String(data.price.toFixed(2)),
    totalAmount: String(data.totalAmount.toFixed(2)),
    session: data.session || "am",
  });
}

export async function findTransactionsByMovie(movieId: number, limit = 50) {
  return getDb().query.transactions.findMany({
    where: eq(transactions.movieId, movieId),
    orderBy: desc(transactions.createdAt),
    limit,
  });
}

export async function findTransactionsByUser(userId: number, limit = 50) {
  return getDb().query.transactions.findMany({
    where: eq(transactions.userId, userId),
    orderBy: desc(transactions.createdAt),
    limit,
  });
}
