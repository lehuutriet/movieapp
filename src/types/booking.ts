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
  promoCode?: string | null;
  status: BookingStatus;
  expiresAt: string;
  concessionLines: BookingConcessionLine[];
  concessionSubtotal: number;
  concessionDiscount: number;
  concessionTotal: number;
  grandTotal: number;
  comboPromoCode?: string | null;
  paymentMethod?: PaymentMethod | null;
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

/** Snapshot of one F&B line saved on a paid booking. */
export interface BookingConcessionLine {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface BookingConcessionSnapshot {
  lines: BookingConcessionLine[];
  subtotal: number;
  discount: number;
  total: number;
  comboPromoCode?: string | null;
}
