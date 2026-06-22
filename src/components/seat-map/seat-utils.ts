import type { SeatStatusSnapshot } from "@/types/booking";
import type { SeatUIStatus } from "@/types/seat";

export function resolveSeatUIStatus(
  seatId: string,
  snapshot: SeatStatusSnapshot | undefined,
  selectedSeatIds: ReadonlySet<string>,
  mySessionId: string,
): SeatUIStatus {
  if (snapshot?.sold.includes(seatId)) {
    return "sold";
  }

  const lock = snapshot?.locked.find((item) => item.seatId === seatId);
  if (lock && lock.sessionId !== mySessionId) {
    return "locked";
  }

  if (selectedSeatIds.has(seatId)) {
    return "selected";
  }

  return "available";
}

export const SEAT_STATUS_STYLES: Record<
  SeatUIStatus,
  { button: string; label: string }
> = {
  available: {
    button:
      "border border-slate-700 bg-slate-800 text-gray-300 hover:bg-slate-600",
    label: "Trống",
  },
  selected: {
    button:
      "border border-red-500 bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110",
    label: "Đang chọn",
  },
  locked: {
    button:
      "cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600 opacity-50",
    label: "Đang giữ",
  },
  sold: {
    button:
      "cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-600 opacity-50",
    label: "Đã bán",
  },
};

export function groupSeatsByRow<T extends { rowLabel: string; colNumber: number }>(
  seats: T[],
): Map<string, T[]> {
  const rows = new Map<string, T[]>();

  for (const seat of seats) {
    const row = rows.get(seat.rowLabel) ?? [];
    row.push(seat);
    rows.set(seat.rowLabel, row);
  }

  for (const [rowLabel, rowSeats] of rows) {
    rows.set(
      rowLabel,
      [...rowSeats].sort((a, b) => a.colNumber - b.colNumber),
    );
  }

  return new Map([...rows.entries()].sort(([a], [b]) => a.localeCompare(b)));
}
