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
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
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
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export const diaries = sqliteTable("diaries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  summary: text("summary"),
  coverImage: text("cover_image"),
  externalUrl: text("external_url"),
  wechatArticleId: text("wechat_article_id"),
  publishDate: integer("publish_date", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Diary = typeof diaries.$inferInsert;
