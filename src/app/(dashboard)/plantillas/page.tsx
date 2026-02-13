"use client";

import { Plus, LayoutTemplate, Check, Loader } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useTemplates } from "@/hooks/useTemplates";
import { useTenant } from "@/hooks/useTenant";

export default function PlantillasPage() {
  const { tenant } = useTenant();
  const { templates, loading, error } = useTemplates({ tenantId: tenant?.id });

  return (
    <div>
      <Header
        title="Plantillas PDF"
        subtitle="Configura las plantillas de exportacion con tu marca"
        actions={
          <button className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
            <Plus size={16} strokeWidth={1.5} /> Nueva Plantilla
          </button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="aspect-3/4 bg-slate-100 rounded-md animate-pulse" />
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mt-3" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse mt-2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-6 text-sm">
          Error al cargar plantillas: {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-slate-200 rounded-lg p-3 hover:border-[#1e3a5f]/40 hover:shadow-sm transition-all duration-150 cursor-pointer group"
            >
              {/* Preview */}
              <div className="aspect-3/4 bg-slate-100 rounded-md flex items-center justify-center relative overflow-hidden">
                {template.thumbnail_url ? (
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LayoutTemplate size={48} className="text-slate-300" strokeWidth={1.5} />
                )}
                {template.is_default && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[11px] font-medium text-white bg-[#1e3a5f] px-2 py-0.5 rounded-md">
                    <Check size={10} strokeWidth={2} /> Por defecto
                  </span>
                )}
              </div>
              {/* Info */}
              <div className="mt-3">
                <h3 className="text-sm font-medium text-slate-900">{template.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {template.template_type === "single"
                    ? "Ficha individual"
                    : template.template_type === "catalog_cover"
                      ? "Portada cat\u00e1logo"
                      : "P\u00e1gina cat\u00e1logo"}
                </p>
              </div>
            </div>
          ))}

          {/* Add new template card */}
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-lg hover:border-slate-300 transition-colors duration-150 cursor-pointer group">
            <div className="aspect-3/4 flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition-colors duration-150 p-3">
              <Plus size={32} className="mb-2" strokeWidth={1.5} />
              <span className="text-sm font-medium">Nueva plantilla</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
