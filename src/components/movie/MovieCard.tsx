import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { getMovieThumbnailUrl } from "@/lib/movie-images";
import type { Movie } from "@/types/movie";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  onTrailerClick?: (trailerUrl: string) => void;
}

const RATING_STYLES: Record<string, string> = {
  P: "bg-emerald-500/90 text-white",
  K: "bg-sky-500/90 text-white",
  T13: "bg-amber-500/90 text-slate-950",
  T16: "bg-orange-500/90 text-white",
  T18: "bg-red-600/90 text-white",
};

export function MovieCard({ movie, className, onTrailerClick }: MovieCardProps) {
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
        "group relative overflow-hidden rounded-xl bg-slate-900 shadow-lg shadow-black/30",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={getMovieThumbnailUrl(movie)}
          alt={movie.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              RATING_STYLES[movie.rating] ?? "bg-slate-700 text-white",
            )}
          >
            {movie.rating}
          </span>
          {movie.genres.slice(0, 1).map((genre) => (
            <span
              key={genre}
              className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-slate-200 backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white drop-shadow-lg">
            {movie.title}
          </h3>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            disabled={isComingSoon}
            onClick={handleBook}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition",
              isComingSoon
                ? "cursor-not-allowed bg-slate-600 text-slate-400"
                : "bg-red-600 text-white hover:bg-red-500",
            )}
          >
            {isComingSoon ? "Sắp chiếu" : "Mua vé"}
          </button>
          {movie.trailerUrl && onTrailerClick ? (
            <button
              type="button"
              onClick={handleTrailer}
              className="rounded-full border border-white/40 bg-white/10 px-5 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20"
            >
              Xem Trailer
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
