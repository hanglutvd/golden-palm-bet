import { mysqlTable, serial, varchar, timestamp, decimal, bigint, mysqlEnum, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    username: varchar("username", { length: 50 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("3000.00"),
    resetToken: varchar("reset_token", { length: 64 }),
    resetTokenExpiry: timestamp("reset_token_expiry"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    usernameIdx: index("username_idx").on(table.username),
  }),
);

export const movies = mysqlTable(
  "movies",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    director: varchar("director", { length: 100 }).notNull(),
    currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull().default("100.00"),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull().default("100.00"),
    totalVolume: decimal("total_volume", { precision: 12, scale: 2 }).notNull().default("0"),
    dailyNetVolume: bigint("daily_net_volume", { mode: "number" }).notNull().default(0),
    lastOpenDate: varchar("last_open_date", { length: 10 }).notNull().default(""),
    premiereDate: varchar("premiere_date", { length: 20 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("name_idx").on(table.name),
  }),
);

export const holdings = mysqlTable(
  "holdings",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
    movieId: bigint("movie_id", { mode: "number", unsigned: true }).notNull(),
    quantity: bigint("quantity", { mode: "number", unsigned: true }).notNull().default(0),
    avgBuyPrice: decimal("avg_buy_price", { precision: 10, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userMovieIdx: index("user_movie_idx").on(table.userId, table.movieId),
  }),
);

export const transactions = mysqlTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
    movieId: bigint("movie_id", { mode: "number", unsigned: true }).notNull(),
    type: mysqlEnum("type", ["buy", "sell"]).notNull(),
    quantity: bigint("quantity", { mode: "number", unsigned: true }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    movieIdx: index("movie_idx").on(table.movieId),
  }),
);

export const diaries = mysqlTable(
  "diaries",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: varchar("summary", { length: 500 }),
    coverImage: varchar("cover_image", { length: 500 }),
    externalUrl: varchar("external_url", { length: 500 }),
    wechatArticleId: varchar("wechat_article_id", { length: 100 }),
    publishDate: timestamp("publish_date").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    dateIdx: index("date_idx").on(table.publishDate),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Movie = typeof movies.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Diary = typeof diaries.$inferSelect;
