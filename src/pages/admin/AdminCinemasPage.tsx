import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { AlertTriangle } from "lucide-react";
import type { Cinema } from "@/types/showtime";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
} from "@/components/admin/ui/admin-ui";
import {
  useAdminCinemas,
  useCreateCinema,
  useDeleteCinema,
  useUpdateCinema,
} from "@/hooks/admin/use-admin-cinemas";
import { slugify } from "@/lib/slugify";
import {
  deleteStorageFileById,
  deleteStorageFileByUrl,
  getStorageFileIdFromUrl,
  uploadImageFile,
} from "@/lib/storage";
import { APPWRITE_CONFIG } from "@/lib/appwrite";
import { CITY_OPTIONS, type CityOption } from "@/stores/preference-store";
import { useUIStore } from "@/stores/ui-store";

const EMPTY_FORM: {
  name: string;
  slug: string;
  address: string;
  city: CityOption;
  district: string;
  imageUrl?: string;
} = {
  name: "",
  slug: "",
  address: "",
  city: CITY_OPTIONS[0],
  district: "",
  imageUrl: undefined,
};

export function AdminCinemasPage() {
  const showToast = useUIStore((state) => state.showToast);
  const { data: cinemas = [], isLoading, isError } = useAdminCinemas();
  const createMutation = useCreateCinema();
  const updateMutation = useUpdateCinema();
  const deleteMutation = useDeleteCinema();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cinemaToDelete, setCinemaToDelete] = useState<Cinema | null>(null);
  const [replacedFileId, setReplacedFileId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(form.imageUrl ?? "");
    return undefined;
  }, [selectedFile, form.imageUrl]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setReplacedFileId(null);
    setModalOpen(true);
  };

  const openEdit = (cinema: Cinema) => {
    setEditingId(cinema.$id);
    setReplacedFileId(
      cinema.imageUrl ? getStorageFileIdFromUrl(cinema.imageUrl) ?? null : null,
    );
    setForm({
      name: cinema.name,
      slug: cinema.slug,
      address: cinema.address,
      city: cinema.city as CityOption,
      district: cinema.district,
      imageUrl: cinema.imageUrl ?? "",
    });
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : prev.slug || slugify(name),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.address || !form.city) {
      showToast({ type: "error", message: "Vui lòng điền đầy đủ thông tin." });
      return;
    }

    let imageUrl = form.imageUrl?.trim() || undefined;
    let uploadedFileId: string | undefined;

    try {
      if (selectedFile) {
        if (!APPWRITE_CONFIG.bucketId) {
          throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
        }

        setIsUploading(true);
        const compressedBlob = await imageCompression(selectedFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const fileToUpload = new File([compressedBlob], selectedFile.name, {
          type: selectedFile.type,
        });

        const uploadResult = await uploadImageFile(fileToUpload);
        uploadedFileId = uploadResult.fileId;
        imageUrl = uploadResult.url;
      }

      const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      address: form.address.trim(),
      city: form.city,
      district: form.district.trim(),
        imageUrl,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, input: payload });
        if (
          selectedFile &&
          replacedFileId &&
          replacedFileId !== uploadedFileId
        ) {
          const deleted = await deleteStorageFileById(replacedFileId);
          if (!deleted) {
            showToast({
              type: "warning",
              message:
                "Rạp đã cập nhật nhưng không xóa được ảnh cũ trong Storage. Kiểm tra quyền Delete của bucket trên Appwrite.",
            });
          }
        }
        showToast({ type: "success", message: "Đã cập nhật rạp." });
      } else {
        await createMutation.mutateAsync(payload);
        showToast({ type: "success", message: "Đã thêm rạp mới." });
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      setSelectedFile(null);
      setReplacedFileId(null);
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể lưu rạp.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (cinema: Cinema) => {
    try {
      if (cinema.imageUrl) {
        const deleted = await deleteStorageFileByUrl(cinema.imageUrl);
        if (!deleted) {
          showToast({
            type: "warning",
            message:
              "Không xóa được ảnh rạp trong Storage. Kiểm tra quyền Delete của bucket trên Appwrite.",
          });
        }
      }

      await deleteMutation.mutateAsync(cinema.$id);
      showToast({ type: "success", message: "Đã xóa rạp." });
      setCinemaToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể xóa rạp.",
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending || isUploading;

  return (
    <div>
      <AdminPageHeader
        title="Rạp"
        description="Thêm và chỉnh sửa thông tin cụm rạp"
        action={<AdminButton onClick={openCreate}>+ Thêm Rạp</AdminButton>}
      />

      <AdminCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-600">
            Không tải được danh sách rạp.
          </div>
        ) : cinemas.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có rạp nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tên rạp</th>
                  <th className="px-4 py-3">Địa chỉ</th>
                  <th className="px-4 py-3">Thành phố</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cinemas.map((cinema) => (
                  <tr key={cinema.$id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {cinema.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{cinema.address}</td>
                    <td className="px-4 py-3 text-slate-600">{cinema.city}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <AdminButton
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => openEdit(cinema)}
                        >
                          Sửa
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => setCinemaToDelete(cinema)}
                        >
                          Xóa
                        </AdminButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingId ? "Sửa rạp" : "Thêm rạp mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Tên rạp *"
            value={form.name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
          />
          <AdminInput
            label="Slug"
            value={form.slug}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slug: event.target.value }))
            }
          />
          <AdminInput
            label="Địa chỉ *"
            value={form.address}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, address: event.target.value }))
            }
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect
              label="Thành phố *"
              value={form.city}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  city: event.target.value as CityOption,
                }))
              }
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </AdminSelect>
            <AdminInput
              label="Quận / Huyện"
              value={form.district}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, district: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Ảnh rạp
            </label>
            {!selectedFile ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:border-slate-400"
              />
            ) : null}
            {previewUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Cinema preview"
                  className="h-20 w-28 rounded border border-slate-200 object-cover"
                />
                <AdminButton
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    setSelectedFile(null);
                    setForm((prev) => ({ ...prev, imageUrl: undefined }));
                  }}
                >
                  Đổi ảnh khác
                </AdminButton>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </AdminButton>
            <AdminButton type="submit" disabled={isSaving}>
              {isUploading
                ? "Đang tải ảnh lên..."
                : isSaving
                  ? "Đang lưu..."
                  : editingId
                    ? "Cập nhật"
                    : "Tạo rạp"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {cinemaToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
              Xác nhận xóa rạp
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Bạn có chắc muốn xóa rạp &quot;{cinemaToDelete.name}&quot;?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCinemaToDelete(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(cinemaToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
