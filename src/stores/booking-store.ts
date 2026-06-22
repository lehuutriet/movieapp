import { create } from "zustand";
import {
  createBookingWithLocks,
  getSeatConflictMessage,
  isSeatConflictError,
  SeatConflictError,
} from "@/api/booking";
import type { Seat, SeatSelection } from "@/types/seat";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

const MAX_SEATS_PER_BOOKING = 8;
const SESSION_STORAGE_KEY = "movieapp_booking_session_id";

export type BookingStep = "idle" | "selecting" | "locking" | "locked" | "paying";

interface ShowtimeMeta {
  movieTitle: string;
  cinemaName: string;
  startTime: string;
  basePrice: number;
}

interface BookingState {
  sessionId: string;
  showtimeId: string | null;
  showtimeMeta: ShowtimeMeta | null;
  showtimeBasePrice: number | null;
  selectedSeats: SeatSelection[];
  lockExpiresAt: number | null;
  bookingId: string | null;
  step: BookingStep;
}

interface BookingActions {
  initSession: () => void;
  setShowtime: (showtimeId: string, meta?: ShowtimeMeta) => void;
  setShowtimeBasePrice: (showtimeBasePrice: number) => void;
  toggleSeat: (seat: SeatSelection) => void;
  removeSeats: (seatIds: string[]) => void;
  confirmBooking: (
    showtimeId: string,
    selectedSeats: SeatSelection[],
  ) => Promise<string | null>;
  clearBooking: () => void;
}

type BookingStore = BookingState & BookingActions;

export function seatToSelection(
  seat: Seat,
  showtimeBasePrice: number,
): SeatSelection {
  return {
    id: seat.$id,
    label: seat.seatLabel,
    price: showtimeBasePrice,
  };
}

export function calculateTotalAmount(
  selectedSeats: SeatSelection[],
  showtimeBasePrice: number,
): number {
  return selectedSeats.length * showtimeBasePrice;
}

function createSessionId(): string {
  return crypto.randomUUID();
}

function readSessionId(): string {
  const stored = localStorage.getItem(SESSION_STORAGE_KEY);
  if (stored) return stored;

  const sessionId = createSessionId();
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

const initialState: BookingState = {
  sessionId: readSessionId(),
  showtimeId: null,
  showtimeMeta: null,
  showtimeBasePrice: null,
  selectedSeats: [],
  lockExpiresAt: null,
  bookingId: null,
  step: "idle",
};

export const useBookingStore = create<BookingStore>((set, get) => ({
  ...initialState,

  initSession: () => {
    set({ sessionId: readSessionId() });
  },

  setShowtime: (showtimeId, meta) => {
    set({
      showtimeId,
      showtimeMeta: meta ?? null,
      showtimeBasePrice: meta?.basePrice ?? null,
      selectedSeats: [],
      lockExpiresAt: null,
      bookingId: null,
      step: "selecting",
    });
  },

  setShowtimeBasePrice: (showtimeBasePrice) => {
    set({ showtimeBasePrice });
  },

  toggleSeat: (seat) => {
    const { selectedSeats, step } = get();
    if (step === "locking" || step === "paying") return;

    const exists = selectedSeats.some((item) => item.id === seat.id);

    if (exists) {
      set({
        selectedSeats: selectedSeats.filter((item) => item.id !== seat.id),
        step: "selecting",
      });
      return;
    }

    if (selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
      useUIStore.getState().showToast({
        type: "warning",
        message: `Chỉ được chọn tối đa ${MAX_SEATS_PER_BOOKING} ghế mỗi lần.`,
      });
      return;
    }

    set({
      selectedSeats: [...selectedSeats, seat],
      step: "selecting",
    });
  },

  removeSeats: (seatIds) => {
    const ids = new Set(seatIds);
    set((state) => ({
      selectedSeats: state.selectedSeats.filter((seat) => !ids.has(seat.id)),
    }));
  },

  confirmBooking: async (showtimeId, selectedSeats) => {
    if (selectedSeats.length === 0) {
      useUIStore.getState().showToast({
        type: "warning",
        message: "Vui lòng chọn ít nhất một ghế trước khi tiếp tục.",
      });
      return null;
    }

    const { sessionId } = get();
    const userId = useAuthStore.getState().user?.$id;
    set({ step: "locking", showtimeId });

    try {
      const result = await createBookingWithLocks({
        showtimeId,
        seats: selectedSeats,
        sessionId,
        userId,
      });

      set({
        bookingId: result.bookingId,
        lockExpiresAt: result.expiresAt,
        selectedSeats,
        step: "locked",
      });

      return result.bookingId;
    } catch (error) {
      set({ step: "selecting" });

      if (error instanceof Error && error.message === "APPWRITE_NOT_CONFIGURED") {
        useUIStore.getState().showToast({
          type: "warning",
          message:
            "Chưa cấu hình Appwrite. Tạo file .env và restart dev server để giữ ghế thật.",
        });
        return null;
      }

      if (isSeatConflictError(error)) {
        const conflictingIds =
          error instanceof SeatConflictError
            ? error.conflictingSeats.map((seat) => seat.id)
            : selectedSeats.map((seat) => seat.id);

        get().removeSeats(conflictingIds);

        useUIStore.getState().showToast({
          type: "error",
          message: getSeatConflictMessage(error),
        });

        return null;
      }

      useUIStore.getState().showToast({
        type: "error",
        message: "Không thể giữ ghế. Vui lòng thử lại sau.",
      });

      throw error;
    }
  },

  clearBooking: () => {
    set({
      showtimeId: null,
      showtimeMeta: null,
      showtimeBasePrice: null,
      selectedSeats: [],
      lockExpiresAt: null,
      bookingId: null,
      step: "idle",
    });
  },
}));
