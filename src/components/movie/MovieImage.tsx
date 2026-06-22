import { useEffect, useState } from "react";
import { getMovieImageFallback } from "@/lib/movie-images";
import { cn } from "@/lib/cn";

interface MovieImageFields {
  posterUrl: string;
  backdropUrl: string;
}

interface MovieImageProps {
  movie: MovieImageFields;
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export function MovieImage({
  movie,
  src,
  alt,
  className,
  loading = "lazy",
}: MovieImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  if (!currentSrc) {
    return <div className={cn("bg-stone-800", className)} aria-label={alt} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => {
        const fallback = getMovieImageFallback(movie, currentSrc);
        if (fallback && fallback !== currentSrc) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}
