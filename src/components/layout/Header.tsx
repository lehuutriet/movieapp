import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import { useSecureLogout } from "@/hooks/use-secure-logout";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

const NAV_LINKS = [
  { to: "/home", label: "Trang chủ", end: true },
  { to: "/movies", label: "Phim", end: true },
  { to: "/showtimes", label: "Lịch chiếu", end: true },
  { to: "/food-drink", label: "Đồ ăn & Thức uống", end: true },
] as const;

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 text-red-600"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h13A2.5 2.5 0 0 1 21 8.5v2.1a2 2 0 0 0 0 3.8v2.1A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-2.1a2 2 0 0 0 0-3.8V8.5zm2.5-.5a.5.5 0 0 0-.5.5v1.2a4 4 0 0 1 0 5.6V16.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-1.2a4 4 0 0 1 0-5.6V8.5a.5.5 0 0 0-.5-.5h-13z" />
      <circle cx="12" cy="12" r="1.5" fill="#0c0a09" />
    </svg>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-700 text-sm font-bold text-white shadow-md shadow-orange-900/30">
      {initial}
    </div>
  );
}

export function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const openAuthModal = useUIStore((state) => state.openAuthModal);
  const showToast = useUIStore((state) => state.showToast);
  const {
    isLogoutModalOpen,
    isLoggingOut,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useSecureLogout({
    onSuccess: () => showToast({ type: "info", message: "Đã đăng xuất." }),
  });

  return (
    <header className="sticky top-0 z-50 border-b border-orange-900/40 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/home" className="flex shrink-0 items-center gap-2">
          <TicketIcon />
          <span className="font-cinema text-xl font-bold text-red-600 md:text-2xl">
            Cine Hall
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "text-sm font-medium transition-colors",
                  isActive
                    ? "text-orange-400"
                    : "text-stone-300 hover:text-orange-400",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-orange-500 sm:inline-flex"
          >
            Đặt vé
          </button>

          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-stone-800" />
          ) : isAuthenticated && user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-stone-700/80 bg-stone-900/80 py-1 pl-1 pr-3 transition hover:border-stone-600 hover:bg-stone-800"
                >
                  <UserAvatar name={user.name} />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-stone-200 sm:inline">
                    {user.name}
                  </span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-[200px] overflow-hidden rounded-xl border border-stone-800 bg-stone-950 p-1 shadow-xl"
                >
                  <div className="border-b border-stone-800 px-3 py-2">
                    <p className="truncate text-sm font-medium text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-stone-500">
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/tickets"
                      className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-stone-300 outline-none hover:bg-stone-800 hover:text-white"
                    >
                      Vé của tôi
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item asChild>
                    <Link
                      to="/account"
                      className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-stone-300 outline-none hover:bg-stone-800 hover:text-white"
                    >
                      Tài khoản
                    </Link>
                  </DropdownMenu.Item>

                  {isAdmin && (
                    <>
                      <DropdownMenu.Separator className="my-1 h-px bg-stone-800" />
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/admin"
                          className="block cursor-pointer rounded-lg px-3 py-2 text-sm text-indigo-300 outline-none hover:bg-indigo-500/10 hover:text-indigo-200"
                        >
                          Quản trị hệ thống
                        </Link>
                      </DropdownMenu.Item>
                    </>
                  )}

                  <DropdownMenu.Separator className="my-1 h-px bg-stone-800" />

                  <DropdownMenu.Item
                    onSelect={openLogoutModal}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-rose-400 outline-none hover:bg-rose-500/10"
                  >
                    Đăng xuất
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-full border border-orange-500/50 px-5 py-2 text-sm font-semibold text-orange-400 transition hover:border-orange-500 hover:bg-orange-600 hover:text-white"
            >
              Đăng nhập
            </button>
          )}
        </div>
      </div>

      <LogoutConfirmModal
        open={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onCancel={closeLogoutModal}
        onConfirm={() => void handleLogout()}
      />
    </header>
  );
}
