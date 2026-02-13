"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-slate-100 animate-pulse rounded-md ${className}`} />
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
