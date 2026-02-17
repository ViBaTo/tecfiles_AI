"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Datasheet } from "@/lib/supabase/types";

interface DatasheetsLineChartProps {
  datasheets: Datasheet[];
}

function getLast30DaysData(datasheets: Datasheet[]) {
  const now = new Date();
  const days: { date: string; label: string; count: number }[] = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const day = d.getDate();
    const month = d.toLocaleDateString("es-ES", { month: "short" });
    days.push({
      date: dateKey,
      label: `${day} ${month}`,
      count: 0,
    });
  }

  for (const ds of datasheets) {
    const dateKey = new Date(ds.created_at).toISOString().split("T")[0];
    const entry = days.find((d) => d.date === dateKey);
    if (entry) {
      entry.count += 1;
    }
  }

  return days;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900">
        {payload[0].value} {payload[0].value === 1 ? "ficha" : "fichas"}
      </p>
    </div>
  );
}

export function DatasheetsLineChart({ datasheets }: DatasheetsLineChartProps) {
  const chartData = useMemo(() => getLast30DaysData(datasheets), [datasheets]);

  const totalPeriod = chartData.reduce((sum, d) => sum + d.count, 0);
  const maxValue = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">Fichas Creadas</h3>
        <span className="text-sm font-semibold text-slate-900 tabular-nums">
          {totalPeriod}
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4">Últimos 30 días</p>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorFichas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            interval={Math.floor(chartData.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={[0, maxValue + 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorFichas)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#10b981",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
