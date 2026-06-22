import { AppwriteException } from "appwrite";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AppwriteException) {
    switch (error.type) {
      case "user_invalid_credentials":
        return "Email hoặc mật khẩu không đúng.";
      case "user_already_exists":
        return "Email này đã được đăng ký.";
      case "password_recently_used":
        return "Mật khẩu không hợp lệ hoặc đã được sử dụng gần đây.";
      case "user_password_mismatch":
        return "Mật khẩu không khớp.";
      case "general_rate_limit_exceeded":
        return "Quá nhiều lần thử. Vui lòng đợi vài phút.";
      default:
        return error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Vui lòng nhập email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email không hợp lệ.";
  }
  return null;
}

export function validatePassword(password: string, isRegister = false): string | null {
  if (!password) return "Vui lòng nhập mật khẩu.";
  if (isRegister && password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Vui lòng nhập họ tên.";
  if (name.trim().length < 2) return "Họ tên quá ngắn.";
  return null;
}
