"use client";

import { Layers, CheckCircle, Loader, Download } from "lucide-react";

interface Lote {
  id: string;
  fichas: number;
  completadas: number;
  estado: "completado" | "procesando";
  fecha: string;
}

export default function LotesPage() {
  const lotes: Lote[] = [
    { id: "LOT-001", fichas: 45, completadas: 45, estado: "completado", fecha: "2026-01-20" },
    { id: "LOT-002", fichas: 28, completadas: 28, estado: "completado", fecha: "2026-01-28" },
    { id: "LOT-003", fichas: 32, completadas: 18, estado: "procesando", fecha: "2026-02-05" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procesamiento Masivo</h1>
          <p className="text-gray-500 text-sm mt-1">Genera fichas por lotes de 20-100+ planos</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 shadow-subtle hover:shadow-medium">
          <Layers size={16} strokeWidth={2} /> Nuevo Lote
        </button>
      </div>

      <div className="space-y-4">
        {lotes.map((l, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-subtle hover:shadow-medium transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${l.estado === "completado" ? "bg-emerald-50" : "bg-amber-50"}`}>
                  {l.estado === "completado" ? <CheckCircle size={18} className="text-emerald-500" strokeWidth={2} /> : <Loader size={18} className="text-amber-500 animate-spin" strokeWidth={2} />}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{l.id}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{l.fecha} · {l.fichas} planos</div>
                </div>
              </div>
              <div className="flex gap-2">
                {l.estado === "completado" && (
                  <button className="text-xs font-semibold text-gray-600 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 flex items-center gap-1.5 transition-all duration-200">
                    <Download size={12} /> ZIP
                  </button>
                )}
                <button className="text-xs font-semibold text-white px-4 py-2 rounded-lg bg-black hover:bg-gray-900 transition-all duration-200">
                  Ver fichas
                </button>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(l.completadas / l.fichas) * 100}%`,
                  backgroundColor: l.estado === "completado" ? "#10b981" : "#f59e0b"
                }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2 font-medium">
              {l.completadas} de {l.fichas} fichas {l.estado === "completado" ? "completadas" : "procesadas"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
