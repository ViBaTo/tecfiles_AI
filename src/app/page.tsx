import Link from "next/link";
import { FileText, Clock, CheckCircle, Zap, ChevronRight, Plus } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { MOCK_FICHAS, ESTADOS } from "@/lib/data";

export default function DashboardPage() {
  const stats = [
    { icon: FileText, label: "Total Fichas", value: "128", trend: "+12%", color: "#000000" },
    { icon: Clock, label: "Pendientes Revisión", value: "7", color: "#64748b" },
    { icon: CheckCircle, label: "Publicadas", value: "98", trend: "+5", color: "#10b981" },
    { icon: Zap, label: "Generadas Hoy", value: "4", color: "#f59e0b" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Vista general del catálogo — OMIO Atelier & Design</p>
        </div>
        <Link
          href="/generator"
          className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-3 rounded-xl bg-black hover:bg-gray-900 transition-all duration-200 active:scale-[0.98] shadow-subtle hover:shadow-medium"
        >
          <Plus size={16} strokeWidth={2.5} /> Nueva Ficha
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-subtle">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Actividad Reciente</h2>
            <Link href="/fichas" className="text-xs text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors duration-200 font-medium">
              Ver todas <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_FICHAS.slice(0, 5).map((f) => (
              <Link
                key={f.id}
                href={`/fichas/${f.id}`}
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 block group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-200">
                    <FileText size={16} className="text-gray-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{f.articulo}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{f.codigo} · {f.familia}</div>
                  </div>
                </div>
                <EstadoBadge estado={f.estado} />
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-subtle">
            <h3 className="font-semibold text-gray-900 text-sm mb-4">Por Estado</h3>
            {Object.entries(ESTADOS).map(([key, val]) => {
              const count = MOCK_FICHAS.filter(f => f.estado === key).length;
              if (count === 0) return null;
              return (
                <div key={key} className="flex items-center justify-between py-2.5 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125" style={{ backgroundColor: val.bg === "#000000" ? "#000000" : val.color }} />
                    <span className="text-sm text-gray-600 font-medium">{val.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-black rounded-xl p-5 text-white shadow-medium">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-sm font-semibold">Procesamiento IA</span>
            </div>
            <div className="text-3xl font-bold mb-1">0,03 €</div>
            <div className="text-xs text-white/50">Coste medio por ficha</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xs text-white/50">Total este mes</div>
              <div className="text-xl font-bold mt-1">3,84 €</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
