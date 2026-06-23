import { mapBookingDocument } from "@/api/booking-mapper";
import { fetchShowtimeMeta } from "@/api/showtimes";
import { formatShowtimeLabel } from "@/data/showtime-meta";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";
import type { BookingStatus } from "@/types/booking";
import type { Models } from "appwrite";

export interface AdminBookingRow {
  id: string;
  userId: string | null;
  movieTitle: string;
  cinemaName: string;
  showtimeLabel: string;
  seatLabels: string[];
  seatCount: number;
  amount: number;
  status: BookingStatus;
  createdAt: string;
}

function readDenormalizedFields(raw: Record<string, unknown>) {
  return {
    movieTitle: raw.movieTitle ? String(raw.movieTitle) : undefined,
    cinemaName: raw.cinemaName ? String(raw.cinemaName) : undefined,
    showtime: raw.showtime ? String(raw.showtime) : undefined,
    grandTotal:
      raw.grandTotal != null
        ? Number(raw.grandTotal)
        : raw.totalAmount != null
          ? Number(raw.totalAmount)
          : undefined,
    seats: Array.isArray(raw.seats)
      ? (raw.seats as string[])
      : Array.isArray(raw.seatLabels)
        ? (raw.seatLabels as string[])
        : [],
  };
}

async function listAllBookings(): Promise<Models.Document[]> {
  const databases = getDatabases();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const allDocs: Models.Document[] = [];
  let cursorAfter: string | null = null;

  while (true) {
    const pageQueries = [
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ];
    if (cursorAfter) {
      pageQueries.push(Query.cursorAfter(cursorAfter));
    }

    const response = await databases.listDocuments(
      databaseId,
      collections.bookings,
      pageQueries,
    );
    allDocs.push(...response.documents);

    if (response.documents.length < 100) {
      break;
    }

    cursorAfter = response.documents[response.documents.length - 1]?.$id ?? null;
    if (!cursorAfter) {
      break;
    }
  }

  return allDocs;
}

export async function fetchAdminBookings(): Promise<AdminBookingRow[]> {
  if (!isAppwriteConfigured()) {
    return [];
  }

  const docs = await listAllBookings();
  const parsed = docs.map((doc) => {
    const raw = doc as Record<string, unknown>;
    return {
      booking: mapBookingDocument(raw),
      raw,
      createdAt: String(raw.$createdAt ?? ""),
    };
  });

  const uniqueShowtimeIds = [
    ...new Set(parsed.map(({ booking }) => booking.showtimeId)),
  ];
  const metaEntries = await Promise.all(
    uniqueShowtimeIds.map(
      async (showtimeId) =>
        [showtimeId, await fetchShowtimeMeta(showtimeId)] as const,
    ),
  );
  const metaByShowtimeId = new Map(metaEntries);

  return parsed.map(({ booking, raw, createdAt }) => {
    const denormalized = readDenormalizedFields(raw);
    const meta = metaByShowtimeId.get(booking.showtimeId)!;
    const seatLabels =
      denormalized.seats.length > 0
        ? denormalized.seats
        : booking.seatLabels;

    return {
      id: booking.$id,
      userId: booking.userId ?? null,
      movieTitle:
        denormalized.movieTitle ?? meta.movieTitle ?? "Phim đang chiếu",
      cinemaName: denormalized.cinemaName ?? meta.cinemaName ?? "Rạp chiếu phim",
      showtimeLabel:
        denormalized.showtime ?? formatShowtimeLabel(meta.startTime),
      seatLabels,
      seatCount: seatLabels.length,
      amount: denormalized.grandTotal ?? booking.totalAmount,
      status: booking.status,
      createdAt,
    };
  });
}

export const adminBookingQueryKeys = {
  all: ["admin-bookings"] as const,
};
