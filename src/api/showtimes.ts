import { Query } from "appwrite";
import {
  DEMO_SHOWTIME_ID,
  DEMO_SHOWTIME_META,
  getShowtimeMeta,
} from "@/data/showtime-meta";
import {
  formatTimeLabel,
  getDayRange,
  isShowtimePast,
} from "@/lib/date-utils";
import {
  APPWRITE_CONFIG,
  getDatabases,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import type { Movie } from "@/types/movie";
import type {
  AllShowtimesData,
  Cinema,
  CinemaShowtimeGroup,
  CinemaScheduleData,
  CinemasByCityGroup,
  CinemaMovieShowtimeGroup,
  MovieShowtimeOverview,
  Showtime,
  ShowtimesPageData,
  ShowtimeSlot,
} from "@/types/showtime";

function mapCinema(raw: Record<string, unknown>): Cinema {
  return {
    $id: String(raw.$id),
    name: String(raw.name),
    slug: String(raw.slug),
    address: String(raw.address),
    city: String(raw.city),
    district: String(raw.district ?? ""),
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
  };
}

function mapShowtime(raw: Record<string, unknown>): Showtime {
  return {
    $id: String(raw.$id),
    movieId: String(raw.movieId),
    cinemaId: String(raw.cinemaId),
    auditoriumId: String(raw.auditoriumId),
    auditoriumName: String(raw.auditoriumName ?? "Phòng chiếu"),
    startTime: String(raw.startTime),
    endTime: String(raw.endTime),
    format: String(raw.format ?? "2D"),
    language: String(raw.language ?? "Phụ đề"),
    basePrice: Number(raw.basePrice ?? 0),
    status: (raw.status as Showtime["status"]) ?? "scheduled",
  };
}

function mapMovie(raw: Record<string, unknown>): Movie {
  const posterUrl = String(raw.posterUrl ?? "");
  const backdropRaw = raw.backdropUrl ? String(raw.backdropUrl) : "";

  return {
    $id: String(raw.$id),
    $updatedAt: raw.$updatedAt ? String(raw.$updatedAt) : undefined,
    title: String(raw.title),
    slug: String(raw.slug),
    posterUrl,
    backdropUrl: backdropRaw || posterUrl,
    synopsis: String(raw.synopsis ?? ""),
    duration: Number(raw.duration ?? 0),
    releaseDate: String(raw.releaseDate ?? ""),
    rating: String(raw.rating ?? "P"),
    genres: Array.isArray(raw.genres) ? (raw.genres as string[]) : [],
    trailerUrl: raw.trailerUrl ? String(raw.trailerUrl) : undefined,
    status: (raw.status as Movie["status"]) ?? "now_showing",
    featured: Boolean(raw.featured),
  };
}

function mapMovieSummary(movie: Movie): ShowtimesPageData["movie"] {
  return {
    $id: movie.$id,
    title: movie.title,
    slug: movie.slug,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    $updatedAt: movie.$updatedAt,
    trailerUrl: movie.trailerUrl,
    genres: movie.genres,
    duration: movie.duration,
    rating: movie.rating,
  };
}

function toShowtimeSlot(showtime: Showtime): ShowtimeSlot {
  return {
    showtimeId: showtime.$id,
    startTime: showtime.startTime,
    timeLabel: formatTimeLabel(showtime.startTime),
    format: showtime.format,
    basePrice: showtime.basePrice,
    isPast: isShowtimePast(showtime.startTime),
  };
}

function groupByCinema(
  showtimes: Showtime[],
  cinemas: Cinema[],
): CinemaShowtimeGroup[] {
  const cinemaMap = new Map(cinemas.map((cinema) => [cinema.$id, cinema]));
  const grouped = new Map<string, ShowtimeSlot[]>();

  for (const showtime of showtimes) {
    const cinema = cinemaMap.get(showtime.cinemaId);
    if (!cinema) continue;

    const slots = grouped.get(cinema.$id) ?? [];
    slots.push(toShowtimeSlot(showtime));
    grouped.set(cinema.$id, slots);
  }

  return [...grouped.entries()]
    .map(([cinemaId, slots]) => ({
      cinema: cinemaMap.get(cinemaId)!,
      showtimes: slots.sort(
        (a, b) => Date.parse(a.startTime) - Date.parse(b.startTime),
      ),
    }))
    .sort((a, b) => a.cinema.name.localeCompare(b.cinema.name, "vi"));
}

async function fetchMovieBySlugAppwrite(slug: string): Promise<Movie | null> {
  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();

  const response = await databases.listDocuments(
    databaseId,
    collections.movies,
    [Query.equal("slug", slug), Query.limit(1)],
  );

  if (response.documents.length === 0) return null;

  return mapMovie(response.documents[0] as Record<string, unknown>);
}

async function fetchAppwriteShowtimesPage(
  movieSlug: string,
  date: string,
  city: string,
): Promise<ShowtimesPageData | null> {
  const movie = await fetchMovieBySlugAppwrite(movieSlug);
  if (!movie) return null;

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const { start, end } = getDayRange(date);

  const [showtimesResult, cinemasResult] = await Promise.all([
    databases.listDocuments(databaseId, collections.showtimes, [
      Query.equal("movieId", movie.$id),
      Query.equal("status", "scheduled"),
      Query.greaterThanEqual("startTime", start),
      Query.lessThanEqual("startTime", end),
      Query.limit(200),
    ]),
    databases.listDocuments(databaseId, collections.cinemas, [
      Query.equal("city", city),
      Query.equal("isActive", true),
      Query.limit(50),
    ]),
  ]);

  const cinemas = cinemasResult.documents.map((doc) =>
    mapCinema(doc as Record<string, unknown>),
  );
  const cinemaIds = new Set(cinemas.map((cinema) => cinema.$id));

  const showtimes = showtimesResult.documents
    .map((doc) => mapShowtime(doc as Record<string, unknown>))
    .filter((showtime) => cinemaIds.has(showtime.cinemaId));

  return {
    movie: mapMovieSummary(movie),
    groups: groupByCinema(showtimes, cinemas),
  };
}

export async function fetchShowtimesPage(
  movieSlug: string,
  date: string,
  city: string,
): Promise<ShowtimesPageData | null> {
  if (!movieSlug) return null;
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  return fetchAppwriteShowtimesPage(movieSlug, date, city);
}

export const showtimeQueryKeys = {
  page: (movieSlug: string, date: string, city: string) =>
    ["showtimes", movieSlug, date, city] as const,
  all: (date: string, city: string) => ["showtimes", "all", date, city] as const,
  cinemaSchedule: (cinemaId: string, date: string) =>
    ["showtimes", "cinema", cinemaId, date] as const,
  cinemas: () => ["cinemas"] as const,
};

function groupByMovie(
  showtimes: Showtime[],
  cinemas: Cinema[],
  movieMap: Map<string, ShowtimesPageData["movie"]>,
): MovieShowtimeOverview[] {
  const movieIds = [...new Set(showtimes.map((showtime) => showtime.movieId))];

  return movieIds
    .map((movieId) => {
      const movie = movieMap.get(movieId);
      if (!movie) return null;

      const movieShowtimes = showtimes.filter(
        (showtime) => showtime.movieId === movieId,
      );

      return {
        movie,
        cinemas: groupByCinema(movieShowtimes, cinemas),
      };
    })
    .filter((item): item is MovieShowtimeOverview => item != null)
    .filter((item) => item.cinemas.length > 0)
    .sort((a, b) => a.movie.title.localeCompare(b.movie.title, "vi"));
}

function groupByMovieForCinema(
  showtimes: Showtime[],
  movieMap: Map<string, ShowtimesPageData["movie"]>,
): CinemaMovieShowtimeGroup[] {
  const movieIds = [...new Set(showtimes.map((showtime) => showtime.movieId))];

  return movieIds
    .map((movieId) => {
      const movie = movieMap.get(movieId);
      if (!movie) return null;

      const slots = showtimes
        .filter((showtime) => showtime.movieId === movieId)
        .map(toShowtimeSlot)
        .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));

      return {
        movie,
        showtimes: slots,
      };
    })
    .filter((item): item is CinemaMovieShowtimeGroup => item != null)
    .sort((a, b) => a.movie.title.localeCompare(b.movie.title, "vi"));
}

export async function fetchAllShowtimes(
  date: string,
  city: string,
): Promise<AllShowtimesData> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const { start, end } = getDayRange(date);

  const [showtimesResult, cinemasResult, moviesResult] = await Promise.all([
    databases.listDocuments(databaseId, collections.showtimes, [
      Query.equal("status", "scheduled"),
      Query.greaterThanEqual("startTime", start),
      Query.lessThanEqual("startTime", end),
      Query.limit(500),
    ]),
    databases.listDocuments(databaseId, collections.cinemas, [
      Query.equal("city", city),
      Query.limit(50),
    ]),
    databases.listDocuments(databaseId, collections.movies, [
      Query.equal("status", "now_showing"),
      Query.limit(100),
    ]),
  ]);

  const cinemas = cinemasResult.documents.map((doc) =>
    mapCinema(doc as Record<string, unknown>),
  );
  const cinemaIds = new Set(cinemas.map((cinema) => cinema.$id));

  const showtimes = showtimesResult.documents
    .map((doc) => mapShowtime(doc as Record<string, unknown>))
    .filter((showtime) => cinemaIds.has(showtime.cinemaId));

  const movieMap = new Map(
    moviesResult.documents.map((doc) => {
      const movie = mapMovie(doc as Record<string, unknown>);
      return [movie.$id, mapMovieSummary(movie)];
    }),
  );

  return { movies: groupByMovie(showtimes, cinemas, movieMap) };
}

export async function fetchCinemasGrouped(): Promise<CinemasByCityGroup[]> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const response = await databases.listDocuments(
    databaseId,
    collections.cinemas,
    [Query.limit(100)],
  );

  const cinemas = response.documents.map((doc) =>
    mapCinema(doc as Record<string, unknown>),
  );

  const cityMap = new Map<string, Cinema[]>();
  for (const cinema of cinemas) {
    const list = cityMap.get(cinema.city) ?? [];
    list.push(cinema);
    cityMap.set(cinema.city, list);
  }

  return [...cityMap.entries()].map(([city, items]) => ({
    city,
    cinemas: items.sort((a, b) => a.name.localeCompare(b.name, "vi")),
  }));
}

export async function fetchCinemaSchedule(
  cinemaId: string,
  date: string,
): Promise<CinemaScheduleData | null> {
  if (!isAppwriteConfigured()) {
    throw new Error("Appwrite chưa được cấu hình.");
  }

  const { databaseId, collections } = APPWRITE_CONFIG;
  const databases = getDatabases();
  const { start, end } = getDayRange(date);

  const [cinemaDoc, showtimesResult, moviesResult] = await Promise.all([
    databases.getDocument(databaseId, collections.cinemas, cinemaId),
    databases.listDocuments(databaseId, collections.showtimes, [
      Query.equal("cinemaId", cinemaId),
      Query.equal("status", "scheduled"),
      Query.greaterThanEqual("startTime", start),
      Query.lessThanEqual("startTime", end),
      Query.limit(100),
    ]),
    databases.listDocuments(databaseId, collections.movies, [Query.limit(200)]),
  ]);

  const cinema = mapCinema(cinemaDoc as Record<string, unknown>);
  const showtimes = showtimesResult.documents.map((doc) =>
    mapShowtime(doc as Record<string, unknown>),
  );
  const movieMap = new Map(
    moviesResult.documents.map((doc) => {
      const movie = mapMovie(doc as Record<string, unknown>);
      return [movie.$id, mapMovieSummary(movie)];
    }),
  );

  return {
    cinema,
    movies: groupByMovieForCinema(showtimes, movieMap),
  };
}

export interface ResolvedShowtimeMeta {
  movieTitle: string;
  cinemaName: string;
  auditoriumName: string;
  startTime: string;
  basePrice: number;
  posterUrl?: string;
  backdropUrl?: string;
}

export async function fetchShowtimeMeta(
  showtimeId: string,
): Promise<ResolvedShowtimeMeta> {
  if (showtimeId === DEMO_SHOWTIME_ID) {
    return DEMO_SHOWTIME_META;
  }

  if (!isAppwriteConfigured()) {
    return getShowtimeMeta(showtimeId);
  }

  try {
    const { databaseId, collections } = APPWRITE_CONFIG;
    const databases = getDatabases();

    const showtimeDoc = await databases.getDocument(
      databaseId,
      collections.showtimes,
      showtimeId,
    );
    const showtime = mapShowtime(showtimeDoc as Record<string, unknown>);

    const [movieDoc, cinemaDoc] = await Promise.all([
      databases.getDocument(databaseId, collections.movies, showtime.movieId),
      databases.getDocument(databaseId, collections.cinemas, showtime.cinemaId),
    ]);

    const movie = mapMovie(movieDoc as Record<string, unknown>);
    const cinema = mapCinema(cinemaDoc as Record<string, unknown>);

    return {
      movieTitle: movie.title,
      cinemaName: cinema.name,
      auditoriumName: showtime.auditoriumName,
      startTime: showtime.startTime,
      basePrice: showtime.basePrice,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
    };
  } catch {
    return getShowtimeMeta(showtimeId);
  }
}
