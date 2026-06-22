import imageCompression from "browser-image-compression";
import { Account, ID, Permission, Role } from "appwrite";
import { Camera, Mail, Phone, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getAppwriteClient,
  getStorage,
  isAppwriteConfigured,
} from "@/lib/appwrite";
import { getStorageFileIdFromUrl } from "@/lib/storage";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

const AVATAR_BUCKET_ID =
  import.meta.env.VITE_APPWRITE_AVATAR_BUCKET_ID?.trim() ?? "";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

interface ProfileTabProps {
  user: AuthUser;
}

async function getAvatarFilePermissions(): Promise<string[]> {
  const permissions = [Permission.read(Role.any())];

  try {
    const account = new Account(getAppwriteClient());
    const session = await account.get();
    permissions.push(Permission.write(Role.user(session.$id)));
  } catch {
    // Bucket-level permissions may still allow the upload.
  }

  return permissions;
}

async function prepareAvatarFile(file: File): Promise<File> {
  if (file.size <= MAX_FILE_SIZE_BYTES) {
    return file;
  }

  const compressedBlob = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 800,
    useWebWorker: true,
  });

  const compressedFile = new File([compressedBlob], file.name, {
    type: file.type,
  });

  if (compressedFile.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  return compressedFile;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const showToast = useUIStore((state) => state.showToast);
  const checkSession = useAuthStore((state) => state.checkSession);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.name);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const displayAvatarUrl = previewUrl || avatarUrl;

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!isAppwriteConfigured()) return;

    async function loadProfile() {
      try {
        const account = new Account(getAppwriteClient());
        const prefs = await account.getPrefs();

        const savedAvatarUrl =
          typeof prefs.avatarUrl === "string" ? prefs.avatarUrl.trim() : "";
        const savedPhone =
          typeof prefs.phone === "string" ? prefs.phone.trim() : "";

        if (savedAvatarUrl) {
          setAvatarUrl(savedAvatarUrl);
        }
        if (savedPhone) {
          setPhone(savedPhone);
        }
      } catch {
        // Profile prefs are optional.
      }
    }

    void loadProfile();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast({
        type: "error",
        message: "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.",
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  async function uploadAvatarFile(file: File): Promise<string> {
    if (!AVATAR_BUCKET_ID) {
      throw new Error("MISSING_BUCKET");
    }

    const fileToUpload = await prepareAvatarFile(file);
    const storage = getStorage();
    const fileId = ID.unique();
    const permissions = await getAvatarFilePermissions();

    await storage.createFile(
      AVATAR_BUCKET_ID,
      fileId,
      fileToUpload,
      permissions,
    );

    return storage.getFileView(AVATAR_BUCKET_ID, fileId);
  }

  async function handleSaveChanges(event: React.FormEvent) {
    event.preventDefault();

    if (!isAppwriteConfigured()) {
      showToast({
        type: "error",
        message: "Appwrite chưa được cấu hình.",
      });
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showToast({
        type: "error",
        message: "Vui lòng nhập họ và tên.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const account = new Account(getAppwriteClient());
      const prefs = await account.getPrefs();

      let nextAvatarUrl = avatarUrl;

      if (selectedFile) {
        if (avatarUrl) {
          const oldFileId = getStorageFileIdFromUrl(avatarUrl);

          if (oldFileId) {
            try {
              const storage = getStorage();
              await storage.deleteFile(AVATAR_BUCKET_ID, oldFileId);
            } catch (error) {
              console.warn(
                "Could not delete previous avatar file, continuing upload:",
                error,
              );
            }
          }
        }

        nextAvatarUrl = await uploadAvatarFile(selectedFile);
      }

      if (trimmedName !== user.name) {
        await account.updateName(trimmedName);
      }

      await account.updatePrefs({
        ...prefs,
        phone: trimmedPhone,
        avatarUrl: nextAvatarUrl,
      });

      setAvatarUrl(nextAvatarUrl);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await checkSession();

      showToast({
        type: "success",
        message: "Đã cập nhật thông tin cá nhân.",
      });
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error && error.message === "FILE_TOO_LARGE"
            ? "Ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn."
            : error instanceof Error && error.message === "MISSING_BUCKET"
              ? "Thiếu cấu hình VITE_APPWRITE_AVATAR_BUCKET_ID."
              : "Không thể lưu thông tin. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-orange-400/80">
          Hồ sơ
        </p>
        <h2 className="font-cinema mt-2 text-2xl font-bold text-white md:text-3xl">
          Thông tin cá nhân
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Cập nhật thông tin liên hệ và ảnh đại diện của bạn.
        </p>
      </header>

      <form
        onSubmit={handleSaveChanges}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 md:p-8"
      >
        <div className="flex flex-col items-center gap-4 border-b border-zinc-800 pb-8 sm:flex-row sm:items-start">
          <div className="relative">
            {displayAvatarUrl ? (
              <img
                src={displayAvatarUrl}
                alt="Ảnh đại diện"
                className="h-24 w-24 rounded-full object-cover ring-2 ring-zinc-700"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-2xl font-bold text-orange-300 ring-2 ring-zinc-700">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={triggerFilePicker}
              disabled={isSaving}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 transition hover:bg-zinc-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Đổi ảnh đại diện"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-white">Ảnh đại diện</p>
            <p className="mt-1 text-xs text-zinc-500">
              JPG, PNG hoặc WEBP. Tối đa 2MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <button
              type="button"
              onClick={triggerFilePicker}
              disabled={isSaving}
              className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Tải ảnh lên
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <User className="h-4 w-4 text-zinc-500" />
              Họ và tên
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
              placeholder="Nhập họ và tên"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Phone className="h-4 w-4 text-zinc-500" />
              Số điện thoại
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
              placeholder="0901 234 567"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-300">
              <Mail className="h-4 w-4 text-zinc-500" />
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
              placeholder="email@example.com"
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
