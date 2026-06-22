import { useQuery } from "@tanstack/react-query";
import { fetchShowtimesPage, showtimeQueryKeys } from "@/api/showtimes";

export function useShowtimes(
  movieSlug: string | undefined,
  date: string,
  city: string,
) {
  return useQuery({
    queryKey: showtimeQueryKeys.page(movieSlug ?? "", date, city),
    queryFn: () => fetchShowtimesPage(movieSlug!, date, city),
    enabled: Boolean(movieSlug && date && city),
    staleTime: 30_000,
  });
}
