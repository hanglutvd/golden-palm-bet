import { getBeijingTime, getBeijingDateStr, isPreLaunch } from "../contracts/market.js";
import { openMarketForAll } from "./queries/movies.js";
import { getDb } from "./queries/connection.js";
import { sessionLogins } from "../db/schema.js";

const SETTLEMENT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Settlement cron: every 10 minutes during trading hours
 * - Trading hours: 09:00-12:00, 15:00-18:00 Beijing Time
 * - Sensitivity: 0.5% per net share
 * - dailyNetVolume reset to 0 after each settlement
 */
export function startDailySettlementCron() {
  const scheduleNext = () => {
    const now = new Date();
    const msUntil = getMsUntilNextSettlement();

    if (msUntil === null) {
      // Outside trading hours, check again in 1 minute
      console.log("[cron] Outside trading hours, rechecking in 1m...");
      setTimeout(scheduleNext, 60 * 1000);
      return;
    }

    const minutesUntil = Math.round(msUntil / 60000);
    console.log(`[cron] Next settlement in ${minutesUntil}m (${new Date(Date.now() + msUntil).toISOString()})`);

    setTimeout(() => {
      console.log(`[cron] ====== SETTLEMENT TRIGGERED at ${new Date().toISOString()} ======`);
      runSettlement();
      console.log(`[cron] ====== SETTLEMENT COMPLETED ======`);
      scheduleNext();
    }, msUntil);
  };

  scheduleNext();
}

async function runSettlement() {
  try {
    // Pre-launch: no settlement (price stays at 100)
    if (isPreLaunch()) {
      console.log("[cron] Pre-launch: no settlement, price locked");
      return;
    }

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);
    const hour = beijing.getHours();
    const minute = beijing.getMinutes();

    const session = hour < 15 ? "am" : "pm";
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    // Clear session logins at the start of each new session (09:00 and 15:00)
    // This resets the "1 login per session" restriction for over-limit IPs
    if ((hour === 9 && minute < 15) || (hour === 15 && minute < 15)) {
      const db = getDb();
      db.delete(sessionLogins).run();
      console.log(`[cron] New session started, cleared session login records`);
    }

    // Cleanup: remove session login records older than 48 hours (daily at 03:00)
    if (hour === 3 && minute < 15) {
      const db = getDb();
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).getTime();
      db.run(`DELETE FROM session_logins WHERE created_at < ${twoDaysAgo}`);
      console.log(`[cron] Cleaned up old session login records`);
    }

    console.log(`[cron] Settlement at ${timeStr} (session=${session})...`);
    await openMarketForAll(session);
    console.log(`[cron] Settlement completed at ${timeStr}`);
  } catch (err: any) {
    console.error(`[cron] Settlement failed:`, err.message);
  }
}

/**
 * Calculate milliseconds until the next 10-minute boundary within trading hours.
 * Trading hours: 09:00-12:00 and 15:00-18:00 Beijing Time
 * Returns null if currently outside trading hours.
 */
function getMsUntilNextSettlement(): number | null {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijing = new Date(utc + 8 * 3600000);
  const hour = beijing.getHours();
  const minute = beijing.getMinutes();

  // Convert current Beijing time to minutes since midnight
  const currentMinutes = hour * 60 + minute;

  // Morning session: 09:00-12:00 (540-720)
  // Afternoon session: 15:00-18:00 (900-1080)
  const isTrading =
    (currentMinutes >= 540 && currentMinutes < 720) ||
    (currentMinutes >= 900 && currentMinutes < 1080);

  if (!isTrading) {
    return null;
  }

  // Find next 10-minute boundary: :00, :10, :20, :30, :40, :50
  const nextBoundaryMinute = Math.ceil((minute + 1) / 10) * 10;
  let targetHour = hour;
  let targetMinute = nextBoundaryMinute;

  if (targetMinute >= 60) {
    targetHour += 1;
    targetMinute = 0;
  }

  // Check if the next boundary is still within trading hours
  const targetMinutes = targetHour * 60 + targetMinute;
  const morningEnd = 720;   // 12:00
  const afternoonEnd = 1080; // 18:00

  if (currentMinutes < morningEnd && targetMinutes > morningEnd) {
    return null;
  }
  if (currentMinutes < afternoonEnd && targetMinutes > afternoonEnd) {
    return null;
  }

  // Calculate milliseconds until next boundary
  const targetBeijing = new Date(beijing);
  targetBeijing.setHours(targetHour, targetMinute, 0, 0);

  const targetUtc = new Date(targetBeijing.getTime() - 8 * 3600000);
  return targetUtc.getTime() - now.getTime();
}
