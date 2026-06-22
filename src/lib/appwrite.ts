import { Client, Databases, ID, Query, Storage } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT?.trim() ?? "";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID?.trim() ?? "";
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID?.trim() ?? "";
const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID?.trim() ?? "";

export const APPWRITE_CONFIG = {
  databaseId,
  bucketId,
  collections: {
    seatLocks:
      import.meta.env.VITE_APPWRITE_SEAT_LOCKS_COLLECTION_ID ?? "seat_locks",
    tickets: import.meta.env.VITE_APPWRITE_TICKETS_COLLECTION_ID ?? "tickets",
    bookings:
      import.meta.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID ?? "bookings",
    movies: import.meta.env.VITE_APPWRITE_MOVIES_COLLECTION_ID ?? "movies",
    cinemas: import.meta.env.VITE_APPWRITE_CINEMAS_COLLECTION_ID ?? "cinemas",
    showtimes:
      import.meta.env.VITE_APPWRITE_SHOWTIMES_COLLECTION_ID ?? "showtimes",
    concessions:
      import.meta.env.VITE_APPWRITE_CONCESSIONS_COLLECTION_ID ?? "concessions",
  },
} as const;

export function isAppwriteConfigured(): boolean {
  return Boolean(endpoint && projectId && databaseId);
}

let clientInstance: Client | null = null;
let databasesInstance: Databases | null = null;
let storageInstance: Storage | null = null;

export function getAppwriteClient(): Client {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite chưa được cấu hình. Tạo file .env từ .env.example và điền VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID, VITE_APPWRITE_DATABASE_ID.",
    );
  }

  if (!clientInstance) {
    clientInstance = new Client().setEndpoint(endpoint).setProject(projectId);
  }

  return clientInstance;
}

export function getDatabases(): Databases {
  if (!databasesInstance) {
    databasesInstance = new Databases(getAppwriteClient());
  }

  return databasesInstance;
}

export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = new Storage(getAppwriteClient());
  }

  return storageInstance;
}

export { ID, Query };
