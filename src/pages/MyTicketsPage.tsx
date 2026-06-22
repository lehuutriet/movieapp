import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { fetchMyPaidBookings, ticketQueryKeys } from "@/api/tickets";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

function TicketsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-4 px-4 py-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-28 rounded-2xl bg-stone-900/80" />
      ))}
    </div>
  );
}

export function MyTicketsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ticketQueryKeys.myTickets(user?.$id ?? ""),
    queryFn: () => fetchMyPaidBookings(user!.$id),
    enabled: Boolean(user?.$id),
    retry: 1,
    staleTime: 0,
    refetchOnMount: "always",
  });

  if (isAuthLoading) {
    return <TicketsSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-800 text-2xl">
          🎟
        </div>
        <h1 className="text-2xl font-bold text-white">Vé của tôi</h1>
        <p className="mt-3 text-stone-400">
          Đăng nhập để xem danh sách vé đã mua và mã QR tại rạp.
        </p>
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="mt-8 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
        >
          Đăng nhập / Đăng ký
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageHeader />
        <TicketsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <PageHeader />
        <p className="mt-12 text-rose-400">Không tải được danh sách vé.</p>
        <p className="mt-2 text-sm text-stone-500">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
      </div>
    );
  }

  const tickets = data ?? [];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <PageHeader count={tickets.length} />

      {tickets.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-stone-800 py-16 text-center">
          <p className="text-lg font-medium text-stone-300">
            Bạn chưa có vé nào
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Đặt vé và thanh toán để vé xuất hiện tại đây.
          </p>
          <Link
            to="/showtimes"
            className="mt-6 inline-block rounded-xl bg-orange-500/90 px-6 py-2.5 text-sm font-semibold text-stone-950 hover:bg-orange-400"
          >
            Khám phá suất chiếu
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {tickets.map((ticket) => (
            <li key={ticket.bookingId}>
              <button
                type="button"
                onClick={() => navigate(`/ticket/${ticket.bookingId}`)}
                className="group w-full rounded-2xl border border-stone-800 bg-black/40 p-5 text-left transition hover:border-orange-500/40 hover:bg-black/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-white group-hover:text-orange-100">
                      {ticket.movieTitle}
                    </p>
                    <p className="mt-1 text-sm text-stone-400">
                      {ticket.cinemaName}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                      ticket.screeningStatus === "upcoming"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-stone-700/80 text-stone-400",
                    )}
                  >
                    {ticket.screeningStatus === "upcoming"
                      ? "Sắp chiếu"
                      : "Đã chiếu"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                  <span>{ticket.showtimeLabel}</span>
                  <span>Ghế {ticket.seatLabels.join(", ")}</span>
                </div>

                <p className="mt-3 text-sm font-medium text-orange-400/90">
                  {ticket.totalAmount.toLocaleString("vi-VN")}đ
                  <span className="ml-2 text-stone-600">→ Xem QR</span>
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PageHeader({ count }: { count?: number }) {
  return (
    <header>
      <p className="text-xs uppercase tracking-[0.3em] text-orange-400/80">
        Vé của tôi
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white">Danh sách vé</h1>
      <p className="mt-2 text-stone-400">
        {count != null
          ? `${count} vé đã thanh toán`
          : "Danh sách vé điện tử của bạn"}
      </p>
    </header>
  );
}
