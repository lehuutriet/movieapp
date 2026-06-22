const VI_WEEKDAYS = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
] as const;

export interface DateOption {
  key: string;
  label: string;
  isToday: boolean;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function buildNext7Days(now = new Date()): DateOption[] {
  const todayKey = toDateKey(now);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);

    const key = toDateKey(date);
    const weekday = VI_WEEKDAYS[date.getDay()];
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const prefix = key === todayKey ? "Hôm nay" : weekday;

    return {
      key,
      label: `${prefix} ${day}/${month}`,
      isToday: key === todayKey,
    };
  });
}

export function isSameLocalDay(iso: string, dateKey: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  return toDateKey(date) === dateKey;
}

export function formatTimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function isShowtimePast(startTime: string, now = Date.now()): boolean {
  const startMs = Date.parse(startTime);
  if (Number.isNaN(startMs)) return true;
  return startMs <= now;
}

export function getDayRange(dateKey: string): { start: string; end: string } {
  const date = parseDateKey(dateKey);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start: start.toISOString(), end: end.toISOString() };
}
