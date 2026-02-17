"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { Header } from "@/components/layout/Header";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusDonutChart } from "@/components/dashboard/StatusDonutChart";
import { DatasheetsLineChart } from "@/components/dashboard/DatasheetsLineChart";
import { useDatasheets } from "@/hooks/useDatasheets";
import { useTenant } from "@/contexts/TenantContext";
import { useTemplates } from "@/hooks/useTemplates";
import { useToast } from "@/contexts/ToastContext";
import { generateFichaPdf } from "@/lib/pdf/generateFichaPdf";
import { canDeleteDatasheet } from "@/lib/permissions";
import type { Datasheet } from "@/lib/supabase/types";

export default function DashboardPage() {
  const router = useRouter();
  const { tenant, tenantUser, loading: tenantLoading } = useTenant();
  const { datasheets, loading: datasheetsLoading, deleteDatasheet } = useDatasheets({
    tenantId: tenant?.id,
  });
  const { templates } = useTemplates({ tenantId: tenant?.id });
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<Datasheet | null>(null);

  const loading = tenantLoading || datasheetsLoading;

  const handleDownloadPdf = async (datasheet: Datasheet) => {
    try {
      const template =
        templates.find((t) => t.id === datasheet.template_id) ||
        templates.find((t) => t.is_default && t.template_type === "single") ||
        null;
      await generateFichaPdf(datasheet, datasheet.id, template);
      toast.success("PDF exportado correctamente");
    } catch {
      toast.error("Error al exportar el PDF");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { error: err } = await deleteDatasheet(confirmDelete.id, confirmDelete.source_file_url);
    if (err) {
      toast.error("Error al eliminar la ficha");
    } else {
      toast.success("Ficha eliminada correctamente");
    }
    setConfirmDelete(null);
  };

  // Calculate stats
  const totalFichas = datasheets.length;
  const pendientesRevision = datasheets.filter((f) => f.status === "review").length;
  const publicadas = datasheets.filter((f) => f.status === "published").length;
  const generadasHoy = datasheets.filter((f) => {
    const today = new Date().toDateString();
    return new Date(f.created_at).toDateString() === today;
  }).length;
  // Count by status
  const statusCounts = datasheets.reduce((acc, f) => {
    acc[f.status] = (acc[f.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Vista general del catálogo" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-7 w-16 bg-slate-100 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
            <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mt-2" />
            <div className="h-[220px] bg-slate-50 rounded animate-pulse mt-4" />
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-[180px] bg-slate-50 rounded-full mx-auto w-[160px] animate-pulse mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Vista general del catálogo"
        actions={
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
          >
            <Plus size={16} strokeWidth={1.5} /> Nueva Ficha
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Productos" value={totalFichas} />
        <StatCard label="Pendientes de Revisión" value={pendientesRevision} />
        <StatCard label="Publicadas" value={publicadas} />
        <StatCard label="Generadas Hoy" value={generadasHoy} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DatasheetsLineChart datasheets={datasheets} />
        </div>
        <StatusDonutChart statusCounts={statusCounts} total={totalFichas} />
      </div>

      <div>
        {/* Activity Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Actividad Reciente</h2>
            <Link
              href="/fichas"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors duration-150"
            >
              Ver todas
            </Link>
          </div>

          {datasheets.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Package size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
              <p className="text-lg font-medium text-slate-800">Sin productos todavía</p>
              <p className="text-sm text-slate-500 mt-1">Sube tu primer archivo para empezar</p>
              <Link
                href="/generator"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
              >
                <Plus size={16} strokeWidth={1.5} /> Subir Archivo
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                      Producto
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                      Código
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                      Estado
                    </th>
                    <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                      Actualizado
                    </th>
                    <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {datasheets.slice(0, 6).map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 group"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/fichas/${f.id}`} className="text-sm font-medium text-slate-900 hover:text-[#1e3a5f] transition-colors">
                          {f.article_name || "Sin nombre"}
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {f.material || "Sin material"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-slate-500 tabular-nums">
                          {f.project_code || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <EstadoBadge estado={f.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatRelativeTime(f.updated_at || f.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ActionMenu
                          items={[
                            {
                              label: "Ver ficha",
                              icon: <Eye size={16} strokeWidth={1.5} />,
                              onClick: () => router.push(`/fichas/${f.id}`),
                            },
                            {
                              label: "Descargar PDF",
                              icon: <Download size={16} strokeWidth={1.5} />,
                              onClick: () => handleDownloadPdf(f),
                            },
                            { type: "divider" as const },
                            {
                              label: "Eliminar",
                              icon: <Trash2 size={16} strokeWidth={1.5} />,
                              onClick: () => setConfirmDelete(f),
                              danger: true,
                              disabled: !canDeleteDatasheet(tenantUser?.role),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar ficha"
        description={`¿Seguro que quieres eliminar "${confirmDelete?.article_name || "esta ficha"}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
