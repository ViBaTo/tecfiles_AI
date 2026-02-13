"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150 relative">
          <Search size={18} strokeWidth={1.5} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150 relative">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
