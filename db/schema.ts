import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  balance: text("balance").notNull().default("3000.00"),
  resetToken: text("reset_token"),
  resetTokenExpiry: integer("reset_token_expiry", { mode: "timestamp" }),
  usernameChangedAt: integer("username_changed_at", { mode: "timestamp" }),
  wechatId: text("wechat_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const movies = sqliteTable("movies", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  director: text("director").notNull(),
  currentPrice: text("current_price").notNull().default("100.00"),
  basePrice: text("base_price").notNull().default("100.00"),
  totalVolume: text("total_volume").notNull().default("0"),
  dailyNetVolume: integer("daily_net_volume").notNull().default(0),
  lastOpenDate: text("last_open_date").notNull().default(""),
  premiereDate: text("premiere_date"),
  // Critical rating field: admin sets 1-10 score based on festival reception
  // Price adjusts proportionally when rating changes
  rating: integer("rating").notNull().default(5),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

// Session logins: tracks which IP has logged in during current trading session
// Cleared at the start of each new session (09:00 and 15:00)
export const sessionLogins = sqliteTable("session_logins", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ip: text("ip").notNull(),
  userId: integer("user_id").notNull(),
  // Session key: "2026-05-13-am" or "2026-05-13-pm"
  sessionKey: text("session_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

// Register IPs: tracks registration sources to prevent multi-account abuse
export const registerIps = sqliteTable("register_ips", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  ip: text("ip").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

// Price history: records price snapshot after each settlement
// Used for trend charts and historical price analysis
export const priceHistory = sqliteTable("price_history", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  movieId: integer("movie_id").notNull(),
  price: text("price").notNull(),
  basePrice: text("base_price").notNull(),
  // Settlement identifier: "2026-05-13-am-09:30"
  settlementKey: text("settlement_key").notNull(),
  // Net volume that caused this price change
  netVolume: integer("net_volume").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

// Rating events: admin-set word-of-mouth impacts that directly move prices
// Example: a film bombs at premiere → create -30% event for 3 cycles
// Each settlement applies a portion of the impact (linear decay over cycles)
export const ratingEvents = sqliteTable("rating_events", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  movieId: integer("movie_id").notNull(),
  // Impact on price: negative = crash, positive = surge
  // e.g. -30 means price drops 30% over the event duration
  impactPercent: integer("impact_percent").notNull(),
  // How many settlement cycles remain (each cycle = 10 min during trading hours)
  remainingCycles: integer("remaining_cycles").notNull(),
  totalCycles: integer("total_cycles").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const holdings = sqliteTable("holdings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  quantity: integer("quantity").notNull().default(0),
  avgBuyPrice: text("avg_buy_price").notNull().default("0"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  type: text("type", { enum: ["buy", "sell"] }).notNull(),
  quantity: integer("quantity").notNull(),
  price: text("price").notNull(),
  totalAmount: text("total_amount").notNull(),
  session: text("session", { enum: ["am", "pm"] }).notNull().default("am"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const diaries = sqliteTable("diaries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary"),
  coverImage: text("cover_image"),
  coverImage2: text("cover_image_2"),
  coverImage3: text("cover_image_3"),
  externalUrl: text("external_url"),
  wechatArticleId: text("wechat_article_id"),
  publishDate: integer("publish_date", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  replyTo: integer("reply_to"), // references comments.id for reply
  replyToUsername: text("reply_to_username"), // quoted username
  replyToContent: text("reply_to_content"), // quoted content snippet
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const siteConfig = sqliteTable("site_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Diary = typeof diaries.$inferInsert;
export type Comment = typeof comments.$inferSelect;
