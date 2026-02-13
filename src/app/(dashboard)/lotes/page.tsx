"use client";

import {
  Plus,
  Layers,
  Loader,
  MoreHorizontal,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useBatchJobs } from "@/hooks/useBatchJobs";
import { useTenant } from "@/hooks/useTenant";

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  completed: {
    label: "Completado",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  processing: {
    label: "Procesando",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  partial: {
    label: "Parcial",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
  },
  failed: {
    label: "Error",
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  pending: {
    label: "Pendiente",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function LotesPage() {
  const { tenant } = useTenant();
  const { batches, loading, error } = useBatchJobs({ tenantId: tenant?.id });

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  return (
    <div>
      <Header
        title="Procesamiento por Lotes"
        subtitle="Gestiona el procesamiento masivo de planos"
        actions={
          <button className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
            <Plus size={16} strokeWidth={1.5} /> Nuevo Lote
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size={24} className="animate-spin text-slate-400" strokeWidth={1.5} />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-6 text-sm">
          Error al cargar lotes: {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center">
          <Layers size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
          <p className="text-lg font-medium text-slate-800">Sin lotes procesados</p>
          <p className="text-sm text-slate-500 mt-1">
            Crea un lote para procesar multiples archivos
          </p>
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150">
            <Plus size={16} strokeWidth={1.5} /> Crear Lote
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Lote
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Archivos
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Progreso
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Iniciado
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => {
                  const statusConfig = STATUS_CONFIG[batch.status] || STATUS_CONFIG.pending;
                  const progress =
                    batch.total_files > 0
                      ? Math.round((batch.processed_files / batch.total_files) * 100)
                      : 0;

                  return (
                    <tr
                      key={batch.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-900">
                          {batch.name || "Sin nombre"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 tabular-nums">
                          {batch.total_files} PDFs
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${statusConfig.classes}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className={`h-full rounded-full transition-all ${
                                batch.status === "completed" ? "bg-emerald-500" : "bg-[#1e3a5f]"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums font-medium">
                            {progress}%
                          </span>
                        </div>
                        {batch.failed_files > 0 && (
                          <span className="text-[11px] text-red-500 mt-0.5 block">
                            {batch.failed_files} error{batch.failed_files > 1 ? "es" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(batch.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
