import { useLocation, useNavigate } from "react-router-dom";

import { useBookingStore } from "@/stores/booking-store";

const HIDDEN_PATH_PREFIXES = ["/book/checkout", "/book/seats", "/food-drink"];

function isBannerHidden(pathname: string): boolean {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function ActiveBookingBanner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const bookingId = useBookingStore((state) => state.bookingId);

  if (!bookingId || isBannerHidden(pathname)) {
    return null;
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-50 max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="absolute -inset-1 animate-pulse rounded-2xl bg-orange-500/25 blur-md" />
      <div className="relative flex items-center gap-4 rounded-2xl border border-orange-500/40 bg-stone-950/95 px-5 py-4 shadow-[0_8px_32px_rgba(234,88,12,0.25)] backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Đơn hàng đang chờ
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">
            Bạn có 1 đơn hàng chưa hoàn tất
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/book/checkout/${bookingId}`)}
          className="shrink-0 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(234,88,12,0.45)] transition hover:bg-orange-500 active:scale-[0.98]"
        >
          Thanh toán ngay
        </button>
      </div>
    </div>
  );
}
