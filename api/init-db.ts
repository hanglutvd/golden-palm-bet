import { getDb } from "./queries/connection.js";
import { seedMovies } from "./queries/movies.js";

let initialized = false;

export function initDatabase() {
  const db = getDb();

  // === MIGRATIONS: always run (idempotent) ===
  // These are safe to run on every startup

  // Migrate: add rating column to movies table
  try { db.run(`ALTER TABLE movies ADD COLUMN rating INTEGER NOT NULL DEFAULT 5`); } catch {}

  // Session logins table: tracks which IP has logged in during current trading session
  db.run(`
    CREATE TABLE IF NOT EXISTS session_logins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      session_key TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_session_logins_ip_session ON session_logins(ip, session_key)`);

  // Register IPs table: tracks registration sources to prevent multi-account abuse
  db.run(`
    CREATE TABLE IF NOT EXISTS register_ips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_register_ips_ip ON register_ips(ip)`);

  // Price history table: records price snapshot after each settlement
  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      price TEXT NOT NULL,
      base_price TEXT NOT NULL,
      settlement_key TEXT NOT NULL,
      net_volume INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_price_history_movie ON price_history(movie_id)`);

  // Rating events table
  db.run(`
    CREATE TABLE IF NOT EXISTS rating_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      impact_percent INTEGER NOT NULL,
      remaining_cycles INTEGER NOT NULL,
      total_cycles INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Migrate: add wechat_id to users table (for top 10 winners contact)
  try { db.run(`ALTER TABLE users ADD COLUMN wechat_id TEXT`); } catch {}

  // Migrate: add username_changed_at to users table
  try { db.run(`ALTER TABLE users ADD COLUMN username_changed_at INTEGER`); } catch {}

  // Migrate: add reply columns to existing comments table
  try { db.run(`ALTER TABLE comments ADD COLUMN reply_to INTEGER`); } catch {}
  try { db.run(`ALTER TABLE comments ADD COLUMN reply_to_username TEXT`); } catch {}
  try { db.run(`ALTER TABLE comments ADD COLUMN reply_to_content TEXT`); } catch {}

  // Migrate: add cover_image columns to diaries
  try { db.run(`ALTER TABLE diaries ADD COLUMN cover_image_1 TEXT`); } catch {}
  try { db.run(`ALTER TABLE diaries ADD COLUMN cover_image_2 TEXT`); } catch {}
  try { db.run(`ALTER TABLE diaries ADD COLUMN cover_image_3 TEXT`); } catch {}

  // === INITIAL SETUP: only run once ===
  if (initialized) return;

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
      rating INTEGER NOT NULL DEFAULT 5,
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

  // Create transactions table with session field
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price TEXT NOT NULL,
      total_amount TEXT NOT NULL,
      session TEXT NOT NULL DEFAULT 'am',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Migrate: add session column to existing transactions table
  try {
    db.run(`ALTER TABLE transactions ADD COLUMN session TEXT NOT NULL DEFAULT 'am'`);
  } catch { /* already exists or table is new */ }

  db.run(`
    CREATE TABLE IF NOT EXISTS diaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT,
      cover_image TEXT,
      cover_image_2 TEXT,
      cover_image_3 TEXT,
      external_url TEXT,
      wechat_article_id TEXT,
      publish_date INTEGER NOT NULL DEFAULT (unixepoch()),
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Migrate: add cover_image_2 and cover_image_3 if missing
  try {
    db.run(`ALTER TABLE diaries ADD COLUMN cover_image_2 TEXT`);
  } catch { /* already exists */ }
  try {
    db.run(`ALTER TABLE diaries ADD COLUMN cover_image_3 TEXT`);
  } catch { /* already exists */ }

  // Comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      reply_to INTEGER,
      reply_to_username TEXT,
      reply_to_content TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Site config table
  db.run(`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  // Create indexes for performance and concurrency
  // Holdings: fast lookup by user+movie (critical for trading)
  db.run(`CREATE INDEX IF NOT EXISTS idx_holdings_user_movie ON holdings(user_id, movie_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_holdings_user ON holdings(user_id)`);

  // Transactions: fast lookup for session trade limits (critical for trading)
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user_movie_session_type ON transactions(user_id, movie_id, session, type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_transactions_movie ON transactions(movie_id)`);

  // Comments: fast pagination
  db.run(`CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC)`);

  // Users: fast lookup for auth
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

  // Seed movies if empty
  seedMovies();

  initialized = true;
  console.log("[init-db] Database initialized with indexes");
}
