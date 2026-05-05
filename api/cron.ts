import { getBeijingTime, getBeijingDateStr } from "../contracts/market.js";
import { openMarketForAll } from "./queries/movies.js";

/**
 * Schedule daily market open at 09:00 Beijing Time
 * Uses setTimeout + setInterval (no external cron dependency)
 */
export function startDailySettlementCron() {
  const scheduleNext = () => {
    const now = new Date();
    // Calculate next 09:00 Beijing Time
    // Beijing is UTC+8, so 09:00 Beijing = 01:00 UTC
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);

    const target = new Date(beijing);
    target.setHours(9, 0, 0, 0);

    if (target.getTime() <= beijing.getTime()) {
      // Already past 09:00 today, schedule for tomorrow
      target.setDate(target.getDate() + 1);
    }

    // Convert back to local server time for setTimeout
    const targetUtc = new Date(target.getTime() - 8 * 3600000);
    const msUntil = targetUtc.getTime() - now.getTime();

    const bjStr = `${target.getMonth() + 1}月${target.getDate()}日 09:00`;
    const hoursUntil = Math.round(msUntil / 3600000);
    console.log(
      `[cron] Next daily settlement scheduled: ${bjStr} (in ${hoursUntil}h)`
    );

    setTimeout(() => {
      runDailySettlement();
      // After first run, schedule every 24 hours
      setInterval(runDailySettlement, 24 * 3600 * 1000);
    }, msUntil);
  };

  scheduleNext();
}

async function runDailySettlement() {
  try {
    const today = getBeijingDateStr();
    console.log(`[cron] Running daily settlement for ${today}...`);
    await openMarketForAll();
    console.log(`[cron] Daily settlement completed for ${today}`);
  } catch (err: any) {
    console.error("[cron] Daily settlement failed:", err.message);
  }
}
