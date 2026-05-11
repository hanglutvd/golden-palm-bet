import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../../db/schema.js";

const fullSchema = { ...schema };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

const DB_PATH = process.env.DB_PATH || "/data/data.sqlite";

export function getDb() {
  if (!instance) {
    const client = new Database(DB_PATH);
    // WAL mode: enables concurrent reads during writes, essential for high-traffic
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = normal");
    client.pragma("temp_store = memory");
    client.pragma("mmap_size = 268435456"); // 256MB memory map
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
