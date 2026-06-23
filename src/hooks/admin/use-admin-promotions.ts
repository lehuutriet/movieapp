import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPromotionWithImage,
  deletePromotion,
  getAdminPromotions,
  promotionQueryKeys,
  updatePromotionWithImage,
} from "@/api/promotions";
import type {
  CreatePromotionInput,
  UpdatePromotionInput,
} from "@/types/promotion";

export interface CreatePromotionPayload {
  input: CreatePromotionInput;
  imageFile?: File;
}

export interface UpdatePromotionPayload {
  documentId: string;
  input: UpdatePromotionInput;
  imageFile?: File;
  previousImageUrl?: string;
}

export function useAdminPromotions() {
  return useQuery({
    queryKey: promotionQueryKeys.adminList(),
    queryFn: getAdminPromotions,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, imageFile }: CreatePromotionPayload) =>
      createPromotionWithImage(input, imageFile),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      input,
      imageFile,
      previousImageUrl,
    }: UpdatePromotionPayload) =>
      updatePromotionWithImage(documentId, input, {
        imageFile,
        previousImageUrl,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deletePromotion(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: promotionQueryKeys.all });
    },
  });
}
