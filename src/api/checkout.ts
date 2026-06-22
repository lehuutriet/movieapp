import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";
import { mapBookingDocument } from "@/api/booking-mapper";
import { fetchShowtimeMeta } from "@/api/showtimes";
import { formatShowtimeLabel } from "@/data/showtime-meta";
import type {
  BookingCheckoutView,
  BookingDocument,
  PaymentMethod,
} from "@/types/booking";

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
  return toCheckoutView(booking);
}

export async function completeMockPayment(
  bookingId: string,
  _method: PaymentMethod,
): Promise<void> {
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

  await databases.updateDocument(
    databaseId,
    collections.bookings,
    bookingId,
    { status: "paid" },
  );

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
