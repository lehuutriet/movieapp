import { AppwriteException, ID } from "appwrite";
import { fetchSeatStatus } from "@/api/seat-status";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { CreateBookingResult } from "@/types/booking";
import type { SeatSelection } from "@/types/seat";

const LOCK_DURATION_MS = 10 * 60 * 1000;

export class SeatConflictError extends Error {
  readonly conflictingSeats: SeatSelection[];

  constructor(conflictingSeats: SeatSelection[]) {
    super("One or more seats are no longer available.");
    this.name = "SeatConflictError";
    this.conflictingSeats = conflictingSeats;
  }
}

export function isSeatConflictError(error: unknown): error is SeatConflictError {
  if (error instanceof SeatConflictError) return true;

  if (error instanceof AppwriteException) {
    return (
      error.code === 409 ||
      error.type === "document_already_exists" ||
      /already exists/i.test(error.message)
    );
  }

  return false;
}

export function getSeatConflictMessage(error: unknown): string {
  if (error instanceof SeatConflictError) {
    const labels = error.conflictingSeats.map((seat) => seat.label).join(", ");
    return labels
      ? `Ghế ${labels} vừa được người khác chọn. Vui lòng chọn ghế khác.`
      : "Một số ghế vừa được người khác chọn. Vui lòng chọn lại.";
  }

  if (error instanceof AppwriteException && isSeatConflictError(error)) {
    return "Ghế bạn chọn vừa được người khác giữ. Vui lòng chọn ghế khác.";
  }

  return "Không thể giữ ghế. Vui lòng thử lại.";
}

interface CreateBookingParams {
  showtimeId: string;
  seats: SeatSelection[];
  sessionId: string;
  userId?: string;
}

/**
 * Client-side stand-in for an Appwrite Function that atomically locks seats
 * and creates a pending booking. Replace with functions.createExecution later.
 */
export async function createBookingWithLocks(
  params: CreateBookingParams,
): Promise<CreateBookingResult> {
  const { showtimeId, seats, sessionId, userId } = params;

  if (seats.length === 0) {
    throw new Error("At least one seat is required.");
  }

  if (!isAppwriteConfigured()) {
    throw new Error("APPWRITE_NOT_CONFIGURED");
  }

  const snapshot = await fetchSeatStatus(showtimeId);
  const conflictingSeats = seats.filter((seat) => {
    if (snapshot.sold.includes(seat.id)) return true;

    const lock = snapshot.locked.find((item) => item.seatId === seat.id);
    return lock != null && lock.sessionId !== sessionId;
  });

  if (conflictingSeats.length > 0) {
    throw new SeatConflictError(conflictingSeats);
  }

  const lockedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const createdLockIds: string[] = [];

  try {
    for (const seat of seats) {
      const lock = await databases.createDocument(
        databaseId,
        collections.seatLocks,
        ID.unique(),
        {
          showtimeId,
          seatId: seat.id,
          seatLabel: seat.label,
          sessionId,
          userId: userId ?? null,
          lockedAt,
          expiresAt,
          status: "active",
        },
      );

      createdLockIds.push(lock.$id);
    }

    const subtotal = seats.reduce((sum, seat) => sum + seat.price, 0);
    const booking = await databases.createDocument(
      databaseId,
      collections.bookings,
      ID.unique(),
      {
        userId: userId ?? null,
        showtimeId,
        seatIds: seats.map((seat) => seat.id),
        seatLabels: seats.map((seat) => seat.label),
        subtotal,
        discount: 0,
        totalAmount: subtotal,
        status: "pending",
        expiresAt,
      },
    );

    return {
      bookingId: booking.$id,
      expiresAt: Date.parse(expiresAt),
    };
  } catch (error) {
    await Promise.allSettled(
      createdLockIds.map((lockId) =>
        databases.deleteDocument(databaseId, collections.seatLocks, lockId),
      ),
    );

    if (isSeatConflictError(error)) {
      throw error instanceof SeatConflictError
        ? error
        : new SeatConflictError(seats);
    }

    throw error;
  }
}
