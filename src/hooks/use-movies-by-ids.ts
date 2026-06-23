import { useQuery } from "@tanstack/react-query";
import { fetchMoviesByIds, movieQueryKeys } from "@/api/movies";

export function useMoviesByIds(ids: string[]) {
  return useQuery({
    queryKey: movieQueryKeys.byIds(ids),
    queryFn: () => fetchMoviesByIds(ids),
    enabled: ids.length > 0,
    staleTime: 30_000,
  });
}
