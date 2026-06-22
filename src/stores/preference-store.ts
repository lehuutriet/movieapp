import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CITY_OPTIONS = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
] as const;

export type CityOption = (typeof CITY_OPTIONS)[number];

interface PreferenceState {
  currentCity: CityOption;
  setCurrentCity: (city: CityOption) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      currentCity: "Hồ Chí Minh",
      setCurrentCity: (city) => set({ currentCity: city }),
    }),
    { name: "movieapp_preferences" },
  ),
);
