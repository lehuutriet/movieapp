import { useQuery } from "@tanstack/react-query";
import { Calendar, Clapperboard, MapPin, Sofa, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import {
  bookingQueryKeys,
  getUserBookings,
  type UserBookingHistoryItem,
} from "@/api/bookings";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";

function TicketHistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 md:flex-row"
        >
          <div className="h-48 bg-zinc-800 md:h-auto md:w-[28%]" />
          <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
            <div className="h-6 w-2/3 rounded-lg bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-zinc-800/80" />
              <div className="h-4 w-4/5 rounded bg-zinc-800/80" />
              <div className="h-4 w-1/2 rounded bg-zinc-800/80" />
            </div>
            <div className="mt-auto h-5 w-1/4 rounded bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: UserBookingHistoryItem }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition hover:border-orange-500/30 hover:bg-zinc-900">
      <div className="absolute right-0 top-1/2 hidden h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full border border-zinc-800 bg-zinc-950 md:block" />
      <div
        className="absolute right-0 top-0 hidden h-full w-px border-r border-dashed border-zinc-700/80 md:block"
        style={{ right: "28%" }}
      />

      <div className="flex flex-col md:flex-row">
        <div className="relative h-48 w-full shrink-0 overflow-hidden md:h-auto md:w-[28%]">
          {ticket.posterUrl ? (
            <img
              src={ticket.posterUrl}
              alt={ticket.movieTitle}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
              <Clapperboard className="h-12 w-12 text-zinc-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-zinc-950/40" />
          <span
            className={cn(
              "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm",
              ticket.screeningStatus === "upcoming"
                ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                : "bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700",
            )}
          >
            {ticket.screeningStatus === "upcoming" ? "Sắp chiếu" : "Đã chiếu"}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-cinema text-lg font-bold text-white group-hover:text-orange-100 md:text-xl">
                {ticket.movieTitle}
              </h3>
              <Ticket className="h-5 w-5 shrink-0 text-orange-500/60" />
            </div>

            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              <li className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 shrink-0 text-zinc-600" />
                <span>{ticket.showtimeLabel}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-600" />
                <span>{ticket.cinemaRoom}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sofa className="h-4 w-4 shrink-0 text-zinc-600" />
                <span>Ghế {ticket.seatLabels.join(", ")}</span>
              </li>
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-dashed border-zinc-800 pt-4">
            <span className="text-xs uppercase tracking-wider text-zinc-600">
              Tổng tiền
            </span>
            <span className="text-lg font-bold text-orange-400">
              {ticket.totalAmount.toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function TicketHistoryEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 py-16 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl ring-1 ring-zinc-800">
        🎟
      </div>
      <p className="text-lg font-medium text-zinc-300">
        Bạn chưa có giao dịch nào
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        Đặt vé và thanh toán để lịch sử xuất hiện tại đây.
      </p>
      <Link
        to="/showtimes"
        className="mt-6 inline-block rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
      >
        Khám phá suất chiếu
      </Link>
    </div>
  );
}

export function TicketHistoryTab() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isError } = useQuery({
    queryKey: bookingQueryKeys.userHistory(user?.$id ?? ""),
    queryFn: () => getUserBookings(user!.$id),
    enabled: Boolean(user?.$id),
    staleTime: 0,
    refetchOnMount: "always",
    retry: 1,
  });

  const tickets = data ?? [];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-orange-400/80">
          Vé điện tử
        </p>
        <h2 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">
          Lịch sử đặt vé
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          {isLoading
            ? "Đang tải lịch sử đặt vé..."
            : `${tickets.length} giao dịch`}
        </p>
      </header>

      {isLoading ? (
        <TicketHistorySkeleton />
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-10 text-center">
          <p className="text-sm font-medium text-rose-300">
            Không tải được lịch sử đặt vé.
          </p>
          <p className="mt-1 text-xs text-zinc-500">Vui lòng thử lại sau.</p>
        </div>
      ) : tickets.length === 0 ? (
        <TicketHistoryEmpty />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
