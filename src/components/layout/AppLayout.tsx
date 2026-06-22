import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AuthModal } from "@/components/auth/AuthModal";
import { ActiveBookingBanner } from "@/components/booking/ActiveBookingBanner";
import { Header } from "@/components/layout/Header";
import { useUIStore } from "@/stores/ui-store";

function useOAuthCallbackToast() {
  const showToast = useUIStore((state) => state.showToast);

  useEffect(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");

    if (queryIndex === -1) return;

    const params = new URLSearchParams(hash.slice(queryIndex + 1));

    if (params.get("auth_failed") === "1") {
      showToast({
        type: "error",
        message: "Đăng nhập Google thất bại. Vui lòng thử lại.",
      });
      window.location.hash = "#/home";
    }
  }, [showToast]);
}

export function AppLayout() {
  useOAuthCallbackToast();

  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <ActiveBookingBanner />
      <AuthModal />
    </div>
  );
}
