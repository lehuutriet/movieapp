import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShowtimeSlotList } from "@/components/showtimes/ShowtimeSlotButton";
import { ShowtimesFilters } from "@/components/showtimes/ShowtimesFilters";
import { useMovies } from "@/hooks/use-movies";
import { useShowtimes } from "@/hooks/use-showtimes";
import { toDateKey } from "@/lib/date-utils";
import { cn } from "@/lib/cn";
import { getMovieThumbnailUrl } from "@/lib/movie-images";
import { usePreferenceStore } from "@/stores/preference-store";
import type { Movie } from "@/types/movie";
import type { CinemaShowtimeGroup } from "@/types/showtime";

const STEPS = [
  { id: 1, label: "Chọn phim" },
  { id: 2, label: "Chọn rạp" },
  { id: 3, label: "Chọn suất" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: StepId;
  onStepClick: (step: StepId) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2 sm:gap-0">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <li key={step.id} className="flex items-center">
            <button
              type="button"
              disabled={step.id > currentStep}
              onClick={() => {
                if (step.id <= currentStep) onStepClick(step.id);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition",
                isActive && "bg-orange-600 text-white",
                isCompleted &&
                  "text-orange-400 hover:bg-orange-600/10 cursor-pointer",
                !isActive &&
                  !isCompleted &&
                  "cursor-not-allowed text-stone-500",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  isActive && "bg-white/20",
                  isCompleted && "bg-orange-600/20",
                  !isActive && !isCompleted && "bg-stone-800",
                )}
              >
                {step.id}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-2 hidden h-px w-8 sm:block",
                  step.id < currentStep ? "bg-orange-600" : "bg-stone-700",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function MovieStep({
  onSelect,
}: {
  onSelect: (movie: Movie) => void;
}) {
  const { data: movies = [], isLoading, isError } = useMovies("now_showing");

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-xl bg-stone-800"
          />
        ))}
      </div>
    );
  }

  if (isError || movies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center">
        <p className="text-slate-400">Hiện chưa có phim đang chiếu.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {movies.map((movie) => (
        <button
          key={movie.$id}
          type="button"
          onClick={() => onSelect(movie)}
          className="group overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/40 text-left transition hover:border-orange-600/50 hover:bg-slate-900/80"
        >
          <img
            src={getMovieThumbnailUrl(movie)}
            alt={movie.title}
            className="aspect-[2/3] w-full object-cover transition group-hover:scale-[1.02]"
          />
          <div className="p-3">
            <p className="line-clamp-2 text-sm font-semibold text-white group-hover:text-orange-400">
              {movie.title}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {movie.rating} · {movie.duration} phút
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function CinemaStep({
  groups,
  selectedCinemaId,
  onSelect,
  isLoading,
}: {
  groups: CinemaShowtimeGroup[];
  selectedCinemaId: string | null;
  onSelect: (cinemaId: string) => void;
  isLoading: boolean;
}) {
  const availableGroups = groups.filter((group) => group.showtimes.length > 0);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-800" />
        ))}
      </div>
    );
  }

  if (availableGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 py-16 text-center">
        <p className="text-slate-400">
          Không có rạp nào chiếu phim này vào ngày bạn chọn.
        </p>
        <p className="mt-2 text-sm text-stone-500">Thử chọn ngày hoặc khu vực khác.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableGroups.map((group) => {
        const isSelected = group.cinema.$id === selectedCinemaId;
        const slotCount = group.showtimes.filter((slot) => !slot.isPast).length;

        return (
          <button
            key={group.cinema.$id}
            type="button"
            onClick={() => onSelect(group.cinema.$id)}
            className={cn(
              "w-full rounded-xl border p-4 text-left transition",
              isSelected
                ? "border-orange-600 bg-orange-600/10"
                : "border-slate-800/60 bg-slate-900/40 hover:border-orange-600/40 hover:bg-slate-900/80",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{group.cinema.name}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {group.cinema.address}, {group.cinema.district}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-300">
                {slotCount} suất
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ShowtimeStep({
  group,
  movieTitle,
}: {
  group: CinemaShowtimeGroup | undefined;
  movieTitle: string;
}) {
  if (!group) return null;

  const availableSlots = group.showtimes.filter((slot) => !slot.isPast);

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
      <p className="text-xs uppercase tracking-wider text-orange-400">Suất chiếu</p>
      <h2 className="mt-1 text-lg font-bold text-white">{group.cinema.name}</h2>
      <p className="mt-1 text-sm text-stone-500">{movieTitle}</p>

      {availableSlots.length === 0 ? (
        <p className="mt-6 text-center text-slate-400">
          Tất cả suất chiếu trong ngày đã qua. Vui lòng chọn ngày khác.
        </p>
      ) : (
        <ShowtimeSlotList slots={group.showtimes} className="mt-6" />
      )}
    </div>
  );
}

export function BookingPage() {
  const navigate = useNavigate();
  const currentCity = usePreferenceStore((state) => state.currentCity);
  const [step, setStep] = useState<StepId>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const { data: showtimeData, isLoading: isShowtimesLoading } = useShowtimes(
    selectedMovie?.slug,
    selectedDate,
    currentCity,
  );

  const groups = showtimeData?.groups ?? [];
  const selectedGroup = groups.find((group) => group.cinema.$id === selectedCinemaId);

  const handleStepClick = (targetStep: StepId) => {
    if (targetStep === 1) {
      setSelectedCinemaId(null);
      setStep(1);
      return;
    }
    if (targetStep === 2) {
      setSelectedCinemaId(null);
      setStep(2);
    }
  };

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setSelectedCinemaId(null);
    setStep(2);
  };

  const handleCinemaSelect = (cinemaId: string) => {
    setSelectedCinemaId(cinemaId);
    setStep(3);
  };

  return (
    <div className="min-h-screen pb-16 text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Đặt vé nhanh</p>
          <h1 className="mt-2 text-2xl font-bold text-white md:text-3xl">
            Chọn phim, rạp và suất chiếu
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Hoàn tất 3 bước để đến màn hình chọn ghế tại {currentCity}
          </p>
          <div className="mt-6">
            <StepIndicator currentStep={step} onStepClick={handleStepClick} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {step > 1 && (
            <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-56">
              <ShowtimesFilters
                layout="sidebar"
                selectedDate={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  if (step === 3) {
                    setSelectedCinemaId(null);
                    setStep(2);
                  }
                }}
              />
              {selectedMovie && (
                <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500">
                    Phim đã chọn
                  </p>
                  <div className="mt-3 flex gap-3">
                    <img
                      src={getMovieThumbnailUrl(selectedMovie)}
                      alt={selectedMovie.title}
                      className="h-16 w-11 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-white">
                        {selectedMovie.title}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMovie(null);
                          setSelectedCinemaId(null);
                          setStep(1);
                        }}
                        className="mt-1 text-xs text-orange-400 hover:underline"
                      >
                        Đổi phim
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {step === 1 && <MovieStep onSelect={handleMovieSelect} />}

            {step === 2 && selectedMovie && (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      Bước 2
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      Chọn rạp chiếu
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/showtimes")}
                    className="shrink-0 text-sm text-stone-400 hover:text-orange-400"
                  >
                    Xem lịch đầy đủ
                  </button>
                </div>
                <CinemaStep
                  groups={groups}
                  selectedCinemaId={selectedCinemaId}
                  onSelect={handleCinemaSelect}
                  isLoading={isShowtimesLoading}
                />
              </>
            )}

            {step === 3 && selectedMovie && (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-500">
                      Bước 3
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-white">
                      Chọn suất chiếu
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="shrink-0 text-sm text-orange-400 hover:underline"
                  >
                    ← Đổi rạp
                  </button>
                </div>
                <ShowtimeStep group={selectedGroup} movieTitle={selectedMovie.title} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
