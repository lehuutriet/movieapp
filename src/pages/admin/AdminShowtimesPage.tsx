import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { ShowtimeStatus } from "@/types/showtime";
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminModal,
  AdminPageHeader,
  AdminSelect,
} from "@/components/admin/ui/admin-ui";
import {
  useAdminShowtimes,
  useAdminShowtimeOptions,
  useCreateShowtime,
  useDeleteShowtime,
} from "@/hooks/admin/use-admin-showtimes";
import { useUIStore } from "@/stores/ui-store";

const EMPTY_FORM = {
  movieId: "",
  cinemaId: "",
  startTime: "",
  basePrice: "",
  status: "scheduled" as ShowtimeStatus,
};
const SHOWTIME_STATUS_OPTIONS: ShowtimeStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
];
const SHOWTIME_STATUS_LABELS: Record<ShowtimeStatus, string> = {
  scheduled: "Đã lên lịch",
  completed: "Đã chiếu",
  cancelled: "Đã hủy",
};

export function AdminShowtimesPage() {
  const showToast = useUIStore((state) => state.showToast);
  const { data: showtimes = [], isLoading, isError } = useAdminShowtimes();
  const { movies, cinemas, isLoading: isOptionsLoading } =
    useAdminShowtimeOptions();
  const createMutation = useCreateShowtime();
  const deleteMutation = useDeleteShowtime();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showtimeToDelete, setShowtimeToDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const movie = movies.find((item) => item.$id === form.movieId);
    if (!form.movieId || !form.cinemaId || !form.startTime || !movie) {
      showToast({ type: "error", message: "Vui lòng chọn phim, rạp và giờ chiếu." });
      return;
    }

    try {
      await createMutation.mutateAsync({
        movieId: form.movieId,
        cinemaId: form.cinemaId,
        startTime: new Date(form.startTime).toISOString(),
        basePrice: Number(form.basePrice) || 85000,
        movieDuration: movie.duration,
        status: form.status,
      });

      showToast({ type: "success", message: "Đã tạo suất chiếu." });
      setModalOpen(false);
      setForm(EMPTY_FORM);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Không thể tạo suất chiếu.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      showToast({ type: "success", message: "Đã xóa suất chiếu." });
      setShowtimeToDelete(null);
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error ? error.message : "Không thể xóa suất chiếu.",
      });
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Quản lý Suất chiếu"
        description="Tạo và quản lý lịch chiếu phim tại các rạp"
        action={
          <AdminButton
            onClick={() => setModalOpen(true)}
            disabled={movies.length === 0 || cinemas.length === 0}
          >
            + Tạo suất chiếu
          </AdminButton>
        }
      />

      {(movies.length === 0 || cinemas.length === 0) && !isOptionsLoading && (
        <p className="mb-4 text-sm text-amber-700">
          Cần có ít nhất 1 phim và 1 rạp trước khi tạo suất chiếu.
        </p>
      )}

      <AdminCard className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Đang tải...</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-rose-600">
            Không tải được danh sách suất chiếu.
          </div>
        ) : showtimes.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có suất chiếu nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Phim</th>
                  <th className="px-4 py-3">Rạp</th>
                  <th className="px-4 py-3">Giờ chiếu</th>
                  <th className="px-4 py-3">Giá vé</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {showtimes.map((showtime) => {
                  const movieName =
                    movies.find((m) => m.$id === showtime.movieId)?.title ??
                    showtime.movieTitle;
                  const cinemaName =
                    cinemas.find((c) => c.$id === showtime.cinemaId)?.name ??
                    showtime.cinemaName;

                  return (
                    <tr key={showtime.$id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {movieName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {cinemaName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {showtime.displayTime}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {showtime.basePrice.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {SHOWTIME_STATUS_LABELS[showtime.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <AdminButton
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        onClick={() =>
                          setShowtimeToDelete({
                            id: showtime.$id,
                            label: `${showtime.movieTitle} - ${showtime.displayTime}`,
                          })
                        }
                      >
                        Xóa
                      </AdminButton>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      <AdminModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Tạo suất chiếu"
        description="Chọn phim, rạp và thời gian chiếu."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminSelect
            label="Phim *"
            value={form.movieId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, movieId: event.target.value }))
            }
            required
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((movie) => (
              <option key={movie.$id} value={movie.$id}>
                {movie.title}
              </option>
            ))}
          </AdminSelect>

          <AdminSelect
            label="Rạp *"
            value={form.cinemaId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, cinemaId: event.target.value }))
            }
            required
          >
            <option value="">-- Chọn rạp --</option>
            {cinemas.map((cinema) => (
              <option key={cinema.$id} value={cinema.$id}>
                {cinema.name} ({cinema.city})
              </option>
            ))}
          </AdminSelect>

          <AdminInput
            label="Giờ chiếu *"
            type="datetime-local"
            value={form.startTime}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, startTime: event.target.value }))
            }
            required
          />

          <AdminInput
            label="Giá vé cơ bản (VND)"
            type="number"
            min={0}
            step={1000}
            value={form.basePrice}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, basePrice: event.target.value }))
            }
            placeholder="85000"
          />
          <AdminSelect
            label="Trạng thái"
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                status: event.target.value as ShowtimeStatus,
              }))
            }
          >
            {SHOWTIME_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {SHOWTIME_STATUS_LABELS[status]}
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
            <AdminButton type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Đang lưu..." : "Tạo suất"}
            </AdminButton>
          </div>
        </form>
      </AdminModal>

      {showtimeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
              Xác nhận xóa suất chiếu
            </h3>
            <p className="mt-2 text-center text-sm text-slate-600">
              Bạn có chắc muốn xóa suất chiếu &quot;{showtimeToDelete.label}&quot;?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowtimeToDelete(null)}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleDelete(showtimeToDelete.id)
                }
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
