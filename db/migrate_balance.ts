import { getDb } from "../api/queries/connection";
import { sql } from "drizzle-orm";

async function migrate() {
  const db = getDb();
  try {
    await db.execute(sql`ALTER TABLE users MODIFY balance DECIMAL(12,2) NOT NULL DEFAULT 1000.00`);
    console.log("✅ Default balance changed to 1000.00");
  } catch (err: any) {
    if (err.sqlMessage?.includes("Duplicate column")) {
      console.log("✅ Column already exists");
    } else {
      console.error("❌ Migration failed:", err.sqlMessage || err.message);
    }
  }
}

migrate();
