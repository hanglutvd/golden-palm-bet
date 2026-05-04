/**
 * Market session utilities
 * Trading hours: 09:00 - 15:00 Beijing Time (UTC+8)
 */

export const TRADING_START_HOUR = 9;
export const TRADING_END_HOUR = 15;

/**
 * Get current time in Beijing timezone
 */
export function getBeijingTime(): Date {
  const now = new Date();
  // Convert to Beijing time (UTC+8)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

/**
 * Check if market is currently open
 * Returns { isOpen: boolean, status: string, nextOpen?: Date }
 */
export function getMarketStatus(): {
  isOpen: boolean;
  status: string;
  nextOpen?: Date;
  nextClose?: Date;
} {
  const beijing = getBeijingTime();
  const hour = beijing.getHours();
  const minute = beijing.getMinutes();
  const currentTime = hour + minute / 60;

  if (currentTime >= TRADING_START_HOUR && currentTime < TRADING_END_HOUR) {
    // Market is open
    const nextClose = new Date(beijing);
    nextClose.setHours(TRADING_END_HOUR, 0, 0, 0);
    return {
      isOpen: true,
      status: "交易中",
      nextClose,
    };
  }

  // Market is closed
  let nextOpen: Date;
  if (currentTime < TRADING_START_HOUR) {
    // Before opening today
    nextOpen = new Date(beijing);
    nextOpen.setHours(TRADING_START_HOUR, 0, 0, 0);
  } else {
    // After closing, next open is tomorrow
    nextOpen = new Date(beijing);
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(TRADING_START_HOUR, 0, 0, 0);
  }

  return {
    isOpen: false,
    status: hour >= TRADING_END_HOUR ? "已收盘" : "未开盘",
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
 */
export function assertTradingHours(): void {
  const status = getMarketStatus();
  if (!status.isOpen) {
    const next = status.nextOpen!;
    const timeStr = `${next.getHours().toString().padStart(2, "0")}:${next.getMinutes().toString().padStart(2, "0")}`;
    throw new Error(
      `当前为非交易时间（交易时段：09:00 - 15:00 北京时间）。下次开盘时间：${next.getMonth() + 1}月${next.getDate()}日 ${timeStr}`
    );
  }
}
