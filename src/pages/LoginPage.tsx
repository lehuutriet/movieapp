import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/home", { replace: true });
      return;
    }

    if (!isLoading && !isAuthenticated) {
      openAuthModal("login");
    }
  }, [isAuthenticated, isLoading, navigate, openAuthModal]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
      <p className="mt-3 max-w-sm text-stone-400">
        Vui lòng đăng nhập để tiếp tục. Form đăng nhập đã được mở tự động.
      </p>
      <button
        type="button"
        onClick={() => openAuthModal("login")}
        className="mt-6 rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-500"
      >
        Mở form đăng nhập
      </button>
      <Link
        to="/home"
        className="mt-4 text-sm text-stone-500 hover:text-stone-300"
      >
        ← Về trang chủ
      </Link>
    </div>
  );
}
