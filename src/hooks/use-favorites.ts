import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  favoriteQueryKeys,
  fetchUserFavoriteIds,
  toggleUserFavorite,
} from "@/api/favorites";
import { isAppwriteConfigured } from "@/lib/appwrite";
import { useAuthStore } from "@/stores/auth-store";
import { useFavoritesStore } from "@/stores/favorites-store";

const EMPTY_FAVORITE_IDS: string[] = [];

export function useFavoriteIds() {
  const user = useAuthStore((state) => state.user);
  const localIds = useFavoritesStore((state) =>
    user ? state.getFavoriteIds(user.$id) : EMPTY_FAVORITE_IDS,
  );

  const remoteQuery = useQuery({
    queryKey: favoriteQueryKeys.list(user?.$id ?? ""),
    queryFn: () => fetchUserFavoriteIds(user!.$id),
    enabled: Boolean(user) && isAppwriteConfigured(),
    staleTime: 30_000,
  });

  if (!user) return EMPTY_FAVORITE_IDS;
  if (isAppwriteConfigured()) {
    return remoteQuery.data ?? EMPTY_FAVORITE_IDS;
  }

  return localIds;
}

export function useIsFavorite(movieId: string) {
  const favoriteIds = useFavoriteIds();
  return favoriteIds.includes(movieId);
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const toggleLocal = useFavoritesStore((state) => state.toggleFavorite);

  return useMutation({
    mutationFn: async (movieId: string) => {
      if (!user) {
        throw new Error("Bạn cần đăng nhập để lưu yêu thích.");
      }

      if (isAppwriteConfigured()) {
        return toggleUserFavorite(user.$id, movieId);
      }

      const wasFavorite = useFavoritesStore
        .getState()
        .isFavorite(user.$id, movieId);
      toggleLocal(user.$id, movieId);
      return !wasFavorite;
    },
    onSuccess: () => {
      if (user && isAppwriteConfigured()) {
        void queryClient.invalidateQueries({
          queryKey: favoriteQueryKeys.list(user.$id),
        });
      }
    },
  });
}
