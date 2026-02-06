"use client";

import { useState } from "react";
import { Upload, Zap, X, Check, Loader, Clock, Eye, ArrowRight } from "lucide-react";

interface UploadFile {
  name: string;
  status: "done" | "processing" | "queued";
  progress: number;
}

export default function GeneratorPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [, setProcessing] = useState(false);

  const simulateUpload = () => {
    setFiles([
      { name: "250038_aplique_lectura.pdf", status: "done", progress: 100 },
      { name: "250039_colgante_comedor.pdf", status: "processing", progress: 65 },
      { name: "250040_downlight_cocina.pdf", status: "queued", progress: 0 },
    ]);
    setProcessing(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generador de Fichas</h1>
        <p className="text-gray-500 text-sm mt-1">Sube planos técnicos y genera fichas automáticamente con IA</p>
      </div>

      {files.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer ${
            dragOver
              ? "border-black bg-gray-50"
              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
          onClick={simulateUpload}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-black/5">
            <Upload size={28} className="text-black" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Arrastra planos aquí
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            PDF o CAD · Individual o lote (hasta 100 archivos)
          </p>
          <button className="text-sm font-semibold text-white px-6 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 shadow-subtle hover:shadow-medium">
            Seleccionar archivos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Processing header */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Zap size={18} className="text-amber-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Procesando 3 planos</div>
                  <div className="text-xs text-gray-400 mt-0.5">Claude Vision extrae datos → Genera descripción → Vista previa</div>
                </div>
              </div>
              <button
                className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors duration-200"
                onClick={() => { setFiles([]); setProcessing(false); }}
              >
                <X size={14} /> Cancelar
              </button>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-black"
                style={{ width: "55%" }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium">1 de 3 completado · ~2 min restante</div>
          </div>

          {/* File list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-subtle">
            {files.map((f, i) => (
              <div key={i} className="px-5 py-4 border-b border-gray-50 last:border-0 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  f.status === "done" ? "bg-emerald-50" :
                  f.status === "processing" ? "bg-amber-50" : "bg-gray-50"
                }`}>
                  {f.status === "done" ? <Check size={18} className="text-emerald-500" strokeWidth={2} /> :
                   f.status === "processing" ? <Loader size={18} className="text-amber-500 animate-spin" strokeWidth={2} /> :
                   <Clock size={18} className="text-gray-300" strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{f.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {f.status === "done" ? "Extracción completa — Vista previa disponible" :
                     f.status === "processing" ? "Extrayendo datos con Claude Vision..." :
                     "En cola de procesamiento"}
                  </div>
                  {f.status === "processing" && (
                    <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  {f.status === "done" && (
                    <button className="text-xs font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-1.5 bg-black hover:bg-gray-900 transition-all duration-200">
                      <Eye size={12} /> Ver ficha
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { step: "1", title: "Sube planos", desc: "PDF o CAD de tus productos" },
          { step: "2", title: "IA extrae datos", desc: "Claude Vision analiza cada plano" },
          { step: "3", title: "Genera ficha", desc: "Texto técnico-comercial automático" },
          { step: "4", title: "Revisa y publica", desc: "Edita, aprueba y exporta a PDF" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 relative shadow-subtle hover:shadow-medium transition-all duration-300 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mb-4 bg-black group-hover:scale-110 transition-transform duration-300">
              {s.step}
            </div>
            <div className="text-sm font-semibold text-gray-900">{s.title}</div>
            <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
            {i < 3 && (
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                <ArrowRight size={14} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
