/**
 * Favorites API — per-user movie bookmarks in Appwrite `favorites` collection.
 *
 * Expected Appwrite document fields:
 *   userId (string), movieId (string)
 *
 * Suggested collection permissions (Appwrite Console):
 *   - Create: role `users`
 *   - Read / Delete: role `users` (queries always filter by userId)
 *
 * Create documents with document-level permissions for the owning user.
 */

import { ID, Permission, Query, Role } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";

export interface FavoriteRecord {
  $id: string;
  userId: string;
  movieId: string;
}

function mapFavoriteDocument(raw: Record<string, unknown>): FavoriteRecord | null {
  const $id = String(raw.$id ?? "");
  const userId = String(raw.userId ?? "");
  const movieId = String(raw.movieId ?? "");

  if (!$id || !userId || !movieId) return null;

  return { $id, userId, movieId };
}

export async function fetchUserFavorites(userId: string): Promise<FavoriteRecord[]> {
  if (!isAppwriteConfigured()) {
    return [];
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(databaseId, collections.favorites, [
    Query.equal("userId", userId),
    Query.limit(100),
  ]);

  return response.documents
    .map((doc) => mapFavoriteDocument(doc as Record<string, unknown>))
    .filter((item): item is FavoriteRecord => item !== null);
}

export async function fetchUserFavoriteIds(userId: string): Promise<string[]> {
  const favorites = await fetchUserFavorites(userId);
  return favorites.map((item) => item.movieId);
}

export async function addUserFavorite(
  userId: string,
  movieId: string,
): Promise<FavoriteRecord> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  const existing = await fetchUserFavorites(userId);
  const found = existing.find((item) => item.movieId === movieId);
  if (found) return found;

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.createDocument(
    databaseId,
    collections.favorites,
    ID.unique(),
    { userId, movieId },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  );

  const mapped = mapFavoriteDocument(doc as Record<string, unknown>);
  if (!mapped) {
    throw new Error("Thêm yêu thích thành công nhưng không thể đọc lại dữ liệu.");
  }

  return mapped;
}

export async function removeUserFavorite(
  userId: string,
  movieId: string,
): Promise<void> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  const existing = await fetchUserFavorites(userId);
  const found = existing.find((item) => item.movieId === movieId);
  if (!found) return;

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  await databases.deleteDocument(databaseId, collections.favorites, found.$id);
}

export async function toggleUserFavorite(
  userId: string,
  movieId: string,
): Promise<boolean> {
  const existing = await fetchUserFavorites(userId);
  const isCurrentlyFavorite = existing.some((item) => item.movieId === movieId);

  if (isCurrentlyFavorite) {
    await removeUserFavorite(userId, movieId);
    return false;
  }

  await addUserFavorite(userId, movieId);
  return true;
}

export const favoriteQueryKeys = {
  all: ["favorites"] as const,
  list: (userId: string) => [...favoriteQueryKeys.all, userId] as const,
};
