import { Query } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { SeatStatusSnapshot } from "@/types/booking";

export const seatStatusQueryKey = (showtimeId: string) =>
  ["seat-status", showtimeId] as const;

export interface SeatMapStatusSnapshot {
  soldSeats: string[];
  lockedSeats: Array<{
    seatLabel: string;
    sessionId: string;
  }>;
}

function isLockStillActive(
  status: string,
  expiresAt: string,
  now = Date.now(),
): boolean {
  return status === "active" && Date.parse(expiresAt) > now;
}

export async function fetchSeatStatus(
  showtimeId: string,
): Promise<SeatStatusSnapshot> {
  if (!isAppwriteConfigured()) {
    return { sold: [], locked: [] };
  }

  const nowIso = new Date().toISOString();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const [ticketsResult, locksResult] = await Promise.all([
    databases.listDocuments(databaseId, collections.tickets, [
      Query.equal("showtimeId", showtimeId),
      Query.equal("status", "valid"),
      Query.limit(500),
    ]),
    databases.listDocuments(databaseId, collections.seatLocks, [
      Query.equal("showtimeId", showtimeId),
      Query.equal("status", "active"),
      Query.greaterThan("expiresAt", nowIso),
      Query.limit(500),
    ]),
  ]);

  return {
    sold: ticketsResult.documents.map((doc) => doc.seatId as string),
    locked: locksResult.documents.map((doc) => ({
      seatId: doc.seatId as string,
      sessionId: doc.sessionId as string,
      expiresAt: doc.expiresAt as string,
    })),
  };
}

export async function fetchSeatMapStatus(
  showtimeId: string,
): Promise<SeatMapStatusSnapshot> {
  if (!isAppwriteConfigured()) {
    return { soldSeats: [], lockedSeats: [] };
  }

  const nowIso = new Date().toISOString();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const [ticketsResult, locksResult] = await Promise.all([
    databases.listDocuments(databaseId, collections.tickets, [
      Query.equal("showtimeId", showtimeId),
      Query.limit(500),
    ]),
    databases.listDocuments(databaseId, collections.seatLocks, [
      Query.equal("showtimeId", showtimeId),
      Query.equal("status", "active"),
      Query.greaterThanEqual("expiresAt", nowIso),
      Query.limit(500),
    ]),
  ]);

  const soldSeats = [
    ...new Set(
      ticketsResult.documents
        .map((doc) => doc.seatLabel as string | undefined)
        .filter((label): label is string => Boolean(label)),
    ),
  ];
  const lockedSeats = [
    ...new Map(
      locksResult.documents
        .map((doc) => ({
          seatLabel: doc.seatLabel as string | undefined,
          sessionId: doc.sessionId as string | undefined,
        }))
        .filter(
          (lock): lock is { seatLabel: string; sessionId: string } =>
            Boolean(lock.seatLabel && lock.sessionId),
        )
        .map((lock) => [lock.seatLabel, lock]),
    ).values(),
  ];

  return { soldSeats, lockedSeats };
}

export function applyRealtimeSeatStatusUpdate(
  current: SeatStatusSnapshot,
  events: string[],
  payload: Record<string, unknown>,
  collectionId: string,
): SeatStatusSnapshot {
  const seatId = payload.seatId as string | undefined;
  if (!seatId) return current;

  const isDelete = events.some((event) => event.endsWith(".delete"));
  const isCreate = events.some((event) => event.endsWith(".create"));
  const isUpdate = events.some((event) => event.endsWith(".update"));

  if (collectionId === APPWRITE_CONFIG.collections.tickets) {
    const status = payload.status as string;

    if (isDelete || (isUpdate && status !== "valid")) {
      return {
        ...current,
        sold: current.sold.filter((id) => id !== seatId),
      };
    }

    if ((isCreate || isUpdate) && status === "valid") {
      const sold = current.sold.includes(seatId)
        ? current.sold
        : [...current.sold, seatId];

      return {
        sold,
        locked: current.locked.filter((lock) => lock.seatId !== seatId),
      };
    }
  }

  if (collectionId === APPWRITE_CONFIG.collections.seatLocks) {
    const status = payload.status as string;
    const expiresAt = payload.expiresAt as string;
    const sessionId = payload.sessionId as string;
    const active = !isDelete && isLockStillActive(status, expiresAt);

    if (!active) {
      return {
        ...current,
        locked: current.locked.filter((lock) => lock.seatId !== seatId),
      };
    }

    if (isCreate || isUpdate) {
      const locked = current.locked.filter((lock) => lock.seatId !== seatId);
      locked.push({ seatId, sessionId, expiresAt });

      return { ...current, locked };
    }
  }

  return current;
}

export function getRealtimeChannels(): string[] {
  const { databaseId, collections } = APPWRITE_CONFIG;

  return [
    `databases.${databaseId}.collections.${collections.seatLocks}.documents`,
    `databases.${databaseId}.collections.${collections.tickets}.documents`,
  ];
}

export function resolveRealtimeCollectionId(
  events: string[],
): string | null {
  const { collections } = APPWRITE_CONFIG;

  if (events.some((event) => event.includes(collections.seatLocks))) {
    return collections.seatLocks;
  }

  if (events.some((event) => event.includes(collections.tickets))) {
    return collections.tickets;
  }

  return null;
}
