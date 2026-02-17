"use client";

import { useState } from "react";
import { Plus, Users, Mail, Shield, Loader, Trash2, UserCog } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ActionMenu, type ActionMenuEntry } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTenantUsers, type TenantUserWithProfile } from "@/hooks/useTenantUsers";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/contexts/ToastContext";
import { canManageUsers } from "@/lib/permissions";
import type { UserRole } from "@/lib/supabase/types";

const ROLE_CONFIG = {
  admin: {
    label: "Administrador",
    classes: "bg-[#e8eef4] text-[#1e3a5f] border-[#1e3a5f]/20",
  },
  editor: {
    label: "Editor",
    classes: "bg-slate-100 text-slate-700 border-slate-200",
  },
  reviewer: {
    label: "Revisor",
    classes: "bg-slate-50 text-slate-600 border-slate-200",
  },
};

export default function UsuariosPage() {
  const { tenant, tenantUser: currentUser } = useTenant();
  const { users, loading, error, updateRole, removeUser } = useTenantUsers({ tenantId: tenant?.id });
  const { toast } = useToast();
  const [confirmRemove, setConfirmRemove] = useState<TenantUserWithProfile | null>(null);

  const isAdmin = canManageUsers(currentUser?.role);

  const handleChangeRole = async (membershipId: string, newRole: UserRole) => {
    const { error: err } = await updateRole(membershipId, newRole);
    if (err) {
      toast.error("Error al cambiar el rol");
    } else {
      toast.success("Rol actualizado correctamente");
    }
  };

  const handleConfirmRemove = async () => {
    if (!confirmRemove) return;
    const { error: err } = await removeUser(confirmRemove.id);
    if (err) {
      toast.error("Error al eliminar el usuario");
    } else {
      toast.success("Usuario eliminado correctamente");
    }
    setConfirmRemove(null);
  };

  const buildUserMenuItems = (user: TenantUserWithProfile): ActionMenuEntry[] => {
    const isSelf = user.user_id === currentUser?.user_id;
    const roles: { value: UserRole; label: string }[] = [
      { value: "admin", label: "Administrador" },
      { value: "editor", label: "Editor" },
      { value: "reviewer", label: "Revisor" },
    ];

    const roleItems: ActionMenuEntry[] = roles
      .filter((r) => r.value !== user.role)
      .map((r) => ({
        label: `Cambiar a ${r.label}`,
        icon: <UserCog size={16} strokeWidth={1.5} />,
        onClick: () => handleChangeRole(user.id, r.value),
        disabled: !isAdmin || isSelf,
      }));

    return [
      ...roleItems,
      { type: "divider" as const },
      {
        label: "Eliminar usuario",
        icon: <Trash2 size={16} strokeWidth={1.5} />,
        onClick: () => setConfirmRemove(user),
        danger: true,
        disabled: !isAdmin || isSelf,
      },
    ];
  };

  return (
    <div>
      <Header
        title="Gestion de Usuarios"
        subtitle="Administra los usuarios de tu organizacion"
        actions={
          <button className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
            <Plus size={16} strokeWidth={1.5} /> Invitar Usuario
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-6 text-sm">
          Error al cargar usuarios: {error}
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
          <p className="text-lg font-medium text-slate-800">Sin usuarios todavia</p>
          <p className="text-sm text-slate-500 mt-1">
            Invita a tu primer usuario para empezar a colaborar
          </p>
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
            <Plus size={16} strokeWidth={1.5} /> Invitar usuario
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                  Usuario
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                  Rol
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                  Estado
                </th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                  Ultima actividad
                </th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleConfig =
                  ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.editor;
                const isActive = !!user.last_sign_in_at;
                return (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-xs font-medium text-white">
                          {user.display_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {user.display_name}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={10} strokeWidth={1.5} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${roleConfig.classes}`}
                      >
                        <Shield size={11} strokeWidth={1.5} /> {roleConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString("es-ES")
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu items={buildUserMenuItems(user)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRemove}
        title="Eliminar usuario"
        description={`¿Seguro que quieres eliminar a "${confirmRemove?.display_name || "este usuario"}" de la organización? Perderá acceso inmediatamente.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
