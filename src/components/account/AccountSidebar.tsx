import type { ComponentType } from "react";
import { LogOut, Settings, Ticket, User } from "lucide-react";
import { cn } from "@/lib/cn";

export type AccountTab = "profile" | "tickets" | "settings";

type SidebarItem = {
  id: AccountTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: SidebarItem[] = [
  { id: "profile", label: "Thông tin cá nhân", icon: User },
  { id: "tickets", label: "Lịch sử đặt vé", icon: Ticket },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

interface AccountSidebarProps {
  activeTab: AccountTab;
  onTabChange: (tab: AccountTab) => void;
  onLogout: () => void;
  userName: string;
  userEmail: string;
}

export function AccountSidebar({
  activeTab,
  onTabChange,
  onLogout,
  userName,
  userEmail,
}: AccountSidebarProps) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="flex w-full shrink-0 flex-col rounded-2xl border border-zinc-800 bg-zinc-950 lg:sticky lg:top-24 lg:w-72 lg:self-start">
      <div className="border-b border-zinc-800 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400/80">
          Tài khoản
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-sm font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs text-zinc-500">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                isActive
                  ? "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
