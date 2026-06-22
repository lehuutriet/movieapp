/**
 * Static F&B catalog used for local development and as an API fallback.
 *
 * Connection:
 * - Imports `ConcessionItem` / `ConcessionCategoryFilter` from `types/concession.ts`
 *   so mock data always matches the real API shape.
 * - Consumed by `api/concessions.ts` when Appwrite is unavailable or returns no items.
 * - Pages should NOT import this directly — call `fetchConcessions()` instead.
 */

import type {
  ConcessionCategoryFilter,
  ConcessionItem,
} from "@/types/concession";

/** Demo menu items extracted from the original hardcoded `FoodAndDrinkPage`. */
export const MOCK_CONCESSIONS: ConcessionItem[] = [
  {
    id: "1",
    name: "Bắp rang bơ",
    description: "Bắp rang tươi với bơ thật",
    category: "popcorn",
    price: 45000,
    emoji: "🍿",
  },
  {
    id: "2",
    name: "Bắp caramel",
    description: "Bắp ngọt phủ caramel giòn",
    category: "popcorn",
    price: 55000,
    emoji: "🍿",
  },
  {
    id: "3",
    name: "Bắp phô mai",
    description: "Vị phô mai cheddar đậm đà",
    category: "popcorn",
    price: 50000,
    emoji: "🧀",
  },
  {
    id: "4",
    name: "Coca-Cola",
    description: "Lon 500ml lạnh",
    category: "drinks",
    price: 35000,
    emoji: "🥤",
  },
  {
    id: "5",
    name: "Cà phê sữa đá",
    description: "Espresso pha với sữa lạnh",
    category: "drinks",
    price: 55000,
    emoji: "☕",
  },
  {
    id: "6",
    name: "Nước cam tươi",
    description: "100% nước cam tự nhiên",
    category: "drinks",
    price: 45000,
    emoji: "🍊",
  },
  {
    id: "7",
    name: "Combo A",
    description: "Bắp lớn + 2 nước",
    category: "combos",
    price: 120000,
    emoji: "🎬",
  },
  {
    id: "8",
    name: "Combo B",
    description: "Bắp vừa + nước + nachos",
    category: "combos",
    price: 145000,
    emoji: "🎟",
  },
  {
    id: "9",
    name: "Nachos phô mai",
    description: "Bánh tortilla giòn chấm phô mai nóng",
    category: "snacks",
    price: 65000,
    emoji: "🌮",
  },
  {
    id: "10",
    name: "Xúc xích nướng",
    description: "Hot dog rạp chiếu cổ điển",
    category: "snacks",
    price: 70000,
    emoji: "🌭",
  },
];

/** UI-only filter labels; not part of the API payload. */
export const CONCESSION_CATEGORIES: {
  id: ConcessionCategoryFilter;
  label: string;
}[] = [
  { id: "all", label: "Tất cả" },
  { id: "popcorn", label: "Bắp rang" },
  { id: "drinks", label: "Thức uống" },
  { id: "combos", label: "Combo" },
  { id: "snacks", label: "Đồ ăn vặt" },
];
