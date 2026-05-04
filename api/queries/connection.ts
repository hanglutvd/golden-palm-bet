import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema.js";

const fullSchema = { ...schema };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

const DB_PATH = process.env.DB_PATH || "/data/data.sqlite";

export function getDb() {
  if (!instance) {
    const client = new Database(DB_PATH);
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
