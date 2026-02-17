export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 py-4">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-100 rounded mt-2" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-5"
          >
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="h-7 w-16 bg-slate-100 rounded mt-3" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-100 rounded" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4">
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
