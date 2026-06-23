import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import {
  buildTicketQrPayload,
  fetchTicketByBookingId,
  ticketQueryKeys,
} from "@/api/tickets";
import { cn } from "@/lib/cn";
import type { BookingStatus } from "@/types/booking";

function TicketSkeleton() {
  return (
    <div className="mx-auto max-w-md animate-pulse px-4 py-10">
      <div className="h-[520px] overflow-hidden rounded-3xl bg-stone-900" />
    </div>
  );
}

function TicketStatusMessage({
  status,
  bookingId,
}: {
  status: BookingStatus;
  bookingId: string;
}) {
  const messages: Record<string, { title: string; body: string }> = {
    pending: {
      title: "Vé chưa được thanh toán",
      body: "Đơn đặt vé này vẫn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để nhận vé điện tử.",
    },
    expired: {
      title: "Vé đã hết hạn",
      body: "Thời gian giữ ghế đã kết thúc. Đơn đặt vé không còn hiệu lực.",
    },
    cancelled: {
      title: "Vé đã bị hủy",
      body: "Đơn đặt vé này đã được hủy và không thể sử dụng tại rạp.",
    },
  };

  const message = messages[status] ?? {
    title: "Không thể hiển thị vé",
    body: "Trạng thái đơn hàng không hợp lệ để xuất vé điện tử.",
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-2xl text-rose-300">
        !
      </div>
      <h1 className="text-2xl font-bold text-white">{message.title}</h1>
      <p className="mt-3 text-stone-400">{message.body}</p>
      <p className="mt-4 text-xs text-stone-600">
        Mã đơn: <span className="font-mono text-stone-500">{bookingId}</span>
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {status === "pending" && (
          <Link
            to={`/book/checkout/${bookingId}`}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
          >
            Thanh toán ngay
          </Link>
        )}
        <Link
          to="/tickets"
          className="rounded-xl border border-stone-700 px-5 py-2.5 text-sm text-stone-300 hover:bg-stone-900"
        >
          Vé của tôi
        </Link>
      </div>
    </div>
  );
}

export function TicketQRPage() {
  const { bookingId } = useParams<{ bookingId: string }>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ticketQueryKeys.detail(bookingId ?? ""),
    queryFn: () => fetchTicketByBookingId(bookingId!),
    enabled: Boolean(bookingId),
    retry: 1,
  });

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-stone-400">
        Không tìm thấy mã vé.
      </div>
    );
  }

  if (isLoading) {
    return <TicketSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-rose-400">Không tải được thông tin vé.</p>
        <p className="mt-2 text-sm text-stone-500">
          {error instanceof Error ? error.message : "Lỗi không xác định"}
        </p>
        <Link
          to="/tickets"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Về danh sách vé
        </Link>
      </div>
    );
  }

  if (data.booking.status !== "paid") {
    return (
      <TicketStatusMessage status={data.booking.status} bookingId={bookingId} />
    );
  }

  const seatsLabel = data.booking.seatLabels.join(", ");
  const qrValue = buildTicketQrPayload(bookingId);
  const backdrop = data.backdropUrl ?? data.posterUrl;
  const { booking } = data;
  const hasConcessions = booking.concessionLines.length > 0;

  return (
    <div className="mx-auto min-h-screen max-w-md px-4 py-8">
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-orange-400/80">
          Vé điện tử
        </p>
        <h1 className="mt-2 text-xl font-semibold text-white">
          Xuất trình tại quầy soát vé
        </h1>
      </header>

      <article className="overflow-hidden rounded-3xl border border-stone-700/80 bg-stone-950 shadow-2xl shadow-black/50">
        <div className="relative min-h-[280px] overflow-hidden">
          {backdrop ? (
            <img
              src={backdrop}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/20" />

          <div className="relative flex h-full flex-col justify-end p-6">
            {data.posterUrl && (
              <img
                src={data.posterUrl}
                alt={data.movieTitle}
                className="mb-4 h-28 w-20 rounded-lg border border-white/10 object-cover shadow-lg"
              />
            )}
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-orange-400">
              Vé xem phim
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-white">
              {data.movieTitle}
            </h2>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-stone-500">Rạp</dt>
                <dd className="font-medium text-stone-200">{data.cinemaName}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Phòng</dt>
                <dd className="font-medium text-stone-200">
                  {data.auditoriumName}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Suất chiếu</dt>
                <dd className="font-medium text-stone-200">
                  {data.showtimeLabel}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Ghế</dt>
                <dd className="font-semibold text-orange-300">{seatsLabel}</dd>
              </div>
            </dl>
          </div>
        </div>

        {hasConcessions ? (
          <div className="border-t border-stone-800 bg-stone-900/60 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-orange-400">
              Đồ ăn &amp; thức uống
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {booking.concessionLines.map((line) => (
                <li
                  key={line.id}
                  className="flex items-center justify-between gap-3 text-stone-300"
                >
                  <span>
                    {line.quantity}× {line.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-stone-400">
                    {line.lineTotal.toLocaleString("vi-VN")}đ
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-sm text-stone-400">
              Tổng đồ ăn:{" "}
              <span className="font-medium text-stone-200">
                {booking.concessionTotal.toLocaleString("vi-VN")}đ
              </span>
            </p>
          </div>
        ) : null}

        <div className="relative flex items-center">
          <div className="absolute -left-3 h-6 w-6 rounded-full bg-stone-950" />
          <div className="h-px flex-1 border-t border-dashed border-stone-600" />
          <div className="absolute -right-3 h-6 w-6 rounded-full bg-stone-950" />
        </div>

        <div className="bg-stone-900/80 px-6 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
            Mã quét tại rạp
          </p>
          <div className="mx-auto mt-5 inline-block rounded-2xl bg-white p-4">
            <QRCode
              value={qrValue}
              size={180}
              level="M"
              bgColor="#ffffff"
              fgColor="#0f172a"
            />
          </div>
          <p className="mt-5 font-mono text-xs text-stone-500">
            {bookingId.slice(0, 8).toUpperCase()}
          </p>
          <div className="mt-3 space-y-1 text-sm text-stone-400">
            {hasConcessions ? (
              <>
                <p>
                  Vé:{" "}
                  <span className="text-stone-300">
                    {booking.totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </p>
                <p>
                  Đồ ăn:{" "}
                  <span className="text-stone-300">
                    {booking.concessionTotal.toLocaleString("vi-VN")}đ
                  </span>
                </p>
              </>
            ) : null}
            <p className="text-base font-semibold text-orange-300">
              Tổng: {booking.grandTotal.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
      </article>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          to="/tickets"
          className="rounded-xl border border-stone-700 px-5 py-2.5 text-sm text-stone-300 hover:bg-stone-900"
        >
          Vé của tôi
        </Link>
        <Link
          to="/showtimes"
          className={cn(
            "rounded-xl bg-orange-500/90 px-5 py-2.5 text-sm font-semibold text-stone-950 hover:bg-orange-400",
          )}
        >
          Đặt vé mới
        </Link>
      </div>
    </div>
  );
}
