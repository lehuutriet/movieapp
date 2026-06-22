import type { Movie } from "@/types/movie";

function isValidImageUrl(url?: string): url is string {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function resolveMovieImage(
  movie: Pick<Movie, "posterUrl" | "backdropUrl">,
  prefer: "poster" | "backdrop",
): string {
  const poster = isValidImageUrl(movie.posterUrl) ? movie.posterUrl : "";
  const backdrop = isValidImageUrl(movie.backdropUrl) ? movie.backdropUrl : "";

  if (prefer === "backdrop") {
    return backdrop || poster;
  }
  return poster || backdrop;
}

/** Grid/card thumbnail — poster first, backdrop as fallback. */
export function getMovieThumbnailUrl(
  movie: Pick<Movie, "posterUrl" | "backdropUrl">,
) {
  return resolveMovieImage(movie, "poster");
}

/** Wide banner image for hero sections. */
export function getMovieBackdropUrl(
  movie: Pick<Movie, "posterUrl" | "backdropUrl">,
) {
  return resolveMovieImage(movie, "backdrop");
}

/** Portrait poster when explicitly needed (e.g. ticket detail). */
export function getMoviePosterUrl(
  movie: Pick<Movie, "posterUrl" | "backdropUrl">,
) {
  return resolveMovieImage(movie, "poster");
}

/** Alternate URL when the primary image fails to load. */
export function getMovieImageFallback(
  movie: Pick<Movie, "posterUrl" | "backdropUrl">,
  failedUrl: string,
): string | undefined {
  const poster = isValidImageUrl(movie.posterUrl) ? movie.posterUrl : "";
  const backdrop = isValidImageUrl(movie.backdropUrl) ? movie.backdropUrl : "";

  if (failedUrl === poster && backdrop && backdrop !== poster) return backdrop;
  if (failedUrl === backdrop && poster && poster !== backdrop) return poster;
  return undefined;
}
