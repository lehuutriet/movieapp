/**
 * Promotions API — loads from Appwrite `promotions` collection.
 *
 * Expected Appwrite document fields:
 *   title, description, category, discountLabel, code (optional),
 *   validUntil, imageUrl, terms (string[]), isActive (optional)
 */

import { ID, Query } from "appwrite";
import { MOCK_PROMOTIONS } from "@/data/mock-promotions";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import {
  deleteStorageFileById,
  deleteStorageFileByUrl,
  getStorageFileIdFromUrl,
  uploadImageFile,
} from "@/lib/storage";
import type {
  AdminPromotion,
  CreatePromotionInput,
  Promotion,
  PromotionCategory,
  UpdatePromotionInput,
} from "@/types/promotion";
import {
  calculateDiscountAmount,
  formatDiscountLabel,
  getPromotionDiscountConfig,
  isPromotionExpired,
} from "@/lib/promo-utils";

export interface AppliedPromoResult {
  promotion: Promotion;
  ticketDiscount: number;
  concessionDiscount: number;
}

export class PromoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoValidationError";
  }
}

const VALID_CATEGORIES: PromotionCategory[] = ["ticket", "combo", "member"];

function isPromotionCategory(value: string): value is PromotionCategory {
  return VALID_CATEGORIES.includes(value as PromotionCategory);
}

function assertAppwriteConfigured() {
  if (!isAppwriteConfigured()) {
    throw new Error(
      "Appwrite chưa được cấu hình. Kiểm tra file .env và khởi động lại dev server.",
    );
  }
}

function mapPromotionFields(
  raw: Record<string, unknown>,
): Omit<AdminPromotion, "isActive"> | null {
  const id = String(raw.$id ?? raw.id ?? "");
  if (!id) return null;

  const category = String(raw.category ?? "ticket");

  return {
    id,
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    category: isPromotionCategory(category) ? category : "ticket",
    discountLabel: String(raw.discountLabel ?? ""),
    discountType:
      raw.discountType === "percent" || raw.discountType === "fixed"
        ? raw.discountType
        : undefined,
    discountValue:
      raw.discountValue !== undefined && raw.discountValue !== null
        ? Number(raw.discountValue)
        : undefined,
    code: raw.code ? String(raw.code) : undefined,
    validUntil: String(raw.validUntil ?? ""),
    imageUrl: String(raw.imageUrl ?? "/images/theater-seats.jpg"),
    terms: Array.isArray(raw.terms) ? (raw.terms as string[]) : [],
  };
}

export function mapAdminPromotionDocument(
  raw: Record<string, unknown>,
): AdminPromotion | null {
  const fields = mapPromotionFields(raw);
  if (!fields) return null;

  return {
    ...fields,
    isActive: raw.isActive !== false,
  };
}

export function mapPromotionDocument(raw: Record<string, unknown>): Promotion | null {
  const item = mapAdminPromotionDocument(raw);
  if (!item || !item.isActive) return null;
  return item;
}

export async function fetchPromotionsFromAppwrite(): Promise<Promotion[]> {
  assertAppwriteConfigured();

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(databaseId, collections.promotions, [
    Query.orderDesc("validUntil"),
    Query.limit(50),
  ]);

  return response.documents
    .map((doc) => mapPromotionDocument(doc as Record<string, unknown>))
    .filter((item): item is Promotion => item !== null && item.title !== "");
}

export async function fetchPromotions(): Promise<Promotion[]> {
  if (!isAppwriteConfigured()) {
    return MOCK_PROMOTIONS;
  }

  return fetchPromotionsFromAppwrite();
}

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  assertAppwriteConfigured();

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(databaseId, collections.promotions, [
    Query.orderDesc("validUntil"),
    Query.limit(100),
  ]);

  return response.documents
    .map((doc) => mapAdminPromotionDocument(doc as Record<string, unknown>))
    .filter((item): item is AdminPromotion => item !== null && item.title !== "");
}

function buildPromotionPayload(input: CreatePromotionInput) {
  const code = input.code?.trim();
  const discountLabel =
    input.discountType &&
    input.discountValue !== undefined &&
    input.discountValue > 0
      ? formatDiscountLabel(input.discountType, input.discountValue)
      : input.discountLabel.trim();

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    discountLabel,
    ...(code ? { code } : {}),
    validUntil: input.validUntil,
    imageUrl: input.imageUrl?.trim() || "/images/theater-seats.jpg",
    terms: input.terms,
    isActive: input.isActive ?? true,
  };
}

export async function uploadPromotionImage(
  file: File,
): Promise<{ fileId: string; imageUrl: string }> {
  assertAppwriteConfigured();

  if (!APPWRITE_CONFIG.bucketId) {
    throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
  }

  const { fileId, url } = await uploadImageFile(file);
  return { fileId, imageUrl: url };
}

export async function createPromotion(
  input: CreatePromotionInput,
): Promise<AdminPromotion> {
  assertAppwriteConfigured();

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.createDocument(
    databaseId,
    collections.promotions,
    ID.unique(),
    buildPromotionPayload(input),
  );

  const item = mapAdminPromotionDocument(doc as Record<string, unknown>);
  if (!item) {
    throw new Error("Tạo khuyến mãi thành công nhưng không thể đọc lại dữ liệu.");
  }

  return item;
}

export async function updatePromotion(
  documentId: string,
  input: UpdatePromotionInput,
): Promise<AdminPromotion> {
  assertAppwriteConfigured();

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const doc = await databases.updateDocument(
    databaseId,
    collections.promotions,
    documentId,
    buildPromotionPayload(input),
  );

  const item = mapAdminPromotionDocument(doc as Record<string, unknown>);
  if (!item) {
    throw new Error("Cập nhật khuyến mãi thành công nhưng không thể đọc lại dữ liệu.");
  }

  return item;
}

export async function deletePromotion(documentId: string): Promise<void> {
  assertAppwriteConfigured();

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  let imageUrl: string | undefined;

  try {
    const doc = await databases.getDocument(
      databaseId,
      collections.promotions,
      documentId,
    );
    imageUrl = (doc as Record<string, unknown>).imageUrl
      ? String((doc as Record<string, unknown>).imageUrl)
      : undefined;
  } catch {
    // Document may already be gone.
  }

  await databases.deleteDocument(databaseId, collections.promotions, documentId);

  if (imageUrl?.includes("/storage/buckets/")) {
    const deleted = await deleteStorageFileByUrl(imageUrl);
    if (!deleted && getStorageFileIdFromUrl(imageUrl)) {
      await deleteStorageFileById(getStorageFileIdFromUrl(imageUrl)!);
    }
  }
}

export async function createPromotionWithImage(
  input: CreatePromotionInput,
  imageFile?: File,
): Promise<AdminPromotion> {
  let uploadedFileId: string | undefined;

  try {
    let imageUrl = input.imageUrl;

    if (imageFile) {
      const uploaded = await uploadPromotionImage(imageFile);
      uploadedFileId = uploaded.fileId;
      imageUrl = uploaded.imageUrl;
    }

    return await createPromotion({ ...input, imageUrl });
  } catch (error) {
    if (uploadedFileId) {
      await deleteStorageFileById(uploadedFileId);
    }
    throw error;
  }
}

export async function updatePromotionWithImage(
  documentId: string,
  input: UpdatePromotionInput,
  options?: { imageFile?: File; previousImageUrl?: string },
): Promise<AdminPromotion> {
  let uploadedFileId: string | undefined;

  try {
    let imageUrl = input.imageUrl;

    if (options?.imageFile) {
      const uploaded = await uploadPromotionImage(options.imageFile);
      uploadedFileId = uploaded.fileId;
      imageUrl = uploaded.imageUrl;
    }

    const item = await updatePromotion(documentId, { ...input, imageUrl });

    if (options?.imageFile && options.previousImageUrl?.includes("/storage/buckets/")) {
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

export async function findPromotionByCode(code: string): Promise<Promotion | null> {
  if (!code.trim()) return null;

  if (!isAppwriteConfigured()) {
    const normalized = code.trim().toUpperCase();
    const found = MOCK_PROMOTIONS.find(
      (promo) => promo.code?.toUpperCase() === normalized,
    );
    return found ?? null;
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(databaseId, collections.promotions, [
    Query.equal("code", code.trim().toUpperCase()),
    Query.limit(1),
  ]);

  if (response.documents.length === 0) {
    const fallback = await databases.listDocuments(databaseId, collections.promotions, [
      Query.equal("code", code.trim()),
      Query.limit(1),
    ]);
    if (fallback.documents.length === 0) return null;
    return mapPromotionDocument(fallback.documents[0] as Record<string, unknown>);
  }

  return mapPromotionDocument(response.documents[0] as Record<string, unknown>);
}

export function evaluatePromotion(
  promotion: Promotion,
  ticketSubtotal: number,
  concessionSubtotal: number,
): AppliedPromoResult {
  if (!promotion.code) {
    throw new PromoValidationError("Khuyến mãi này không có mã để áp dụng.");
  }

  if (isPromotionExpired(promotion.validUntil)) {
    throw new PromoValidationError("Mã khuyến mãi đã hết hạn.");
  }

  const config = getPromotionDiscountConfig(promotion);
  if (!config) {
    throw new PromoValidationError(
      "Không thể tính giảm giá cho mã này. Kiểm tra cấu hình khuyến mãi trong admin.",
    );
  }

  if (promotion.category === "ticket" || promotion.category === "member") {
    const ticketDiscount = calculateDiscountAmount(ticketSubtotal, config);
    if (ticketDiscount <= 0) {
      throw new PromoValidationError("Mã không áp dụng được cho đơn vé hiện tại.");
    }

    return { promotion, ticketDiscount, concessionDiscount: 0 };
  }

  const concessionDiscount = calculateDiscountAmount(concessionSubtotal, config);
  if (concessionDiscount <= 0) {
    throw new PromoValidationError(
      "Mã chỉ áp dụng cho đồ ăn & thức uống. Hãy thêm món vào giỏ trước.",
    );
  }

  return { promotion, ticketDiscount: 0, concessionDiscount };
}

export const promotionQueryKeys = {
  all: ["promotions"] as const,
  list: () => [...promotionQueryKeys.all, "list"] as const,
  adminList: () => [...promotionQueryKeys.all, "admin", "list"] as const,
};
