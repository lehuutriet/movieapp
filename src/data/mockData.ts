import type { Movie } from "@/types/movie";

export const MOCK_MOVIES: Movie[] = [
  {
    $id: "movie_1",
    title: "Avengers: Endgame",
    slug: "avengers-endgame",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    synopsis:
      "Sau sự kiện tàn khốc, các siêu anh hùng còn sót lại phải hợp sức đảo ngược thế giới.",
    duration: 181,
    releaseDate: "2019-04-26",
    rating: "T13",
    genres: ["Hành động", "Khoa học viễn tưởng"],
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
    status: "now_showing",
    featured: true,
  },
  {
    $id: "movie_2",
    title: "Dune: Part Two",
    slug: "dune-part-two",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlYjUrKHbg0vwr0.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/xOMo8BRKjPpJhD5XlsaioG2qXng.jpg",
    synopsis:
      "Paul Atreides đồng minh với người Fremen trên hành trình trả thù.",
    duration: 166,
    releaseDate: "2024-03-01",
    rating: "T16",
    genres: ["Phiêu lưu", "Khoa học viễn tưởng"],
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w",
    status: "now_showing",
  },
  {
    $id: "movie_3",
    title: "Mai",
    slug: "mai",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/8bcoRX3GhQR0ia7j7yOpW9KotqH.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/8bcoRX3GhQR0ia7j7yOpW9KotqH.jpg",
    synopsis: "Câu chuyện tình yêu và số phận của người phụ nữ tên Mai.",
    duration: 131,
    releaseDate: "2024-02-10",
    rating: "T18",
    genres: ["Tình cảm", "Chính kịch"],
    trailerUrl: "https://www.youtube.com/watch?v=example",
    status: "now_showing",
  },
  {
    $id: "movie_4",
    title: "Inside Out 2",
    slug: "inside-out-2",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/vpn69AdZNDiN9GPa3BYwEG7Sb2i.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/7BmHTAnGlOJDJ0PyGcc8zvqXaiz.jpg",
    synopsis:
      "Riley bước vào tuổi vị thành niên cùng những cảm xúc mới xuất hiện.",
    duration: 96,
    releaseDate: "2026-07-15",
    rating: "P",
    genres: ["Hoạt hình", "Gia đình"],
    trailerUrl: "https://www.youtube.com/watch?v=LEjhY15eCx0",
    status: "coming_soon",
  },
  {
    $id: "movie_5",
    title: "Deadpool & Wolverine",
    slug: "deadpool-wolverine",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/8cdWjsZdExjhUZM0ANbnCM8BnkK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/w1280/9PXZIUsSDh4alB80jhe9JdLlKdk.jpg",
    synopsis: "Deadpool và Wolverine hợp sức trong cuộc phiêu lưu đa vũ trụ.",
    duration: 128,
    releaseDate: "2026-08-01",
    rating: "T18",
    genres: ["Hành động", "Hài"],
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk",
    status: "coming_soon",
  },
];
