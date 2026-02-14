"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Save,
  Building2,
  Palette,
  Bell,
  Key,
  Loader,
  Check,
  Sparkles,
  Eye,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useTenant } from "@/hooks/useTenant";
import { createClient } from "@/lib/supabase/client";
import type {
  DescriptionPreferences,
  DescriptionTone,
  DescriptionDetailLevel,
  DescriptionLength,
  DescriptionFocusArea,
  TenantSettings,
} from "@/lib/supabase/types";
import { DEFAULT_DESCRIPTION_PREFERENCES } from "@/lib/supabase/types";

// ── Pill selector component ───────────────────────
function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2">
        {label}
      </label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 ${
              value === opt.value
                ? "bg-[#1e3a5f] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Focus area chip component ─────────────────────
const FOCUS_OPTIONS: { value: DescriptionFocusArea; label: string }[] = [
  { value: "materials", label: "Materiales y acabados" },
  { value: "functionality", label: "Funcionalidad" },
  { value: "design", label: "Diseno y estetica" },
  { value: "sustainability", label: "Sostenibilidad" },
  { value: "innovation", label: "Innovacion tecnica" },
];

// ── Prompt preview builder ────────────────────────
function buildPreviewText(prefs: DescriptionPreferences): string {
  const parts: string[] = [];

  const toneMap: Record<DescriptionTone, string> = {
    formal: "formal y corporativo",
    professional: "profesional y accesible",
    casual: "cercano y amigable",
  };
  parts.push(`Tono ${toneMap[prefs.tone]}.`);

  const detailMap: Record<DescriptionDetailLevel, string> = {
    minimal: "Incluir solo los datos esenciales del producto.",
    moderate: "Equilibrar informacion tecnica con descripcion comercial.",
    detailed:
      "Incluir especificaciones tecnicas detalladas junto con la descripcion.",
  };
  parts.push(detailMap[prefs.detail_level]);

  const lengthMap: Record<DescriptionLength, string> = {
    short: "Longitud: 50-80 palabras.",
    medium: "Longitud: 80-150 palabras.",
    long: "Longitud: 150-250 palabras.",
  };
  parts.push(lengthMap[prefs.length]);

  if (prefs.focus_areas.length > 0) {
    const focusLabels = prefs.focus_areas
      .map((f) => FOCUS_OPTIONS.find((o) => o.value === f)?.label)
      .filter(Boolean);
    parts.push(`Enfocarse en: ${focusLabels.join(", ")}.`);
  }

  if (prefs.brand_keywords.trim()) {
    parts.push(
      `Incorporar naturalmente: ${prefs.brand_keywords.trim()}.`
    );
  }

  if (prefs.custom_instructions.trim()) {
    parts.push(prefs.custom_instructions.trim());
  }

  return parts.join(" ");
}

// ── Main page ─────────────────────────────────────
export default function SettingsPage() {
  const { tenant } = useTenant();
  const supabase = createClient();

  // Organization fields
  const [name, setName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e3a5f");
  const [secondaryColor, setSecondaryColor] = useState("#c9a962");

  // Description preferences
  const [descPrefs, setDescPrefs] = useState<DescriptionPreferences>(
    DEFAULT_DESCRIPTION_PREFERENCES
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

      // Load description preferences from tenant settings
      const settings = tenant.settings as TenantSettings | null;
      if (settings?.description_preferences) {
        setDescPrefs({
          ...DEFAULT_DESCRIPTION_PREFERENCES,
          ...settings.description_preferences,
        });
      }
    }
  }, [tenant]);

  const previewText = useMemo(() => buildPreviewText(descPrefs), [descPrefs]);

  const updateDescPref = <K extends keyof DescriptionPreferences>(
    key: K,
    value: DescriptionPreferences[K]
  ) => {
    setDescPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFocusArea = (area: DescriptionFocusArea) => {
    setDescPrefs((prev) => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter((a) => a !== area)
        : [...prev.focus_areas, area],
    }));
  };

  const handleSave = async () => {
    if (!tenant) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    // Merge description_preferences into existing settings
    const currentSettings = (tenant.settings as TenantSettings) || {};
    const newSettings: TenantSettings = {
      ...currentSettings,
      description_preferences: descPrefs,
    };

    const { error: updateError } = await supabase
      .from("ds_tenants")
      .update({
        name,
        brand_colors: {
          primary: primaryColor,
          secondary: secondaryColor,
        },
        settings: newSettings,
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

          {/* AI Description Preferences */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                <Sparkles size={18} className="text-[#1e3a5f]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Preferencias de descripcion IA
                </h3>
                <p className="text-xs text-slate-500">
                  Personaliza como la IA genera las descripciones de tus
                  productos
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Tone */}
              <PillSelector<DescriptionTone>
                label="Tono"
                value={descPrefs.tone}
                onChange={(v) => updateDescPref("tone", v)}
                options={[
                  { value: "formal", label: "Formal" },
                  { value: "professional", label: "Profesional" },
                  { value: "casual", label: "Cercano" },
                ]}
              />

              {/* Detail level */}
              <PillSelector<DescriptionDetailLevel>
                label="Nivel de detalle tecnico"
                value={descPrefs.detail_level}
                onChange={(v) => updateDescPref("detail_level", v)}
                options={[
                  { value: "minimal", label: "Minimo" },
                  { value: "moderate", label: "Moderado" },
                  { value: "detailed", label: "Detallado" },
                ]}
              />

              {/* Length */}
              <PillSelector<DescriptionLength>
                label="Longitud"
                value={descPrefs.length}
                onChange={(v) => updateDescPref("length", v)}
                options={[
                  { value: "short", label: "Corta (~50 pal.)" },
                  { value: "medium", label: "Media (~100 pal.)" },
                  { value: "long", label: "Larga (~200 pal.)" },
                ]}
              />

              {/* Focus areas */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  Enfoques prioritarios
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((opt) => {
                    const isActive = descPrefs.focus_areas.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleFocusArea(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 border ${
                          isActive
                            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand keywords */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Palabras clave de marca
                </label>
                <input
                  type="text"
                  value={descPrefs.brand_keywords}
                  onChange={(e) =>
                    updateDescPref("brand_keywords", e.target.value)
                  }
                  placeholder="artesanal, lujo contemporaneo, hecho a medida..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 placeholder:text-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Terminos que la IA intentara incorporar de forma natural en las
                  descripciones
                </p>
              </div>

              {/* Custom instructions */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Instrucciones adicionales
                </label>
                <textarea
                  value={descPrefs.custom_instructions}
                  onChange={(e) =>
                    updateDescPref("custom_instructions", e.target.value)
                  }
                  placeholder="Ej: Siempre mencionar que es fabricacion europea. No incluir dimensiones en la descripcion..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 placeholder:text-slate-300 resize-none"
                />
              </div>

              {/* Preview toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1e3a5f] hover:text-[#16304f] transition-colors duration-150"
                >
                  <Eye size={14} strokeWidth={1.5} />
                  {showPreview
                    ? "Ocultar vista previa"
                    : "Ver vista previa del prompt"}
                </button>

                {showPreview && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Instrucciones que recibira la IA
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {previewText}
                    </p>
                  </div>
                )}
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
