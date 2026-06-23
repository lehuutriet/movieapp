import { useMemo, useState } from "react";
import { Copy, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PROMOTION_CATEGORY_LABELS, type PromotionCategory } from "@/data/mock-promotions";
import { usePromotions } from "@/hooks/use-promotions";
import { cn } from "@/lib/cn";
import { savePendingPromoCode } from "@/lib/promo-utils";
import { useBookingStore } from "@/stores/booking-store";
import type { Promotion } from "@/types/promotion";
import { useUIStore } from "@/stores/ui-store";

const CATEGORY_FILTERS: Array<PromotionCategory | "all"> = [
  "all",
  "ticket",
  "combo",
  "member",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PromotionCard({ promo }: { promo: Promotion }) {
  const navigate = useNavigate();
  const showToast = useUIStore((state) => state.showToast);
  const bookingId = useBookingStore((state) => state.bookingId);

  const copyCode = async () => {
    if (!promo.code) return;

    try {
      await navigator.clipboard.writeText(promo.code);
      showToast({ type: "success", message: `Đã sao chép mã ${promo.code}` });
    } catch {
      showToast({ type: "error", message: "Không thể sao chép mã. Vui lòng thử lại." });
    }
  };

  const handleUsePromo = () => {
    if (!promo.code) {
      showToast({ type: "info", message: "Khuyến mãi này không có mã để áp dụng." });
      return;
    }

    savePendingPromoCode(promo.code);

    if (bookingId) {
      navigate(`/book/checkout/${bookingId}`);
      return;
    }

    if (promo.category === "combo") {
      navigate("/food-drink");
      showToast({
        type: "info",
        message: "Thêm món vào giỏ, sau đó thanh toán và nhập mã.",
      });
      return;
    }

    navigate("/booking");
    showToast({
      type: "info",
      message: "Chọn suất chiếu — mã sẽ tự điền ở bước thanh toán.",
    });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-orange-900/30 bg-stone-950/80 shadow-lg shadow-black/20">
      <div className="relative h-40 overflow-hidden">
        <img
          src={promo.imageUrl}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {PROMOTION_CATEGORY_LABELS[promo.category]}
        </span>
        <span className="absolute right-4 top-4 rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-black text-stone-950">
          {promo.discountLabel}
        </span>
      </div>

      <div className="p-5">
        <h2 className="font-cinema text-xl font-bold text-white">{promo.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">{promo.description}</p>

        <p className="mt-3 text-xs text-stone-500">
          Hiệu lực đến: <span className="text-stone-300">{formatDate(promo.validUntil)}</span>
        </p>

        {promo.code ? (
          <button
            type="button"
            onClick={() => void copyCode()}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left transition hover:bg-amber-500/15"
          >
            <span className="flex items-center gap-2 text-sm text-amber-300">
              <Tag className="h-4 w-4" />
              Mã: <strong className="tracking-widest">{promo.code}</strong>
            </span>
            <Copy className="h-4 w-4 text-amber-400" />
          </button>
        ) : null}

        {promo.code ? (
          <button
            type="button"
            onClick={handleUsePromo}
            className="mt-3 w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Dùng ngay
          </button>
        ) : null}

        <ul className="mt-4 space-y-1.5 border-t border-stone-800 pt-4">
          {promo.terms.map((term) => (
            <li key={term} className="text-xs text-stone-500">
              • {term}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function PromotionsPage() {
  const [category, setCategory] = useState<PromotionCategory | "all">("all");
  const { data: promotions = [], isLoading, isError } = usePromotions();

  const filteredPromotions = useMemo(() => {
    if (category === "all") return promotions;
    return promotions.filter((promo) => promo.category === category);
  }, [category, promotions]);

  return (
    <div className="min-h-screen text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Tiết kiệm</p>
          <h1 className="font-cinema mt-2 text-2xl font-bold md:text-3xl">
            Ưu đãi & Khuyến mãi
          </h1>
          <p className="mt-2 text-sm text-stone-400">
            Các chương trình khuyến mãi đang áp dụng tại Cine Hall
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setCategory(filter)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition",
                category === filter
                  ? "border-orange-600 bg-orange-600 text-white"
                  : "border-orange-900/40 text-stone-400 hover:border-orange-700 hover:text-white",
              )}
            >
              {filter === "all" ? "Tất cả" : PROMOTION_CATEGORY_LABELS[filter]}
            </button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl bg-stone-900"
              />
            ))
          ) : isError ? (
            <p className="col-span-full py-12 text-center text-sm text-stone-400">
              Không thể tải khuyến mãi. Vui lòng thử lại sau.
            </p>
          ) : filteredPromotions.length === 0 ? (
            <p className="col-span-full py-12 text-center text-sm text-stone-400">
              Chưa có chương trình khuyến mãi nào.
            </p>
          ) : (
            filteredPromotions.map((promo) => (
              <PromotionCard key={promo.id} promo={promo} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
