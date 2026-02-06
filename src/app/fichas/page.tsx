"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import { MOCK_FICHAS, EstadoKey } from "@/lib/data";
import { FichaRow } from "@/components/ui/FichaRow";

type FilterEstado = EstadoKey | "todos";

export default function FichasPage() {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<FilterEstado>("todos");

  const filtered = MOCK_FICHAS.filter(f => {
    const matchSearch = f.articulo.toLowerCase().includes(search.toLowerCase()) || f.codigo.includes(search);
    const matchEstado = filterEstado === "todos" || f.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fichas Técnicas</h1>
          <p className="text-gray-500 text-sm mt-1">{MOCK_FICHAS.length} fichas en catálogo</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 shadow-subtle hover:shadow-medium">
          <Download size={16} strokeWidth={2} /> Exportar Catálogo
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o artículo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 bg-white transition-all duration-200"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-subtle">
          {[
            { key: "todos" as const, label: "Todos" },
            { key: "borrador" as const, label: "Borrador" },
            { key: "revision" as const, label: "Revisión" },
            { key: "aprobado" as const, label: "Aprobado" },
            { key: "publicado" as const, label: "Publicado" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterEstado(f.key)}
              className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
                filterEstado === f.key ? "text-white bg-black shadow-subtle" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-subtle">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/50">
              {["Código", "Artículo", "Material", "Acabado", "Estado", "Fecha", ""].map((h, i) => (
                <th key={i} className="py-3.5 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <FichaRow key={f.id} ficha={f} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400 font-medium">
            No se encontraron fichas con estos filtros
          </div>
        )}
      </div>
    </div>
  );
}
