import { AppwriteException } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";
import { mapBookingDocument, serializeConcessionLines } from "@/api/booking-mapper";
import { fetchShowtimeMeta } from "@/api/showtimes";
import { formatShowtimeLabel } from "@/data/showtime-meta";
import { getAppwriteErrorMessage, getUnknownAppwriteAttribute } from "@/lib/appwrite-errors";
import type {
  BookingCheckoutView,
  BookingConcessionSnapshot,
  BookingDocument,
  PaymentMethod,
} from "@/types/booking";
import {
  evaluatePromotion,
  findPromotionByCode,
  PromoValidationError,
} from "@/api/promotions";

async function toCheckoutView(
  booking: BookingDocument,
): Promise<BookingCheckoutView> {
  const meta = await fetchShowtimeMeta(booking.showtimeId);

  return {
    booking,
    movieTitle: meta.movieTitle,
    cinemaName: meta.cinemaName,
    showtimeLabel: formatShowtimeLabel(meta.startTime),
  };
}

export async function fetchBookingById(
  bookingId: string,
): Promise<BookingCheckoutView> {
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.getDocument(
    databaseId,
    collections.bookings,
    bookingId,
  );

  const booking = mapBookingDocument(doc as Record<string, unknown>);
  return toCheckoutView(booking  );
}

export async function applyPromoCodeToBooking(
  bookingId: string,
  code: string,
): Promise<BookingCheckoutView> {
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const view = await fetchBookingById(bookingId);
  const promotion = await findPromotionByCode(code);

  if (!promotion) {
    throw new PromoValidationError("Mã khuyến mãi không hợp lệ.");
  }

  const result = evaluatePromotion(promotion, view.booking.subtotal, 0);

  if (result.ticketDiscount <= 0) {
    throw new PromoValidationError("Mã này không áp dụng cho vé phim.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const totalAmount = Math.max(0, view.booking.subtotal - result.ticketDiscount);

  const doc = await databases.updateDocument(
    databaseId,
    collections.bookings,
    bookingId,
    {
      discount: result.ticketDiscount,
      totalAmount,
      promoCode: promotion.code,
    },
  );

  const booking = mapBookingDocument(doc as Record<string, unknown>);
  return toCheckoutView(booking);
}

export async function removePromoFromBooking(
  bookingId: string,
): Promise<BookingCheckoutView> {
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const view = await fetchBookingById(bookingId);
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.updateDocument(
    databaseId,
    collections.bookings,
    bookingId,
    {
      discount: 0,
      totalAmount: view.booking.subtotal,
      promoCode: null,
    },
  );

  const booking = mapBookingDocument(doc as Record<string, unknown>);
  return toCheckoutView(booking);
}

export interface CompleteMockPaymentParams {
  bookingId: string;
  method: PaymentMethod;
  concessions: BookingConcessionSnapshot;
  grandTotal: number;
}

function toAppwriteInt(value: number): number {
  return Math.round(value);
}

function buildPaidBookingPayload(
  params: CompleteMockPaymentParams,
): Record<string, unknown> {
  const { method, concessions, grandTotal } = params;

  const payload: Record<string, unknown> = {
    status: "paid",
    paymentMethod: method,
    concessionSubtotal: toAppwriteInt(concessions.subtotal),
    concessionDiscount: toAppwriteInt(concessions.discount),
    concessionTotal: toAppwriteInt(concessions.total),
    grandTotal: toAppwriteInt(grandTotal),
    concessionLines: serializeConcessionLines(concessions.lines),
  };

  if (concessions.comboPromoCode) {
    payload.comboPromoCode = concessions.comboPromoCode;
  }

  return payload;
}

async function updatePaidBookingDocument(
  bookingId: string,
  params: CompleteMockPaymentParams,
): Promise<void> {
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  let payload = buildPaidBookingPayload(params);
  let lastError: unknown;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await databases.updateDocument(
        databaseId,
        collections.bookings,
        bookingId,
        payload,
      );
      return;
    } catch (error) {
      lastError = error;

      if (!(error instanceof AppwriteException)) {
        throw error;
      }

      const unknownAttribute = getUnknownAppwriteAttribute(error);
      if (unknownAttribute && unknownAttribute in payload) {
        const nextPayload = { ...payload };
        delete nextPayload[unknownAttribute];
        payload = nextPayload;
        continue;
      }

      const invalidAttributeMatch = error.message.match(
        /attribute: "([^"]+)"/i,
      );
      const invalidAttribute = invalidAttributeMatch?.[1];
      if (
        invalidAttribute &&
        invalidAttribute in payload &&
        /invalid|enum|value/i.test(error.message)
      ) {
        const nextPayload = { ...payload };
        delete nextPayload[invalidAttribute];
        payload = nextPayload;
        continue;
      }

      const isConcessionLinesTypeError =
        /concessionLines/i.test(error.message) &&
        /invalid|expected|type/i.test(error.message);

      if (
        isConcessionLinesTypeError &&
        typeof payload.concessionLines === "string"
      ) {
        payload = {
          ...payload,
          concessionLines: params.concessions.lines.map((line) =>
            JSON.stringify({
              id: line.id,
              name: line.name,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              lineTotal: line.lineTotal,
            }),
          ),
        };
        continue;
      }

      throw new Error(getAppwriteErrorMessage(error));
    }
  }

  throw new Error(getAppwriteErrorMessage(lastError));
}

export async function completeMockPayment(
  params: CompleteMockPaymentParams,
): Promise<void> {
  const { bookingId } = params;
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const bookingDoc = await databases.getDocument(
    databaseId,
    collections.bookings,
    bookingId,
  );

  const booking = mapBookingDocument(bookingDoc as Record<string, unknown>);

  if (booking.status === "paid") {
    return;
  }

  const expiresMs = Date.parse(booking.expiresAt);
  if (!Number.isNaN(expiresMs) && expiresMs <= Date.now()) {
    throw new Error("BOOKING_EXPIRED");
  }

  if (booking.status !== "pending") {
    throw new Error("BOOKING_NOT_PAYABLE");
  }

  const locksResponse = await databases.listDocuments(
    databaseId,
    collections.seatLocks,
    [
      Query.equal("showtimeId", booking.showtimeId),
      Query.equal("status", "active"),
      Query.limit(100),
    ],
  );

  const seatIdSet = new Set(booking.seatIds);
  const locksToConvert = locksResponse.documents.filter((lock) =>
    seatIdSet.has(String((lock as Record<string, unknown>).seatId)),
  );

  await updatePaidBookingDocument(bookingId, params);

  await Promise.all(
    locksToConvert.map((lock) =>
      databases.updateDocument(databaseId, collections.seatLocks, lock.$id, {
        status: "converted",
      }),
    ),
  );
}

export const checkoutQueryKeys = {
  booking: (bookingId: string) => ["booking", bookingId] as const,
};
