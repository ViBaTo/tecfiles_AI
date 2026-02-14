"use client";

import { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";

interface ComponentsSectionProps {
  components: string[];
}

export function ComponentsSection({ components }: ComponentsSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (components.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full px-5 py-3 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50/50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <Layers size={15} strokeWidth={1.5} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Componentes</h3>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {components.length}
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
          <ul className="space-y-1.5">
            {components.map((comp, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-slate-700 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition-colors duration-100"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-500 tabular-nums shrink-0">
                  {i + 1}
                </span>
                <span className="truncate">{comp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
