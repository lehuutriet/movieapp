/**
 * Derived F&B cart view — connects catalog data with `concession-store` quantities.
 *
 * Connection:
 * - Subscribes to `useConcessionStore` for `quantities` and cart actions.
 * - Accepts the current `ConcessionItem[]` catalog (from `fetchConcessions`).
 * - Returns memoized `lines`, `itemCount`, and `subtotal` for the summary bar.
 *
 * Re-render flow:
 * 1. User clicks +/- → store action updates `quantities`.
 * 2. Zustand notifies this hook's `quantities` selector → component re-renders.
 * 3. `useMemo` blocks re-run because `quantities` changed → totals update instantly.
 */

import { useMemo } from "react";
import { useConcessionStore } from "@/stores/concession-store";
import type { ConcessionCartLine, ConcessionItem } from "@/types/concession";

export function useConcessionCart(catalog: ConcessionItem[]) {
  const quantities = useConcessionStore((state) => state.quantities);
  const addItem = useConcessionStore((state) => state.addItem);
  const removeItem = useConcessionStore((state) => state.removeItem);
  const setQuantity = useConcessionStore((state) => state.setQuantity);
  const clearCart = useConcessionStore((state) => state.clearCart);

  const lines = useMemo<ConcessionCartLine[]>(() => {
    return catalog
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => {
        const quantity = quantities[item.id];
        return {
          itemId: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          emoji: item.emoji,
          imageUrl: item.imageUrl,
          unitPrice: item.price,
          quantity,
          lineTotal: item.price * quantity,
        };
      });
  }, [catalog, quantities]);

  const itemCount = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.lineTotal, 0),
    [lines],
  );

  const getQuantity = (itemId: string) => quantities[itemId] ?? 0;

  return {
    quantities,
    lines,
    itemCount,
    subtotal,
    getQuantity,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
  };
}
