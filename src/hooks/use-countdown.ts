import { useEffect, useMemo, useState } from "react";

function formatMmSs(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Countdown tới `expiresAt` (ISO). Dựa trên chênh lệch thời gian thực — F5 không reset.
 */
export function useCountdown(expiresAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;

    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return useMemo(() => {
    if (!expiresAt) {
      return { formatted: "--:--", isExpired: false, remainingMs: 0 };
    }

    const expiresMs = Date.parse(expiresAt);
    if (Number.isNaN(expiresMs)) {
      return { formatted: "--:--", isExpired: false, remainingMs: 0 };
    }

    const remainingMs = Math.max(0, expiresMs - now);
    const isExpired = remainingMs <= 0;

    return {
      formatted: formatMmSs(remainingMs),
      isExpired,
      remainingMs,
    };
  }, [expiresAt, now]);
}
