import type { Seat } from "@/types/seat";

export { DEMO_SHOWTIME_ID, DEMO_SHOWTIME_META } from "@/data/showtime-meta";

const AUDITORIUM_ID = "auditorium_demo";

function buildRow(
  rowLabel: string,
  cols: number,
  seatType: Seat["seatType"] = "standard",
): Seat[] {
  return Array.from({ length: cols }, (_, index) => {
    const colNumber = index + 1;
    const seatLabel = `${rowLabel}${colNumber}`;

    return {
      $id: `seat_${seatLabel.toLowerCase()}`,
      auditoriumId: AUDITORIUM_ID,
      rowLabel,
      colNumber,
      seatLabel,
      seatType,
      priceMultiplier: seatType === "vip" ? 1.5 : 1,
      isActive: true,
    };
  });
}

export const DEMO_SEATS: Seat[] = [
  ...buildRow("A", 8, "vip"),
  ...buildRow("B", 10),
  ...buildRow("C", 10),
  ...buildRow("D", 10),
  ...buildRow("E", 10),
  ...buildRow("F", 10),
];
