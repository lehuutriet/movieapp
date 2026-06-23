import { useQuery } from "@tanstack/react-query";
import { fetchPromotions, promotionQueryKeys } from "@/api/promotions";

export function usePromotions() {
  return useQuery({
    queryKey: promotionQueryKeys.list(),
    queryFn: fetchPromotions,
    staleTime: 60_000,
  });
}
