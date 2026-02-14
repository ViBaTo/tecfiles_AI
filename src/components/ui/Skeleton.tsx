"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div className={`bg-slate-100 animate-pulse rounded-md ${className}`} style={style} />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? "w-32" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-20 mb-4" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

// ── Skeleton for Ficha Detail Page ───────────────
function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FichaDetailSkeleton() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-4">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex items-center justify-between py-4 mb-6">
        <div>
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Split panel skeleton */}
      <div className="flex gap-6 items-start">
        {/* Left: PDF viewer */}
        <div className="w-1/2 shrink-0 hidden lg:block">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="w-full" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }} />
          </div>
        </div>

        {/* Right: Data sections */}
        <div className="flex-1 space-y-5">
          <SectionSkeleton rows={3} />
          <SectionSkeleton rows={4} />
          <SectionSkeleton rows={3} />
          <SectionSkeleton rows={2} />
        </div>
      </div>
    </div>
  );
}
