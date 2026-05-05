/**
 * 将 ISO 日期字符串格式化为中文显示
 * 输入: "2026-05-13T15:00" 或 "2026-05-13" 或 "待定"
 * 输出: "5月13日 15:00" 或 "5月13日" 或 "待定"
 */
export function formatPremiereDate(dateStr?: string): string {
  if (!dateStr || dateStr === '待定') return '待定';

  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // 无法解析则原样返回

    const month = d.getMonth() + 1;
    const day = d.getDate();

    // 如果有时间部分
    if (dateStr.includes('T')) {
      const hours = d.getHours().toString().padStart(2, '0');
      const minutes = d.getMinutes().toString().padStart(2, '0');
      return `${month}月${day}日 ${hours}:${minutes}`;
    }

    // 仅日期
    return `${month}月${day}日`;
  } catch {
    return dateStr;
  }
}

/**
 * 判断首映时间是否晚于另一个时间
 */
export function isPremiereLaterThan(dateA?: string, dateB?: string): boolean {
  if (!dateA || dateA === '待定') return false;
  if (!dateB || dateB === '待定') return true;

  try {
    return new Date(dateA) > new Date(dateB);
  } catch {
    return dateA.localeCompare(dateB) > 0;
  }
}

/**
 * 首映时间排序比较函数（用于 Array.sort）
 * 支持 ISO 格式（2026-05-13T15:00）
 * "待定" 排在最后
 */
export function comparePremiereDate(dateA?: string, dateB?: string): number {
  if (!dateA || dateA === '待定') return 1;
  if (!dateB || dateB === '待定') return -1;

  try {
    const a = new Date(dateA).getTime();
    const b = new Date(dateB).getTime();
    if (!isNaN(a) && !isNaN(b)) {
      return a - b;
    }
  } catch {
    // 回退到字符串排序（ISO 格式字典序=时间序）
  }

  return dateA.localeCompare(dateB);
}
