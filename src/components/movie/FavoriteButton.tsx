import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useIsFavorite, useToggleFavorite } from "@/hooks/use-favorites";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

interface FavoriteButtonProps {
  movieId: string;
  movieTitle?: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  movieId,
  movieTitle,
  className,
  size = "sm",
}: FavoriteButtonProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const showToast = useUIStore((state) => state.showToast);
  const isFavorite = useIsFavorite(movieId);
  const toggleFavorite = useToggleFavorite();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated || !user) {
      openAuthModal("login");
      return;
    }

    toggleFavorite.mutate(movieId, {
      onSuccess: (nowFavorite) => {
        showToast({
          type: "success",
          message: nowFavorite
            ? `Đã thêm "${movieTitle ?? "phim"}" vào yêu thích`
            : `Đã bỏ "${movieTitle ?? "phim"}" khỏi yêu thích`,
        });
      },
      onError: () => {
        showToast({
          type: "error",
          message: "Không thể cập nhật yêu thích. Vui lòng thử lại.",
        });
      },
    });
  };

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const buttonSize = size === "md" ? "h-9 w-9" : "h-8 w-8";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      className={cn(
        "flex items-center justify-center rounded-full border backdrop-blur-sm transition",
        buttonSize,
        isFavorite
          ? "border-rose-400/50 bg-rose-600/80 text-white hover:bg-rose-500 opacity-100"
          : "border-white/20 bg-black/50 text-white hover:border-rose-400/40 hover:bg-black/70 opacity-90 md:opacity-0 md:group-hover:opacity-100",
        className,
      )}
    >
      <Heart className={cn(iconSize, isFavorite && "fill-current")} />
    </button>
  );
}
