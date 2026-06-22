import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { SeatMap } from "@/components/seat-map/SeatMap";
import {
  DEMO_SEATS,
  DEMO_SHOWTIME_ID,
  DEMO_SHOWTIME_META,
} from "@/data/mock-seats";
import { APPWRITE_CONFIG, getDatabases, isAppwriteConfigured } from "@/lib/appwrite";
import {
  calculateTotalAmount,
  useBookingStore,
} from "@/stores/booking-store";

export function SeatSelectionPage() {
  const { showtimeId: routeShowtimeId } = useParams<{ showtimeId: string }>();
  const showtimeId = routeShowtimeId ?? DEMO_SHOWTIME_ID;
  const navigate = useNavigate();

  const appwriteReady = isAppwriteConfigured();
  const selectedSeats = useBookingStore((state) => state.selectedSeats);
  const confirmBooking = useBookingStore((state) => state.confirmBooking);
  const step = useBookingStore((state) => state.step);
  const setShowtime = useBookingStore((state) => state.setShowtime);
  const setShowtimeBasePrice = useBookingStore((state) => state.setShowtimeBasePrice);
  const showtimeMeta = useBookingStore((state) => state.showtimeMeta);
  const showtimeBasePrice = useBookingStore((state) => state.showtimeBasePrice);

  const { data: headerData } = useQuery({
    queryKey: ["seat-selection-header", showtimeId],
    enabled: appwriteReady && showtimeId !== DEMO_SHOWTIME_ID,
    queryFn: async () => {
      const databases = getDatabases();
      const { databaseId, collections } = APPWRITE_CONFIG;

      const showtimeDoc = await databases.getDocument(
        databaseId,
        collections.showtimes,
        showtimeId,
      );

      const raw = showtimeDoc as Record<string, unknown>;
      const movieId = String(raw.movieId ?? "");
      const cinemaId = String(raw.cinemaId ?? "");
      const startTime = String(raw.startTime ?? "");
      const basePrice = Number(raw.basePrice ?? 0);

      const [movieDoc, cinemaDoc] = await Promise.all([
        databases.getDocument(databaseId, collections.movies, movieId),
        databases.getDocument(databaseId, collections.cinemas, cinemaId),
      ]);

      return {
        movieTitle: String((movieDoc as Record<string, unknown>).title ?? "Chưa xác định"),
        moviePosterUrl: String((movieDoc as Record<string, unknown>).posterUrl ?? ""),
        cinemaName: String((cinemaDoc as Record<string, unknown>).name ?? "Chưa xác định"),
        startTime,
        basePrice,
      };
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (showtimeId === DEMO_SHOWTIME_ID) {
      setShowtime(showtimeId, {
        movieTitle: DEMO_SHOWTIME_META.movieTitle,
        cinemaName: DEMO_SHOWTIME_META.cinemaName,
        startTime: DEMO_SHOWTIME_META.startTime,
        basePrice: DEMO_SHOWTIME_META.basePrice,
      });
      return;
    }

    const storeShowtimeId = useBookingStore.getState().showtimeId;
    if (storeShowtimeId !== showtimeId) {
      setShowtime(showtimeId);
    }
  }, [showtimeId, setShowtime]);

  useEffect(() => {
    if (!headerData?.basePrice) return;

    setShowtimeBasePrice(headerData.basePrice);
  }, [headerData?.basePrice, setShowtimeBasePrice]);

  const resolvedBasePrice =
    showtimeBasePrice ??
    headerData?.basePrice ??
    (showtimeId === DEMO_SHOWTIME_ID ? DEMO_SHOWTIME_META.basePrice : null);

  const total =
    resolvedBasePrice != null
      ? calculateTotalAmount(selectedSeats, resolvedBasePrice)
      : 0;
  const isLocking = step === "locking";
  const headerMovieTitle =
    headerData?.movieTitle ?? showtimeMeta?.movieTitle ?? "Chọn ghế của bạn";
  const headerCinemaName =
    headerData?.cinemaName ?? showtimeMeta?.cinemaName ?? "Rạp chưa xác định";
  const headerStartTimeRaw = headerData?.startTime ?? showtimeMeta?.startTime;
  const headerStartTime = headerStartTimeRaw
    ? new Date(headerStartTimeRaw).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour12: false,
      })
    : "Giờ chiếu chưa xác định";
  const cinematicBackground = headerData?.moviePosterUrl || "";

  const handleContinue = async () => {
    const id = await confirmBooking(showtimeId, selectedSeats);
    if (id) {
      navigate(`/book/checkout/${id}`);
    }
  };

  const handleResetSeats = () => {
    if (resolvedBasePrice != null) {
      setShowtime(showtimeId, {
        movieTitle: headerMovieTitle,
        cinemaName: headerCinemaName,
        startTime: headerStartTimeRaw ?? "",
        basePrice: resolvedBasePrice,
      });
      return;
    }

    setShowtime(showtimeId);
  };

  return (
    <div className="relative min-h-screen text-white">
      {cinematicBackground ? (
        <div
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${cinematicBackground})` }}
        />
      ) : (
        <div className="fixed inset-0 z-[-1] bg-slate-950" />
      )}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-36 pt-8">
        <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
            Bước chọn ghế
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">{headerMovieTitle}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {headerCinemaName} • {headerStartTime}
          </p>
          {resolvedBasePrice != null && (
            <p className="mt-2 text-sm text-orange-400">
              Giá vé: {resolvedBasePrice.toLocaleString("vi-VN")}đ
            </p>
          )}
          <p className="mt-2 text-xs text-slate-400">
            {appwriteReady
              ? "Trạng thái ghế cập nhật realtime qua Appwrite."
              : "Đang chạy offline — bạn vẫn có thể chọn ghế để xem UI."}
          </p>
        </header>

        {!appwriteReady && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <p className="font-medium">Chế độ demo — Appwrite chưa được cấu hình</p>
            <p className="mt-1 text-amber-100/80">
              Tạo file <code className="rounded bg-black/20 px-1">.env</code> từ{" "}
              <code className="rounded bg-black/20 px-1">.env.example</code> và điền
              biến Appwrite, sau đó restart dev server.
            </p>
          </div>
        )}

        <SeatMap
          showtimeId={showtimeId}
          seats={DEMO_SEATS}
          basePrice={resolvedBasePrice ?? undefined}
          className="rounded-3xl border border-slate-800 bg-linear-to-b from-slate-900 to-slate-950 p-6 shadow-[0_25px_60px_rgba(2,6,23,0.75)]"
        />
      </div>

      <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-slate-800 bg-slate-900 p-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-300">
              Ghế đã chọn:{" "}
              <span className="font-medium text-white">
                {selectedSeats.length > 0
                  ? selectedSeats.map((seat) => seat.label).join(", ")
                  : "Chưa chọn"}
              </span>
            </p>
            <p className="mt-1 text-2xl font-bold text-orange-400">
              Tổng tiền: {total.toLocaleString("vi-VN")}đ
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleResetSeats}
              className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Chọn lại
            </button>
            <button
              type="button"
              disabled={selectedSeats.length === 0 || isLocking || resolvedBasePrice == null}
              onClick={handleContinue}
              className="rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLocking ? "Đang giữ ghế..." : "Tiếp tục"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
