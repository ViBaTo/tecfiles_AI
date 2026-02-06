"use client";

import { use } from "react";
import Link from "next/link";
import { RefreshCw, Check, Image, Zap, ArrowLeft } from "lucide-react";
import { getFichaById, MOCK_FICHAS } from "@/lib/data";
import { EstadoBadge } from "@/components/ui/EstadoBadge";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params);
  const ficha = getFichaById(Number(id)) || MOCK_FICHAS[0];

  return (
    <div>
      <Link href="/fichas" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 mb-4 transition-colors duration-200 font-medium">
        <ArrowLeft size={14} /> Volver a fichas
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{ficha.articulo}</h1>
            <EstadoBadge estado={ficha.estado} />
          </div>
          <p className="text-gray-400 text-sm mt-1">Código: {ficha.codigo} · {ficha.familia}</p>
        </div>
        <div className="flex gap-2">
          <button className="text-sm font-medium text-gray-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-1.5">
            <RefreshCw size={14} /> Regenerar
          </button>
          <button className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 flex items-center gap-1.5 shadow-subtle">
            <Check size={14} strokeWidth={2.5} /> Aprobar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Original plan */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-subtle">
          <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plano Original</span>
          </div>
          <div className="p-8 flex items-center justify-center bg-gray-50/50 min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Image size={32} className="text-gray-300" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-gray-400 font-medium">Vista previa del plano técnico</p>
              <p className="text-xs text-gray-300 mt-1">{ficha.codigo}_plano.pdf</p>
            </div>
          </div>
        </div>

        {/* Right: Generated data */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-subtle">
          <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ficha Generada</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: "Código Proyecto", value: ficha.codigo },
              { label: "Artículo", value: ficha.articulo },
              { label: "Familia", value: ficha.familia },
              { label: "Material", value: ficha.material },
              { label: "Acabado", value: ficha.acabado },
              { label: "Dimensiones", value: "Ø160 × 78 mm" },
              { label: "Peso", value: "0,4 kg" },
            ].map((field, i) => (
              <div key={i}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                <input
                  defaultValue={field.value}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all duration-200"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Especificaciones Técnicas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "Potencia", val: "6W" },
                  { key: "Lúmenes", val: "540 lm" },
                  { key: "Temp. Color", val: "3000K" },
                  { key: "IP", val: "IP44" },
                  { key: "CRI", val: ">90" },
                  { key: "Voltaje", val: "220-240V" },
                ].map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <input defaultValue={spec.key} className="w-1/2 px-2.5 py-2 rounded-lg border border-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all duration-200" />
                    <input defaultValue={spec.val} className="w-1/2 px-2.5 py-2 rounded-lg border border-gray-100 text-xs focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 font-semibold transition-all duration-200" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Descripción Generada por IA
              </label>
              <textarea
                rows={5}
                defaultValue="Aplique de baño de línea contemporánea, diseñado para integrar funcionalidad y estética en espacios húmedos. Fabricado en metal con acabado en negro mate y difusor de cristal fumé, ofrece una iluminación cálida y envolvente (3000K, 540 lm) con un excelente índice de reproducción cromática (CRI >90). Su protección IP44 garantiza la resistencia a salpicaduras, mientras que su perfil compacto (Ø160 × 78 mm) permite la instalación tanto en espejos como en zonas auxiliares."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 leading-relaxed transition-all duration-200"
              />
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-gray-300 flex items-center gap-1 font-medium">
                  <Zap size={10} /> Generado por Claude · 1,2s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
