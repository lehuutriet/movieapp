import { X } from "lucide-react";
import { AddConcessionForm } from "@/components/admin/AddConcessionForm";
import { cn } from "@/lib/cn";
import type { AdminConcessionItem, ConcessionItem } from "@/types/concession";

interface ConcessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: AdminConcessionItem | null;
  onSuccess?: (item: ConcessionItem) => void;
}

export function ConcessionModal({
  open,
  onOpenChange,
  editingItem = null,
  onSuccess,
}: ConcessionModalProps) {
  if (!open) return null;

  const isEditing = Boolean(editingItem);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="concession-modal-title"
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden",
          "rounded-2xl border border-slate-200 bg-white shadow-2xl",
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2
            id="concession-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            {isEditing ? "Sửa món" : "Thêm món mới"}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <AddConcessionForm
            key={editingItem?.id ?? "new"}
            editingItem={editingItem}
            className="border-0 p-0 shadow-none"
            onSuccess={(item) => {
              onSuccess?.(item);
              onOpenChange(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
