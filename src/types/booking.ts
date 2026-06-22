export type SeatLockStatus = "active" | "released" | "converted";

export type BookingStatus = "pending" | "paid" | "expired" | "cancelled";

export interface SeatLockDocument {
  $id: string;
  showtimeId: string;
  seatId: string;
  seatLabel: string;
  userId?: string;
  sessionId: string;
  lockedAt: string;
  expiresAt: string;
  status: SeatLockStatus;
}

export interface BookingDocument {
  $id: string;
  userId?: string | null;
  showtimeId: string;
  seatIds: string[];
  seatLabels: string[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: BookingStatus;
  expiresAt: string;
}

export interface BookingCheckoutView {
  booking: BookingDocument;
  movieTitle: string;
  cinemaName: string;
  showtimeLabel: string;
}

export interface SeatStatusSnapshot {
  sold: string[];
  locked: Array<{
    seatId: string;
    sessionId: string;
    expiresAt: string;
  }>;
}

export interface CreateBookingResult {
  bookingId: string;
  expiresAt: number;
}

export type PaymentMethod = "atm" | "momo" | "cash";
