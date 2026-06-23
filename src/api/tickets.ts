import type { BookingDocument } from "@/types/booking";
import { mapBookingDocument } from "@/api/booking-mapper";
import { fetchShowtimeMeta } from "@/api/showtimes";
import {
  formatShowtimeLabel,
  getScreeningStatus,
} from "@/data/showtime-meta";
import { listAllDocuments } from "@/lib/appwrite-list";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";

export interface TicketDetailView {
  booking: BookingDocument;
  movieTitle: string;
  cinemaName: string;
  auditoriumName: string;
  showtimeLabel: string;
  startTime: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface TicketListItem {
  bookingId: string;
  movieTitle: string;
  cinemaName: string;
  showtimeLabel: string;
  startTime: string;
  seatLabels: string[];
  ticketTotal: number;
  concessionTotal: number;
  grandTotal: number;
  concessionLines: BookingDocument["concessionLines"];
  screeningStatus: "upcoming" | "past";
}

async function enrichBooking(booking: BookingDocument): Promise<TicketDetailView> {
  const meta = await fetchShowtimeMeta(booking.showtimeId);

  return {
    booking,
    movieTitle: meta.movieTitle,
    cinemaName: meta.cinemaName,
    auditoriumName: meta.auditoriumName,
    showtimeLabel: formatShowtimeLabel(meta.startTime),
    startTime: meta.startTime,
    posterUrl: meta.posterUrl,
    backdropUrl: meta.backdropUrl,
  };
}

export async function fetchTicketByBookingId(
  bookingId: string,
): Promise<TicketDetailView> {
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

  return enrichBooking(mapBookingDocument(doc as Record<string, unknown>));
}

export async function fetchMyPaidBookings(
  userId: string,
): Promise<TicketListItem[]> {
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;

  const documents = await listAllDocuments(databaseId, collections.bookings, [
    Query.equal("userId", userId),
    Query.equal("status", "paid"),
    Query.orderDesc("$createdAt"),
  ]);

  const bookings = documents.map((doc) =>
    mapBookingDocument(doc as Record<string, unknown>),
  );

  const uniqueShowtimeIds = [...new Set(bookings.map((booking) => booking.showtimeId))];
  const metaEntries = await Promise.all(
    uniqueShowtimeIds.map(
      async (showtimeId) =>
        [showtimeId, await fetchShowtimeMeta(showtimeId)] as const,
    ),
  );
  const metaByShowtimeId = new Map(metaEntries);

  return bookings.map((booking) => {
    const meta = metaByShowtimeId.get(booking.showtimeId)!;

    return {
      bookingId: booking.$id,
      movieTitle: meta.movieTitle,
      cinemaName: meta.cinemaName,
      showtimeLabel: formatShowtimeLabel(meta.startTime),
      startTime: meta.startTime,
      seatLabels: booking.seatLabels,
      ticketTotal: booking.totalAmount,
      concessionTotal: booking.concessionTotal,
      grandTotal: booking.grandTotal,
      concessionLines: booking.concessionLines,
      screeningStatus: getScreeningStatus(meta.startTime),
    };
  });
}

export function buildTicketQrPayload(bookingId: string): string {
  return JSON.stringify({ bookingId, type: "cinema_ticket" });
}

export const ticketQueryKeys = {
  detail: (bookingId: string) => ["ticket", bookingId] as const,
  myTickets: (userId: string) => ["my-tickets", userId] as const,
};
