interface LogoutConfirmModalProps {
  open: boolean;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  isLoading = false,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        disabled={isLoading}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <h2
          id="logout-modal-title"
          className="text-lg font-semibold text-white"
        >
          Bạn có chắc chắn muốn đăng xuất?
        </h2>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}
