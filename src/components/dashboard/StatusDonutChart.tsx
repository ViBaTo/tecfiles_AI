"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { DatasheetStatus } from "@/lib/supabase/types";

const STATUS_COLORS: Record<DatasheetStatus, string> = {
  uploading: "#3b82f6",
  extracting: "#3b82f6",
  draft: "#94a3b8",
  review: "#f59e0b",
  approved: "#10b981",
  published: "#0ea5e9",
  error: "#ef4444",
};

const STATUS_LABELS: Record<DatasheetStatus, string> = {
  uploading: "Subiendo",
  extracting: "Extrayendo",
  draft: "Borrador",
  review: "En Revisión",
  approved: "Aprobado",
  published: "Publicado",
  error: "Error",
};

interface StatusDonutChartProps {
  statusCounts: Record<string, number>;
  total: number;
}

export function StatusDonutChart({ statusCounts, total }: StatusDonutChartProps) {
  const data = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_LABELS[status as DatasheetStatus] || status,
      value: count,
      color: STATUS_COLORS[status as DatasheetStatus] || "#94a3b8",
    }));

  const isEmpty = data.length === 0;

  if (isEmpty) {
    data.push({ name: "Sin datos", value: 1, color: "#e2e8f0" });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">Por Estado</h3>
      <p className="text-xs text-slate-500 mb-4">Distribución del catálogo</p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={data.length > 1 ? 3 : 0}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-semibold text-slate-900 tabular-nums">
              {isEmpty ? 0 : total}
            </div>
            <div className="text-xs text-slate-500">Total</div>
          </div>
        </div>
      </div>

      {!isEmpty && (
        <div className="mt-4 space-y-2">
          {Object.entries(statusCounts)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[status as DatasheetStatus] || "#94a3b8" }}
                  />
                  <span className="text-sm text-slate-600">
                    {STATUS_LABELS[status as DatasheetStatus] || status}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-900 tabular-nums">
                  {count}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
