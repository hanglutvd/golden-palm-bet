/**
 * Market session utilities
 * Trading hours: 09:00-12:00 / 15:00-18:00 Beijing Time (UTC+8)
 * Settlement: 12:00 and 18:00
 */

// Dynamic price sensitivity: higher at low prices, lower at high prices
// This prevents a few popular movies from skyrocketing to extreme prices
export function getPriceSensitivity(currentPrice: number): number {
  if (currentPrice >= 300) return 0.001; // 300+: 0.1% per net share
  if (currentPrice >= 150) return 0.002; // 150-300: 0.2%
  return 0.005; // 100-150: 0.5% (original)
}

export const AM_START = 9;
export const AM_END = 12;
export const PM_START = 15;
export const PM_END = 18;

export type Session = "am" | "pm";

/**
 * Get current time in Beijing timezone
 */
export function getBeijingTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

/**
 * Get current trading session
 */
export function getCurrentSession(): Session | null {
  const beijing = getBeijingTime();
  const hour = beijing.getHours();

  if (hour >= AM_START && hour < AM_END) return "am";
  if (hour >= PM_START && hour < PM_END) return "pm";
  return null;
}

/**
 * Check if market is currently open
 */
export function getMarketStatus(): {
  isOpen: boolean;
  status: string;
  session: Session | null;
  nextOpen?: Date;
  nextClose?: Date;
} {
  const beijing = getBeijingTime();
  const hour = beijing.getHours();
  const minute = beijing.getMinutes();
  const currentTime = hour + minute / 60;

  // Morning session
  if (currentTime >= AM_START && currentTime < AM_END) {
    const nextClose = new Date(beijing);
    nextClose.setHours(AM_END, 0, 0, 0);
    return {
      isOpen: true,
      status: "上午交易中",
      session: "am",
      nextClose,
    };
  }

  // Afternoon session
  if (currentTime >= PM_START && currentTime < PM_END) {
    const nextClose = new Date(beijing);
    nextClose.setHours(PM_END, 0, 0, 0);
    return {
      isOpen: true,
      status: "下午交易中",
      session: "pm",
      nextClose,
    };
  }

  // Market is closed
  let nextOpen: Date;
  let status: string;

  if (currentTime < AM_START) {
    // Before morning open
    nextOpen = new Date(beijing);
    nextOpen.setHours(AM_START, 0, 0, 0);
    status = "未开盘";
  } else if (currentTime >= AM_END && currentTime < PM_START) {
    // Lunch break
    nextOpen = new Date(beijing);
    nextOpen.setHours(PM_START, 0, 0, 0);
    status = "午间休市";
  } else {
    // After afternoon close, next open is tomorrow morning
    nextOpen = new Date(beijing);
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(AM_START, 0, 0, 0);
    status = "已收盘";
  }

  return {
    isOpen: false,
    status,
    session: null,
    nextOpen,
  };
}

/**
 * Get current Beijing date as "YYYY-MM-DD" string
 */
export function getBeijingDateStr(): string {
  const beijing = getBeijingTime();
  const y = beijing.getFullYear();
  const m = String(beijing.getMonth() + 1).padStart(2, "0");
  const d = String(beijing.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get current Beijing hour (0-23)
 */
export function getBeijingHour(): number {
  return getBeijingTime().getHours();
}

/**
 * Get the settlement date key for a session
 * Format: "YYYY-MM-DD-am" or "YYYY-MM-DD-pm"
 */
export function getSessionKey(): string {
  const beijing = getBeijingTime();
  const y = beijing.getFullYear();
  const m = String(beijing.getMonth() + 1).padStart(2, "0");
  const d = String(beijing.getDate()).padStart(2, "0");
  const session = getCurrentSession() || "pm";
  return `${y}-${m}-${d}-${session}`;
}

export function formatTimeRemaining(target: Date): string {
  const now = getBeijingTime().getTime();
  const diff = target.getTime() - now;
  if (diff <= 0) return "0分";

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}小时${minutes}分`;
  }
  return `${minutes}分`;
}

// ============================================
// MARKET CLOSE (end of trading)
// ============================================
const CLOSE_DATE = "2026-05-23"; // 闭市日期
const CLOSE_HOUR = 12; // 闭市时间：中午12点

/**
 * Check if the market has permanently closed.
 * After closing, no trading is allowed.
 */
export function isMarketClosed(): boolean {
  const today = getBeijingDateStr();
  const hour = getBeijingHour();
  // Close at 12:00 on May 23
  if (today > CLOSE_DATE) return true;
  if (today === CLOSE_DATE && hour >= CLOSE_HOUR) return true;
  return false;
}

/**
 * Get the market close date as a formatted string.
 */
export function getCloseDateDisplay(): string {
  return "5月23日（周六）中午12:00";
}

// ============================================
// PRE-LAUNCH PERIOD (before official market open)
// ============================================
const LAUNCH_DATE = "2026-05-13"; // 首次开盘日期
const LAUNCH_HOUR = 9; // 首次开盘时间（北京时间）

/**
 * Check if we're in the pre-launch period.
 * Pre-launch: unlimited trading, no settlement, price locked at 100.
 */
export function isPreLaunch(): boolean {
  const today = getBeijingDateStr();
  // Before May 13: pre-launch (unlimited trading, no settlement)
  if (today < LAUNCH_DATE) return true;
  return false;
}

/**
 * Check if market is locked on launch day (midnight to 9am).
 * During this window: no trading allowed.
 */
export function isLaunchLock(): boolean {
  const today = getBeijingDateStr();
  const hour = getBeijingHour();
  return today === LAUNCH_DATE && hour < LAUNCH_HOUR;
}

/**
 * Validate if trading is allowed, throw error if not.
 * Handles three phases:
 * 1. Pre-launch (before 5/13): always allowed
 * 2. Launch lock (5/13 00:00-09:00): not allowed
 * 3. After 5/13 09:00: normal trading hours
 */
export function assertTradingHours(): void {
  // Phase 1: Pre-launch period — unlimited trading
  if (isPreLaunch()) return;

  // Phase 2: Launch day lock (midnight to 9am)
  if (isLaunchLock()) {
    throw new Error(
      "戛纳电影节即将开幕！股票交易将于5月13日09:00（北京时间）正式开盘"
    );
  }

  // Phase 3: Normal trading hours (after 5/13 09:00)
  const status = getMarketStatus();
  if (!status.isOpen) {
    const next = status.nextOpen!;
    const timeStr = `${next.getHours().toString().padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`;
    throw new Error(
      `当前为非交易时间（交易时段：09:00-12:00 / 15:00-18:00 北京时间）。下次开盘时间：${next.getMonth() + 1}月${next.getDate()}日 ${timeStr}`
    );
  }
}
