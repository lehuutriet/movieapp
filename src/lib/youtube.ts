/**
 * Chuyển bất kỳ dạng link YouTube thông thường sang link embed.
 * Hỗ trợ: watch?v=, youtu.be/, youtube.com/embed/
 * Trả về "" nếu không parse được.
 */
export function getYouTubeEmbedUrl(url?: string): string {
  if (!url) return "";

  const patterns = [
    /youtube\.com\/watch\?.*v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/embed\/([\w-]{6,})/,
    /youtube\.com\/shorts\/([\w-]{6,})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }

  return "";
}
