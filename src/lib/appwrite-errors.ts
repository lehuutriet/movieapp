import { AppwriteException } from "appwrite";

export function getAppwriteErrorMessage(error: unknown): string {
  if (error instanceof AppwriteException) {
    return error.message || "Lỗi Appwrite không xác định.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export function getUnknownAppwriteAttribute(error: unknown): string | null {
  if (!(error instanceof AppwriteException)) {
    return null;
  }

  const match = error.message.match(/Unknown attribute: "([^"]+)"/i);
  return match?.[1] ?? null;
}
