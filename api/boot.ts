import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import fs from "fs";
import { appRouter } from "./router.js";
import { createContext } from "./context.js";
import { env } from "./lib/env.js";
import { initDatabase } from "./init-db.js";
import { serveStaticFiles } from "./lib/vite.js";
import { startBackupSchedule } from "./backup.js";
import { startDailySettlementCron } from "./cron.js";

// Initialize SQLite database (create tables, seed data)
initDatabase();

// Start daily backup at 04:00 (keeps last 7 copies)
startBackupSchedule();

// Start daily price settlement at 09:00 Beijing Time
startDailySettlementCron();

const app = new Hono<{ Bindings: HttpBindings }>();

// File upload: save images to persistent volume
const IMG_DIR = "/data/images";
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

app.post("/api/upload", bodyLimit({ maxSize: 10 * 1024 * 1024 }), async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File;

    if (!file) {
      return c.json({ error: "未找到文件" }, 400);
    }

    if (!file.type.startsWith("image/")) {
      return c.json({ error: "只允许上传图片文件" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const maxSize = 5 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return c.json({ error: "图片大小不能超过 5MB" }, 400);
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "png";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
    const filepath = `${IMG_DIR}/${filename}`;

    fs.writeFileSync(filepath, buffer);

    return c.json({ url: `/images/${filename}` });
  } catch (err: any) {
    console.error("[upload] error:", err);
    return c.json({ error: err.message || "上传失败" }, 500);
  }
});

// Serve uploaded images
app.get("/images/:filename", async (c) => {
  const filename = c.req.param("filename");

  if (filename.includes("..") || filename.includes("/")) {
    return c.json({ error: "Invalid filename" }, 400);
  }

  const filepath = `${IMG_DIR}/${filename}`;
  if (!fs.existsSync(filepath)) {
    return c.notFound();
  }

  const ext = filename.split(".").pop()?.toLowerCase() || "png";
  const contentType: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
  };

  const file = fs.readFileSync(filepath);
  return new Response(file, {
    headers: {
      "Content-Type": contentType[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`[server] Running on port ${port}`);
  });
}
