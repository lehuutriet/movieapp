import imageCompression from "browser-image-compression";
import { useEffect, useRef, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui/admin-ui";
import {
  useCreateConcession,
  useUpdateConcession,
} from "@/hooks/admin/use-admin-concessions";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/stores/ui-store";
import type {
  AdminConcessionItem,
  ConcessionCategory,
  ConcessionItem,
} from "@/types/concession";

const CATEGORY_OPTIONS: {
  value: ConcessionCategory;
  label: string;
}[] = [
  { value: "popcorn", label: "Bắp rang (popcorn)" },
  { value: "drinks", label: "Thức uống (drinks)" },
  { value: "combos", label: "Combo (combos)" },
  { value: "snacks", label: "Đồ ăn vặt (snacks)" },
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FormState = {
  name: string;
  description: string;
  category: ConcessionCategory;
  price: string;
  emoji: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  category: "popcorn",
  price: "",
  emoji: "🍿",
  isActive: true,
};

function formStateFromItem(item: AdminConcessionItem): FormState {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    price: String(item.price),
    emoji: item.emoji,
    isActive: item.isActive,
  };
}

interface AddConcessionFormProps {
  editingItem?: AdminConcessionItem | null;
  onSuccess?: (item: ConcessionItem) => void;
  className?: string;
}

export function AddConcessionForm({
  editingItem = null,
  onSuccess,
  className,
}: AddConcessionFormProps) {
  const isEditing = Boolean(editingItem);
  const showToast = useUIStore((state) => state.showToast);
  const createMutation = useCreateConcession();
  const updateMutation = useUpdateConcession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || isUploading;

  useEffect(() => {
    if (editingItem) {
      setForm(formStateFromItem(editingItem));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setForm(EMPTY_FORM);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editingItem]);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(editingItem?.imageUrl ?? "");
  }, [selectedFile, editingItem?.imageUrl]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    if (editingItem) {
      setForm(formStateFromItem(editingItem));
    } else {
      setForm(EMPTY_FORM);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      showToast({
        type: "error",
        message: "Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.",
      });
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    const parsedPrice = Number.parseInt(form.price, 10);

    if (!name || !description) {
      showToast({
        type: "error",
        message: "Vui lòng nhập tên và mô tả món.",
      });
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      showToast({
        type: "error",
        message: "Giá phải là số nguyên dương (VND).",
      });
      return;
    }

    const payload = {
      name,
      description,
      category: form.category,
      price: parsedPrice,
      emoji: form.emoji.trim() || "🍿",
      isActive: form.isActive,
      imageUrl: editingItem?.imageUrl,
    };

    try {
      let imageFile: File | undefined;

      if (selectedFile) {
        setIsUploading(true);
        const compressedBlob = await imageCompression(selectedFile, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
        imageFile = new File([compressedBlob], selectedFile.name, {
          type: selectedFile.type,
        });
        setIsUploading(false);
      }

      const saved = isEditing
        ? await updateMutation.mutateAsync({
            documentId: editingItem!.id,
            input: payload,
            imageFile,
            previousImageUrl: editingItem?.imageUrl,
          })
        : await createMutation.mutateAsync({
            input: payload,
            imageFile,
          });

      showToast({
        type: "success",
        message: isEditing
          ? `Đã cập nhật "${saved.name}".`
          : `Đã thêm "${saved.name}" vào thực đơn.`,
      });

      if (!isEditing) {
        setForm(EMPTY_FORM);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      onSuccess?.(saved);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : isEditing
              ? "Không thể cập nhật món. Vui lòng thử lại."
              : "Không thể tạo món. Vui lòng thử lại.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminCard className={cn("p-6", className)}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminInput
            label="Tên món *"
            name="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="VD: Bắp rang bơ"
            required
            disabled={isSubmitting}
          />

          <AdminSelect
            label="Danh mục *"
            name="category"
            value={form.category}
            onChange={(event) =>
              updateField("category", event.target.value as ConcessionCategory)
            }
            required
            disabled={isSubmitting}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>
        </div>

        <AdminTextarea
          label="Mô tả *"
          name="description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Mô tả ngắn hiển thị trên thực đơn khách hàng"
          rows={3}
          required
          disabled={isSubmitting}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <AdminInput
            label="Giá (VND) *"
            name="price"
            type="number"
            min={1}
            step={1000}
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            placeholder="VD: 45000"
            required
            disabled={isSubmitting}
          />

          <AdminInput
            label="Emoji (dự phòng khi chưa có ảnh)"
            name="emoji"
            value={form.emoji}
            onChange={(event) => updateField("emoji", event.target.value)}
            placeholder="🍿"
            maxLength={4}
            disabled={isSubmitting}
          />
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Hình ảnh món
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileChange}
              disabled={isSubmitting}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </label>

          {previewUrl && (
            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
              <img
                src={previewUrl}
                alt="Xem trước hình món"
                className="mx-auto max-h-48 w-full object-contain"
              />
            </div>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={(event) => updateField("isActive", event.target.checked)}
            disabled={isSubmitting}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-slate-700">
            Hiển thị trên thực đơn khách hàng{" "}
            <span className="text-slate-500">(isActive)</span>
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <AdminButton type="submit" disabled={isSubmitting}>
            {isUploading
              ? "Đang nén ảnh..."
              : isSubmitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật món"
                  : "Thêm món"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Đặt lại
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}
