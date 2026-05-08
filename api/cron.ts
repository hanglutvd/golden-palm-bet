import { getBeijingTime, getBeijingDateStr } from "../contracts/market.js";
import { openMarketForAll } from "./queries/movies.js";

const SETTLEMENT_INTERVAL_MS = 60 * 1000; // 1 minute for testing (was 10 min)

/**
 * Settlement cron: every 1 minute (all times, for testing)
 * TEMP: No trading hours restriction - runs 24/7 for testing
 */
export function startDailySettlementCron() {
  const scheduleNext = () => {
    console.log(`[cron] Next settlement in 1m`);

    setTimeout(() => {
      runSettlement();
      scheduleNext();
    }, SETTLEMENT_INTERVAL_MS);
  };

  scheduleNext();
}

async function runSettlement() {
  try {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);
    const hour = beijing.getHours();
    const minute = beijing.getMinutes();

    const session = hour < 15 ? "am" : "pm";
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

    console.log(`[cron] Settlement at ${timeStr} (session=${session})...`);
    await openMarketForAll(session);
    console.log(`[cron] Settlement completed at ${timeStr}`);
  } catch (err: any) {
    console.error(`[cron] Settlement failed:`, err.message);
  }
}
