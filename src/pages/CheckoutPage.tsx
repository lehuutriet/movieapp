import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Link, useNavigate, useParams } from "react-router-dom";

import {

  checkoutQueryKeys,

  completeMockPayment,

  fetchBookingById,

} from "@/api/checkout";

import { concessionQueryKeys, fetchConcessions } from "@/api/concessions";

import { ticketQueryKeys } from "@/api/tickets";

import { useCountdown } from "@/hooks/use-countdown";

import { useConcessionCart } from "@/hooks/use-concession-cart";

import { cn } from "@/lib/cn";

import { computeOrderTotals } from "@/lib/order-summary";

import type { BookingCheckoutView, PaymentMethod } from "@/types/booking";

import { useAuthStore } from "@/stores/auth-store";

import { useBookingStore } from "@/stores/booking-store";

import { useUIStore } from "@/stores/ui-store";



const PAYMENT_OPTIONS: Array<{

  id: PaymentMethod;

  label: string;

  description: string;

}> = [

  { id: "atm", label: "Thẻ ATM / Napas", description: "Thanh toán qua cổng ngân hàng" },

  { id: "momo", label: "Ví MoMo", description: "Quét QR hoặc liên kết ví" },

  { id: "cash", label: "Tiền mặt", description: "Thanh toán tại quầy rạp" },

];



function formatVnd(amount: number) {

  return `${amount.toLocaleString("vi-VN")}đ`;

}



function CheckoutSkeleton() {

  return (

    <div className="mx-auto min-h-screen max-w-5xl animate-pulse px-4 py-8">

      <div className="mb-8 space-y-2">

        <div className="h-3 w-32 rounded bg-slate-800" />

        <div className="h-8 w-64 rounded bg-slate-800" />

      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        <div className="h-80 rounded-2xl bg-slate-900/80" />

        <div className="space-y-6">

          <div className="h-32 rounded-2xl bg-slate-900/80" />

          <div className="h-64 rounded-2xl bg-slate-900/80" />

        </div>

      </div>

      <p className="mt-8 text-center text-sm text-slate-500">

        Đang tải thông tin đơn hàng...

      </p>

    </div>

  );

}



interface CheckoutContentProps {

  bookingId: string;

  data: BookingCheckoutView;

}



function CheckoutContent({ bookingId, data }: CheckoutContentProps) {

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const clearBooking = useBookingStore((state) => state.clearBooking);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("atm");



  const { booking, movieTitle, cinemaName, showtimeLabel } = data;

  const { formatted, isExpired } = useCountdown(booking.expiresAt);



  const { data: concessionCatalog = [] } = useQuery({

    queryKey: concessionQueryKeys.list(),

    queryFn: fetchConcessions,

    staleTime: 60_000,

  });



  const {
    lines,
    subtotal: concessionSubtotal,
    itemCount,
    clearCart,
    addItem,
    removeItem,
  } = useConcessionCart(concessionCatalog);

  const catalogById = useMemo(
    () => new Map(concessionCatalog.map((item) => [item.id, item])),
    [concessionCatalog],
  );



  const orderTotals = useMemo(

    () => computeOrderTotals(booking, concessionSubtotal),

    [booking, concessionSubtotal],

  );



  useEffect(() => {

    if (!isExpired) return;

    if (!useBookingStore.getState().bookingId) return;



    useUIStore.getState().showToast({

      type: "warning",

      message: "Thời gian giữ ghế đã hết. Vui lòng chọn suất chiếu lại.",

    });

    clearBooking();

    clearCart();

    navigate("/", { replace: true });

  }, [isExpired, clearBooking, clearCart, navigate]);



  const payMutation = useMutation({

    mutationFn: () => completeMockPayment(bookingId, paymentMethod),

    onSuccess: () => {

      queryClient.invalidateQueries({

        queryKey: checkoutQueryKeys.booking(bookingId),

      });

      queryClient.invalidateQueries({

        queryKey: ticketQueryKeys.detail(bookingId),

      });

      if (user?.$id) {

        queryClient.invalidateQueries({

          queryKey: ticketQueryKeys.myTickets(user.$id),

        });

      }

      clearBooking();

      clearCart();

      navigate(`/ticket/${bookingId}`, { replace: true });

    },

    onError: (err: unknown) => {

      if (err instanceof Error && err.message === "BOOKING_EXPIRED") {

        navigate("/showtimes", { replace: true });

        return;

      }



      useUIStore.getState().showToast({

        type: "error",

        message: "Thanh toán thất bại. Vui lòng thử lại.",

      });

    },

  });



  const seatsLabel = booking.seatLabels.join(", ");

  const payable = booking.status === "pending" && !isExpired;



  return (

    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8">

      <header className="mb-8 space-y-1">

        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">

          Bước thanh toán

        </p>

        <h1 className="text-2xl font-bold text-white">Xác nhận & thanh toán</h1>

      </header>



      <div className="grid gap-6 lg:grid-cols-2">

        <div className="space-y-4">

          {/* Ticket summary */}

          <section className="rounded-2xl border border-sky-800/50 bg-slate-900/60 p-6">

            <div className="mb-4 flex items-center gap-2">

              <span className="text-lg" aria-hidden>

                🎬

              </span>

              <h2 className="text-lg font-semibold text-white">Vé xem phim</h2>

            </div>

            <dl className="space-y-3 text-sm">

              <div>

                <dt className="text-stone-500">Phim</dt>

                <dd className="font-medium text-white">{movieTitle}</dd>

              </div>

              <div>

                <dt className="text-stone-500">Rạp</dt>

                <dd className="text-slate-200">{cinemaName}</dd>

              </div>

              <div>

                <dt className="text-stone-500">Suất chiếu</dt>

                <dd className="text-slate-200">{showtimeLabel}</dd>

              </div>

              <div>

                <dt className="text-stone-500">Ghế</dt>

                <dd className="font-medium text-sky-300">{seatsLabel || "—"}</dd>

              </div>

              <div className="border-t border-sky-900/40 pt-3">

                <div className="flex items-center justify-between">

                  <dt className="text-stone-500">Tạm tính vé</dt>

                  <dd className="text-slate-300">

                    {formatVnd(orderTotals.ticketSubtotal)}

                  </dd>

                </div>

                {orderTotals.ticketDiscount > 0 && (

                  <div className="mt-2 flex items-center justify-between">

                    <dt className="text-stone-500">Giảm giá vé</dt>

                    <dd className="text-emerald-400">

                      -{formatVnd(orderTotals.ticketDiscount)}

                    </dd>

                  </div>

                )}

                <div className="mt-2 flex items-center justify-between font-medium">

                  <dt className="text-sky-200">Tổng vé</dt>

                  <dd className="text-sky-300">

                    {formatVnd(orderTotals.ticketTotal)}

                  </dd>

                </div>

              </div>

            </dl>

          </section>



          {/* F&B summary */}

          <section className="rounded-2xl border border-orange-800/50 bg-slate-900/60 p-6">

            <div className="mb-4 flex items-center justify-between gap-2">

              <div className="flex items-center gap-2">

                <span className="text-lg" aria-hidden>

                  🍿

                </span>

                <h2 className="text-lg font-semibold text-white">

                  Đồ ăn &amp; thức uống

                </h2>

                {itemCount > 0 && (

                  <span className="rounded-full bg-orange-600/20 px-2.5 py-0.5 text-xs font-semibold text-orange-300">

                    {itemCount} món

                  </span>

                )}

              </div>

              {lines.length > 0 && (

                <button

                  type="button"

                  onClick={clearCart}

                  className="shrink-0 text-xs font-semibold text-red-400 hover:text-red-300"

                >

                  Xóa tất cả

                </button>

              )}

            </div>



            {lines.length === 0 ? (

              <div className="rounded-xl border border-dashed border-orange-900/40 bg-black/20 px-4 py-6 text-center">

                <p className="text-sm text-stone-400">Chưa có món nào trong đơn.</p>

                <Link

                  to="/food-drink"

                  className="mt-3 inline-block text-sm font-semibold text-orange-400 hover:text-orange-300"

                >

                  Thêm đồ ăn &amp; thức uống →

                </Link>

              </div>

            ) : (

              <ul className="space-y-3">

                {lines.map((line) => {

                  const catalogItem = catalogById.get(line.itemId);

                  return (

                    <li

                      key={line.itemId}

                      className="flex items-center justify-between gap-3 text-sm"

                    >

                      <div className="flex min-w-0 items-center gap-2">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-orange-950/50 text-lg">

                          {line.imageUrl ? (

                            <img

                              src={line.imageUrl}

                              alt={line.name}

                              className="h-full w-full object-cover"

                            />

                          ) : (

                            line.emoji

                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="font-medium text-white">{line.name}</p>

                          <p className="text-xs text-stone-500">

                            {formatVnd(line.unitPrice)} × {line.quantity}

                          </p>

                        </div>

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <div className="flex items-center gap-1.5">

                          <button

                            type="button"

                            onClick={() => removeItem(line.itemId)}

                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800"

                            aria-label={`Giảm số lượng ${line.name}`}

                          >

                            −

                          </button>

                          <span className="w-5 text-center font-semibold text-white">

                            {line.quantity}

                          </span>

                          <button

                            type="button"

                            onClick={() => {

                              if (catalogItem) addItem(catalogItem);

                            }}

                            disabled={!catalogItem}

                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"

                            aria-label={`Tăng số lượng ${line.name}`}

                          >

                            +

                          </button>

                        </div>

                        <span className="w-20 text-right font-medium text-orange-300">

                          {formatVnd(line.lineTotal)}

                        </span>

                      </div>

                    </li>

                  );

                })}

              </ul>

            )}



            <div className="mt-4 flex items-center justify-between border-t border-orange-900/40 pt-3 text-sm font-medium">

              <span className="text-orange-200">Tổng đồ ăn</span>

              <span className="text-orange-300">

                {formatVnd(orderTotals.concessionSubtotal)}

              </span>

            </div>

          </section>



          {/* Grand total */}

          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6">

            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-400">

              Tổng hợp đơn hàng

            </h2>

            <dl className="space-y-2 text-sm">

              <div className="flex items-center justify-between">

                <dt className="text-stone-400">Vé xem phim</dt>

                <dd className="text-slate-200">

                  {formatVnd(orderTotals.ticketTotal)}

                </dd>

              </div>

              <div className="flex items-center justify-between">

                <dt className="text-stone-400">Đồ ăn &amp; thức uống</dt>

                <dd className="text-slate-200">

                  {formatVnd(orderTotals.concessionSubtotal)}

                </dd>

              </div>

            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-slate-600 pt-4">

              <span className="text-base font-semibold text-white">

                Tổng thanh toán

              </span>

              <span className="text-2xl font-bold text-white">

                {formatVnd(orderTotals.grandTotal)}

              </span>

            </div>

          </section>

        </div>



        <section className="flex flex-col gap-6">

          <div

            className={cn(

              "rounded-2xl border p-6 text-center",

              isExpired

                ? "border-red-500/40 bg-red-500/10"

                : "border-amber-500/30 bg-amber-500/10",

            )}

          >

            <p className="text-sm text-stone-400">Thời gian giữ ghế còn lại</p>

            <p

              className={cn(

                "mt-2 font-mono text-4xl font-bold tabular-nums",

                isExpired ? "text-red-400" : "text-amber-300",

              )}

            >

              {formatted}

            </p>

            {isExpired && (

              <p className="mt-2 text-sm text-red-300">

                Đơn đã hết hạn — đang chuyển về trang chủ...

              </p>

            )}

          </div>



          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">

            <h2 className="mb-4 text-lg font-semibold text-white">

              Phương thức thanh toán

            </h2>

            <div className="space-y-2">

              {PAYMENT_OPTIONS.map((option) => (

                <label

                  key={option.id}

                  className={cn(

                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",

                    paymentMethod === option.id

                      ? "border-sky-500 bg-sky-500/10"

                      : "border-slate-700 hover:border-slate-600",

                    !payable && "cursor-not-allowed opacity-50",

                  )}

                >

                  <input

                    type="radio"

                    name="payment"

                    value={option.id}

                    checked={paymentMethod === option.id}

                    disabled={!payable}

                    onChange={() => setPaymentMethod(option.id)}

                    className="mt-1"

                  />

                  <span>

                    <span className="block font-medium text-white">

                      {option.label}

                    </span>

                    <span className="text-xs text-slate-400">

                      {option.description}

                    </span>

                  </span>

                </label>

              ))}

            </div>



            <button

              type="button"

              disabled={!payable || payMutation.isPending}

              onClick={() => payMutation.mutate()}

              className="mt-6 w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"

            >

              {payMutation.isPending

                ? "Đang xử lý..."

                : isExpired

                  ? "Đã hết hạn"

                  : `Thanh toán ${formatVnd(orderTotals.grandTotal)}`}

            </button>



            {booking.status === "paid" && (

              <p className="mt-3 text-center text-sm text-emerald-400">

                Đơn này đã được thanh toán.

              </p>

            )}

          </div>

        </section>

      </div>

    </div>

  );

}



export function CheckoutPage() {

  const { bookingId } = useParams<{ bookingId: string }>();

  const navigate = useNavigate();



  const { data, isLoading, isError, error } = useQuery({

    queryKey: checkoutQueryKeys.booking(bookingId ?? ""),

    queryFn: () => fetchBookingById(bookingId!),

    enabled: Boolean(bookingId),

    retry: 1,

  });



  if (!bookingId) {

    return (

      <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-300">

        Không tìm thấy mã đặt vé.

      </div>

    );

  }



  if (isLoading) {

    return <CheckoutSkeleton />;

  }



  if (isError || !data) {

    return (

      <div className="mx-auto max-w-lg px-4 py-16 text-center">

        <p className="text-red-400">Không tải được đơn đặt vé.</p>

        <p className="mt-2 text-sm text-slate-500">

          {error instanceof Error ? error.message : "Lỗi không xác định"}

        </p>

        <button

          type="button"

          onClick={() => navigate("/showtimes")}

          className="mt-6 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white"

        >

          Quay lại suất chiếu

        </button>

      </div>

    );

  }



  return <CheckoutContent bookingId={bookingId} data={data} />;

}


