"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  Palette,
  Bell,
  Key,
  Loader,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useTenant } from "@/hooks/useTenant";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { tenant } = useTenant();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e3a5f");
  const [secondaryColor, setSecondaryColor] = useState("#c9a962");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name || "");
      const colors = tenant.brand_colors as {
        primary?: string;
        secondary?: string;
      } | null;
      if (colors) {
        setPrimaryColor(colors.primary || "#1e3a5f");
        setSecondaryColor(colors.secondary || "#c9a962");
      }
    }
  }, [tenant]);

  const handleSave = async () => {
    if (!tenant) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await supabase
      .from("ds_tenants")
      .update({
        name,
        brand_colors: {
          primary: primaryColor,
          secondary: secondaryColor,
        },
      })
      .eq("id", tenant.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  return (
    <div>
      <Header
        title="Configuracion"
        subtitle="Ajustes de tu organizacion"
        actions={
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150 disabled:opacity-50"
          >
            {saving ? (
              <Loader size={16} className="animate-spin" strokeWidth={1.5} />
            ) : saved ? (
              <Check size={16} strokeWidth={1.5} />
            ) : (
              <Save size={16} strokeWidth={1.5} />
            )}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </button>
        }
      />

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-sm mb-6">
          Error al guardar: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Organization */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Building2 size={18} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Organizacion</h3>
                <p className="text-xs text-slate-500">
                  Informacion de tu empresa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Nombre de la organizacion
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={tenant?.slug || ""}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Plan
                </label>
                <input
                  type="text"
                  value={tenant?.plan || "starter"}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 capitalize"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Palette size={18} className="text-slate-500" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Marca</h3>
                <p className="text-xs text-slate-500">
                  Personaliza la apariencia de tus fichas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Logo
                </label>
                <div className="w-full h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400 cursor-pointer hover:border-slate-300 hover:text-slate-500 transition-colors duration-150">
                  Click para subir
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Color primario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Color secundario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan info */}
          <div className="bg-[#1e3a5f] rounded-lg p-6 text-white">
            <h3 className="text-sm font-semibold mb-4">
              Tu Plan: {tenant?.plan || "Starter"}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Fichas/mes</span>
                <span className="font-medium tabular-nums">
                  {tenant?.max_datasheets_month || 50}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Usuarios</span>
                <span className="font-medium tabular-nums">{tenant?.max_users || 2}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Plantillas</span>
                <span className="font-medium tabular-nums">
                  {tenant?.max_templates || 1}
                </span>
              </div>
            </div>
            <button className="w-full mt-6 py-2 rounded-lg bg-white text-[#1e3a5f] text-sm font-medium hover:bg-white/90 transition-colors duration-150">
              Actualizar plan
            </button>
          </div>

          {/* Quick links */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Accesos rapidos
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-150 text-left">
                <Bell size={16} className="text-slate-400" strokeWidth={1.5} />
                Notificaciones
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors duration-150 text-left">
                <Key size={16} className="text-slate-400" strokeWidth={1.5} />
                API Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
