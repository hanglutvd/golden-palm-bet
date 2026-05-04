import fs from "fs";
import path from "path";
import { getDb } from "./queries/connection.js";
import { seedMovies } from "./queries/movies.js";

let initialized = false;

export function initDatabase() {
  if (initialized) return;

  // Ensure data directory exists (for Railway volume mount)
  const dbPath = process.env.DB_PATH || "/data/data.sqlite";
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = getDb();

  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      balance TEXT NOT NULL DEFAULT '3000.00',
      reset_token TEXT,
      reset_token_expiry INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      director TEXT NOT NULL,
      current_price TEXT NOT NULL DEFAULT '100.00',
      base_price TEXT NOT NULL DEFAULT '100.00',
      total_volume TEXT NOT NULL DEFAULT '0',
      daily_net_volume INTEGER NOT NULL DEFAULT 0,
      last_open_date TEXT NOT NULL DEFAULT '',
      premiere_date TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      avg_buy_price TEXT NOT NULL DEFAULT '0',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price TEXT NOT NULL,
      total_amount TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS diaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      cover_image TEXT,
      external_url TEXT,
      wechat_article_id TEXT,
      publish_date INTEGER NOT NULL DEFAULT (unixepoch()),
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Seed movies if empty
  seedMovies();

  initialized = true;
  console.log("[init-db] Database initialized at", dbPath);
}
