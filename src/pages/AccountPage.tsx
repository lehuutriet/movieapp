import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AccountSidebar,
  type AccountTab,
} from "@/components/account/AccountSidebar";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import { FavoritesTab } from "@/components/account/FavoritesTab";
import { ProfileTab } from "@/components/account/ProfileTab";
import { SettingsTab } from "@/components/account/SettingsTab";
import { TicketHistoryTab } from "@/components/account/TicketHistoryTab";
import { useSecureLogout } from "@/hooks/use-secure-logout";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

function AccountSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-80 rounded-2xl bg-zinc-900 lg:w-72" />
        <div className="h-96 flex-1 rounded-2xl bg-zinc-900" />
      </div>
    </div>
  );
}

function AccountGuestPrompt() {
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-2xl ring-1 ring-zinc-800">
        🎬
      </div>
      <h1 className="font-cinema text-2xl font-bold text-white">Tài khoản</h1>
      <p className="mt-3 text-zinc-400">
        Đăng nhập để xem và quản lý thông tin tài khoản.
      </p>
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="mt-6 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
      >
        Đăng nhập
      </button>
    </div>
  );
}

function isAccountTab(value: string | null): value is AccountTab {
  return (
    value === "profile" ||
    value === "tickets" ||
    value === "favorites" ||
    value === "settings"
  );
}

export function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [activeTab, setActiveTab] = useState<AccountTab>(
    isAccountTab(tabFromUrl) ? tabFromUrl : "profile",
  );
  const {
    isLogoutModalOpen,
    isLoggingOut,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  } = useSecureLogout();

  useEffect(() => {
    if (isAccountTab(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (isLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return <AccountGuestPrompt />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AccountSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={openLogoutModal}
          userName={user.name}
          userEmail={user.email}
        />

        <main className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 md:p-8">
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "tickets" && <TicketHistoryTab />}
          {activeTab === "favorites" && <FavoritesTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>

      <LogoutConfirmModal
        open={isLogoutModalOpen}
        isLoading={isLoggingOut}
        onCancel={closeLogoutModal}
        onConfirm={() => void handleLogout()}
      />
    </div>
  );
}
