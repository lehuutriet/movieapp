export interface ShowtimeMeta {
  movieTitle: string;
  cinemaName: string;
  auditoriumName: string;
  startTime: string;
  basePrice: number;
  posterUrl?: string;
  backdropUrl?: string;
}

export const DEMO_SHOWTIME_ID = "showtime_demo";

export const DEMO_SHOWTIME_META: ShowtimeMeta = {
  movieTitle: "Avengers: Endgame",
  cinemaName: "CGV Vincom Thủ Đức",
  auditoriumName: "Phòng 5 — IMAX",
  startTime: "2026-06-15T19:30:00+07:00",
  basePrice: 85_000,
  posterUrl:
    "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  backdropUrl:
    "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
};

const SHOWTIME_META: Record<string, ShowtimeMeta> = {
  [DEMO_SHOWTIME_ID]: DEMO_SHOWTIME_META,
};

export function getShowtimeMeta(showtimeId: string): ShowtimeMeta {
  return (
    SHOWTIME_META[showtimeId] ?? {
      movieTitle: "Phim đang chiếu",
      cinemaName: "Rạp chiếu phim",
      auditoriumName: "Phòng chiếu",
      startTime: "",
      basePrice: 65_000,
    }
  );
}

export function formatShowtimeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Chưa xác định";

  return date.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getScreeningStatus(
  startTime: string,
  now = Date.now(),
): "upcoming" | "past" {
  const startMs = Date.parse(startTime);
  if (Number.isNaN(startMs)) return "upcoming";
  return startMs > now ? "upcoming" : "past";
}
