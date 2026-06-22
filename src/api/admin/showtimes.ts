import { ID, Query } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import { formatShowtimeLabel } from "@/data/showtime-meta";
import type { Showtime, ShowtimeStatus } from "@/types/showtime";

export interface AdminShowtimeRow extends Showtime {
  movieTitle: string;
  cinemaName: string;
  displayTime: string;
}

export interface CreateShowtimeInput {
  movieId: string;
  cinemaId: string;
  startTime: string;
  basePrice: number;
  movieDuration: number;
  status?: ShowtimeStatus;
  format?: string;
  language?: string;
}

function assertAppwrite() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }
}

export function mapShowtimeDocument(raw: Record<string, unknown>): Showtime {
  return {
    $id: String(raw.$id),
    movieId: String(raw.movieId),
    cinemaId: String(raw.cinemaId),
    auditoriumId: String(raw.auditoriumId),
    auditoriumName: String(raw.auditoriumName ?? "Phòng 1"),
    startTime: String(raw.startTime),
    endTime: String(raw.endTime),
    format: String(raw.format ?? "2D"),
    language: String(raw.language ?? "Phụ đề"),
    basePrice: Number(raw.basePrice ?? 0),
    status: (raw.status as ShowtimeStatus) ?? "scheduled",
  };
}

export async function fetchAdminShowtimes(
  movieMap: Map<string, string>,
  cinemaMap: Map<string, string>,
): Promise<AdminShowtimeRow[]> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    collections.showtimes,
    [Query.orderDesc("startTime"), Query.limit(200)],
  );

  return response.documents.map((doc) => {
    const showtime = mapShowtimeDocument(doc as Record<string, unknown>);
    return {
      ...showtime,
      movieTitle: movieMap.get(showtime.movieId) ?? showtime.movieId,
      cinemaName: cinemaMap.get(showtime.cinemaId) ?? showtime.cinemaId,
      displayTime: formatShowtimeLabel(showtime.startTime),
    };
  });
}

export async function createShowtime(
  input: CreateShowtimeInput,
): Promise<Showtime> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const start = new Date(input.startTime);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + input.movieDuration + 15);

  const doc = await databases.createDocument(
    databaseId,
    collections.showtimes,
    ID.unique(),
    {
      movieId: input.movieId,
      cinemaId: input.cinemaId,
      auditoriumId: `aud_${input.cinemaId}`,
      auditoriumName: "Phòng 1",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      format: input.format ?? "2D",
      language: input.language ?? "Phụ đề",
      basePrice: input.basePrice,
      status: input.status ?? "scheduled",
    },
  );

  return mapShowtimeDocument(doc as Record<string, unknown>);
}

export async function deleteShowtime(id: string): Promise<void> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  await databases.deleteDocument(databaseId, collections.showtimes, id);
}

export const adminShowtimeKeys = {
  all: ["admin", "showtimes"] as const,
};
