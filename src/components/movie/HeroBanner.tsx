import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";
import { MovieImage } from "@/components/movie/MovieImage";
import { getMovieBackdropUrl } from "@/lib/movie-images";
import type { Movie } from "@/types/movie";

interface HeroBannerProps {
  movie: Movie;
  className?: string;
  onTrailerClick?: (trailerUrl: string) => void;
}

export function HeroBanner({ movie, className, onTrailerClick }: HeroBannerProps) {
  const navigate = useNavigate();

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        className,
      )}
    >
      <MovieImage
        movie={movie}
        src={getMovieBackdropUrl(movie)}
        alt=""
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-stone-950 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-stone-950/90 via-stone-950/40 to-transparent" />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-10 pt-8 md:px-6 md:pb-16">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">
          Phim đang hot
        </p>
        <h1 className="font-cinema mt-3 max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">
          {movie.title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
          {movie.synopsis}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          <span className="rounded bg-orange-600 px-2 py-0.5 font-bold text-white">
            {movie.rating}
          </span>
          <span>{movie.duration} phút</span>
          <span>•</span>
          <span>{movie.genres.join(", ")}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(`/showtimes/${movie.slug}`)}
            className="rounded-xl bg-orange-600 px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-500"
          >
            Đặt vé ngay
          </button>
          {movie.trailerUrl && onTrailerClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTrailerClick(movie.trailerUrl!);
              }}
              className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Xem Trailer
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
