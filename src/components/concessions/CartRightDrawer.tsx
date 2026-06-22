import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { useConcessionCart } from "@/hooks/use-concession-cart";
import { cn } from "@/lib/cn";
import type { ConcessionItem } from "@/types/concession";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

function ItemThumbnail({
  imageUrl,
  emoji,
  name,
}: {
  imageUrl?: string;
  emoji: string;
  name: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!imageUrl || broken) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-2xl shadow-inner">
        {emoji}
      </div>
    );
  }

  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-800 shadow-inner">
      <img
        src={imageUrl}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}

interface CartRightDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: ConcessionItem[];
  bookingId?: string | null;
  onCheckout?: () => void;
}

export function CartRightDrawer({
  open,
  onOpenChange,
  catalog,
  bookingId,
  onCheckout,
}: CartRightDrawerProps) {
  const { lines, subtotal, addItem, removeItem } = useConcessionCart(catalog);
  const catalogById = new Map(catalog.map((item) => [item.id, item]));
  const canCheckout = bookingId ? true : lines.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed top-0 right-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-zinc-900 shadow-2xl outline-none",
            "transform transition-transform duration-300 ease-out",
            "data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
          )}
        >
          <header className="flex items-center justify-between border-b border-zinc-800 p-5">
            <Dialog.Title className="text-lg font-bold tracking-tight text-white">
              Giỏ hàng của bạn
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </header>

          <ul className="flex-1 overflow-y-auto p-5 scrollbar-hide">
            {lines.length === 0 ? (
              <li className="py-12 text-center text-sm text-zinc-500">
                Chưa có món nào trong giỏ.
              </li>
            ) : (
              lines.map((line) => {
                const catalogItem = catalogById.get(line.itemId);

                return (
                  <li
                    key={line.itemId}
                    className="mb-3 flex items-center gap-4 rounded-2xl bg-zinc-800/30 p-3 last:mb-0"
                  >
                    <ItemThumbnail
                      imageUrl={line.imageUrl}
                      emoji={line.emoji}
                      name={line.name}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-100">
                        {line.name}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-orange-500">
                        {formatPrice(line.lineTotal)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center rounded-full border border-zinc-800 bg-zinc-950 p-0.5">
                      <button
                        type="button"
                        onClick={() => removeItem(line.itemId)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                        aria-label={`Giảm số lượng ${line.name}`}
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold tabular-nums text-white">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (catalogItem) addItem(catalogItem);
                        }}
                        disabled={!catalogItem}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white shadow-[0_0_12px_rgba(234,88,12,0.35)] transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none"
                        aria-label={`Tăng số lượng ${line.name}`}
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <footer className="mt-auto border-t border-zinc-800 bg-zinc-900 p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm text-zinc-500">Tổng tạm tính</span>
              <span className="text-2xl font-bold tracking-tight text-orange-500">
                {formatPrice(subtotal)}
              </span>
            </div>
            {onCheckout && (
              <button
                type="button"
                onClick={onCheckout}
                disabled={!canCheckout}
                className={cn(
                  "w-full rounded-xl py-3.5 text-sm font-bold uppercase tracking-wide transition",
                  canCheckout
                    ? "bg-orange-600 text-white shadow-[0_4px_24px_rgba(234,88,12,0.45)] hover:bg-orange-500 active:scale-[0.98]"
                    : "cursor-not-allowed bg-zinc-800 text-zinc-500",
                )}
              >
                {bookingId ? "Tiếp tục thanh toán" : "CHƯA CÓ VÉ TRONG ĐƠN"}
              </button>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
