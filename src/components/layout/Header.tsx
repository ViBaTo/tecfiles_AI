"use client";

import { Bell, Settings, Search } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
      {/* Spacer for mobile menu button */}
      <div className="lg:hidden w-10" />
      
      {/* Search bar */}
      <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar fichas, productos..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="relative p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black" />
        </button>
        <div className="w-px h-6 bg-gray-100" />
        <button className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all duration-200">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
