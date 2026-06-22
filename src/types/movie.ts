export type MovieStatus = "now_showing" | "coming_soon" | "ended";

export interface Movie {
  $id: string;
  $updatedAt?: string;
  title: string;
  slug: string;
  posterUrl: string;
  backdropUrl: string;
  synopsis: string;
  duration: number;
  releaseDate: string;
  rating: string;
  genres: string[];
  trailerUrl?: string;
  status: MovieStatus;
  featured?: boolean;
}
