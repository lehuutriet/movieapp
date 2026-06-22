import { useRef, useState } from "react";
import { buildNext7Days } from "@/lib/date-utils";
import { cn } from "@/lib/cn";
import {
  CITY_OPTIONS,
  usePreferenceStore,
  type CityOption,
} from "@/stores/preference-store";

interface ShowtimesFiltersProps {
  selectedDate: string;
  onDateChange: (dateKey: string) => void;
  className?: string;
  layout?: "horizontal" | "sidebar";
}

export function ShowtimesFilters({
  selectedDate,
  onDateChange,
  className,
  layout = "horizontal",
}: ShowtimesFiltersProps) {
  const currentCity = usePreferenceStore((state) => state.currentCity);
  const setCurrentCity = usePreferenceStore((state) => state.setCurrentCity);
  const dateOptions = buildNext7Days();
  const isSidebar = layout === "sidebar";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (event: React.MouseEvent) => {
    if (!scrollRef.current || isSidebar) return;
    setIsDragging(true);
    setStartX(event.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => setIsDragging(false);

  const onMouseUp = () => setIsDragging(false);

  const onMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current || isSidebar) return;
    event.preventDefault();
    const x = event.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const dateButtonClass = (isActive: boolean) =>
    cn(
      "select-none whitespace-nowrap rounded-xl text-sm transition-all",
      isSidebar ? "w-full px-4 py-3 text-left" : "shrink-0 px-4 py-2.5",
      isActive
        ? "bg-red-600 font-bold text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
        : "border border-slate-700/50 bg-slate-800/50 font-medium text-gray-400 hover:bg-slate-700 hover:text-white",
    );

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Chọn ngày
        </p>
        <div
          ref={isSidebar ? undefined : scrollRef}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          className={cn(
            isSidebar
              ? "flex flex-col gap-2"
              : cn(
                  "flex w-full items-center justify-start gap-3 overflow-x-auto scroll-smooth py-2 scrollbar-hide",
                  isDragging ? "cursor-grabbing" : "cursor-grab active:cursor-grabbing",
                ),
          )}
        >
          {dateOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onDateChange(option.key)}
              className={dateButtonClass(selectedDate === option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="city-select"
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          Khu vực
        </label>
        <select
          id="city-select"
          value={currentCity}
          onChange={(event) => setCurrentCity(event.target.value as CityOption)}
          className={cn(
            "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500",
            !isSidebar && "md:w-64",
          )}
        >
          {CITY_OPTIONS.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
