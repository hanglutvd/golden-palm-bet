import { getDb } from "./connection.js";
import { comments } from "../../db/schema.js";
import { desc, eq, count } from "drizzle-orm";

export async function createComment(data: {
  userId: number;
  username: string;
  content: string;
}) {
  const result = await getDb()
    .insert(comments)
    .values({
      userId: data.userId,
      username: data.username,
      content: data.content,
    })
    .returning({ id: comments.id });

  return result[0]?.id;
}

export async function listComments(limit: number = 50, offset: number = 0) {
  return getDb()
    .select()
    .from(comments)
    .orderBy(desc(comments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function countComments() {
  const result = await getDb()
    .select({ value: count(comments.id) })
    .from(comments);
  return result[0]?.value ?? 0;
}

export async function deleteComment(id: number) {
  await getDb()
    .delete(comments)
    .where(eq(comments.id, id));
}
