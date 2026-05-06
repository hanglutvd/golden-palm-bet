import { getBeijingTime, getBeijingDateStr } from "../contracts/market.js";
import { openMarketForAll } from "./queries/movies.js";

/**
 * Schedule settlement cron: twice daily at 12:00 and 18:00 Beijing Time
 * - 12:00 结算上午交易 (session: 'am') → 15:00 开盘展示新价格
 * - 18:00 结算下午交易 (session: 'pm') → 次日 09:00 开盘展示新价格
 * Uses setTimeout so it works in Railway containers (no system cron needed)
 */
export function startDailySettlementCron() {
  const scheduleNext = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const beijing = new Date(utc + 8 * 3600000);

    const hour = beijing.getHours();
    let target: Date;
    let session: "am" | "pm";

    if (hour < 12) {
      // Before noon, schedule for 12:00 (AM settlement)
      target = new Date(beijing);
      target.setHours(12, 0, 0, 0);
      session = "am";
    } else if (hour < 18) {
      // Before evening, schedule for 18:00 (PM settlement)
      target = new Date(beijing);
      target.setHours(18, 0, 0, 0);
      session = "pm";
    } else {
      // After evening close, schedule for tomorrow 12:00 (AM settlement)
      target = new Date(beijing);
      target.setDate(target.getDate() + 1);
      target.setHours(12, 0, 0, 0);
      session = "am";
    }

    // Convert back to local server time for setTimeout
    const targetUtc = new Date(target.getTime() - 8 * 3600000);
    const msUntil = targetUtc.getTime() - now.getTime();

    const bjStr = `${target.getMonth() + 1}月${target.getDate()}日 ${target.getHours().toString().padStart(2, "0")}:00`;
    const hoursUntil = Math.round(msUntil / 3600000);
    console.log(
      `[cron] Next settlement scheduled: ${bjStr} session=${session} (in ${hoursUntil}h)`
    );

    setTimeout(() => {
      runDailySettlement(session);
      // Schedule next one after this runs
      scheduleNext();
    }, msUntil);
  };

  scheduleNext();
}

async function runDailySettlement(session: "am" | "pm") {
  try {
    const today = getBeijingDateStr();
    console.log(`[cron] Running ${session} settlement for ${today}...`);
    await openMarketForAll(session);
    console.log(`[cron] ${session} settlement completed for ${today}`);
  } catch (err: any) {
    console.error(`[cron] ${session} settlement failed:`, err.message);
  }
}
