export function ShowtimesListSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-12 rounded-xl bg-slate-900" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-slate-900" />
        ))}
      </div>
    </div>
  );
}

export function MovieShowtimesSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-36 rounded-2xl bg-slate-900" />
      <div className="h-12 rounded-xl bg-slate-900" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 rounded-2xl bg-slate-900" />
        ))}
      </div>
    </div>
  );
}

export function CinemasPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-4 py-8 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-slate-900" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-900" />
      </div>
    </div>
  );
}
