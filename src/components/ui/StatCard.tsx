"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export function StatCard({ label, value, trend, trendDirection = "neutral" }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-900 tabular-nums mt-1">
        {value}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium mt-2 ${
            trendDirection === "up"
              ? "text-emerald-600"
              : trendDirection === "down"
                ? "text-red-600"
                : "text-slate-400"
          }`}
        >
          {trendDirection === "up" && <ArrowUpRight size={14} strokeWidth={1.5} />}
          {trendDirection === "down" && <ArrowDownRight size={14} strokeWidth={1.5} />}
          {trend}
        </div>
      )}
    </div>
  );
}
