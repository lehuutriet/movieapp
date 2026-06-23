import { create } from "zustand";
import { persist } from "zustand/middleware";

const EMPTY_FAVORITE_IDS: string[] = [];

interface FavoritesState {
  byUser: Record<string, string[]>;
  toggleFavorite: (userId: string, movieId: string) => void;
  isFavorite: (userId: string, movieId: string) => boolean;
  getFavoriteIds: (userId: string) => string[];
  removeFavorite: (userId: string, movieId: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      byUser: {},

      toggleFavorite: (userId, movieId) => {
        set((state) => {
          const current = state.byUser[userId] ?? [];
          const next = current.includes(movieId)
            ? current.filter((id) => id !== movieId)
            : [...current, movieId];

          return {
            byUser: { ...state.byUser, [userId]: next },
          };
        });
      },

      isFavorite: (userId, movieId) => {
        return (get().byUser[userId] ?? []).includes(movieId);
      },

      getFavoriteIds: (userId) => {
        return get().byUser[userId] ?? EMPTY_FAVORITE_IDS;
      },

      removeFavorite: (userId, movieId) => {
        set((state) => ({
          byUser: {
            ...state.byUser,
            [userId]: (state.byUser[userId] ?? []).filter((id) => id !== movieId),
          },
        }));
      },
    }),
    { name: "movieapp_favorites" },
  ),
);
