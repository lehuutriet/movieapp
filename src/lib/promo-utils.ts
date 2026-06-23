import type { Promotion, PromoDiscountType } from "@/types/promotion";

export interface PromoDiscountConfig {
  type: PromoDiscountType;
  value: number;
}

export function formatDiscountLabel(
  type: PromoDiscountType,
  value: number,
): string {
  if (type === "percent") {
    return `-${value}%`;
  }

  return `${value.toLocaleString("vi-VN")}đ`;
}

export function parseDiscountFromLabel(
  label: string,
): PromoDiscountConfig | null {
  const percentMatch = label.match(/-?\s*(\d+(?:[.,]\d+)?)\s*%/);
  if (percentMatch) {
    return {
      type: "percent",
      value: Number(percentMatch[1].replace(",", ".")),
    };
  }

  const fixedMatch = label.match(/(\d[\d.,]*)\s*đ/i);
  if (fixedMatch) {
    const raw = fixedMatch[1].replace(/\./g, "").replace(",", ".");
    const value = Number(raw);
    if (Number.isFinite(value) && value > 0) {
      return { type: "fixed", value };
    }
  }

  return null;
}

export function getPromotionDiscountConfig(
  promo: Pick<Promotion, "discountLabel" | "discountType" | "discountValue">,
): PromoDiscountConfig | null {
  if (promo.discountType && promo.discountValue && promo.discountValue > 0) {
    return { type: promo.discountType, value: promo.discountValue };
  }

  return parseDiscountFromLabel(promo.discountLabel);
}

export function calculateDiscountAmount(
  subtotal: number,
  config: PromoDiscountConfig,
): number {
  if (subtotal <= 0) return 0;

  if (config.type === "percent") {
    return Math.min(subtotal, Math.round((subtotal * config.value) / 100));
  }

  return Math.min(subtotal, Math.round(config.value));
}

export function isPromotionExpired(validUntil: string): boolean {
  const expiresAt = Date.parse(validUntil);
  if (Number.isNaN(expiresAt)) return false;
  return expiresAt < Date.now();
}

export const PENDING_PROMO_STORAGE_KEY = "movieapp_pending_promo";

export function savePendingPromoCode(code: string) {
  sessionStorage.setItem(PENDING_PROMO_STORAGE_KEY, code.trim().toUpperCase());
}

export function consumePendingPromoCode(): string {
  const code = sessionStorage.getItem(PENDING_PROMO_STORAGE_KEY)?.trim() ?? "";
  if (code) {
    sessionStorage.removeItem(PENDING_PROMO_STORAGE_KEY);
  }
  return code;
}
