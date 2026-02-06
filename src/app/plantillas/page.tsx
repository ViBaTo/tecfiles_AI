"use client";

import { Plus, FileText, Eye, Upload } from "lucide-react";

interface Plantilla {
  name: string;
  familias: number;
  active: boolean;
}

export default function PlantillasPage() {
  const plantillas: Plantilla[] = [
    { name: "OMIO — Estándar", familias: 6, active: true },
    { name: "OMIO — Exterior", familias: 2, active: true },
    { name: "OMIO — Técnica LED", familias: 3, active: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas</h1>
          <p className="text-gray-500 text-sm mt-1">Configuración de plantillas PDF por familia de producto</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 shadow-subtle hover:shadow-medium">
          <Plus size={16} strokeWidth={2.5} /> Nueva Plantilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plantillas.map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-medium transition-all duration-300 shadow-subtle group">
            <div className="h-40 flex items-center justify-center relative bg-gray-50">
              <div className="text-center">
                <FileText size={40} className="mx-auto mb-2 text-gray-300 group-hover:text-gray-400 transition-colors duration-300" strokeWidth={1} />
                <div className="text-xs font-medium text-gray-400">Vista previa PDF</div>
              </div>
              {p.active && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold text-white bg-black px-2.5 py-1 rounded-full">
                  Activa
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{p.familias} familias de producto</p>
              <div className="flex gap-2 mt-4">
                <button className="text-xs font-semibold text-gray-600 px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 flex-1 transition-all duration-200">
                  Editar
                </button>
                <button className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 text-gray-400 hover:text-gray-600 transition-all duration-200">
                  <Eye size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center min-h-[260px] hover:border-gray-300 hover:bg-gray-50/50 transition-all duration-300 cursor-pointer group">
          <div className="text-center">
            <Plus size={24} className="text-gray-300 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="text-sm text-gray-400 font-medium">Añadir plantilla</div>
          </div>
        </div>
      </div>

      {/* Brand config */}
      <div className="mt-8 bg-white rounded-xl border border-gray-100 p-6 shadow-subtle">
        <h2 className="font-semibold text-gray-900 mb-5">Configuración de Marca — OMIO</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Logo</label>
            <div className="h-20 border border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer font-medium">
              <Upload size={14} className="mr-1.5" /> Subir logo
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Colores de Marca</label>
            <div className="flex gap-2">
              {["#000000", "#c9a962", "#f5f3ee", "#666666"].map((c, i) => (
                <div key={i} className="w-10 h-10 rounded-xl border border-gray-100 cursor-pointer hover:scale-110 transition-all duration-200 shadow-subtle" style={{ backgroundColor: c }} />
              ))}
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-all duration-200">
                <Plus size={14} className="text-gray-300" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tipografía</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-gray-100 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-200 transition-all duration-200">
              <option>Sora</option>
              <option>Montserrat</option>
              <option>Helvetica Neue</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
