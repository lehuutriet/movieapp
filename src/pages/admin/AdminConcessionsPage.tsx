import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ConcessionModal } from "@/components/admin/ConcessionModal";
import {
  AdminButton,
  AdminCard,
  AdminModal,
  AdminPageHeader,
} from "@/components/admin/ui/admin-ui";
import {
  useAdminConcessions,
  useDeleteConcession,
} from "@/hooks/admin/use-admin-concessions";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/stores/ui-store";
import type { AdminConcessionItem, ConcessionCategory } from "@/types/concession";

const CATEGORY_LABELS: Record<ConcessionCategory, string> = {
  popcorn: "Bắp rang",
  drinks: "Thức uống",
  combos: "Combo",
  snacks: "Đồ ăn vặt",
};

function formatPrice(price: number) {
  return `${price.toLocaleString("vi-VN")}đ`;
}

export function AdminConcessionsPage() {
  const showToast = useUIStore((state) => state.showToast);
  const { data: concessions = [], isLoading, isError, refetch } =
    useAdminConcessions();
  const deleteMutation = useDeleteConcession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminConcessionItem | null>(
    null,
  );
  const [itemToDelete, setItemToDelete] = useState<AdminConcessionItem | null>(
    null,
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminConcessionItem) => {
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
        message: `Đã xóa "${itemToDelete.name}".`,
      });
      setItemToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Không thể xóa món.",
      });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Đồ ăn & Thức uống"
        description="Quản lý thực đơn concessions trên Appwrite."
        action={
          <AdminButton onClick={openCreateModal}>+ Thêm món mới</AdminButton>
        }
      />

      <AdminCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Đang tải danh sách...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-600">
            Không tải được danh sách món.
          </div>
        ) : concessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có món nào.{" "}
            <button
              type="button"
              onClick={openCreateModal}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Thêm món mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Ảnh / Emoji</th>
                  <th className="px-4 py-3">Tên món</th>
                  <th className="px-4 py-3">Danh mục</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {concessions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl" aria-hidden>
                            {item.emoji}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatPrice(item.price)}
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

      <ConcessionModal
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
        title="Xác nhận xóa món"
        description={
          itemToDelete
            ? `Bạn có chắc muốn xóa "${itemToDelete.name}"? Hành động này không thể hoàn tác.`
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
            {deleteMutation.isPending ? "Đang xóa..." : "Xóa món"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}
