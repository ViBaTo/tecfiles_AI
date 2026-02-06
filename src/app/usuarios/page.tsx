"use client";

import { Plus, MoreHorizontal } from "lucide-react";

interface User {
  name: string;
  email: string;
  role: "Administrador" | "Editor" | "Revisor";
  avatar: string;
}

const roleColors: Record<string, { bg: string; text: string; badge: string }> = {
  Administrador: { bg: "#000000", text: "#ffffff", badge: "#000000" },
  Editor: { bg: "#f59e0b", text: "#ffffff", badge: "#f59e0b" },
  Revisor: { bg: "#64748b", text: "#ffffff", badge: "#64748b" },
};

export default function UsuariosPage() {
  const users: User[] = [
    { name: "Vicente Martínez", email: "vicente@vibato.ai", role: "Administrador", avatar: "VM" },
    { name: "Ana García", email: "ana@omio.es", role: "Editor", avatar: "AG" },
    { name: "Carlos López", email: "carlos@omio.es", role: "Revisor", avatar: "CL" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de roles y permisos</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 shadow-subtle hover:shadow-medium">
          <Plus size={16} strokeWidth={2.5} /> Invitar Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-subtle">
        {users.map((u, i) => (
          <div key={i} className="px-5 py-4 border-b border-gray-50 last:border-0 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: roleColors[u.role].bg }}>
                {u.avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${roleColors[u.role].badge}10`, color: roleColors[u.role].badge }}
              >
                {u.role}
              </span>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Roles del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { role: "Administrador", perms: "Configura plantillas, esquemas, usuarios. Acceso total." },
            { role: "Editor", perms: "Genera, edita y exporta fichas. No puede aprobar." },
            { role: "Revisor", perms: "Revisa y aprueba fichas para publicación." },
          ].map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-subtle hover:shadow-medium transition-all duration-300">
              <div className="font-semibold text-sm mb-2" style={{ color: roleColors[r.role as keyof typeof roleColors].badge }}>{r.role}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{r.perms}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
