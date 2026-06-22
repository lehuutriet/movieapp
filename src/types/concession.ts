/**
 * Shared type definitions for the F&B (concession) catalog.
 *
 * Used by:
 * - `data/mock-concessions.ts` — shapes the static demo menu
 * - `api/concessions.ts` — maps API/Appwrite documents into these types
 * - UI pages & cart store (later steps) — consume `ConcessionItem` as read-only catalog data
 */

/** Product categories shown in the menu filter tabs (excluding "all"). */
export type ConcessionCategory = "popcorn" | "drinks" | "combos" | "snacks";

/** Category filter value used by the menu UI — includes "all" to show every item. */
export type ConcessionCategoryFilter = ConcessionCategory | "all";

/**
 * A single concession product from the catalog.
 * This is read-only menu data; cart quantity is managed separately (Step 2).
 */
export interface ConcessionItem {
  id: string;
  name: string;
  description: string;
  category: ConcessionCategory;
  price: number;
  /** Placeholder icon until real `imageUrl` assets are wired up. */
  emoji: string;
  imageUrl?: string;
}

/**
 * A cart row enriched with catalog details and computed line total.
 * Built by `useConcessionCart` from store quantities + menu catalog.
 */
export interface ConcessionCartLine {
  itemId: string;
  name: string;
  description: string;
  category: ConcessionCategory;
  emoji: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

/** Full concession record for admin views (includes inactive items). */
export interface AdminConcessionItem extends ConcessionItem {
  isActive: boolean;
}
