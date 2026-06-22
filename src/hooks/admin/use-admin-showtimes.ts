import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminShowtimeKeys,
  createShowtime,
  deleteShowtime,
  fetchAdminShowtimes,
  type CreateShowtimeInput,
} from "@/api/admin/showtimes";
import { useAdminCinemas } from "@/hooks/admin/use-admin-cinemas";
import { useAdminMovies } from "@/hooks/admin/use-admin-movies";

export function useAdminShowtimes() {
  const { data: movies = [] } = useAdminMovies();
  const { data: cinemas = [] } = useAdminCinemas();

  const movieMap = new Map(movies.map((movie) => [movie.$id, movie.title]));
  const cinemaMap = new Map(cinemas.map((cinema) => [cinema.$id, cinema.name]));

  return useQuery({
    queryKey: adminShowtimeKeys.all,
    queryFn: () => fetchAdminShowtimes(movieMap, cinemaMap),
  });
}

export function useCreateShowtime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShowtimeInput) => createShowtime(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminShowtimeKeys.all });
    },
  });
}

export function useDeleteShowtime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShowtime(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminShowtimeKeys.all });
    },
  });
}

export function useAdminShowtimeOptions() {
  const moviesQuery = useAdminMovies();
  const cinemasQuery = useAdminCinemas();

  return {
    movies: moviesQuery.data ?? [],
    cinemas: cinemasQuery.data ?? [],
    isLoading: moviesQuery.isLoading || cinemasQuery.isLoading,
  };
}

export function useAdminStats() {
  const movies = useAdminMovies();
  const cinemas = useAdminCinemas();
  const showtimes = useAdminShowtimes();

  return {
    movieCount: movies.data?.length ?? 0,
    cinemaCount: cinemas.data?.length ?? 0,
    showtimeCount: showtimes.data?.length ?? 0,
    isLoading: movies.isLoading || cinemas.isLoading || showtimes.isLoading,
  };
}
