import { useQuery } from "@tanstack/react-query";
import {
  fetchPaidBookingsForStats,
  statisticsQueryKeys,
  type BookingStatsDocument,
} from "@/api/statistics";

export interface RecentBookingRow {
  id: string;
  movieTitle: string;
  cinemaName: string;
  seatCount: number;
  amount: number;
  createdAt: string;
}

export interface WeeklyTicketChartPoint {
  name: string;
  total: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalTicketsSold: number;
  paidBookingCount: number;
  recentBookings: RecentBookingRow[];
  weeklyTicketSales: WeeklyTicketChartPoint[];
}

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;
const CHART_DAY_ORDER = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

export function aggregateWeeklyTicketSales(
  bookings: BookingStatsDocument[],
): WeeklyTicketChartPoint[] {
  const totals = new Map<string, number>(
    CHART_DAY_ORDER.map((name) => [name, 0]),
  );

  for (const booking of bookings) {
    const dayIndex = new Date(booking.$createdAt).getDay();
    const dayName = WEEKDAY_LABELS[dayIndex];
    totals.set(dayName, (totals.get(dayName) ?? 0) + getSeatCount(booking));
  }

  return CHART_DAY_ORDER.map((name) => ({
    name,
    total: totals.get(name) ?? 0,
  }));
}

function getBookingAmount(booking: BookingStatsDocument): number {
  return booking.grandTotal ?? booking.totalAmount;
}

function getSeatCount(booking: BookingStatsDocument): number {
  if (booking.seats && booking.seats.length > 0) {
    return booking.seats.length;
  }
  return booking.seatLabels.length;
}

function toRecentBookingRow(booking: BookingStatsDocument): RecentBookingRow {
  return {
    id: booking.$id,
    movieTitle: booking.movieTitle ?? "Phim đang chiếu",
    cinemaName: booking.cinemaName ?? "Rạp chiếu phim",
    seatCount: getSeatCount(booking),
    amount: getBookingAmount(booking),
    createdAt: booking.$createdAt,
  };
}

function calculateDashboardStats(
  bookings: BookingStatsDocument[],
): DashboardStats {
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + getBookingAmount(booking),
    0,
  );

  const totalTicketsSold = bookings.reduce(
    (sum, booking) => sum + getSeatCount(booking),
    0,
  );

  const recentBookings = bookings
    .slice(0, 5)
    .map(toRecentBookingRow);

  return {
    totalRevenue,
    totalTicketsSold,
    paidBookingCount: bookings.length,
    recentBookings,
    weeklyTicketSales: aggregateWeeklyTicketSales(bookings),
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: statisticsQueryKeys.dashboard,
    queryFn: async () => {
      const bookings = await fetchPaidBookingsForStats();
      return calculateDashboardStats(bookings);
    },
  });
}
