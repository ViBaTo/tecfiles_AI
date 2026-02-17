"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileUp,
  Package,
  LayoutTemplate,
  Layers,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";

const NAV_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { key: "generator", icon: FileUp, label: "Nueva Ficha", href: "/generator" },
  { key: "fichas", icon: Package, label: "Productos", href: "/fichas" },
  { key: "plantillas", icon: LayoutTemplate, label: "Plantillas", href: "/plantillas" },
  { key: "lotes", icon: Layers, label: "Lotes", href: "/lotes" },
];

const SECONDARY_NAV = [
  { key: "usuarios", icon: Users, label: "Usuarios", href: "/usuarios" },
  { key: "settings", icon: Settings, label: "Configuración", href: "/settings" },
];

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { tenant } = useTenant();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (!user?.email) return "Usuario";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={18} className="text-slate-600" strokeWidth={1.5} />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 bg-white border-r border-slate-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        <button
          className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors duration-150"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              DOSSIER
            </div>
            <div className="text-[10px] font-medium tracking-[0.2em] uppercase text-slate-400">
              by VIBATO
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="px-3 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 px-3 py-2">
            {tenant?.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name || "Logo"}
                className="w-7 h-7 rounded-lg object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] text-slate-600 font-semibold">
                {tenant?.name?.charAt(0) || "T"}
              </div>
            )}
            <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">
              {tenant?.name || "Cargando..."}
            </span>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.5}
                  className={active ? "text-[#1e3a5f]" : "text-slate-400"}
                />
                {item.label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="border-t border-slate-100 my-3" />

          {SECONDARY_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  active
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.5}
                  className={active ? "text-[#1e3a5f]" : "text-slate-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-medium">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-900 font-medium truncate">
                {getUserName()}
              </div>
              <div className="text-[11px] text-slate-400">Admin</div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
              title="Cerrar sesión"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
