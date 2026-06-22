/**
 * F&B cart state — quantities only (`itemId → qty`).
 *
 * Connection:
 * - Reads catalog prices from `fetchConcessions()` / `ConcessionItem` in the UI layer.
 * - `hooks/use-concession-cart.ts` subscribes to `quantities` and derives totals.
 * - Checkout (Step 3) will read the same store to merge with ticket booking.
 */

import { create } from "zustand";
import type { ConcessionItem } from "@/types/concession";

interface ConcessionState {
  /** itemId → quantity. Keys with qty 0 are removed to keep the map lean. */
  quantities: Record<string, number>;
}

interface ConcessionActions {
  /** Increment quantity for a catalog item (creates key at 1 if new). */
  addItem: (item: ConcessionItem) => void;
  /** Decrement quantity; removes the key when quantity reaches 0. */
  removeItem: (itemId: string) => void;
  /** Set an exact quantity; removes the key when quantity is 0 or negative. */
  setQuantity: (itemId: string, quantity: number) => void;
  /** Empty the entire F&B cart (e.g. after successful payment). */
  clearCart: () => void;
}

type ConcessionStore = ConcessionState & ConcessionActions;

const initialState: ConcessionState = {
  quantities: {},
};

export const useConcessionStore = create<ConcessionStore>((set) => ({
  ...initialState,

  addItem: (item) => {
    set((state) => ({
      quantities: {
        ...state.quantities,
        [item.id]: (state.quantities[item.id] ?? 0) + 1,
      },
    }));
  },

  removeItem: (itemId) => {
    set((state) => {
      const current = state.quantities[itemId];
      if (!current) return state;

      if (current <= 1) {
        const { [itemId]: _removed, ...rest } = state.quantities;
        return { quantities: rest };
      }

      return {
        quantities: {
          ...state.quantities,
          [itemId]: current - 1,
        },
      };
    });
  },

  setQuantity: (itemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const { [itemId]: _removed, ...rest } = state.quantities;
        return { quantities: rest };
      }

      return {
        quantities: {
          ...state.quantities,
          [itemId]: quantity,
        },
      };
    });
  },

  clearCart: () => {
    set({ quantities: {} });
  },
}));
