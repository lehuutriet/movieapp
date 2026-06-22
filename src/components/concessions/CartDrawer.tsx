import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/cn";
import type { ConcessionCartLine, ConcessionItem } from "@/types/concession";

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lines: ConcessionCartLine[];
  catalog: ConcessionItem[];
  itemCount: number;
  subtotal: number;
  onIncrement: (item: ConcessionItem) => void;
  onDecrement: (itemId: string) => void;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  checkoutLabel?: string;
}

export function CartDrawer({
  open,
  onOpenChange,
  lines,
  catalog,
  itemCount,
  subtotal,
  onIncrement,
  onDecrement,
  onCheckout,
  checkoutDisabled = false,
  checkoutLabel = "Tiếp tục thanh toán",
}: CartDrawerProps) {
  const catalogById = new Map(catalog.map((item) => [item.id, item]));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border border-orange-900/40 bg-stone-950 shadow-2xl outline-none",
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-stone-700" />

          <header className="flex items-center justify-between border-b border-orange-900/30 px-5 py-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-white">
                Giỏ hàng của bạn
              </Dialog.Title>
              <Dialog.Description className="text-sm text-stone-400">
                {itemCount} món · {formatPrice(subtotal)}
              </Dialog.Description>
            </div>
            <Dialog.Close
              type="button"
              className="rounded-lg border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:bg-stone-800"
            >
              Đóng
            </Dialog.Close>
          </header>

          <ul className="flex-1 overflow-y-auto px-5 py-4">
            {lines.length === 0 ? (
              <li className="py-8 text-center text-sm text-stone-500">
                Chưa có món nào trong giỏ.
              </li>
            ) : (
              lines.map((line) => {
                const catalogItem = catalogById.get(line.itemId);

                return (
                  <li
                    key={line.itemId}
                    className="flex items-center gap-3 border-b border-stone-800/80 py-4 last:border-0"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-950/50 text-2xl">
                      {line.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{line.name}</p>
                      <p className="text-sm text-orange-400">
                        {formatPrice(line.unitPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrement(line.itemId)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-600 text-stone-300 hover:bg-stone-800"
                        aria-label={`Giảm số lượng ${line.name}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-semibold text-white">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (catalogItem) onIncrement(catalogItem);
                        }}
                        disabled={!catalogItem}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Tăng số lượng ${line.name}`}
                      >
                        +
                      </button>
                    </div>

                    <p className="w-20 shrink-0 text-right text-sm font-semibold text-white">
                      {formatPrice(line.lineTotal)}
                    </p>
                  </li>
                );
              })
            )}
          </ul>

          <footer className="border-t border-orange-900/30 bg-stone-950/95 px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-stone-400">Tổng tạm tính</span>
              <span className="text-xl font-bold text-orange-400">
                {formatPrice(subtotal)}
              </span>
            </div>
            {onCheckout && (
              <button
                type="button"
                onClick={onCheckout}
                disabled={checkoutDisabled || lines.length === 0}
                className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLabel}
              </button>
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
