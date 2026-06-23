import { Heart } from "lucide-react";
import { MoviePosterCard } from "@/components/movie/MoviePosterCard";
import { useFavoriteIds } from "@/hooks/use-favorites";
import { useMoviesByIds } from "@/hooks/use-movies-by-ids";

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="aspect-[2/3] animate-pulse rounded-lg bg-zinc-800" />
      ))}
    </div>
  );
}

export function FavoritesTab() {
  const favoriteIds = useFavoriteIds();
  const { data: movies, isLoading, isError } = useMoviesByIds(favoriteIds);

  if (!favoriteIds.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800">
          <Heart className="h-6 w-6 text-zinc-500" />
        </div>
        <h2 className="text-lg font-semibold text-white">Chưa có phim yêu thích</h2>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Nhấn biểu tượng trái tim trên poster phim để lưu vào danh sách yêu thích.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <FavoritesSkeleton />;
  }

  if (isError || !movies?.length) {
    return (
      <p className="py-12 text-center text-sm text-zinc-400">
        Không thể tải danh sách yêu thích. Vui lòng thử lại sau.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-1 text-xl font-bold text-white">Phim yêu thích</h2>
      <p className="mb-6 text-sm text-zinc-400">
        {movies.length} phim trong danh sách của bạn
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {movies.map((movie) => (
          <MoviePosterCard key={movie.$id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
