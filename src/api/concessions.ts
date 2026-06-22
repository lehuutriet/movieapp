/**
 * F&B catalog API — loads products from Appwrite `concessions` collection.
 *
 * Data flow:
 * 1. UI calls `fetchConcessions()` via React Query.
 * 2. When Appwrite is configured, documents are read from
 *    `VITE_APPWRITE_CONCESSIONS_COLLECTION_ID` and mapped to `ConcessionItem`.
 * 3. When Appwrite is not configured (local dev without .env), returns `MOCK_CONCESSIONS`.
 *
 * Expected Appwrite document fields:
 *   name, description, category, price, emoji (optional), imageUrl (optional), isActive (optional)
 */

import { ID, Query } from "appwrite";
import { MOCK_CONCESSIONS } from "@/data/mock-concessions";
import {
  APPWRITE_CONFIG,
  getDatabases,
  getStorage,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import {
  deleteStorageFileById,
  deleteStorageFileByUrl,
  getStorageFileIdFromUrl,
  getStorageFileViewUrl,
  uploadImageFile,
} from "@/lib/storage";
import type {
  AdminConcessionItem,
  ConcessionCategory,
  ConcessionItem,
} from "@/types/concession";

/** Payload for creating a new concession document in Appwrite. */
export interface CreateConcessionInput {
  name: string;
  description: string;
  category: ConcessionCategory;
  price: number;
  emoji?: string;
  imageUrl?: string;
  isActive?: boolean;
}

/** Resolved from VITE_APPWRITE_CONCESSIONS_COLLECTION_ID (default: "concessions"). */
export const CONCESSIONS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_CONCESSIONS_COLLECTION_ID?.trim() ??
  APPWRITE_CONFIG.collections.concessions;

const VALID_CATEGORIES: ConcessionCategory[] = [
  "popcorn",
  "drinks",
  "combos",
  "snacks",
];

function isConcessionCategory(value: string): value is ConcessionCategory {
  return VALID_CATEGORIES.includes(value as ConcessionCategory);
}

function mapConcessionFields(
  raw: Record<string, unknown>,
): Omit<AdminConcessionItem, "isActive"> | null {
  const id = String(raw.$id ?? raw.id ?? "");
  if (!id) return null;

  const category = String(raw.category ?? "snacks");
  const priceRaw = raw.price;
  const price =
    typeof priceRaw === "number"
      ? priceRaw
      : Number.parseFloat(String(priceRaw ?? "0"));

  return {
    id,
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    category: isConcessionCategory(category) ? category : "snacks",
    price: Number.isFinite(price) ? price : 0,
    emoji: String(raw.emoji ?? "🍿"),
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
  };
}

export function mapAdminConcessionDocument(
  raw: Record<string, unknown>,
): AdminConcessionItem | null {
  const fields = mapConcessionFields(raw);
  if (!fields) return null;

  return {
    ...fields,
    isActive: raw.isActive !== false,
  };
}

/**
 * Maps one Appwrite document → `ConcessionItem`.
 * Returns `null` when the document is explicitly inactive.
 */
export function mapConcessionDocument(
  raw: Record<string, unknown>,
): ConcessionItem | null {
  const item = mapAdminConcessionDocument(raw);
  if (!item || !item.isActive) return null;
  return item;
}

/** Fetches live documents from the Appwrite concessions collection. */
export async function fetchConcessionsFromAppwrite(): Promise<ConcessionItem[]> {
  const { databaseId } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    CONCESSIONS_COLLECTION_ID,
    [Query.orderAsc("name"), Query.limit(100)],
  );

  return response.documents
    .map((doc) => mapConcessionDocument(doc as Record<string, unknown>))
    .filter((item): item is ConcessionItem => item !== null && item.id !== "");
}

/**
 * Public catalog loader used by pages.
 * - Appwrite configured → real collection data (throws on network/API errors).
 * - Appwrite missing   → static mock menu for offline UI development.
 */
export async function fetchConcessions(): Promise<ConcessionItem[]> {
  if (!isAppwriteConfigured()) {
    return MOCK_CONCESSIONS;
  }

  return fetchConcessionsFromAppwrite();
}

/** Fetches every concession for the admin panel (includes inactive). */
export async function getConcessions(): Promise<AdminConcessionItem[]> {
  assertAppwriteConfigured();

  const { databaseId } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    CONCESSIONS_COLLECTION_ID,
    [Query.orderAsc("name"), Query.limit(100)],
  );

  return response.documents
    .map((doc) =>
      mapAdminConcessionDocument(doc as Record<string, unknown>),
    )
    .filter((item): item is AdminConcessionItem => item !== null);
}

/** Deletes a concession document and its storage image when present. */
export async function deleteConcession(documentId: string): Promise<void> {
  assertAppwriteConfigured();

  const { databaseId } = APPWRITE_CONFIG;
  const databases = getDatabases();

  let imageUrl: string | undefined;

  try {
    const doc = await databases.getDocument(
      databaseId,
      CONCESSIONS_COLLECTION_ID,
      documentId,
    );
    imageUrl = (doc as Record<string, unknown>).imageUrl
      ? String((doc as Record<string, unknown>).imageUrl)
      : undefined;
  } catch {
    // Document may already be gone; still attempt delete below.
  }

  await databases.deleteDocument(
    databaseId,
    CONCESSIONS_COLLECTION_ID,
    documentId,
  );

  if (imageUrl) {
    const deleted = await deleteStorageFileByUrl(imageUrl);
    if (!deleted && getStorageFileIdFromUrl(imageUrl)) {
      await deleteStorageFileById(getStorageFileIdFromUrl(imageUrl)!);
    }
  }
}

function assertAppwriteConfigured() {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite chưa được cấu hình. Kiểm tra file .env và khởi động lại dev server.",
    );
  }
}

export interface UploadConcessionImageResult {
  fileId: string;
  imageUrl: string;
}

/**
 * Uploads a concession image to Appwrite Storage.
 *
 * Flow:
 * 1. `storage.createFile(bucketId, fileId, file)` — stores the binary in the bucket.
 * 2. `storage.getFileView(bucketId, fileId)` — builds the public preview URL.
 * 3. That URL is saved later as `imageUrl` on the concessions document.
 *
 * Uses `uploadImageFile()` from `lib/storage.ts` which sets read permissions
 * so customer-facing pages can render the image.
 */
export async function uploadConcessionImage(
  file: File,
): Promise<UploadConcessionImageResult> {
  assertAppwriteConfigured();

  if (!APPWRITE_CONFIG.bucketId) {
    throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
  }

  const { fileId, url } = await uploadImageFile(file);

  return {
    fileId,
    imageUrl: url,
  };
}

/**
 * Low-level helper — documents the exact Storage SDK calls.
 * Prefer `uploadConcessionImage()` in application code.
 */
export async function uploadConcessionImageRaw(
  file: File,
  fileId = ID.unique(),
): Promise<UploadConcessionImageResult> {
  assertAppwriteConfigured();

  if (!APPWRITE_CONFIG.bucketId) {
    throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
  }

  const bucketId = APPWRITE_CONFIG.bucketId;
  const storage = getStorage();

  await storage.createFile(bucketId, fileId, file);

  return {
    fileId,
    imageUrl: getStorageFileViewUrl(fileId),
  };
}

/**
 * Creates a new concession document in Appwrite.
 * Pass `imageUrl` from `uploadConcessionImage()` when the admin uploaded a file.
 */
export async function createConcession(
  input: CreateConcessionInput,
): Promise<ConcessionItem> {
  assertAppwriteConfigured();

  const { databaseId } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const imageUrl = input.imageUrl?.trim();

  const doc = await databases.createDocument(
    databaseId,
    CONCESSIONS_COLLECTION_ID,
    ID.unique(),
    {
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      price: input.price,
      emoji: input.emoji?.trim() || "🍿",
      ...(imageUrl ? { imageUrl } : {}),
      isActive: input.isActive ?? true,
    },
  );

  const item = mapAdminConcessionDocument(doc as Record<string, unknown>);
  if (!item) {
    throw new Error("Tạo món thành công nhưng không thể đọc lại dữ liệu.");
  }

  return item;
}

/** Payload for updating an existing concession document. */
export type UpdateConcessionInput = CreateConcessionInput;

/**
 * Updates an existing concession document.
 * The payload object only contains fields that should be written — Appwrite merges them into the document.
 */
export async function updateConcession(
  documentId: string,
  input: UpdateConcessionInput,
): Promise<AdminConcessionItem> {
  assertAppwriteConfigured();

  const { databaseId } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const imageUrl = input.imageUrl?.trim();

  const doc = await databases.updateDocument(
    databaseId,
    CONCESSIONS_COLLECTION_ID,
    documentId,
    {
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      price: input.price,
      emoji: input.emoji?.trim() || "🍿",
      ...(imageUrl ? { imageUrl } : {}),
      isActive: input.isActive ?? true,
    },
  );

  const item = mapAdminConcessionDocument(doc as Record<string, unknown>);
  if (!item) {
    throw new Error("Cập nhật món thành công nhưng không thể đọc lại dữ liệu.");
  }

  return item;
}

/**
 * Uploads a replacement image (optional) then updates the concession document.
 * Deletes the previous storage file when a new image is uploaded.
 */
export async function updateConcessionWithImage(
  documentId: string,
  input: UpdateConcessionInput,
  options?: { imageFile?: File; previousImageUrl?: string },
): Promise<AdminConcessionItem> {
  let uploadedFileId: string | undefined;

  try {
    let imageUrl = input.imageUrl;

    if (options?.imageFile) {
      const uploaded = await uploadConcessionImage(options.imageFile);
      uploadedFileId = uploaded.fileId;
      imageUrl = uploaded.imageUrl;
    }

    const item = await updateConcession(documentId, { ...input, imageUrl });

    if (options?.imageFile && options.previousImageUrl) {
      await deleteStorageFileByUrl(options.previousImageUrl);
    }

    return item;
  } catch (error) {
    if (uploadedFileId) {
      await deleteStorageFileById(uploadedFileId);
    }
    throw error;
  }
}

/**
 * Convenience orchestrator: upload image (optional) → create DB document.
 * Rolls back the uploaded file if `createDocument` fails.
 */
export async function createConcessionWithImage(
  input: CreateConcessionInput,
  imageFile?: File,
): Promise<ConcessionItem> {
  let uploadedFileId: string | undefined;

  try {
    let imageUrl = input.imageUrl;

    if (imageFile) {
      const uploaded = await uploadConcessionImage(imageFile);
      uploadedFileId = uploaded.fileId;
      imageUrl = uploaded.imageUrl;
    }

    return await createConcession({ ...input, imageUrl });
  } catch (error) {
    if (uploadedFileId) {
      await deleteStorageFileById(uploadedFileId);
    }
    throw error;
  }
}

/** React Query cache keys for concession catalog requests. */
export const concessionQueryKeys = {
  all: ["concessions"] as const,
  list: () => [...concessionQueryKeys.all, "list"] as const,
  adminList: () => [...concessionQueryKeys.all, "admin", "list"] as const,
};
