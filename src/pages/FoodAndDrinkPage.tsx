import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { concessionQueryKeys, fetchConcessions } from "@/api/concessions";

import { CartRightDrawer } from "@/components/concessions/CartRightDrawer";

import { CONCESSION_CATEGORIES } from "@/data/mock-concessions";

import { useConcessionCart } from "@/hooks/use-concession-cart";

import { cn } from "@/lib/cn";

import { useBookingStore } from "@/stores/booking-store";

import type { ConcessionCategoryFilter } from "@/types/concession";



function formatPrice(price: number) {

  return `${price.toLocaleString("vi-VN")}đ`;

}



export function FoodAndDrinkPage() {

  const navigate = useNavigate();

  const bookingId = useBookingStore((state) => state.bookingId);

  const [category, setCategory] = useState<ConcessionCategoryFilter>("all");

  const [cartOpen, setCartOpen] = useState(false);



  const {

    data: menuItems = [],

    isLoading,

    isError,

    error,

    refetch,

  } = useQuery({

    queryKey: concessionQueryKeys.list(),

    queryFn: fetchConcessions,

    staleTime: 60_000,

  });



  const {
    itemCount,
    subtotal,
    getQuantity,
    addItem,
    removeItem,
  } = useConcessionCart(menuItems);



  const filteredItems = useMemo(() => {

    if (category === "all") return menuItems;

    return menuItems.filter((item) => item.category === category);

  }, [category, menuItems]);



  const handleCheckout = () => {

    if (!bookingId) return;

    setCartOpen(false);

    navigate(`/book/checkout/${bookingId}`);

  };



  return (

    <div className="min-h-screen pb-24 text-white">

      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">

        <div className="mx-auto max-w-6xl">

          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Đồ ăn thức uống</p>

          <h1 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">

            Đồ ăn &amp; Thức uống

          </h1>

          <p className="mt-2 text-sm text-stone-400">

            Đặt đồ ăn và nước uống, nhận tại quầy trước giờ chiếu

          </p>

        </div>

      </section>



      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

        <div className="mb-8 flex flex-wrap gap-2">

          {CONCESSION_CATEGORIES.map((cat) => (

            <button

              key={cat.id}

              type="button"

              onClick={() => setCategory(cat.id)}

              className={cn(

                "rounded-full px-4 py-2 text-sm font-semibold transition",

                category === cat.id

                  ? "bg-orange-600 text-white"

                  : "border border-orange-900/40 bg-black/30 text-stone-300 hover:border-orange-600/50 hover:text-white",

              )}

            >

              {cat.label}

            </button>

          ))}

        </div>



        {isError && (

          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">

            <p>Không tải được thực đơn từ máy chủ.</p>

            <p className="mt-1 text-xs text-red-200/80">

              {error instanceof Error ? error.message : "Lỗi không xác định"}

            </p>

            <button

              type="button"

              onClick={() => refetch()}

              className="mt-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30"

            >

              Thử lại

            </button>

          </div>

        )}



        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {isLoading && (

            <p className="col-span-full text-center text-sm text-stone-400">

              Đang tải thực đơn...

            </p>

          )}

          {!isLoading && !isError && filteredItems.length === 0 && (

            <p className="col-span-full text-center text-sm text-stone-400">

              Không có món nào trong danh mục này.

            </p>

          )}

          {filteredItems.map((item) => {

            const qty = getQuantity(item.id);



            return (

              <article

                key={item.id}

                className="flex gap-4 rounded-2xl border border-orange-900/30 bg-black/40 p-5 transition hover:border-orange-600/40"

              >

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-orange-950/50 text-3xl">

                  {item.emoji}

                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="font-semibold text-white">{item.name}</h2>

                  <p className="mt-1 text-sm text-stone-400">{item.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-2">

                    <span className="font-bold text-orange-400">

                      {formatPrice(item.price)}

                    </span>

                    {qty === 0 ? (

                      <button

                        type="button"

                        onClick={() => addItem(item)}

                        className="rounded-lg bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-500"

                      >

                        Thêm

                      </button>

                    ) : (

                      <div className="flex items-center gap-2">

                        <button

                          type="button"

                          onClick={() => removeItem(item.id)}

                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800"

                        >

                          −

                        </button>

                        <span className="w-6 text-center font-semibold">{qty}</span>

                        <button

                          type="button"

                          onClick={() => addItem(item)}

                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-500"

                        >

                          +

                        </button>

                      </div>

                    )}

                  </div>

                </div>

              </article>

            );

          })}

        </div>

      </div>



      {(itemCount > 0 || bookingId) && (

        <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-orange-900/40 bg-stone-950/95 px-4 py-4 backdrop-blur-md">

          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">

            {itemCount > 0 ? (

              <button

                type="button"

                onClick={() => setCartOpen(true)}

                className="group min-w-0 flex-1 rounded-xl border border-orange-900/30 bg-black/30 px-4 py-2 text-left transition hover:border-orange-600/50 hover:bg-black/50"

              >

                <p className="text-sm text-stone-400 group-hover:text-stone-300">

                  {itemCount} món trong đơn · Nhấn để xem chi tiết

                </p>

                <p className="text-xl font-bold text-orange-400">

                  {formatPrice(subtotal)}

                </p>

              </button>

            ) : (

              <p className="min-w-0 flex-1 text-sm text-stone-400">

                Chưa thêm món nào · Bạn có thể tiếp tục thanh toán vé

              </p>

            )}

            <button

              type="button"

              onClick={handleCheckout}

              disabled={!bookingId && itemCount === 0}

              className="shrink-0 rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"

            >

              {bookingId ? "Tiếp tục thanh toán" : "Chưa có vé"}

            </button>

          </div>

        </footer>

      )}



      <CartRightDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        catalog={menuItems}
        bookingId={bookingId}
        onCheckout={handleCheckout}
      />

    </div>

  );

}


