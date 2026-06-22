import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAppwriteConfigured } from "@/lib/appwrite";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Tổng quan hệ thống",
  "/admin/movies": "Quản lý phim",
  "/admin/cinemas": "Quản lý rạp",
  "/admin/showtimes": "Quản lý suất chiếu",
};

export function AdminLayout() {
  const location = useLocation();
  const appwriteReady = isAppwriteConfigured();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "admin cinestar";

  return (
    // Dùng layout 2 cột với flex:
    // - Cột trái cố định (Sidebar) để điều hướng nhất quán.
    // - Cột phải chiếm toàn bộ phần còn lại để chứa Header + nội dung từng trang.
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar />

      {/* Cột phải được tổ chức theo flex dọc:
          Header ở trên, vùng nội dung (Outlet) cuộn độc lập bên dưới. */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <AdminHeader title={pageTitle} />

        {!appwriteReady && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800 md:px-8">
            Appwrite chưa được cấu hình. Các thao tác CRUD sẽ không hoạt động.
          </div>
        )}

        {/* Main content dùng nền xám nhạt để làm nổi bật card trắng của từng module.
            max-w-7xl + mx-auto giúp nội dung cân đối, tránh trải quá rộng trên màn hình lớn. */}
        <div className="flex-1 overflow-y-auto">
          <main className="mx-auto w-full max-w-7xl p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
