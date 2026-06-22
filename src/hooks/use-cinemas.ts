import { useQuery } from "@tanstack/react-query";
import {
  fetchAllShowtimes,
  fetchCinemaSchedule,
  fetchCinemasGrouped,
  showtimeQueryKeys,
} from "@/api/showtimes";

export function useAllShowtimes(date: string, city: string) {
  return useQuery({
    queryKey: showtimeQueryKeys.all(date, city),
    queryFn: () => fetchAllShowtimes(date, city),
    enabled: Boolean(date && city),
    staleTime: 30_000,
  });
}

export function useCinemas() {
  return useQuery({
    queryKey: showtimeQueryKeys.cinemas(),
    queryFn: fetchCinemasGrouped,
    staleTime: 60_000,
  });
}

export function useCinemaSchedule(cinemaId: string | undefined, date: string) {
  return useQuery({
    queryKey: showtimeQueryKeys.cinemaSchedule(cinemaId ?? "", date),
    queryFn: () => fetchCinemaSchedule(cinemaId!, date),
    enabled: Boolean(cinemaId && date),
    staleTime: 30_000,
  });
}
