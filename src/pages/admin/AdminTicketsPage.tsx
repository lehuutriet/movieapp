import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import type { AdminBookingRow } from "@/api/admin/bookings";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
} from "@/components/admin/ui/admin-ui";
import { useAdminBookings } from "@/hooks/admin/use-admin-bookings";
import { cn } from "@/lib/cn";
import type { BookingStatus } from "@/types/booking";

const STATUS_LABELS: Record<BookingStatus, string> = {
  paid: "Đã thanh toán",
  pending: "Chờ thanh toán",
  expired: "Hết hạn",
  cancelled: "Đã hủy",
};

const STATUS_STYLES: Record<BookingStatus, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  expired: "bg-slate-100 text-slate-600 ring-slate-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function formatDate(isoDate: string) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function BookingDetailModal({
  booking,
  open,
  onOpenChange,
}: {
  booking: AdminBookingRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!booking) return null;

  return (
    <AdminModal
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết đặt vé"
      description={`Mã: ${booking.id}`}
    >
      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Trạng thái</dt>
          <dd>
            <StatusBadge status={booking.status} />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Phim</dt>
          <dd className="text-right font-medium text-slate-900">
            {booking.movieTitle}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Rạp</dt>
          <dd className="text-right text-slate-900">{booking.cinemaName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Suất chiếu</dt>
          <dd className="text-right text-slate-900">{booking.showtimeLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Ghế</dt>
          <dd className="text-right font-medium text-slate-900">
            {booking.seatLabels.length > 0
              ? booking.seatLabels.join(", ")
              : "—"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Tổng tiền</dt>
          <dd className="text-right font-semibold text-emerald-700">
            {formatVnd(booking.amount)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Thời gian đặt</dt>
          <dd className="text-right text-slate-900">
            {formatDate(booking.createdAt)}
          </dd>
        </div>
        {booking.userId && (
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Mã người dùng</dt>
            <dd className="max-w-[220px] truncate text-right font-mono text-xs text-slate-600">
              {booking.userId}
            </dd>
          </div>
        )}
      </dl>
    </AdminModal>
  );
}

export function AdminTicketsPage() {
  const { data: bookings = [], isLoading, isError, refetch } =
    useAdminBookings();
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingRow | null>(
    null,
  );

  const statusCounts = useMemo(() => {
    const counts: Record<BookingStatus | "all", number> = {
      all: bookings.length,
      paid: 0,
      pending: 0,
      expired: 0,
      cancelled: 0,
    };
    for (const booking of bookings) {
      counts[booking.status] += 1;
    }
    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }
      if (!query) return true;
      return (
        booking.id.toLowerCase().includes(query) ||
        booking.movieTitle.toLowerCase().includes(query) ||
        booking.cinemaName.toLowerCase().includes(query) ||
        booking.seatLabels.some((seat) => seat.toLowerCase().includes(query))
      );
    });
  }, [bookings, search, statusFilter]);

  return (
    <div>
      <AdminPageHeader
        title="Vé"
        description="Theo dõi toàn bộ đơn đặt vé trên hệ thống"
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["all", "Tất cả"],
            ["paid", "Đã thanh toán"],
            ["pending", "Chờ thanh toán"],
            ["expired", "Hết hạn"],
            ["cancelled", "Đã hủy"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={cn(
              "rounded-xl border px-4 py-3 text-left transition",
              statusFilter === key
                ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200"
                : "border-slate-200 bg-white hover:border-slate-300",
            )}
          >
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {statusCounts[key]}
            </p>
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_220px]">
        <AdminInput
          label="Tìm kiếm"
          placeholder="Mã đặt vé, phim, rạp hoặc ghế..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AdminSelect
          label="Lọc trạng thái"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as BookingStatus | "all")
          }
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="paid">Đã thanh toán</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </AdminSelect>
      </div>

      <AdminCard className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-0 divide-y divide-slate-100 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex animate-pulse gap-4 py-4"
              >
                <div className="h-4 flex-1 rounded bg-slate-200" />
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-4 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-600">
              Không tải được danh sách đặt vé.
            </p>
            <AdminButton
              variant="secondary"
              className="mt-4"
              onClick={() => refetch()}
            >
              Thử lại
            </AdminButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã đặt vé</th>
                  <th className="px-4 py-3">Phim</th>
                  <th className="px-4 py-3">Rạp</th>
                  <th className="px-4 py-3">Ghế</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tổng tiền</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {booking.id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {booking.movieTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {booking.cinemaName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {booking.seatLabels.length > 0
                        ? booking.seatLabels.join(", ")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3 font-medium text-emerald-700">
                      {formatVnd(booking.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminButton
                        variant="ghost"
                        className="px-2!"
                        onClick={() => setSelectedBooking(booking)}
                        aria-label="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </AdminButton>
                    </td>
                  </tr>
                ))}
                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      {bookings.length === 0
                        ? "Chưa có đơn đặt vé nào."
                        : "Không tìm thấy đơn phù hợp với bộ lọc."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <BookingDetailModal
        booking={selectedBooking}
        open={selectedBooking !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
      />
    </div>
  );
}
