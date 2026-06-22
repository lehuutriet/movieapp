import { Search } from "lucide-react";

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm md:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          admin cinestar
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            readOnly
            placeholder="Tìm kiếm phim, rạp, suất chiếu..."
            className="w-72 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            AD
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">Cine Hall Admin</p>
            <p className="text-xs text-slate-500">Quản trị hệ thống</p>
          </div>
        </div>
      </div>
    </header>
  );
}
