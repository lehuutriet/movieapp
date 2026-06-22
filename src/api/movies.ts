import { Query } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { Movie, MovieStatus } from "@/types/movie";

function mapMovieDocument(raw: Record<string, unknown>): Movie {
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

export async function fetchMovies(status?: MovieStatus): Promise<Movie[]> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const queries = [Query.orderDesc("releaseDate"), Query.limit(50)];

  if (status) {
    queries.unshift(Query.equal("status", status));
  }
  const response = await databases.listDocuments(databaseId, collections.movies, queries);

  return response.documents.map((doc) =>
    mapMovieDocument(doc as Record<string, unknown>),
  );
}

export async function fetchFeaturedMovies(limit = 5): Promise<Movie[]> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const featured = await databases.listDocuments(
    databaseId,
    collections.movies,
    [
      Query.equal("status", "now_showing"),
      Query.equal("featured", true),
      Query.orderDesc("releaseDate"),
      Query.limit(limit),
    ],
  );

  if (featured.documents.length > 0) {
    return featured.documents.map((doc) =>
      mapMovieDocument(doc as Record<string, unknown>),
    );
  }

  const fallback = await databases.listDocuments(
    databaseId,
    collections.movies,
    [Query.equal("status", "now_showing"), Query.orderDesc("releaseDate"), Query.limit(limit)],
  );

  return fallback.documents.map((doc) =>
    mapMovieDocument(doc as Record<string, unknown>),
  );
}

export async function fetchFeaturedMovie(): Promise<Movie | null> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite is not configured.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const featured = await databases.listDocuments(
    databaseId,
    collections.movies,
    [
      Query.equal("status", "now_showing"),
      Query.equal("featured", true),
      Query.limit(1),
    ],
  );

  if (featured.documents.length > 0) {
    return mapMovieDocument(featured.documents[0] as Record<string, unknown>);
  }

  const fallback = await databases.listDocuments(
    databaseId,
    collections.movies,
    [Query.equal("status", "now_showing"), Query.limit(1)],
  );

  if (fallback.documents.length > 0) {
    return mapMovieDocument(fallback.documents[0] as Record<string, unknown>);
  }

  return null;
}

export const movieQueryKeys = {
  list: (status: MovieStatus) => ["movies", status] as const,
  featured: () => ["movies", "featured"] as const,
  featuredList: (limit: number) => ["movies", "featured-list", limit] as const,
};
