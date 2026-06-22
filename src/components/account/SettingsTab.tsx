import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { useUIStore } from "@/stores/ui-store";

export function SettingsTab() {
  const showToast = useUIStore((state) => state.showToast);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast({
        type: "error",
        message: "Mật khẩu xác nhận không khớp.",
      });
      return;
    }

    if (newPassword.length < 8) {
      showToast({
        type: "error",
        message: "Mật khẩu mới phải có ít nhất 8 ký tự.",
      });
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSaving(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast({
      type: "success",
      message: "Đã cập nhật mật khẩu thành công.",
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-orange-400/80">
          Bảo mật
        </p>
        <h2 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">
          Cài đặt
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Quản lý mật khẩu và bảo mật tài khoản.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8"
      >
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Đổi mật khẩu</p>
            <p className="text-xs text-zinc-500">
              Sử dụng mật khẩu mạnh để bảo vệ tài khoản.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <PasswordField
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent((prev) => !prev)}
          />
          <PasswordField
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew((prev) => !prev)}
          />
          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm((prev) => !prev)}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </form>
    </div>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
        <Lock className="h-4 w-4 text-zinc-500" />
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 pr-11 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition hover:text-zinc-300"
          aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
