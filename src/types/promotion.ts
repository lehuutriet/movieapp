export type PromotionCategory = "ticket" | "combo" | "member";
export type PromoDiscountType = "percent" | "fixed";

export interface Promotion {
  id: string;
  title: string;
  description: string;
  category: PromotionCategory;
  discountLabel: string;
  discountType?: PromoDiscountType;
  discountValue?: number;
  code?: string;
  validUntil: string;
  imageUrl: string;
  terms: string[];
}

export interface AdminPromotion extends Promotion {
  isActive: boolean;
}

export interface CreatePromotionInput {
  title: string;
  description: string;
  category: PromotionCategory;
  discountLabel: string;
  discountType?: PromoDiscountType;
  discountValue?: number;
  code?: string;
  validUntil: string;
  imageUrl?: string;
  terms: string[];
  isActive?: boolean;
}

export type UpdatePromotionInput = CreatePromotionInput;
