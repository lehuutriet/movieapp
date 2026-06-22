export interface Cinema {
  $id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  district: string;
  imageUrl?: string;
}

export type ShowtimeStatus = "scheduled" | "cancelled" | "completed";

export interface Showtime {
  $id: string;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  auditoriumName: string;
  startTime: string;
  endTime: string;
  format: string;
  language: string;
  basePrice: number;
  status: ShowtimeStatus;
}

export interface ShowtimeSlot {
  showtimeId: string;
  startTime: string;
  timeLabel: string;
  format: string;
  basePrice: number;
  isPast: boolean;
}

export interface CinemaShowtimeGroup {
  cinema: Cinema;
  showtimes: ShowtimeSlot[];
}

export interface ShowtimesPageData {
  movie: {
    $id: string;
    $updatedAt?: string;
    title: string;
    slug: string;
    posterUrl: string;
    backdropUrl: string;
    trailerUrl?: string;
    genres: string[];
    duration: number;
    rating: string;
  };
  groups: CinemaShowtimeGroup[];
}

export type MovieSummary = ShowtimesPageData["movie"];

export interface MovieShowtimeOverview {
  movie: MovieSummary;
  cinemas: CinemaShowtimeGroup[];
}

export interface AllShowtimesData {
  movies: MovieShowtimeOverview[];
}

export interface CinemaMovieShowtimeGroup {
  movie: MovieSummary;
  showtimes: ShowtimeSlot[];
}

export interface CinemaScheduleData {
  cinema: Cinema;
  movies: CinemaMovieShowtimeGroup[];
}

export interface CinemasByCityGroup {
  city: string;
  cinemas: Cinema[];
}
