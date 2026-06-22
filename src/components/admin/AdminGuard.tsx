import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

export function AdminGuard() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isLoading = useAuthStore((state) => state.isLoading);
  const showToast = useUIStore((state) => state.showToast);
  const hasShownDeniedToast = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin && !hasShownDeniedToast.current) {
      hasShownDeniedToast.current = true;
      showToast({
        type: "error",
        message: "Bạn không có quyền truy cập",
      });
    }
  }, [isLoading, isAuthenticated, isAdmin, showToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Đang xác thực...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "admin" }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
