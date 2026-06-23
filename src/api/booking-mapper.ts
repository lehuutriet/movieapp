import type { BookingConcessionLine, BookingDocument } from "@/types/booking";

function parseConcessionLines(raw: unknown): BookingConcessionLine[] {
  let items: unknown[] = [];

  if (Array.isArray(raw)) {
    if (
      raw.length > 0 &&
      typeof raw[0] === "string" &&
      raw[0].trim().startsWith("{")
    ) {
      items = raw
        .map((entry) => {
          if (typeof entry !== "string") return null;
          try {
            return JSON.parse(entry) as unknown;
          } catch {
            return null;
          }
        })
        .filter((entry): entry is unknown => entry != null);
    } else {
      items = raw;
    }
  } else if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed;
      }
    } catch {
      return [];
    }
  } else {
    return [];
  }

  return items
    .map((item): BookingConcessionLine | null => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row.itemId ?? "");
      const name = String(row.name ?? "");
      if (!id || !name) return null;

      return {
        id,
        name,
        quantity: Number(row.quantity ?? 0),
        unitPrice: Number(row.unitPrice ?? 0),
        lineTotal: Number(row.lineTotal ?? 0),
      };
    })
    .filter((line): line is BookingConcessionLine => line !== null);
}

export function mapBookingDocument(raw: Record<string, unknown>): BookingDocument {
  const totalAmount = Number(raw.totalAmount ?? 0);
  const concessionLines = parseConcessionLines(raw.concessionLines);

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
    totalAmount,
    promoCode: raw.promoCode ? String(raw.promoCode) : null,
    status: (raw.status as BookingDocument["status"]) ?? "pending",
    expiresAt: String(raw.expiresAt),
    concessionLines,
    concessionSubtotal: Number(raw.concessionSubtotal ?? 0),
    concessionDiscount: Number(raw.concessionDiscount ?? 0),
    concessionTotal: Number(raw.concessionTotal ?? 0),
    grandTotal: Number(raw.grandTotal ?? totalAmount),
    comboPromoCode: raw.comboPromoCode ? String(raw.comboPromoCode) : null,
    paymentMethod: raw.paymentMethod
      ? (String(raw.paymentMethod) as BookingDocument["paymentMethod"])
      : null,
  };
}

export function serializeConcessionLines(
  lines: BookingConcessionLine[],
): string {
  return JSON.stringify(lines);
}
