import { mapBookingDocument } from "@/api/booking-mapper";
import { fetchShowtimeMeta } from "@/api/showtimes";
import {
  formatShowtimeLabel,
  getScreeningStatus,
} from "@/data/showtime-meta";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";

export interface UserBookingHistoryItem {
  id: string;
  movieTitle: string;
  posterUrl?: string;
  showtimeLabel: string;
  cinemaRoom: string;
  seatLabels: string[];
  totalAmount: number;
  screeningStatus: "upcoming" | "past";
}

function readDenormalizedFields(raw: Record<string, unknown>) {
  const seats = Array.isArray(raw.seats)
    ? (raw.seats as string[])
    : Array.isArray(raw.seatLabels)
      ? (raw.seatLabels as string[])
      : [];

  return {
    movieTitle: raw.movieTitle ? String(raw.movieTitle) : undefined,
    posterUrl: raw.posterUrl ? String(raw.posterUrl) : undefined,
    showtime: raw.showtime ? String(raw.showtime) : undefined,
    cinemaName: raw.cinemaName ? String(raw.cinemaName) : undefined,
    roomName: raw.roomName ? String(raw.roomName) : undefined,
    seats,
    grandTotal:
      raw.grandTotal != null
        ? Number(raw.grandTotal)
        : raw.totalAmount != null
          ? Number(raw.totalAmount)
          : undefined,
  };
}

function buildCinemaRoom(cinemaName: string, roomName: string): string {
  if (cinemaName && roomName) return `${cinemaName} · ${roomName}`;
  return cinemaName || roomName || "Rạp chiếu phim";
}

export async function getUserBookings(
  userId: string,
): Promise<UserBookingHistoryItem[]> {
  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    collections.bookings,
    [
      Query.equal("userId", userId),
      Query.equal("status", "paid"),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ],
  );

  const bookings = response.documents.map((doc) => ({
    booking: mapBookingDocument(doc as Record<string, unknown>),
    raw: doc as Record<string, unknown>,
  }));

  const uniqueShowtimeIds = [
    ...new Set(bookings.map(({ booking }) => booking.showtimeId)),
  ];
  const metaEntries = await Promise.all(
    uniqueShowtimeIds.map(
      async (showtimeId) =>
        [showtimeId, await fetchShowtimeMeta(showtimeId)] as const,
    ),
  );
  const metaByShowtimeId = new Map(metaEntries);

  return bookings.map(({ booking, raw }) => {
    const denormalized = readDenormalizedFields(raw);
    const meta = metaByShowtimeId.get(booking.showtimeId)!;
    const startTime = meta.startTime;

    const movieTitle =
      denormalized.movieTitle ?? meta.movieTitle ?? "Phim đang chiếu";
    const posterUrl = denormalized.posterUrl ?? meta.posterUrl;
    const showtimeLabel =
      denormalized.showtime ?? formatShowtimeLabel(startTime);
    const cinemaRoom = buildCinemaRoom(
      denormalized.cinemaName ?? meta.cinemaName,
      denormalized.roomName ?? meta.auditoriumName,
    );
    const seatLabels =
      denormalized.seats.length > 0
        ? denormalized.seats
        : booking.seatLabels;
    const totalAmount =
      denormalized.grandTotal ?? booking.totalAmount;

    return {
      id: booking.$id,
      movieTitle,
      posterUrl,
      showtimeLabel,
      cinemaRoom,
      seatLabels,
      totalAmount,
      screeningStatus: getScreeningStatus(startTime),
    };
  });
}

export const bookingQueryKeys = {
  userHistory: (userId: string) => ["user-bookings", userId] as const,
};
