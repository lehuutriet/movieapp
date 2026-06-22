import { useQuery } from "@tanstack/react-query";
import {
  fetchFeaturedMovie,
  fetchFeaturedMovies,
  fetchMovies,
  movieQueryKeys,
} from "@/api/movies";
import type { MovieStatus } from "@/types/movie";

export function useMovies(status: MovieStatus) {
  return useQuery({
    queryKey: movieQueryKeys.list(status),
    queryFn: () => fetchMovies(status),
    staleTime: 30_000,
  });
}

export function useFeaturedMovie() {
  return useQuery({
    queryKey: movieQueryKeys.featured(),
    queryFn: fetchFeaturedMovie,
    staleTime: 30_000,
  });
}

export function useFeaturedMovies(limit = 5) {
  return useQuery({
    queryKey: movieQueryKeys.featuredList(limit),
    queryFn: () => fetchFeaturedMovies(limit),
    staleTime: 30_000,
  });
}
