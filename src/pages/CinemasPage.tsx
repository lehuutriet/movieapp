import { useEffect, useMemo, useState } from "react";
import { ShowtimeSlotList } from "@/components/showtimes/ShowtimeSlotButton";
import { CinemasPageSkeleton } from "@/components/showtimes/ShowtimesSkeleton";
import { useCinemaSchedule, useCinemas } from "@/hooks/use-cinemas";
import { toDateKey } from "@/lib/date-utils";
import { getMovieThumbnailUrl } from "@/lib/movie-images";
import { cn } from "@/lib/cn";

export function CinemasPage() {
  const today = useMemo(() => toDateKey(new Date()), []);
  const { data: cinemaGroups, isLoading: isCinemasLoading } = useCinemas();
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | undefined>();

  const allCinemas = useMemo(
    () => cinemaGroups?.flatMap((group) => group.cinemas) ?? [],
    [cinemaGroups],
  );

  useEffect(() => {
    if (!selectedCinemaId && allCinemas.length > 0) {
      setSelectedCinemaId(allCinemas[0].$id);
    }
  }, [allCinemas, selectedCinemaId]);

  const { data: schedule, isLoading: isScheduleLoading } = useCinemaSchedule(
    selectedCinemaId,
    today,
  );

  if (isCinemasLoading) {
    return <CinemasPageSkeleton />;
  }

  const selectedCinema =
    allCinemas.find((cinema) => cinema.$id === selectedCinemaId) ?? allCinemas[0];

  return (
    <div className="min-h-screen pb-16 text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Cụm rạp</p>
          <h1 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">
            Hệ thống rạp Cine Hall
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Chọn rạp để xem lịch chiếu hôm nay
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:px-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          {cinemaGroups?.map((group) => (
            <div key={group.city}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                {group.city}
              </h2>
              <ul className="space-y-2">
                {group.cinemas.map((cinema) => {
                  const isActive = cinema.$id === selectedCinema?.$id;

                  return (
                    <li key={cinema.$id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCinemaId(cinema.$id)}
                        className={cn(
                          "w-full rounded-xl border px-4 py-3 text-left transition-all",
                          isActive
                            ? "border-orange-500 bg-orange-600 font-bold text-white shadow-[0_4px_14px_0_rgba(234,88,12,0.39)]"
                            : "border-stone-700/50 bg-black/40 text-stone-400 hover:bg-stone-800 hover:text-white",
                        )}
                      >
                        <span className="block text-sm font-medium">
                          {cinema.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-stone-500">
                          {cinema.district}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <section className="min-h-[400px] rounded-2xl border border-orange-900/30 bg-black/40 transition-colors hover:bg-black/50">
          {!selectedCinema ? (
            <div className="flex h-full items-center justify-center p-8 text-stone-500">
              Chọn một rạp để xem chi tiết
            </div>
          ) : (
            <>
              {selectedCinema.imageUrl && (
                <div className="relative h-48 overflow-hidden rounded-t-2xl md:h-56">
                  <img
                    src={selectedCinema.imageUrl}
                    alt={selectedCinema.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-stone-900 to-transparent" />
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-white">
                  {selectedCinema.name}
                </h2>
                <p className="mt-2 text-sm text-stone-400">
                  {selectedCinema.address}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {selectedCinema.district}, {selectedCinema.city}
                </p>

                <div className="mt-8 border-t border-stone-800/50 pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                    Lịch chiếu hôm nay
                  </h3>

                  {isScheduleLoading ? (
                    <div className="mt-4 animate-pulse space-y-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="h-20 rounded-xl bg-stone-800/60" />
                      ))}
                    </div>
                  ) : !schedule?.movies.length ? (
                    <p className="mt-4 text-sm text-stone-500">
                      Hôm nay chưa có suất chiếu tại rạp này.
                    </p>
                  ) : (
                    <div className="mt-5 space-y-5">
                      {schedule.movies.map((entry) => (
                        <div
                          key={entry.movie.$id}
                          className="rounded-2xl border border-stone-800/50 bg-black/40 p-4 transition-colors hover:bg-black/50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={getMovieThumbnailUrl(entry.movie)}
                              alt={entry.movie.title}
                              className="h-16 w-12 rounded-lg object-cover shadow-md"
                            />
                            <div>
                              <p className="text-lg font-bold text-white">
                                {entry.movie.title}
                              </p>
                              <p className="text-xs text-stone-500">
                                {entry.movie.duration} phút · {entry.movie.rating}
                              </p>
                            </div>
                          </div>
                          <ShowtimeSlotList
                            slots={entry.showtimes}
                            className="mt-3"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
