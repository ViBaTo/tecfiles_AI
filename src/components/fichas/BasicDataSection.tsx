"use client";

import { useState } from "react";
import { Database, Pencil, Save, X, Loader } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { Datasheet } from "@/lib/supabase/types";

interface BasicDataSectionProps {
  datasheet: Datasheet;
  onUpdate: (updates: Partial<Datasheet>) => Promise<{ error: string | null }>;
}

interface FieldDef {
  key: keyof Pick<Datasheet, "project_code" | "article_name" | "material" | "finish" | "dimensions" | "weight">;
  label: string;
  mono?: boolean;
}

const FIELDS: FieldDef[] = [
  { key: "project_code", label: "Código Proyecto", mono: true },
  { key: "article_name", label: "Artículo" },
  { key: "material", label: "Material" },
  { key: "finish", label: "Acabado" },
  { key: "dimensions", label: "Dimensiones", mono: true },
  { key: "weight", label: "Peso", mono: true },
];

export function BasicDataSection({ datasheet, onUpdate }: BasicDataSectionProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const startEditing = () => {
    const vals: Record<string, string> = {};
    for (const f of FIELDS) {
      vals[f.key] = (datasheet[f.key] as string) || "";
    }
    setLocalValues(vals);
    setEditMode(true);
  };

  const cancelEditing = () => {
    setEditMode(false);
    setLocalValues({});
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<Datasheet> = {};
    for (const f of FIELDS) {
      const newVal = localValues[f.key]?.trim() || null;
      if (newVal !== (datasheet[f.key] || null)) {
        (updates as Record<string, string | null>)[f.key] = newVal;
      }
    }

    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      setSaving(false);
      return;
    }

    const { error } = await onUpdate(updates);
    setSaving(false);

    if (error) {
      toast.error("Error al guardar los datos básicos");
    } else {
      toast.success("Datos básicos actualizados");
      setEditMode(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={15} strokeWidth={1.5} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Datos Básicos</h3>
        </div>

        {!editMode ? (
          <button
            onClick={startEditing}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors duration-150"
          >
            <Pencil size={13} strokeWidth={1.5} />
            Editar
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors duration-150 disabled:opacity-50"
            >
              <X size={13} strokeWidth={1.5} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs font-medium text-white bg-[#1e3a5f] hover:bg-[#16304f] px-3 py-1.5 rounded-md transition-colors duration-150 disabled:opacity-50"
            >
              {saving ? (
                <Loader size={13} className="animate-spin" strokeWidth={1.5} />
              ) : (
                <Save size={13} strokeWidth={1.5} />
              )}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Fields */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                {field.label}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={localValues[field.key] || ""}
                  onChange={(e) =>
                    setLocalValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className={`w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f]/50 transition-colors ${
                    field.mono ? "font-mono tabular-nums" : ""
                  }`}
                />
              ) : (
                <div
                  className={`w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 min-h-[38px] ${
                    field.mono ? "font-mono tabular-nums" : ""
                  }`}
                >
                  {(datasheet[field.key] as string) || "-"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
