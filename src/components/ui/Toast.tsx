import { cn } from "@/lib/cn";
import { useUIStore, type ToastType } from "@/stores/ui-store";

const TOAST_STYLES: Record<ToastType, string> = {
  success: "border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  error: "border-rose-500/40 bg-rose-500/15 text-rose-100",
  warning: "border-amber-500/40 bg-amber-500/15 text-amber-100",
  info: "border-sky-500/40 bg-sky-500/15 text-sky-100",
};

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur",
            TOAST_STYLES[toast.type],
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Đóng
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
