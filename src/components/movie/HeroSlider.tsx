import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MovieImage } from "@/components/movie/MovieImage";
import { cn } from "@/lib/cn";
import { getMovieBackdropUrl } from "@/lib/movie-images";
import type { Movie } from "@/types/movie";

interface HeroSliderProps {
  movies: Movie[];
  className?: string;
  onTrailerClick?: (trailerUrl: string) => void;
}

export function HeroSlider({ movies, className, onTrailerClick }: HeroSliderProps) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const count = movies.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;

  const movie = movies[activeIndex];

  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <div className="film-strip-top" />

      <div className="relative h-[50vh] min-h-[320px] md:h-[55vh]">
        {movies.map((slide, index) => (
          <div
            key={slide.$id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <MovieImage
              movie={slide}
              src={getMovieBackdropUrl(slide)}
              alt=""
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-orange-950/30" />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
          </div>
        ))}

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-8 pt-6 md:px-6 md:pb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-400">
            Phim đang hot
          </p>
          <h1 className="font-cinema mt-2 max-w-2xl text-3xl font-bold leading-tight text-white md:text-5xl">
            {movie.title}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
            {movie.synopsis}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            <span className="rounded bg-red-700 px-2 py-0.5 font-bold text-white">
              {movie.rating}
            </span>
            <span>{movie.duration} phút</span>
            <span>•</span>
            <span>{movie.genres.join(", ")}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/showtimes/${movie.slug}`)}
              className="rounded-lg bg-orange-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-500"
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
                className="rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Xem trailer
              </button>
            ) : null}
          </div>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 md:left-6"
              aria-label="Slide trước"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 md:right-6"
              aria-label="Slide sau"
            >
              ›
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {movies.map((slide, index) => (
                <button
                  key={slide.$id}
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === activeIndex
                      ? "w-6 bg-orange-500"
                      : "w-2 bg-white/40 hover:bg-white/60",
                  )}
                  aria-label={`Đến slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div className="film-strip-bottom" />
    </section>
  );
}
