import { useQuery } from "@tanstack/react-query";
import type { Models } from "appwrite";
import { mapBookingDocument } from "@/api/booking-mapper";
import { seatStatusQueryKey } from "@/api/seat-status";
import type { SeatLockDocument } from "@/types/booking";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
  Query,
} from "@/lib/appwrite";

interface SeatMapStatusSnapshot {
  soldSeats: string[];
  lockedSeats: Array<{
    seatLabel: string;
    sessionId: string;
  }>;
}

async function listAllDocuments(
  collectionId: string,
  queries: string[],
): Promise<Models.Document[]> {
  const databases = getDatabases();
  const { databaseId } = APPWRITE_CONFIG;
  const allDocs: Models.Document[] = [];
  let cursorAfter: string | null = null;

  while (true) {
    const pageQueries = [...queries, Query.limit(100)];
    if (cursorAfter) {
      pageQueries.push(Query.cursorAfter(cursorAfter));
    }

    const response = await databases.listDocuments(
      databaseId,
      collectionId,
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

async function fetchSeatMapStatus(showtimeId: string): Promise<SeatMapStatusSnapshot> {
  if (!isAppwriteConfigured()) {
    return { soldSeats: [], lockedSeats: [] };
  }

  const nowIso = new Date().toISOString();
  const { collections } = APPWRITE_CONFIG;

  const [bookingDocs, lockDocs] = await Promise.all([
    listAllDocuments(collections.bookings, [
      Query.equal("showtimeId", showtimeId),
      Query.equal("status", "paid"),
    ]),
    listAllDocuments(collections.seatLocks, [
      Query.equal("showtimeId", showtimeId),
      Query.equal("status", "active"),
      Query.greaterThanEqual("expiresAt", nowIso),
    ]),
  ]);

  const soldSeats = [
    ...new Set(
      bookingDocs.flatMap((raw) => {
        const booking = mapBookingDocument(raw as Record<string, unknown>);
        if (booking.seatLabels.length > 0) {
          return booking.seatLabels;
        }

        if (booking.seatIds.length > 0) {
          return booking.seatIds;
        }

        return [];
      }),
    ),
  ];

  const lockedSeats = [
    ...new Map(
      lockDocs
        .map((raw) => {
          const lock = raw as unknown as SeatLockDocument;
          return {
            seatLabel: lock.seatLabel,
            sessionId: lock.sessionId,
          };
        })
        .filter(
          (lock): lock is { seatLabel: string; sessionId: string } =>
            Boolean(lock.seatLabel && lock.sessionId),
        )
        .map((lock) => [lock.seatLabel, lock]),
    ).values(),
  ];

  return { soldSeats, lockedSeats };
}

export function useSeatStatus(showtimeId: string | undefined) {
  return useQuery({
    queryKey: seatStatusQueryKey(showtimeId ?? ""),
    queryFn: () => fetchSeatMapStatus(showtimeId!),
    enabled: Boolean(showtimeId),
    staleTime: 15_000,
  });
}
