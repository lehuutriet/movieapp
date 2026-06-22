import type { Cinema, Showtime } from "@/types/showtime";
import { MOCK_MOVIES } from "@/data/mockData";
import { DEMO_SHOWTIME_ID } from "@/data/showtime-meta";
import { toDateKey } from "@/lib/date-utils";

export const MOCK_CINEMAS: Cinema[] = [
  {
    $id: "cinema_cgv_thuduc",
    name: "CGV Vincom Thủ Đức",
    slug: "cgv-vincom-thu-duc",
    address: "216 Võ Văn Ngân, Linh Chiểu, Thủ Đức",
    city: "Hồ Chí Minh",
    district: "Thủ Đức",
    imageUrl:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  },
  {
    $id: "cinema_cgv_gigamall",
    name: "CGV Giga Mall",
    slug: "cgv-giga-mall",
    address: "242 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức",
    city: "Hồ Chí Minh",
    district: "Thủ Đức",
    imageUrl:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80",
  },
  {
    $id: "cinema_lotte_cantavil",
    name: "Lotte Cinema Cantavil",
    slug: "lotte-cantavil",
    address: "1 Song Hành, An Phú, Thủ Đức",
    city: "Hồ Chí Minh",
    district: "Thủ Đức",
    imageUrl:
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&q=80",
  },
  {
    $id: "cinema_cgv_hanoi",
    name: "CGV Vincom Center Bà Triệu",
    slug: "cgv-ba-trieu",
    address: "191 Bà Triệu, Hai Bà Trưng",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    imageUrl:
      "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
  },
  {
    $id: "cinema_galaxy_danang",
    name: "Galaxy Cinema Đà Nẵng",
    slug: "galaxy-da-nang",
    address: "116 Nguyễn Văn Linh, Hải Châu",
    city: "Đà Nẵng",
    district: "Hải Châu",
    imageUrl:
      "https://images.unsplash.com/photo-1574267432550-4a4a4f14133f?w=800&q=80",
  },
];

const SHOWTIME_HOURS = [10, 13, 16, 19, 21];
const SHOWTIME_MINUTES = [0, 30, 0, 0, 30];

function buildShowtimeId(
  movieId: string,
  cinemaId: string,
  dateKey: string,
  slotIndex: number,
): string {
  if (
    movieId === "movie_1" &&
    cinemaId === "cinema_cgv_thuduc" &&
    slotIndex === 3
  ) {
    return DEMO_SHOWTIME_ID;
  }

  return `st_${movieId}_${cinemaId}_${dateKey}_${slotIndex}`;
}

function generateMockShowtimes(): Showtime[] {
  const showtimes: Showtime[] = [];
  const now = new Date();

  const movieIds = MOCK_MOVIES.filter((m) => m.status === "now_showing").map(
    (m) => m.$id,
  );

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);
    const dateKey = toDateKey(date);

    for (const movieId of movieIds) {
      const movie = MOCK_MOVIES.find((item) => item.$id === movieId);
      if (!movie) continue;

      for (const cinema of MOCK_CINEMAS) {
        SHOWTIME_HOURS.forEach((hour, slotIndex) => {
          const start = new Date(date);
          start.setHours(hour, SHOWTIME_MINUTES[slotIndex], 0, 0);

          const end = new Date(start);
          end.setMinutes(end.getMinutes() + movie.duration + 15);

          showtimes.push({
            $id: buildShowtimeId(movieId, cinema.$id, dateKey, slotIndex),
            movieId,
            cinemaId: cinema.$id,
            auditoriumId: `aud_${cinema.$id}`,
            auditoriumName:
              slotIndex >= 3 ? "Phòng IMAX" : `Phòng ${slotIndex + 1}`,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            format: slotIndex >= 3 ? "IMAX 2D" : "2D",
            language: "Phụ đề",
            basePrice: slotIndex >= 3 ? 120_000 : 85_000,
            status: "scheduled",
          });
        });
      }
    }
  }

  return showtimes;
}

export const MOCK_SHOWTIMES: Showtime[] = generateMockShowtimes();

export function getMockCinemaById(id: string): Cinema | undefined {
  return MOCK_CINEMAS.find((cinema) => cinema.$id === id);
}

export function getMockMovieBySlug(slug: string) {
  return MOCK_MOVIES.find((movie) => movie.slug === slug);
}

export function getMockMovieById(id: string) {
  return MOCK_MOVIES.find((movie) => movie.$id === id);
}
