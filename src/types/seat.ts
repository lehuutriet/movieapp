export type SeatType = "standard" | "vip" | "couple" | "disabled";

export type SeatUIStatus = "available" | "selected" | "locked" | "sold";

export interface Seat {
  $id: string;
  auditoriumId: string;
  rowLabel: string;
  colNumber: number;
  seatLabel: string;
  seatType: SeatType;
  priceMultiplier: number;
  isActive: boolean;
}

export interface SeatSelection {
  id: string;
  label: string;
  price: number;
}
