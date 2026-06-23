import { useMemo } from "react";
import { SeatButton } from "@/components/seat-map/SeatButton";
import {
  groupSeatsByRow,
  SEAT_STATUS_STYLES,
} from "@/components/seat-map/seat-utils";
import { useSeatStatus } from "@/hooks/use-seat-status";
import { cn } from "@/lib/cn";
import { seatToSelection, useBookingStore } from "@/stores/booking-store";
import type { Seat, SeatUIStatus } from "@/types/seat";

interface SeatMapProps {
  showtimeId: string;
  seats: Seat[];
  basePrice?: number;
  className?: string;
}

export function SeatMap({
  showtimeId,
  seats,
  basePrice,
  className,
}: SeatMapProps) {
  const sessionId = useBookingStore((state) => state.sessionId);
  const showtimeBasePrice = useBookingStore((state) => state.showtimeBasePrice);
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const toggleSeat = useBookingStore((state) => state.toggleSeat);

  const resolvedBasePrice = basePrice ?? showtimeBasePrice;

  const { data: seatStatus, isLoading, isError, refetch } = useSeatStatus(showtimeId);

  const activeSeats = useMemo(
    () => seats.filter((seat) => seat.isActive),
    [seats],
  );

  const seatsByRow = useMemo(
    () => groupSeatsByRow(activeSeats),
    [activeSeats],
  );

  const selectedSeatIds = useMemo(
    () => new Set(selectedSeats.map((seat) => seat.id)),
    [selectedSeats],
  );
  const selectedSeatLabels = useMemo(
    () => new Set(selectedSeats.map((seat) => seat.label)),
    [selectedSeats],
  );
  const soldSeatLabels = useMemo(
    () => seatStatus?.soldSeats ?? [],
    [seatStatus],
  );
  const lockedSeatOwners = useMemo(
    () =>
      new Map(
        (seatStatus?.lockedSeats ?? []).map((lock) => [
          lock.seatLabel,
          lock.sessionId,
        ]),
      ),
    [seatStatus],
  );
  const statusCounts = useMemo(() => {
    const counts: Record<SeatUIStatus, number> = {
      available: 0,
      selected: 0,
      locked: 0,
      sold: 0,
    };

    for (const seat of activeSeats) {
      const lockSession = lockedSeatOwners.get(seat.seatLabel);
      const isLockedByOther = Boolean(lockSession && lockSession !== sessionId);
      const status: SeatUIStatus = soldSeatLabels.includes(seat.seatLabel)
        ? "sold"
        : isLockedByOther
          ? "locked"
          : selectedSeatIds.has(seat.$id) || selectedSeatLabels.has(seat.seatLabel)
            ? "selected"
            : "available";
      counts[status] += 1;
    }

    return counts;
  }, [
    activeSeats,
    lockedSeatOwners,
    selectedSeatIds,
    selectedSeatLabels,
    sessionId,
    soldSeatLabels,
  ]);

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl border border-slate-800 bg-slate-900/60 p-8", className)}>
        <p className="text-center text-sm text-slate-400">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8", className)}>
        <p className="text-center text-sm text-rose-200">
          Không tải được trạng thái ghế.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mx-auto mt-4 block rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-end justify-center rounded-t-[100%] border-t-4 border-blue-500 pb-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-blue-500 shadow-[0_-20px_50px_rgba(59,130,246,0.2)] h-12 w-full">
        MÀN HÌNH
      </div>

      <div className="overflow-x-auto">
        <div className="mx-auto flex w-fit min-w-full flex-col gap-2 px-2 py-2">
          {[...seatsByRow.entries()].map(([rowLabel, rowSeats]) => (
            <div key={rowLabel} className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-semibold text-slate-400">
                {rowLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                {rowSeats.map((seat) => {
                  const lockSession = lockedSeatOwners.get(seat.seatLabel);
                  const isLockedByOther = Boolean(
                    lockSession && lockSession !== sessionId,
                  );
                  const status: SeatUIStatus = soldSeatLabels.includes(seat.seatLabel)
                    ? "sold"
                    : isLockedByOther
                      ? "locked"
                      : selectedSeatIds.has(seat.$id) ||
                          selectedSeatLabels.has(seat.seatLabel)
                        ? "selected"
                        : "available";

                  return (
                    <SeatButton
                      key={seat.$id}
                      label={seat.seatLabel}
                      status={status}
                      onClick={() => {
                        if (resolvedBasePrice == null) return;
                        toggleSeat(seatToSelection(seat, resolvedBasePrice));
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-800 pt-4 text-xs text-slate-400">
        {(Object.keys(SEAT_STATUS_STYLES) as SeatUIStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className={cn(
                "h-4 w-4 rounded-t-md rounded-b-sm border",
                SEAT_STATUS_STYLES[status].button,
              )}
            />
            <span>
              {SEAT_STATUS_STYLES[status].label} ({statusCounts[status]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
