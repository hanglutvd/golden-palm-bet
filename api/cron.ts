import { getBeijingTime, getBeijingDateStr } from "../contracts/market.js";
import { openMarketForAll } from "./queries/movies.js";

/**
 * Schedule daily market open at 12:00 and 18:00 Beijing Time
 * Settlement happens at market close: 12:00 (AM close) and 18:00 (PM close)
 */
export function startDailySettlementCron() {
  const scheduleNext = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);

    const hour = beijing.getHours();
    let target: Date;

    if (hour < 12) {
      // Before noon, schedule for 12:00
      target = new Date(beijing);
      target.setHours(12, 0, 0, 0);
    } else if (hour < 18) {
      // Before evening, schedule for 18:00
      target = new Date(beijing);
      target.setHours(18, 0, 0, 0);
    } else {
      // After evening close, schedule for tomorrow 12:00
      target = new Date(beijing);
      target.setDate(target.getDate() + 1);
      target.setHours(12, 0, 0, 0);
    }

    // Convert back to local server time for setTimeout
    const targetUtc = new Date(target.getTime() - 8 * 3600000);
    const msUntil = targetUtc.getTime() - now.getTime();

    const bjStr = `${target.getMonth() + 1}月${target.getDate()}日 ${target.getHours().toString().padStart(2, "0")}:00`;
    const hoursUntil = Math.round(msUntil / 3600000);
    console.log(
      `[cron] Next settlement scheduled: ${bjStr} (in ${hoursUntil}h)`
    );

    setTimeout(() => {
      runDailySettlement();
      // Schedule next one after this runs
      scheduleNext();
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
