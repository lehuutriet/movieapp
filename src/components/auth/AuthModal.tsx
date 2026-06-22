import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useState } from "react";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth-errors";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-stone-800" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-[0.25em]">
        <span className="bg-stone-950 px-3 text-stone-500">Hoặc</span>
      </div>
    </div>
  );
}

export function AuthModal() {
  const open = useUIStore((state) => state.authModalOpen);
  const defaultTab = useUIStore((state) => state.authModalTab);
  const closeAuthModal = useUIStore((state) => state.closeAuthModal);
  const showToast = useUIStore((state) => state.showToast);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
    }
  }, [open, defaultTab]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      closeAuthModal();
      resetForm();
      return;
    }
    setTab(defaultTab);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, tab === "register");
    const nameError = tab === "register" ? validateName(name) : null;
    const validationError = emailError ?? passwordError ?? nameError;

    if (validationError) {
      showToast({ type: "error", message: validationError });
      return;
    }

    setIsSubmitting(true);

    try {
      if (tab === "login") {
        await login(email.trim(), password);
        showToast({ type: "success", message: "Đăng nhập thành công!" });
      } else {
        await register(email.trim(), password, name.trim());
        showToast({ type: "success", message: "Tạo tài khoản thành công!" });
      }

      closeAuthModal();
      resetForm();
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Đã xảy ra lỗi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      closeAuthModal();
      loginWithGoogle();
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : "Không thể đăng nhập Google.",
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-800 bg-stone-950 p-6 shadow-2xl outline-none">
          <Dialog.Title className="sr-only">Đăng nhập hoặc đăng ký</Dialog.Title>
          <Dialog.Description className="sr-only">
            Form xác thực tài khoản Cine Hall
          </Dialog.Description>

          <div className="mb-6 text-center">
            <p className="font-cinema text-lg font-bold text-red-600">Cine Hall</p>
            <h2 className="mt-2 text-xl font-bold text-white">Chào mừng bạn trở lại</h2>
            <p className="mt-1 text-sm text-stone-400">
              Đăng nhập để quản lý vé và tài khoản
            </p>
          </div>

          <Tabs.Root
            value={tab}
            onValueChange={(value) => setTab(value as "login" | "register")}
          >
            <Tabs.List className="mb-6 grid grid-cols-2 rounded-full border border-stone-800 bg-stone-900 p-1">
              <Tabs.Trigger
                value="login"
                className={cn(
                  "rounded-full py-2 text-sm font-semibold text-stone-400 transition",
                  "data-[state=active]:bg-orange-600 data-[state=active]:text-white",
                )}
              >
                Đăng nhập
              </Tabs.Trigger>
              <Tabs.Trigger
                value="register"
                className={cn(
                  "rounded-full py-2 text-sm font-semibold text-stone-400 transition",
                  "data-[state=active]:bg-orange-600 data-[state=active]:text-white",
                )}
              >
                Đăng ký
              </Tabs.Trigger>
            </Tabs.List>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs.Content value="register" className="outline-none">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-stone-400">Họ và tên</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                  />
                </label>
              </Tabs.Content>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ban@email.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-stone-400">Mật khẩu</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-orange-600 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Đang xử lý..."
                  : tab === "login"
                    ? "Đăng nhập"
                    : "Tạo tài khoản"}
              </button>
            </form>
          </Tabs.Root>

          <AuthDivider />

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-700 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
          >
            <GoogleIcon className="h-5 w-5" />
            Tiếp tục với Google
          </button>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-stone-500 transition hover:bg-stone-800 hover:text-white"
              aria-label="Đóng"
            >
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
