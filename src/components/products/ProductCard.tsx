"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import type { Datasheet } from "@/lib/supabase/types";

interface ProductCardProps {
  product: Datasheet;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 30) return `Hace ${diffDays}d`;
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <Link
      href={`/fichas/${product.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:border-[#1e3a5f]/40 hover:shadow-sm transition-all duration-150 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {product.article_name || "Sin nombre"}
          </h3>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            {product.project_code || "-"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150 opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      </div>

      {/* Category tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {product.material && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
            {product.material}
          </span>
        )}
        {product.finish && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-600">
            {product.finish}
          </span>
        )}
      </div>

      {/* Status + timestamp */}
      <div className="flex items-center justify-between">
        <EstadoBadge estado={product.status} />
        <span className="text-[11px] text-slate-400">
          {formatRelativeTime(product.updated_at || product.created_at)}
        </span>
      </div>
    </Link>
  );
}
