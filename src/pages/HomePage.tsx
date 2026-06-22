import { useState } from "react";
import { Link } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { HeroSlider } from "@/components/movie/HeroSlider";
import { MovieGrid } from "@/components/movie/MoviePosterCard";
import { Footer } from "@/components/layout/Footer";
import { useFeaturedMovies } from "@/hooks/use-movies";
import { cn } from "@/lib/cn";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

function SectionHeader({
  eyebrow,
  title,
  seeAllTo,
}: {
  eyebrow: string;
  title: string;
  seeAllTo: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-orange-400">{eyebrow}</p>
        <h2 className="font-cinema mt-1 text-2xl font-bold text-white md:text-3xl">
          {title}
        </h2>
      </div>
      <Link
        to={seeAllTo}
        className="shrink-0 text-sm font-semibold text-amber-400 transition hover:text-amber-300"
      >
        Xem tất cả
      </Link>
    </div>
  );
}

export function HomePage() {
  const { data: sliderMovies, isLoading: isSliderLoading } = useFeaturedMovies(5);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState("");

  const openTrailer = (trailerUrl: string) => {
    setCurrentTrailerUrl(trailerUrl);
    setIsTrailerOpen(true);
  };

  return (
    <div className="min-h-screen text-white">
      {isSliderLoading ? (
        <div className="relative">
          <div className="film-strip-top" />
          <div className="h-[50vh] min-h-[320px] animate-pulse bg-stone-900 md:h-[55vh]" />
          <div className="film-strip-bottom" />
        </div>
      ) : sliderMovies && sliderMovies.length > 0 ? (
        <HeroSlider
          movies={sliderMovies}
          onTrailerClick={openTrailer}
        />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <SectionHeader eyebrow="Phim" title="Đang chiếu" seeAllTo="/movies" />
        <MovieGrid status="now_showing" onTrailerClick={openTrailer} limit={10} />
      </section>

      <section className="border-y border-orange-900/20 bg-stone-950/60">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <SectionHeader eyebrow="Phim" title="Sắp chiếu" seeAllTo="/movies" />
          <MovieGrid status="coming_soon" onTrailerClick={openTrailer} limit={10} />
        </div>
      </section>

      <Footer />

      {isTrailerOpen && currentTrailerUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsTrailerOpen(false)}
              className="absolute -top-10 right-0 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ✕ Đóng
            </button>
            <iframe
              src={getYouTubeEmbedUrl(currentTrailerUrl)}
              className="aspect-video w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title="Trailer phim"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function MoviesPage() {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState("");

  const openTrailer = (trailerUrl: string) => {
    setCurrentTrailerUrl(trailerUrl);
    setIsTrailerOpen(true);
  };

  return (
    <div className="min-h-screen text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Khám phá</p>
          <h1 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">
            Tất cả phim
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Xem phim đang chiếu và sắp chiếu
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <Tabs.Root defaultValue="now_showing" className="w-full">
          <Tabs.List className="mb-8 inline-flex rounded-full border border-orange-900/40 bg-black/40 p-1">
            <Tabs.Trigger
              value="now_showing"
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-300 transition-colors",
                "data-[state=active]:bg-orange-600 data-[state=active]:text-white",
                "hover:text-white",
              )}
            >
              Đang chiếu
            </Tabs.Trigger>
            <Tabs.Trigger
              value="coming_soon"
              className={cn(
                "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-stone-300 transition-colors",
                "data-[state=active]:bg-orange-600 data-[state=active]:text-white",
                "hover:text-white",
              )}
            >
              Sắp chiếu
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="now_showing" className="outline-none">
            <MovieGrid status="now_showing" onTrailerClick={openTrailer} />
          </Tabs.Content>

          <Tabs.Content value="coming_soon" className="outline-none">
            <MovieGrid status="coming_soon" onTrailerClick={openTrailer} />
          </Tabs.Content>
        </Tabs.Root>
      </main>

      {isTrailerOpen && currentTrailerUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsTrailerOpen(false)}
              className="absolute -top-10 right-0 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              ✕ Đóng
            </button>
            <iframe
              src={getYouTubeEmbedUrl(currentTrailerUrl)}
              className="aspect-video w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title="Trailer phim"
            />
          </div>
        </div>
      )}
    </div>
  );
}
