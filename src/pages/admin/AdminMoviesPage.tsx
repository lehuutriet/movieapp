import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import type { Movie, MovieStatus } from "@/types/movie";
import {
  AdminButton,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/ui/admin-ui";
import {
  useAdminMovies,
  useCreateMovie,
  useDeleteMovie,
  useUpdateMovie,
} from "@/hooks/admin/use-admin-movies";
import { slugify } from "@/lib/slugify";
import { APPWRITE_CONFIG } from "@/lib/appwrite";
import {
  deleteStorageFileById,
  deleteStorageFileByUrl,
  getStorageFileIdFromUrl,
  uploadImageFile,
} from "@/lib/storage";
import { useUIStore } from "@/stores/ui-store";

const STATUS_OPTIONS: MovieStatus[] = ["now_showing", "coming_soon", "ended"];
const STATUS_LABELS: Record<MovieStatus, string> = {
  now_showing: "Đang chiếu",
  coming_soon: "Sắp chiếu",
  ended: "Ngưng chiếu",
};
const STATUS_BADGE_STYLES: Record<MovieStatus, string> = {
  now_showing: "bg-green-100 text-green-700",
  coming_soon: "bg-yellow-100 text-yellow-700",
  ended: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  title: "",
  slug: "",
  posterUrl: "",
  synopsis: "",
  trailerUrl: "",
  releaseDate: "",
  duration: "",
  status: "now_showing" as MovieStatus,
};

export function AdminMoviesPage() {
  const showToast = useUIStore((state) => state.showToast);
  const { data: movies = [], isLoading, isError } = useAdminMovies();
  const createMutation = useCreateMovie();
  const updateMutation = useUpdateMovie();
  const deleteMutation = useDeleteMovie();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [replacedFileId, setReplacedFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(form.posterUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, form.posterUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const title = form.title.trim();
    const slug = form.slug.trim();
    const synopsis = form.synopsis.trim();
    const trailerUrl = form.trailerUrl.trim();
    const releaseDateInput = form.releaseDate.trim();
    const parsedDuration = Number.parseInt(form.duration, 10);
    const duration = Number.isNaN(parsedDuration) ? 0 : parsedDuration;

    if (!title || !slug || !releaseDateInput) {
      showToast({ type: "error", message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
      return;
    }
    const releaseDate = new Date(releaseDateInput).toISOString();
    if (Number.isNaN(new Date(releaseDateInput).getTime())) {
      showToast({ type: "error", message: "Ngày phát hành không hợp lệ." });
      return;
    }

    try {
      if (!APPWRITE_CONFIG.bucketId) {
        throw new Error("Thiếu cấu hình VITE_APPWRITE_BUCKET_ID.");
      }

      let posterUrl = form.posterUrl;
      let uploadedFileId: string | undefined;

      if (selectedFile) {
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
        posterUrl = uploadResult.url;
      }

      if (!posterUrl) {
        showToast({ type: "error", message: "Vui lòng chọn ảnh poster." });
        return;
      }

      const payload = {
        title,
        slug,
        posterUrl,
        backdropUrl: posterUrl,
        synopsis,
        trailerUrl: trailerUrl || undefined,
        releaseDate,
        duration,
        status: form.status,
      };

      if (editingMovieId) {
        await updateMutation.mutateAsync({ id: editingMovieId, input: payload });
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
                "Phim đã cập nhật nhưng không xóa được ảnh cũ trong Storage. Kiểm tra quyền Delete của bucket trên Appwrite.",
            });
          }
        }
        showToast({ type: "success", message: "Đã cập nhật phim." });
      } else {
        await createMutation.mutateAsync(payload);
        showToast({ type: "success", message: "Đã thêm phim mới." });
      }

      setModalOpen(false);
      setForm(EMPTY_FORM);
      setSelectedFile(null);
      setEditingMovieId(null);
      setReplacedFileId(null);
    } catch (error) {
      const errorResponse =
        typeof error === "object" &&
        error !== null &&
        "response" in error
          ? (error as { response?: unknown }).response
          : undefined;
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tạo phim.";

      console.log("Create movie failed:", errorResponse ?? error);
      showToast({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    setEditingMovieId(null);
    setForm(EMPTY_FORM);
    setSelectedFile(null);
    setReplacedFileId(null);
    setModalOpen(true);
  };

  const handleEdit = (movie: Movie) => {
    const releaseDate = new Date(movie.releaseDate);
    setEditingMovieId(movie.$id);
    setReplacedFileId(getStorageFileIdFromUrl(movie.posterUrl) ?? null);
    setForm({
      title: movie.title,
      slug: movie.slug,
      posterUrl: movie.posterUrl,
      synopsis: movie.synopsis,
      trailerUrl: movie.trailerUrl ?? "",
      releaseDate: Number.isNaN(releaseDate.getTime())
        ? ""
        : releaseDate.toISOString().slice(0, 10),
      duration: String(movie.duration),
      status: movie.status,
    });
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleDeleteMovie = async (movie: Movie) => {
    try {
      const deleted = await deleteStorageFileByUrl(movie.posterUrl);
      if (!deleted && movie.posterUrl) {
        showToast({
          type: "warning",
          message:
            "Không xóa được ảnh poster trong Storage. Kiểm tra quyền Delete của bucket trên Appwrite.",
        });
      }

      await deleteMutation.mutateAsync(movie.$id);
      showToast({ type: "success", message: "Đã xóa phim." });
      setMovieToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "Không thể xóa phim.",
      });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Phim"
        description="Thêm và quản lý danh sách phim trên hệ thống"
        action={
          <AdminButton onClick={handleCreate}>+ Thêm Phim mới</AdminButton>
        }
      />

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-600">
            Không tải được danh sách phim. Kiểm tra cấu hình Appwrite.
          </div>
        ) : movies.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có phim nào. Bấm &quot;Thêm Phim mới&quot; để bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3.5">Poster</th>
                  <th className="px-4 py-3.5">Tên phim</th>
                  <th className="px-4 py-3.5">Thời lượng</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movies.map((movie) => (
                  <tr key={movie.$id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="h-16 w-12 rounded-md object-cover shadow-sm"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {movie.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {movie.duration} phút
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_STYLES[movie.status]}`}
                      >
                        {STATUS_LABELS[movie.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Sửa phim ${movie.title}`}
                          className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                          onClick={() => handleEdit(movie)}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xóa phim ${movie.title}`}
                          className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                          onClick={() => setMovieToDelete(movie)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editingMovieId ? "Sửa phim" : "Thêm phim mới"}
        description={
          editingMovieId
            ? "Cập nhật thông tin phim trên Appwrite."
            : "Nhập thông tin phim để tạo document trên Appwrite."
        }
        closeOnBackdrop={false}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Tên phim *"
            value={form.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            required
          />
          <AdminInput
            label="Slug *"
            value={form.slug}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slug: event.target.value }))
            }
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Ảnh poster *
            </label>
            {!selectedFile ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!editingMovieId && !form.posterUrl}
                className="block w-full cursor-pointer rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:border-slate-400"
              />
            ) : null}
            {previewUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Poster preview"
                  className="h-20 w-14 rounded border border-slate-200 object-cover"
                />
                <AdminButton
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    setSelectedFile(null);
                    setForm((prev) => ({ ...prev, posterUrl: "" }));
                  }}
                >
                  Đổi ảnh khác
                </AdminButton>
              </div>
            ) : null}
          </div>
          <AdminTextarea
            label="Synopsis"
            rows={3}
            value={form.synopsis}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, synopsis: event.target.value }))
            }
          />
          <AdminInput
            label="Link Trailer YouTube (Tùy chọn)"
            type="text"
            value={form.trailerUrl}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, trailerUrl: event.target.value }))
            }
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminInput
              label="Ngày phát hành"
              type="date"
              value={form.releaseDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, releaseDate: event.target.value }))
              }
            />
            <AdminInput
              label="Thời lượng (phút)"
              type="number"
              min={1}
              value={form.duration}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, duration: event.target.value }))
              }
            />
          </div>
          <AdminSelect
            label="Trạng thái"
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                status: event.target.value as MovieStatus,
              }))
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </AdminSelect>

          <div className="flex justify-end gap-2 pt-2">
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </AdminButton>
            <AdminButton
              type="submit"
              disabled={
                createMutation.isPending || updateMutation.isPending || isUploading
              }
            >
              {isUploading
                ? "Đang tải ảnh lên..."
                : createMutation.isPending || updateMutation.isPending
                  ? "Đang lưu..."
                  : editingMovieId
                    ? "Cập nhật phim"
                    : "Tạo phim"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {movieToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
              Xác nhận xóa phim
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Bạn có chắc muốn xóa phim &quot;{movieToDelete.title}&quot;?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMovieToDelete(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteMovie(movieToDelete)}
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
