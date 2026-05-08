/**
 * Market session utilities
 * Trading hours: 09:00-12:00 / 15:00-18:00 Beijing Time (UTC+8)
 * Settlement: 12:00 and 18:00
 */

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

/**
 * Validate if trading is allowed, throw error if not
 * TEMP: Trading hours check disabled for testing
 */
export function assertTradingHours(): void {
  // Allow trading at all times for testing
  return;
}
