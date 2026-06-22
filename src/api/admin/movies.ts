import { ID, Query } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { Movie, MovieStatus } from "@/types/movie";

export interface CreateMovieInput {
  title: string;
  slug: string;
  posterUrl: string;
  synopsis: string;
  trailerUrl?: string;
  releaseDate: string;
  duration: number;
  status: MovieStatus;
  backdropUrl?: string;
  rating?: string;
  genres?: string[];
}

export function mapMovieDocument(raw: Record<string, unknown>): Movie {
  const posterUrl = String(raw.posterUrl ?? "");
  const backdropRaw = raw.backdropUrl ? String(raw.backdropUrl) : "";

  return {
    $id: String(raw.$id),
    $updatedAt: raw.$updatedAt ? String(raw.$updatedAt) : undefined,
    title: String(raw.title),
    slug: String(raw.slug),
    posterUrl,
    backdropUrl: backdropRaw || posterUrl,
    synopsis: String(raw.synopsis ?? ""),
    duration: Number(raw.duration ?? 0),
    releaseDate: String(raw.releaseDate ?? ""),
    rating: String(raw.rating ?? "P"),
    genres: Array.isArray(raw.genres) ? (raw.genres as string[]) : [],
    trailerUrl: raw.trailerUrl ? String(raw.trailerUrl) : undefined,
    status: (raw.status as MovieStatus) ?? "now_showing",
    featured: Boolean(raw.featured),
  };
}

function assertAppwrite() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }
}

export async function fetchAdminMovies(): Promise<Movie[]> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    collections.movies,
    [Query.orderDesc("$createdAt"), Query.limit(100)],
  );

  return response.documents.map((doc) =>
    mapMovieDocument(doc as Record<string, unknown>),
  );
}

export async function createMovie(input: CreateMovieInput): Promise<Movie> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.createDocument(
    databaseId,
    collections.movies,
    ID.unique(),
    {
      title: input.title,
      slug: input.slug,
      posterUrl: input.posterUrl,
      backdropUrl: input.backdropUrl ?? input.posterUrl,
      synopsis: input.synopsis,
      trailerUrl: input.trailerUrl,
      releaseDate: input.releaseDate,
      duration: input.duration,
      status: input.status,
      rating: input.rating ?? "P",
      genres: input.genres ?? [],
      featured: false,
    },
  );

  return mapMovieDocument(doc as Record<string, unknown>);
}

export async function updateMovie(
  id: string,
  input: Partial<CreateMovieInput>,
): Promise<Movie> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.updateDocument(
    databaseId,
    collections.movies,
    id,
    input,
  );

  return mapMovieDocument(doc as Record<string, unknown>);
}

export async function deleteMovie(id: string): Promise<void> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  await databases.deleteDocument(databaseId, collections.movies, id);
}

export const adminMovieKeys = {
  all: ["admin", "movies"] as const,
};
