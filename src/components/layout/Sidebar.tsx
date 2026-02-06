"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/data";

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-gray-200 shadow-subtle"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full w-[240px] flex flex-col transition-transform duration-300 lg:translate-x-0 bg-black ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-colors"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center">
              <Image
                src="/logos/logoA.svg"
                alt="AIVO"
                width={28}
                height={28}
                className="brightness-0 invert"
              />
            </div>
            <div>
              <div className="text-white font-semibold text-base tracking-wide">AIVO</div>
              <div className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Fichas Técnicas</div>
            </div>
          </div>
        </div>

        {/* Tenant selector */}
        <div className="px-3 py-3 border-b border-white/10">
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[11px] text-white/70 font-semibold">
                O
              </div>
              <span className="text-sm text-white/80 font-medium">OMIO Atelier</span>
            </div>
            <ChevronDown size={14} className="text-white/40" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-white text-black"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <item.icon size={18} strokeWidth={active ? 2.5 : 1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
              VM
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/90 font-medium truncate">Vicente</div>
              <div className="text-[11px] text-white/40">Admin</div>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors duration-200">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
