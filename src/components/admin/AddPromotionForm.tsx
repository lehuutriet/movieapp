import imageCompression from "browser-image-compression";
import { useEffect, useRef, useState } from "react";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui/admin-ui";
import { PROMOTION_CATEGORY_LABELS } from "@/data/mock-promotions";
import {
  useCreatePromotion,
  useUpdatePromotion,
} from "@/hooks/admin/use-admin-promotions";
import { cn } from "@/lib/cn";
import {
  formatDiscountLabel,
  getPromotionDiscountConfig,
} from "@/lib/promo-utils";
import { useUIStore } from "@/stores/ui-store";
import type {
  AdminPromotion,
  PromotionCategory,
} from "@/types/promotion";

const CATEGORY_OPTIONS: { value: PromotionCategory; label: string }[] = [
  { value: "ticket", label: PROMOTION_CATEGORY_LABELS.ticket },
  { value: "combo", label: PROMOTION_CATEGORY_LABELS.combo },
  { value: "member", label: PROMOTION_CATEGORY_LABELS.member },
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type FormState = {
  title: string;
  description: string;
  category: PromotionCategory;
  discountLabel: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  code: string;
  validUntil: string;
  termsText: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  category: "ticket",
  discountLabel: "",
  discountType: "percent",
  discountValue: "",
  code: "",
  validUntil: "",
  termsText: "",
  isActive: true,
};

function toDateInputValue(isoOrDate: string) {
  if (!isoOrDate) return "";
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formStateFromItem(item: AdminPromotion): FormState {
  const parsed = getPromotionDiscountConfig(item);

  return {
    title: item.title,
    description: item.description,
    category: item.category,
    discountLabel: item.discountLabel,
    discountType: parsed?.type ?? item.discountType ?? "percent",
    discountValue:
      parsed?.value !== undefined
        ? String(parsed.value)
        : item.discountValue !== undefined
          ? String(item.discountValue)
          : "",
    code: item.code ?? "",
    validUntil: toDateInputValue(item.validUntil),
    termsText: item.terms.join("\n"),
    isActive: item.isActive,
  };
}

function parseTerms(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

interface AddPromotionFormProps {
  editingItem?: AdminPromotion | null;
  onSuccess?: () => void;
  className?: string;
}

export function AddPromotionForm({
  editingItem = null,
  onSuccess,
  className,
}: AddPromotionFormProps) {
  const isEditing = Boolean(editingItem);
  const showToast = useUIStore((state) => state.showToast);
  const createMutation = useCreatePromotion();
  const updateMutation = useUpdatePromotion();
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
      setPreviewUrl(editingItem.imageUrl);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setForm(EMPTY_FORM);
    setPreviewUrl("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editingItem]);

  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      showToast({
        type: "error",
        message: "Vui lòng điền tiêu đề và mô tả.",
      });
      return;
    }

    const parsedDiscountValue = Number.parseFloat(form.discountValue);
    if (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0) {
      showToast({
        type: "error",
        message: "Vui lòng nhập giá trị giảm hợp lệ.",
      });
      return;
    }

    if (!form.code.trim()) {
      showToast({ type: "error", message: "Vui lòng nhập mã khuyến mãi." });
      return;
    }

    if (!form.validUntil) {
      showToast({ type: "error", message: "Vui lòng chọn ngày hết hạn." });
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      discountLabel:
        form.discountLabel.trim() ||
        formatDiscountLabel(form.discountType, parsedDiscountValue),
      discountType: form.discountType,
      discountValue: parsedDiscountValue,
      code: form.code.trim() || undefined,
      validUntil: new Date(form.validUntil).toISOString(),
      terms: parseTerms(form.termsText),
      isActive: form.isActive,
      imageUrl: editingItem?.imageUrl,
    };

    try {
      let imageFile: File | undefined;

      if (selectedFile) {
        setIsUploading(true);
        const compressedBlob = await imageCompression(selectedFile, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
        imageFile = new File([compressedBlob], selectedFile.name, {
          type: selectedFile.type,
        });
        setIsUploading(false);
      }

      if (isEditing && editingItem) {
        await updateMutation.mutateAsync({
          documentId: editingItem.id,
          input: payload,
          imageFile,
          previousImageUrl: editingItem.imageUrl,
        });
        showToast({ type: "success", message: "Đã cập nhật khuyến mãi." });
      } else {
        await createMutation.mutateAsync({
          input: payload,
          imageFile,
        });
        showToast({ type: "success", message: "Đã thêm khuyến mãi mới." });
      }

      onSuccess?.();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể lưu khuyến mãi.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AdminCard className={cn("p-6", className)}>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <AdminInput
            label="Tiêu đề *"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="VD: Thứ 3 Vui Vẻ"
            required
          />
          <AdminInput
            label="Nhãn hiển thị"
            value={form.discountLabel}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                discountLabel: event.target.value,
              }))
            }
            placeholder="Tự điền từ loại & giá trị giảm"
          />
        </div>

        <AdminTextarea
          label="Mô tả *"
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          rows={3}
          placeholder="Mô tả ngắn về chương trình khuyến mãi"
          required
        />

        <div className="grid gap-5 md:grid-cols-3">
          <AdminSelect
            label="Loại giảm giá"
            value={form.discountType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                discountType: event.target.value as "percent" | "fixed",
              }))
            }
          >
            <option value="percent">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định (đ)</option>
          </AdminSelect>

          <AdminInput
            label="Giá trị giảm *"
            type="number"
            min={1}
            value={form.discountValue}
            onChange={(event) =>
              setForm((current) => ({ ...current, discountValue: event.target.value }))
            }
            placeholder={form.discountType === "percent" ? "VD: 30" : "VD: 50000"}
            required
          />

          <AdminInput
            label="Mã khuyến mãi *"
            value={form.code}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                code: event.target.value.toUpperCase(),
              }))
            }
            placeholder="VD: T3VUIVE"
            required
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <AdminSelect
            label="Danh mục"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as PromotionCategory,
              }))
            }
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </AdminSelect>

          <AdminInput
            label="Hết hạn *"
            type="date"
            value={form.validUntil}
            onChange={(event) =>
              setForm((current) => ({ ...current, validUntil: event.target.value }))
            }
            required
          />
        </div>

        <AdminTextarea
          label="Điều kiện áp dụng"
          value={form.termsText}
          onChange={(event) =>
            setForm((current) => ({ ...current, termsText: event.target.value }))
          }
          rows={4}
          placeholder="Mỗi dòng một điều kiện"
        />

        <div>
          <span className="text-sm font-medium text-slate-700">Ảnh banner</span>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Xem trước banner"
                className="h-24 w-40 rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-24 w-40 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500">
                Chưa có ảnh
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={(event) => void handleFileChange(event)}
              className="block text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Hiển thị trên trang khuyến mãi
        </label>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <AdminButton type="submit" disabled={isSubmitting}>
            {isUploading
              ? "Đang nén ảnh..."
              : isSubmitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật khuyến mãi"
                  : "Thêm khuyến mãi"}
          </AdminButton>
        </div>
      </form>
    </AdminCard>
  );
}
