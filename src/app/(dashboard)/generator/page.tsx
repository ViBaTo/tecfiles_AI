"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Upload,
  Sparkles,
  X,
  Check,
  Loader,
  Clock,
  Eye,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useTenant } from "@/hooks/useTenant";

const STEPS = [
  { num: 1, label: "Subir Archivo" },
  { num: 2, label: "Extraccion IA" },
  { num: 3, label: "Revisar Datos" },
  { num: 4, label: "Generar Ficha" },
];

export default function GeneratorPage() {
  const { tenant } = useTenant();
  const { files, isUploading, uploadFiles, clearFiles } = useFileUpload({
    tenantId: tenant?.id,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
  };

  const completedCount = files.filter((f) => f.status === "done").length;
  const totalProgress =
    files.length > 0
      ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
      : 0;

  const activeStep = files.length === 0 ? 1 : completedCount === files.length ? 4 : 2;

  return (
    <div>
      <Header
        title="Generador de Fichas"
        subtitle="Sube planos tecnicos y genera fichas automaticamente con IA"
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors duration-150 ${
                  step.num < activeStep
                    ? "bg-emerald-100 text-emerald-700"
                    : step.num === activeStep
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {step.num < activeStep ? (
                  <Check size={14} strokeWidth={2} />
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  step.num === activeStep
                    ? "text-slate-900"
                    : step.num < activeStep
                      ? "text-emerald-700"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 h-px mx-3 ${
                  step.num < activeStep ? "bg-emerald-300" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.dwg,.dxf,image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {files.length === 0 ? (
        /* Upload Zone */
        <div
          className="border-2 border-dashed rounded-xl p-12 text-center transition-colors duration-150 cursor-pointer border-slate-300 bg-white hover:border-[#1e3a5f] hover:bg-[#f0f4f8]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 bg-[#e8eef4]">
            <Upload size={24} className="text-[#1e3a5f]" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-medium text-slate-700 mb-1">
            Arrastra tu archivo CAD o PDF aqui
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            o haz clic para seleccionar
          </p>
          <div className="text-xs text-slate-400">
            PDF, DWG, DXF, STEP
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Processing header */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e8eef4] flex items-center justify-center">
                  <Sparkles size={18} className="text-[#1e3a5f]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {isUploading
                      ? `Subiendo ${files.length} planos`
                      : `${completedCount} de ${files.length} completados`}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Subida a Storage &rarr; Crea ficha &rarr; Registra job de extraccion
                  </div>
                </div>
              </div>
              <button
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors duration-150"
                onClick={clearFiles}
              >
                <X size={14} strokeWidth={1.5} /> Limpiar
              </button>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-[#1e3a5f]"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-2 font-medium tabular-nums">
              {completedCount} de {files.length} completado
              {files.length > 1 ? "s" : ""}
            </div>
          </div>

          {/* File list */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            {files.map((f) => (
              <div
                key={f.id}
                className="px-5 py-4 border-b border-slate-100 last:border-0 flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    f.status === "done"
                      ? "bg-emerald-50"
                      : f.status === "uploading" || f.status === "processing" || f.status === "extracting"
                        ? "bg-blue-50"
                        : f.status === "error"
                          ? "bg-red-50"
                          : "bg-slate-50"
                  }`}
                >
                  {f.status === "done" ? (
                    <Check size={18} className="text-emerald-600" strokeWidth={1.5} />
                  ) : f.status === "uploading" || f.status === "processing" || f.status === "extracting" ? (
                    <Loader size={18} className="text-blue-600 animate-spin" strokeWidth={1.5} />
                  ) : f.status === "error" ? (
                    <AlertCircle size={18} className="text-red-600" strokeWidth={1.5} />
                  ) : (
                    <Clock size={18} className="text-slate-400" strokeWidth={1.5} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {f.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {f.status === "done"
                      ? "Extraccion completada - Ficha lista"
                      : f.status === "uploading"
                        ? "Subiendo archivo..."
                        : f.status === "extracting"
                          ? "Extrayendo datos con IA..."
                          : f.status === "processing"
                            ? "Procesando..."
                            : f.status === "error"
                              ? f.errorMessage || "Error al subir"
                              : "En cola de subida"}
                  </div>
                  {(f.status === "uploading" || f.status === "processing" || f.status === "extracting") && (
                    <div className="w-full h-1 bg-slate-200 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#1e3a5f] rounded-full transition-all"
                        style={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {f.status === "done" && f.datasheetId && (
                    <Link
                      href={`/fichas/${f.datasheetId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-white px-3 py-1.5 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
                    >
                      <Eye size={12} strokeWidth={1.5} /> Ver ficha
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Upload more button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-lg border-2 border-dashed border-slate-200 text-sm text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <Upload size={14} strokeWidth={1.5} /> Subir mas archivos
          </button>
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: "1", title: "Sube planos", desc: "PDF o CAD de tus productos" },
          { step: "2", title: "IA extrae datos", desc: "Claude Vision analiza cada plano" },
          { step: "3", title: "Genera ficha", desc: "Texto tecnico-comercial automatico" },
          { step: "4", title: "Revisa y publica", desc: "Edita, aprueba y exporta a PDF" },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-lg p-5 relative group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold mb-4 bg-[#1e3a5f]">
              {s.step}
            </div>
            <div className="text-sm font-semibold text-slate-900">{s.title}</div>
            <div className="text-xs text-slate-500 mt-1">{s.desc}</div>
            {i < 3 && (
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                <ArrowRight size={14} className="text-slate-300" strokeWidth={1.5} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
