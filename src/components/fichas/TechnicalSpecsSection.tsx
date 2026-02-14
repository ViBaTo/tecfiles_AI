"use client";

import { useState } from "react";
import { Cpu, ChevronDown } from "lucide-react";
import { formatValue, isLongValue } from "@/lib/formatters";

interface TechnicalSpecsSectionProps {
  specs: Record<string, unknown>;
}

export function TechnicalSpecsSection({ specs }: TechnicalSpecsSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const entries = Object.entries(specs).filter(
    ([, v]) => v !== null && v !== undefined
  );

  if (entries.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full px-5 py-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50/50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <Cpu size={15} strokeWidth={1.5} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">
            Especificaciones Técnicas
          </h3>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {entries.length}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={`text-slate-400 transition-transform duration-200 ${
            collapsed ? "-rotate-90" : ""
          }`}
        />
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            {entries.map(([key, value]) => {
              const long = isLongValue(value);
              const displayValue = formatValue(value);

              return (
                <div
                  key={key}
                  className={`py-2.5 px-3 rounded-lg bg-slate-50 ${
                    long ? "col-span-2" : ""
                  }`}
                >
                  <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`block text-sm font-medium text-slate-900 ${
                      long
                        ? "whitespace-pre-wrap wrap-break-word max-h-32 overflow-y-auto"
                        : "font-mono tabular-nums"
                    }`}
                  >
                    {displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
