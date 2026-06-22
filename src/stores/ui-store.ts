import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface UIState {
  toasts: ToastMessage[];
  authModalOpen: boolean;
  authModalTab: "login" | "register";
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  authModalOpen: false,
  authModalTab: "login",

  openAuthModal: (tab = "login") => {
    set({ authModalOpen: true, authModalTab: tab });
  },

  closeAuthModal: () => {
    set({ authModalOpen: false });
  },

  showToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 4000);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    }));
  },
}));
