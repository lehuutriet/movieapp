import { Account, ID, Permission, Role } from "appwrite";
import { APPWRITE_CONFIG, getAppwriteClient, getStorage } from "./appwrite";

export function getStorageFileIdFromUrl(fileUrl: string): string | undefined {
  const trimmed = fileUrl.trim();
  if (!trimmed) {
    return undefined;
  }

  const match = trimmed.match(/\/files\/([^/?#]+)/);
  return match?.[1];
}

async function getImageFilePermissions(): Promise<string[]> {
  const permissions = [Permission.read(Role.any())];

  try {
    const account = new Account(getAppwriteClient());
    const user = await account.get();
    permissions.push(Permission.write(Role.user(user.$id)));
  } catch {
    // Upload may still work with bucket-level permissions.
  }

  permissions.push(
    Permission.write(Role.label("admin")),
    Permission.write(Role.users()),
  );

  return permissions;
}

export function getStorageFileViewUrl(fileId: string): string {
  if (!APPWRITE_CONFIG.bucketId) {
    throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
  }

  return getStorage().getFileView(APPWRITE_CONFIG.bucketId, fileId);
}

export async function uploadImageFile(
  file: File,
): Promise<{ fileId: string; url: string }> {
  if (!APPWRITE_CONFIG.bucketId) {
    throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
  }

  const permissions = await getImageFilePermissions();
  const fileId = ID.unique();
  const storage = getStorage();

  await storage.createFile(
    APPWRITE_CONFIG.bucketId,
    fileId,
    file,
    permissions,
  );

  return {
    fileId,
    url: getStorageFileViewUrl(fileId),
  };
}

export async function deleteStorageFileById(fileId: string): Promise<boolean> {
  if (!APPWRITE_CONFIG.bucketId || !fileId) {
    return false;
  }

  const bucketId = APPWRITE_CONFIG.bucketId;
  const storage = getStorage();

  try {
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (firstError) {
    console.log(
      "Delete storage file failed, retrying after permission update:",
      firstError,
    );
  }

  try {
    const permissions = await getImageFilePermissions();
    await storage.updateFile(bucketId, fileId, undefined, permissions);
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (error) {
    console.error("Delete storage file failed:", error);
    return false;
  }
}

export async function deleteStorageFileByUrl(fileUrl: string): Promise<boolean> {
  const fileId = getStorageFileIdFromUrl(fileUrl);
  if (!fileId) {
    console.warn("Could not parse storage file ID from URL:", fileUrl);
    return false;
  }

  return deleteStorageFileById(fileId);
}
