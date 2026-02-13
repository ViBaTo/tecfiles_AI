"use client";

import type { DatasheetStatus } from "@/lib/supabase/types";

const ESTADOS: Record<
  DatasheetStatus,
  { label: string; classes: string }
> = {
  uploading: {
    label: "Subiendo",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  extracting: {
    label: "Extrayendo",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Borrador",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
  review: {
    label: "En Revisión",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
  },
  approved: {
    label: "Aprobado",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  published: {
    label: "Publicado",
    classes: "bg-sky-50 text-sky-700 border-sky-200",
  },
  error: {
    label: "Error",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

interface EstadoBadgeProps {
  estado: DatasheetStatus;
  size?: "sm" | "md";
}

export function EstadoBadge({ estado, size = "sm" }: EstadoBadgeProps) {
  const config = ESTADOS[estado] || ESTADOS.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${config.classes} ${
        size === "sm" ? "text-[11px] px-2.5 py-0.5" : "text-xs px-3 py-1"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}
