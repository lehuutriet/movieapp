import { useNavigate } from "react-router-dom";
import { MovieImage } from "@/components/movie/MovieImage";
import { useMovies } from "@/hooks/use-movies";
import { getMovieThumbnailUrl } from "@/lib/movie-images";
import { cn } from "@/lib/cn";
import type { Movie } from "@/types/movie";

interface MoviePosterCardProps {
  movie: Movie;
  onTrailerClick?: (trailerUrl: string) => void;
  className?: string;
}

export function MoviePosterCard({
  movie,
  onTrailerClick,
  className,
}: MoviePosterCardProps) {
  const navigate = useNavigate();
  const isComingSoon = movie.status === "coming_soon";

  const handleBook = () => {
    if (isComingSoon) return;
    navigate(`/showtimes/${movie.slug}`);
  };

  const handleTrailer = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (movie.trailerUrl && onTrailerClick) {
      onTrailerClick(movie.trailerUrl);
    }
  };

  return (
    <article
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border-orange-900/30 shadow-lg shadow-black/30",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-900">
        <MovieImage
          movie={movie}
          src={getMovieThumbnailUrl(movie)}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent p-3 pt-10">
          <h3 className="line-clamp-2 text-sm font-bold text-white">{movie.title}</h3>
          {isComingSoon && movie.releaseDate ? (
            <p className="mt-1 text-[11px] text-amber-400/90">
              Khởi chiếu{" "}
              {new Date(movie.releaseDate).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : null}
        </div>

        {!isComingSoon ? (
          <button
            type="button"
            onClick={handleBook}
            className="absolute bottom-0 w-full translate-y-full bg-orange-600 py-2 text-center text-sm font-bold uppercase tracking-wide text-white transition-transform duration-300 group-hover:translate-y-0"
          >
            Đặt vé
          </button>
        ) : (
          <div className="absolute bottom-0 w-full translate-y-full bg-stone-700 py-2 text-center text-sm font-bold text-stone-300 transition-transform duration-300 group-hover:translate-y-0">
            Sắp chiếu
          </div>
        )}

        {movie.trailerUrl && onTrailerClick ? (
          <button
            type="button"
            onClick={handleTrailer}
            className="absolute right-2 top-2 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          >
            Xem trailer
          </button>
        ) : null}
      </div>
    </article>
  );
}

function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-[2/3] animate-pulse rounded-lg bg-stone-800/80"
        />
      ))}
    </div>
  );
}

interface MovieGridProps {
  status: "now_showing" | "coming_soon";
  onTrailerClick?: (trailerUrl: string) => void;
  limit?: number;
}

export function MovieGrid({ status, onTrailerClick, limit }: MovieGridProps) {
  const { data, isLoading, isError } = useMovies(status);

  if (isLoading) return <MovieGridSkeleton count={limit ?? 10} />;

  if (isError || !data?.length) {
    return (
      <p className="py-12 text-center text-sm text-stone-400">
        Chưa có phim trong mục này.
      </p>
    );
  }

  const movies = limit ? data.slice(0, limit) : data;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MoviePosterCard
          key={movie.$id}
          movie={movie}
          onTrailerClick={onTrailerClick}
        />
      ))}
    </div>
  );
}
