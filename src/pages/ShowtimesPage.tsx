import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShowtimeSlotList } from "@/components/showtimes/ShowtimeSlotButton";
import { ShowtimesFilters } from "@/components/showtimes/ShowtimesFilters";
import {
  MovieShowtimesSkeleton,
  ShowtimesListSkeleton,
} from "@/components/showtimes/ShowtimesSkeleton";
import { useAllShowtimes } from "@/hooks/use-cinemas";
import { useShowtimes } from "@/hooks/use-showtimes";
import { toDateKey } from "@/lib/date-utils";
import { getMovieBackdropUrl, getMovieThumbnailUrl } from "@/lib/movie-images";
import { usePreferenceStore } from "@/stores/preference-store";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

function ShowtimesOverviewPage() {
  const currentCity = usePreferenceStore((state) => state.currentCity);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const { data, isLoading, isError } = useAllShowtimes(selectedDate, currentCity);

  if (isLoading) return <ShowtimesListSkeleton />;

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-rose-400">
        Không tải được lịch chiếu.
      </div>
    );
  }

  const movies = data?.movies ?? [];
  const hasShowtimes = movies.length > 0;

  return (
    <div className="min-h-screen pb-16 text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Lịch chiếu</p>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Tất cả suất chiếu
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Xem lịch chiếu theo ngày và khu vực tại {currentCity}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-56">
            <ShowtimesFilters
              layout="sidebar"
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </aside>

          <div className="min-w-0 flex-1">
          {!hasShowtimes ? (
            <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center">
              <p className="text-gray-400">
                Hiện chưa có lịch chiếu vào ngày bạn chọn.
              </p>
              <p className="mt-2 text-sm text-stone-500">
                Thử chọn ngày khác hoặc đổi khu vực.
              </p>
            </div>
          ) : (
            movies.map((entry) => (
              <article
                key={entry.movie.$id}
                className="mb-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-colors hover:bg-slate-900/60"
              >
                <div className="flex gap-4">
                  <img
                    src={getMovieThumbnailUrl(entry.movie)}
                    alt={entry.movie.title}
                    className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-lg"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/showtimes/${entry.movie.slug}`}
                      className="text-xl font-bold text-white transition-colors hover:text-red-400"
                    >
                      {entry.movie.title}
                    </Link>
                    <p className="mt-2 text-sm text-gray-400">
                      {entry.movie.rating} · {entry.movie.duration} phút ·{" "}
                      {entry.movie.genres.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-5 border-t border-slate-800/50 pt-5">
                  {entry.cinemas.map((group) => (
                    <div key={group.cinema.$id}>
                      <h3 className="font-semibold text-gray-200">
                        {group.cinema.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {group.cinema.address}
                      </p>
                      <ShowtimeSlotList
                        slots={group.showtimes}
                        className="mt-3"
                      />
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MovieShowtimesPage({ movieSlug }: { movieSlug: string }) {
  const currentCity = usePreferenceStore((state) => state.currentCity);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const { data, isLoading, isError } = useShowtimes(
    movieSlug,
    selectedDate,
    currentCity,
  );

  if (isLoading) return <MovieShowtimesSkeleton />;

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-rose-400">Không tìm thấy phim hoặc lịch chiếu.</p>
        <Link
          to="/showtimes"
          className="mt-6 inline-block text-sm text-orange-400 hover:underline"
        >
          Xem tất cả lịch chiếu
        </Link>
      </div>
    );
  }

  const { movie, groups } = data;
  const hasShowtimes = groups.some((group) => group.showtimes.length > 0);

  return (
    <div className="min-h-screen pb-16 text-white">
      <section className="relative overflow-hidden border-b border-orange-900/30">
        <img
          src={getMovieBackdropUrl(movie)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />

        <div className="relative mx-auto flex max-w-4xl gap-4 px-4 py-8 md:gap-6 md:px-6">
          <img
            src={getMovieThumbnailUrl(movie)}
            alt={movie.title}
            className="h-32 shrink-0 rounded-lg border border-white/10 object-cover shadow-xl md:h-40 md:w-28"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.25em] text-orange-400">Đặt vé</p>
            <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              {movie.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="rounded bg-red-600/90 px-2 py-0.5 text-xs font-bold text-white">
                {movie.rating}
              </span>
              <span>{movie.duration} phút</span>
              <span className="text-slate-600">•</span>
              <span>{movie.genres.join(", ")}</span>
            </div>
            {movie.trailerUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsTrailerOpen(true);
                }}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-700"
              >
                ▶ Xem Trailer
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-56">
            <ShowtimesFilters
              layout="sidebar"
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
          {!hasShowtimes ? (
            <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center">
              <p className="text-slate-400">
                Hiện chưa có lịch chiếu cho phim này vào ngày bạn chọn.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <article
                key={group.cinema.$id}
                className="mb-6 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-5 transition-colors hover:bg-slate-900/60"
              >
                <h2 className="text-xl font-bold text-white">
                  {group.cinema.name}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {group.cinema.address}, {group.cinema.district}
                </p>
                <ShowtimeSlotList slots={group.showtimes} className="mt-4" />
              </article>
            ))
          )}
          </div>
        </div>
      </div>

      {isTrailerOpen && movie.trailerUrl && (
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
              src={getYouTubeEmbedUrl(movie.trailerUrl)}
              className="aspect-video w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title="Trailer"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function ShowtimesPage() {
  const { movieSlug } = useParams<{ movieSlug?: string }>();

  if (movieSlug) {
    return <MovieShowtimesPage movieSlug={movieSlug} />;
  }

  return <ShowtimesOverviewPage />;
}
