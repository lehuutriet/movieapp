import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import type { SeatUIStatus } from "@/types/seat";
import { SEAT_STATUS_STYLES } from "@/components/seat-map/seat-utils";

interface SeatButtonProps {
  label: string;
  status: SeatUIStatus;
  disabled?: boolean;
  onClick: () => void;
}

export function SeatButton({
  label,
  status,
  disabled = false,
  onClick,
}: SeatButtonProps) {
  const styles = SEAT_STATUS_STYLES[status];
  const isDisabled = disabled || status === "locked" || status === "sold";

  return (
    <button
      type="button"
      aria-label={`Ghế ${label}`}
      aria-pressed={status === "selected"}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-b-sm rounded-t-lg border text-[10px] font-medium transition-all",
        styles.button,
        isDisabled && "pointer-events-none",
      )}
    >
      {(status === "sold" || status === "locked") && (
        <span className="absolute inset-0 flex items-center justify-center">
          <X className="h-3.5 w-3.5" />
        </span>
      )}
      <span className={cn((status === "sold" || status === "locked") && "opacity-60")}>
        {label}
      </span>
    </button>
  );
}
