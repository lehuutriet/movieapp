import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PromotionModal } from "@/components/admin/PromotionModal";
import {
  AdminButton,
  AdminCard,
  AdminModal,
  AdminPageHeader,
} from "@/components/admin/ui/admin-ui";
import { PROMOTION_CATEGORY_LABELS } from "@/data/mock-promotions";
import {
  useAdminPromotions,
  useDeletePromotion,
} from "@/hooks/admin/use-admin-promotions";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/stores/ui-store";
import type { AdminPromotion } from "@/types/promotion";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminPromotionsPage() {
  const showToast = useUIStore((state) => state.showToast);
  const { data: promotions = [], isLoading, isError, refetch } =
    useAdminPromotions();
  const deleteMutation = useDeletePromotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminPromotion | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AdminPromotion | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminPromotion) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      showToast({
        type: "success",
        message: `Đã xóa "${itemToDelete.title}".`,
      });
      setItemToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Không thể xóa khuyến mãi.",
      });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Khuyến mãi"
        description="Thêm và quản lý chương trình ưu đãi hiển thị trên trang khách."
        action={
          <AdminButton onClick={openCreateModal}>+ Thêm khuyến mãi</AdminButton>
        }
      />

      <AdminCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Đang tải danh sách...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-600">
            Không tải được danh sách khuyến mãi. Kiểm tra collection{" "}
            <code className="rounded bg-slate-100 px-1">promotions</code> trên
            Appwrite.
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có khuyến mãi nào.{" "}
            <button
              type="button"
              onClick={openCreateModal}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Thêm khuyến mãi mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-24 px-4 py-3">Ảnh</th>
                  <th className="w-[28%] px-4 py-3">Tiêu đề</th>
                  <th className="w-28 px-4 py-3">Danh mục</th>
                  <th className="w-24 px-4 py-3">Giảm giá</th>
                  <th className="w-24 px-4 py-3">Mã</th>
                  <th className="w-28 px-4 py-3">Hết hạn</th>
                  <th className="w-24 px-4 py-3">Trạng thái</th>
                  <th className="w-40 px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {promotions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-12 w-20 rounded-lg border border-slate-200 object-cover"
                      />
                    </td>
                    <td className="min-w-0 px-4 py-3">
                      <p
                        className="truncate font-medium text-slate-900"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p
                        className="mt-0.5 break-all text-xs leading-5 text-slate-500"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {PROMOTION_CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="min-w-0 px-4 py-3">
                      <p
                        className="truncate font-medium text-slate-900"
                        title={item.discountLabel}
                      >
                        {item.discountLabel}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.code ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(item.validUntil)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <AdminButton
                          variant="secondary"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Sửa
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                          onClick={() => setItemToDelete(item)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Xóa
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <PromotionModal
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        editingItem={editingItem}
        onSuccess={() => void refetch()}
      />

      <AdminModal
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open) setItemToDelete(null);
        }}
        title="Xác nhận xóa khuyến mãi"
        description={
          itemToDelete
            ? `Bạn có chắc muốn xóa "${itemToDelete.title}"? Hành động này không thể hoàn tác.`
            : undefined
        }
      >
        <div className="flex justify-end gap-3">
          <AdminButton
            variant="secondary"
            onClick={() => setItemToDelete(null)}
            disabled={deleteMutation.isPending}
          >
            Hủy
          </AdminButton>
          <AdminButton
            variant="danger"
            onClick={() => void handleDelete()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Đang xóa..." : "Xóa khuyến mãi"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}
