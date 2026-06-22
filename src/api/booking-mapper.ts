import type { BookingDocument } from "@/types/booking";

export function mapBookingDocument(raw: Record<string, unknown>): BookingDocument {
  return {
    $id: String(raw.$id),
    userId: (raw.userId as string | null) ?? null,
    showtimeId: String(raw.showtimeId),
    seatIds: Array.isArray(raw.seatIds) ? (raw.seatIds as string[]) : [],
    seatLabels: Array.isArray(raw.seatLabels)
      ? (raw.seatLabels as string[])
      : [],
    subtotal: Number(raw.subtotal ?? 0),
    discount: Number(raw.discount ?? 0),
    totalAmount: Number(raw.totalAmount ?? 0),
    status: (raw.status as BookingDocument["status"]) ?? "pending",
    expiresAt: String(raw.expiresAt),
  };
}
