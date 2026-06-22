import { ID, Query } from "appwrite";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { Cinema } from "@/types/showtime";

export interface CreateCinemaInput {
  name: string;
  slug: string;
  address: string;
  city: string;
  district: string;
  imageUrl?: string;
}

function assertAppwrite() {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }
}

export function mapCinemaDocument(raw: Record<string, unknown>): Cinema {
  return {
    $id: String(raw.$id),
    name: String(raw.name),
    slug: String(raw.slug),
    address: String(raw.address),
    city: String(raw.city),
    district: String(raw.district ?? ""),
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
  };
}

export async function fetchAdminCinemas(): Promise<Cinema[]> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    collections.cinemas,
    [Query.orderAsc("name"), Query.limit(100)],
  );

  return response.documents.map((doc) =>
    mapCinemaDocument(doc as Record<string, unknown>),
  );
}

export async function createCinema(input: CreateCinemaInput): Promise<Cinema> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.createDocument(
    databaseId,
    collections.cinemas,
    ID.unique(),
    {
      ...input,
      isActive: true,
    },
  );

  return mapCinemaDocument(doc as Record<string, unknown>);
}

export async function updateCinema(
  id: string,
  input: Partial<CreateCinemaInput>,
): Promise<Cinema> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.updateDocument(
    databaseId,
    collections.cinemas,
    id,
    input,
  );

  return mapCinemaDocument(doc as Record<string, unknown>);
}

export async function deleteCinema(id: string): Promise<void> {
  assertAppwrite();
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  await databases.deleteDocument(databaseId, collections.cinemas, id);
}

export const adminCinemaKeys = {
  all: ["admin", "cinemas"] as const,
};
