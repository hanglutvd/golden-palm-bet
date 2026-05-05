import fs from "fs";
import path from "path";

const DB_PATH = process.env.DB_PATH || "/data/data.sqlite";
const BACKUP_DIR = "/data/backup";

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getBeijingNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

function getBackupFilename(): string {
  const bj = getBeijingNow();
  const ts = `${bj.getFullYear()}${String(bj.getMonth() + 1).padStart(2, "0")}${String(bj.getDate()).padStart(2, "0")}-${String(bj.getHours()).padStart(2, "0")}${String(bj.getMinutes()).padStart(2, "0")}${String(bj.getSeconds()).padStart(2, "0")}`;
  return `data-${ts}.sqlite`;
}

function cleanOldBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("data-") && f.endsWith(".sqlite"))
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  // Keep only the latest 7 backups
  const toDelete = files.slice(7);
  for (const f of toDelete) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      console.log(`[backup] removed old backup: ${f.name}`);
    } catch {
      // ignore
    }
  }
}

export function runBackup() {
  ensureDir(BACKUP_DIR);
  const src = DB_PATH;
  if (!fs.existsSync(src)) {
    console.log("[backup] source db not found, skipping");
    return;
  }
  const dest = path.join(BACKUP_DIR, getBackupFilename());
  try {
    fs.copyFileSync(src, dest);
    console.log(`[backup] created: ${dest}`);
    cleanOldBackups();
  } catch (err: any) {
    console.error("[backup] failed:", err.message);
  }
}

/**
 * Start daily backup at 04:00 Beijing Time
 * Uses setTimeout so it works in Railway containers (no system cron needed)
 */
export function startBackupSchedule() {
  const scheduleNext = () => {
    const now = new Date();
    // Next 04:00 Beijing Time
    // Simple approximation: just use local server time for interval scheduling
    // Railway servers are UTC, so 04:00 Beijing = 20:00 UTC (previous day) or 20:00 UTC
    const target = new Date(now);
    target.setHours(4, 0, 0, 0); // 04:00 local server time
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const msUntil = target.getTime() - now.getTime();

    console.log(
      `[backup] next backup scheduled at ${target.toISOString()} (in ${Math.round(msUntil / 3600000)}h)`
    );

    setTimeout(() => {
      runBackup();
      // Then every 24 hours
      setInterval(runBackup, 24 * 3600 * 1000);
    }, msUntil);
  };

  scheduleNext();
}
