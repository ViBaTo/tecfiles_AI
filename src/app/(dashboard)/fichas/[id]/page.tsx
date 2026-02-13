"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  FileText,
  RefreshCw,
  Download,
  Check,
  X,
  Loader,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { useDatasheet } from "@/hooks/useDatasheets";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FichaDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { datasheet, loading, error, updateDatasheet, refetch } = useDatasheet(id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  const handleGenerateDescription = async () => {
    if (!datasheet) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasheetId: id,
          language: selectedLanguage,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al generar descripción");
      }

      await refetch();
    } catch (err) {
      console.error("Generation error:", err);
      alert(err instanceof Error ? err.message : "Error al generar descripción");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReExtract = async () => {
    if (!datasheet) return;
    
    setIsExtracting(true);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasheetId: id }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Error al extraer datos");
      }

      await refetch();
    } catch (err) {
      console.error("Extraction error:", err);
      alert(err instanceof Error ? err.message : "Error al extraer datos");
    } finally {
      setIsExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e3a5f]" />
      </div>
    );
  }

  if (error || !datasheet) {
    return (
      <div className="text-center py-16">
        <FileText size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          Ficha no encontrada
        </h2>
        <p className="text-sm text-slate-500 mb-6">{error || "No se pudo cargar la ficha"}</p>
        <Link
          href="/fichas"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1e3a5f] hover:underline"
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Volver al listado
        </Link>
      </div>
    );
  }

  const technicalSpecs = (datasheet.technical_specs || {}) as Record<string, string>;
  const components = (datasheet.components || []) as string[];

  const handleStatusChange = async (newStatus: string) => {
    await updateDatasheet({ status: newStatus as typeof datasheet.status });
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/fichas"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.5} /> Volver al listado
        </Link>
      </div>

      <Header
        title={datasheet.article_name || "Sin nombre"}
        subtitle={`Código: ${datasheet.project_code || "-"}`}
        actions={
          <div className="flex items-center gap-2">
            <EstadoBadge estado={datasheet.status} size="md" />
            {datasheet.source_file_url && (
              <button 
                onClick={handleReExtract}
                disabled={isExtracting}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 disabled:opacity-50"
              >
                {isExtracting ? (
                  <Loader size={16} className="animate-spin" strokeWidth={1.5} />
                ) : (
                  <RefreshCw size={16} strokeWidth={1.5} />
                )}
                {isExtracting ? "Extrayendo..." : "Re-extraer"}
              </button>
            )}
            <button className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150">
              <Download size={16} strokeWidth={1.5} /> Exportar PDF
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
              <Save size={16} strokeWidth={1.5} /> Guardar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Source file preview */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Plano Original</h3>
          </div>
          <div className="aspect-4/3 bg-slate-50 flex items-center justify-center">
            {datasheet.source_file_url ? (
              <iframe
                src={datasheet.source_file_url}
                className="w-full h-full"
                title="Plano original"
              />
            ) : (
              <div className="text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                <p className="text-sm">Sin archivo de origen</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Data form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Datos Básicos</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Código Proyecto", value: datasheet.project_code, mono: true },
                { label: "Artículo", value: datasheet.article_name },
                { label: "Material", value: datasheet.material },
                { label: "Acabado", value: datasheet.finish },
                { label: "Dimensiones", value: datasheet.dimensions, mono: true },
                { label: "Peso", value: datasheet.weight, mono: true },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    {field.label}
                  </label>
                  <div
                    className={`w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 ${
                      field.mono ? "font-mono tabular-nums" : ""
                    }`}
                  >
                    {field.value || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          {Object.keys(technicalSpecs).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Especificaciones Técnicas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(technicalSpecs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50"
                  >
                    <span className="text-xs text-slate-500 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-slate-900 font-mono tabular-nums">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Components */}
          {components.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Componentes</h3>
              <ul className="space-y-2">
                {components.map((comp, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-600 py-2 px-3 rounded-lg bg-slate-50"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-500 tabular-nums">
                      {i + 1}
                    </span>
                    {comp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Generated Description */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Descripción Generada
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
                <button 
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader size={14} className="animate-spin" strokeWidth={1.5} />
                  ) : (
                    <RefreshCw size={14} strokeWidth={1.5} />
                  )}
                  {isGenerating ? "Generando..." : "Regenerar"}
                </button>
              </div>
            </div>
            {datasheet.generated_description ? (
              <div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {datasheet.generated_description}
                </p>
                {datasheet.description_language && (
                  <p className="text-xs text-slate-400 mt-3">
                    Idioma: {datasheet.description_language === "es" ? "Español" : 
                            datasheet.description_language === "en" ? "English" :
                            datasheet.description_language === "fr" ? "Français" : "Deutsch"}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles size={32} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
                <p className="text-sm text-slate-500">Sin descripción generada</p>
                <button 
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white bg-[#1e3a5f] px-4 py-2 rounded-lg hover:bg-[#16304f] transition-colors duration-150 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader size={14} className="animate-spin" strokeWidth={1.5} />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} strokeWidth={1.5} />
                      Generar con IA
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Acciones</h3>
            <div className="flex flex-wrap gap-2">
              {datasheet.status === "draft" && (
                <button
                  onClick={() => handleStatusChange("review")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
                >
                  Enviar a revisión
                </button>
              )}
              {datasheet.status === "review" && (
                <>
                  <button
                    onClick={() => handleStatusChange("approved")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors duration-150"
                  >
                    <Check size={16} strokeWidth={1.5} /> Aprobar
                  </button>
                  <button
                    onClick={() => handleStatusChange("draft")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
                  >
                    <X size={16} strokeWidth={1.5} /> Rechazar
                  </button>
                </>
              )}
              {datasheet.status === "approved" && (
                <button
                  onClick={() => handleStatusChange("published")}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
                >
                  Publicar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
