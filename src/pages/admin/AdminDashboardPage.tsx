import { Banknote, Calendar, Film, MapPin, Ticket } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPageHeader } from "@/components/admin/ui/admin-ui";
import { useDashboardStats } from "@/hooks/admin/use-dashboard-stats";
import { useAdminMovies } from "@/hooks/admin/use-admin-movies";
import { useAdminStats } from "@/hooks/admin/use-admin-showtimes";
import type { MovieStatus } from "@/types/movie";

function formatVnd(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

function formatBookingDate(isoDate: string) {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCardSkeleton() {
  return (
    <div className="flex animate-pulse items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex-1 space-y-3">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-9 w-20 rounded bg-gray-200" />
        <div className="h-3 w-32 rounded bg-gray-100" />
      </div>
      <div className="h-12 w-12 rounded-xl bg-gray-200" />
    </div>
  );
}

export function AdminDashboardPage() {
  const { movieCount, cinemaCount, showtimeCount, isLoading } = useAdminStats();
  const {
    data: dashboardStats,
    isLoading: isDashboardStatsLoading,
  } = useDashboardStats();
  const { data: movies = [] } = useAdminMovies();

  const weeklyTicketData = dashboardStats?.weeklyTicketSales ?? [];

  const statusLabelMap: Record<MovieStatus, string> = {
    now_showing: "Đang chiếu",
    coming_soon: "Sắp chiếu",
    ended: "Ngưng chiếu",
  };
  const statusColorMap: Record<MovieStatus, string> = {
    now_showing: "#16a34a",
    coming_soon: "#ca8a04",
    ended: "#dc2626",
  };
  const statusCountMap = movies.reduce<Record<MovieStatus, number>>(
    (accumulator, movie) => {
      accumulator[movie.status] += 1;
      return accumulator;
    },
    { now_showing: 0, coming_soon: 0, ended: 0 },
  );
  const movieStatusData = (Object.keys(statusCountMap) as MovieStatus[]).map(
    (status) => ({
      name: statusLabelMap[status],
      value: statusCountMap[status],
      color: statusColorMap[status],
    }),
  );

  const recentBookings = dashboardStats?.recentBookings ?? [];
  const paidBookingCount = dashboardStats?.paidBookingCount ?? 0;

  const stats = [
    {
      label: "Tổng Phim",
      value: movieCount,
      subtitle: "Phim trên hệ thống",
      icon: Film,
      iconWrapperClass: "bg-blue-100",
      iconClass: "text-blue-700",
      loading: isLoading,
    },
    {
      label: "Tổng Rạp",
      value: cinemaCount,
      subtitle: "Rạp đang hoạt động",
      icon: MapPin,
      iconWrapperClass: "bg-purple-100",
      iconClass: "text-purple-700",
      loading: isLoading,
    },
    {
      label: "Tổng Suất Chiếu",
      value: showtimeCount,
      subtitle: "Suất chiếu đã lên lịch",
      icon: Calendar,
      iconWrapperClass: "bg-orange-100",
      iconClass: "text-orange-700",
      loading: isLoading,
    },
    {
      label: "Tổng doanh thu",
      value: (dashboardStats?.totalRevenue ?? 0).toLocaleString("vi-VN"),
      subtitle: `${paidBookingCount} giao dịch thành công`,
      icon: Banknote,
      iconWrapperClass: "bg-green-100",
      iconClass: "text-green-700",
      loading: isDashboardStatsLoading,
      isRevenue: true,
    },
    {
      label: "Số vé đã bán",
      value: (dashboardStats?.totalTicketsSold ?? 0).toLocaleString("vi-VN"),
      subtitle: "Tổng ghế đã đặt thành công",
      icon: Ticket,
      iconWrapperClass: "bg-emerald-100",
      iconClass: "text-emerald-700",
      loading: isDashboardStatsLoading,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thống kê"
        description="Cine Hall system overview"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) =>
          stat.loading ? (
            <StatCardSkeleton key={stat.label} />
          ) : "isRevenue" in stat && stat.isRevenue ? (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconWrapperClass}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconClass}`} />
                </div>
              </div>
              <p className="mt-2 whitespace-nowrap text-2xl font-bold tracking-tight text-gray-900 xl:text-3xl">
                {stat.value}
                <span className="ml-1 text-lg font-medium text-gray-500">đ</span>
              </p>
              <p className="mt-2 text-xs font-medium text-gray-500">
                {stat.subtitle}
              </p>
            </div>
          ) : (
            <div
              key={stat.label}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 xl:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium text-gray-500">
                  {stat.subtitle}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.iconWrapperClass}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconClass}`} />
              </div>
            </div>
          ),
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Số vé bán theo ngày trong tuần
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tổng vé đã bán theo ngày trong tuần từ giao dịch thành công.
            </p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTicketData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value) => [`${value ?? 0} vé`, "Đã bán"]}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tỷ lệ trạng thái phim</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tỷ trọng phim đang chiếu, sắp chiếu và ngưng chiếu.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={movieStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {movieStatusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value, name) => [`${value ?? 0} phim`, String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {movieStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
                <span className="font-semibold text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
          <p className="mt-1 text-sm text-gray-500">
            5 đặt vé thành công mới nhất trên hệ thống
          </p>
        </div>
        <div className="overflow-x-auto">
          {isDashboardStatsLoading ? (
            <div className="space-y-0 divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse gap-6 px-6 py-4"
                >
                  <div className="h-4 flex-1 rounded bg-gray-200" />
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-3.5">Phim</th>
                  <th className="px-6 py-3.5">Rạp</th>
                  <th className="px-6 py-3.5">Số vé</th>
                  <th className="px-6 py-3.5">Doanh thu</th>
                  <th className="px-6 py-3.5">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-semibold text-gray-800">
                      {booking.movieTitle}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{booking.cinemaName}</td>
                    <td className="px-6 py-3.5 text-gray-600">
                      {booking.seatCount.toLocaleString("vi-VN")} vé
                    </td>
                    <td className="px-6 py-3.5 font-medium text-green-700">
                      {formatVnd(booking.amount)}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">
                      {formatBookingDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Chưa có giao dịch nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
