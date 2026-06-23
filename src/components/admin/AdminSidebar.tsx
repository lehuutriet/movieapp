import type { ComponentType } from "react";
import { Film, LayoutDashboard, MonitorPlay, Ticket, Building2, Coffee, Tag } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/cn";

type SidebarItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  end?: boolean;
  disabled?: boolean;
};

const ADMIN_NAV_ITEMS: SidebarItem[] = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, end: true },
  { to: "/admin/movies", label: "Phim", icon: Film, end: true },
  { to: "/admin/cinemas", label: "Rạp", icon: Building2, end: true },
  { to: "/admin/showtimes", label: "Suất chiếu", icon: MonitorPlay, end: true },
  { to: "/admin/concessions", label: "Đồ ăn & Thức uống", icon: Coffee, end: true },
  { to: "/admin/promotions", label: "Khuyến mãi", icon: Tag, end: true },
  { to: "/admin/tickets", label: "Vé", icon: Ticket, end: true },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-100">
      <div className="border-b border-slate-800 px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          admin cinestar
        </p>
        <h1 className="font-cinema mt-2 text-2xl font-bold tracking-wide text-white">Cine Hall</h1>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="mt-3 text-sm font-medium text-slate-300 transition hover:text-white"
        >
          ← Về trang khách
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 p-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <div
                key={item.to}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500"
                title="Tính năng sẽ sớm được cập nhật"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/40"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
