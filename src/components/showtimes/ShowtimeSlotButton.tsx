import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { useBookingStore } from "@/stores/booking-store";
import type { ShowtimeSlot } from "@/types/showtime";

interface ShowtimeSlotButtonProps {
  slot: ShowtimeSlot;
  className?: string;
}

export function ShowtimeSlotButton({ slot, className }: ShowtimeSlotButtonProps) {
  const navigate = useNavigate();
  const setShowtime = useBookingStore((state) => state.setShowtime);

  const handleSelect = () => {
    setShowtime(slot.showtimeId, {
      movieTitle: "",
      cinemaName: "",
      startTime: slot.startTime,
      basePrice: slot.basePrice,
    });
    navigate(`/book/seats/${slot.showtimeId}`);
  };

  return (
    <button
      type="button"
      disabled={slot.isPast}
      onClick={handleSelect}
      className={cn(
        "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
        slot.isPast
          ? "cursor-not-allowed border-slate-800 bg-transparent text-slate-600 opacity-50"
          : "border-slate-600 bg-transparent text-gray-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-500",
        className,
      )}
    >
      <span className="block font-mono text-base font-bold tabular-nums">
        {slot.timeLabel}
      </span>
      <span className="mt-0.5 block text-[10px] text-gray-500">{slot.format}</span>
      {!slot.isPast && (
        <span className="mt-1 block text-xs font-medium text-red-400/90">
          {slot.basePrice.toLocaleString("vi-VN")}đ
        </span>
      )}
    </button>
  );
}

interface ShowtimeSlotListProps {
  slots: ShowtimeSlot[];
  className?: string;
}

export function ShowtimeSlotList({ slots, className }: ShowtimeSlotListProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {slots.map((slot) => (
        <ShowtimeSlotButton key={slot.showtimeId} slot={slot} />
      ))}
    </div>
  );
}
