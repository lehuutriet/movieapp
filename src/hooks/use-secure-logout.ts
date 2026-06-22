import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { useBookingStore } from "@/stores/booking-store";
import { useConcessionStore } from "@/stores/concession-store";

interface UseSecureLogoutOptions {
  redirectTo?: "/home" | "/login";
  onSuccess?: () => void;
}

export function useSecureLogout(options: UseSecureLogoutOptions = {}) {
  const { redirectTo = "/home", onSuccess } = options;
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useConcessionStore((state) => state.clearCart);
  const clearBooking = useBookingStore((state) => state.clearBooking);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function openLogoutModal() {
    setIsLogoutModalOpen(true);
  }

  function closeLogoutModal() {
    if (isLoggingOut) {
      return;
    }

    setIsLogoutModalOpen(false);
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      clearCart();
      clearBooking();
      setIsLogoutModalOpen(false);
      onSuccess?.();
      navigate(redirectTo, { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return {
    isLogoutModalOpen,
    isLoggingOut,
    openLogoutModal,
    closeLogoutModal,
    handleLogout,
  };
}
