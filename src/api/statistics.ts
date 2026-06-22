import { mapBookingDocument } from "@/api/booking-mapper";
import type { BookingDocument } from "@/types/booking";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";
import type { Models } from "appwrite";

export interface BookingStatsDocument extends BookingDocument {
  $createdAt: string;
  movieTitle?: string;
  cinemaName?: string;
  grandTotal?: number;
  seats?: string[];
}

async function listAllPaidBookings(): Promise<BookingStatsDocument[]> {
  const databases = getDatabases();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const allDocs: Models.Document[] = [];
  let cursorAfter: string | null = null;

  while (true) {
    const pageQueries = [
      Query.equal("status", "paid"),
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

  return allDocs.map((doc) => {
    const raw = doc as Record<string, unknown>;
    const booking = mapBookingDocument(raw);

    return {
      ...booking,
      $createdAt: String(raw.$createdAt ?? ""),
      movieTitle: raw.movieTitle ? String(raw.movieTitle) : undefined,
      cinemaName: raw.cinemaName ? String(raw.cinemaName) : undefined,
      grandTotal:
        raw.grandTotal != null
          ? Number(raw.grandTotal)
          : undefined,
      seats: Array.isArray(raw.seats) ? (raw.seats as string[]) : undefined,
    };
  });
}

export async function fetchPaidBookingsForStats(): Promise<BookingStatsDocument[]> {
  if (!isAppwriteConfigured()) {
    return [];
  }

  return listAllPaidBookings();
}

export const statisticsQueryKeys = {
  dashboard: ["admin-dashboard-stats"] as const,
};
