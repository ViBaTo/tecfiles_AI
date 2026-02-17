"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Package,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  Eye,
  FileText,
  Trash2,
  Layers,
  SendHorizontal,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EstadoBadge } from "@/components/ui/EstadoBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ActionMenu, type ActionMenuEntry } from "@/components/ui/ActionMenu";
import { ProductCard } from "@/components/products/ProductCard";
import { useDatasheets } from "@/hooks/useDatasheets";
import type { DatasheetWithBatch } from "@/hooks/useDatasheets";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/contexts/ToastContext";
import { canDeleteDatasheet, getAllowedTransitions } from "@/lib/permissions";
import type { DatasheetStatus } from "@/lib/supabase/types";

const STATUS_OPTIONS: { value: DatasheetStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "extracting", label: "Extrayendo" },
  { value: "review", label: "En Revisión" },
  { value: "approved", label: "Aprobado" },
  { value: "published", label: "Publicado" },
  { value: "error", label: "Error" },
];

export default function FichasPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DatasheetStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [confirmDelete, setConfirmDelete] = useState<DatasheetWithBatch | null>(null);
  const { tenant, tenantUser, loading: tenantLoading } = useTenant();
  const { datasheets, loading: datasheetsLoading, deleteDatasheet, updateDatasheetStatus } = useDatasheets({
    tenantId: tenant?.id,
  });
  const { toast } = useToast();

  const loading = tenantLoading || datasheetsLoading;

  const handleStatusChange = async (datasheet: DatasheetWithBatch, newStatus: DatasheetStatus) => {
    const { error: err } = await updateDatasheetStatus(datasheet.id, newStatus);
    if (err) {
      toast.error("Error al cambiar el estado");
    } else {
      const statusLabels: Record<string, string> = {
        review: "en revisión",
        approved: "aprobado",
        draft: "borrador",
        published: "publicado",
      };
      toast.success(`Estado cambiado a ${statusLabels[newStatus] || newStatus}`);
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

  // Filter datasheets
  const filteredDatasheets = datasheets.filter((f) => {
    const matchesSearch =
      search === "" ||
      f.article_name?.toLowerCase().includes(search.toLowerCase()) ||
      f.project_code?.toLowerCase().includes(search.toLowerCase()) ||
      f.material?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || f.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = statusFilter !== "all" || search !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const STATUS_TRANSITION_META: Record<string, { label: string; icon: React.ReactNode }> = {
    review: { label: "Enviar a revisión", icon: <SendHorizontal size={16} strokeWidth={1.5} /> },
    approved: { label: "Aprobar", icon: <CheckCircle2 size={16} strokeWidth={1.5} /> },
    draft: { label: "Devolver a borrador", icon: <XCircle size={16} strokeWidth={1.5} /> },
    published: { label: "Publicar", icon: <Globe size={16} strokeWidth={1.5} /> },
  };

  const buildTableRowMenu = (ficha: DatasheetWithBatch): ActionMenuEntry[] => {
    const transitions = getAllowedTransitions(tenantUser?.role, ficha.status);

    const statusItems: ActionMenuEntry[] =
      transitions.length > 0
        ? [
            { type: "divider" as const } as ActionMenuEntry,
            ...transitions.map((status) => {
              const meta = STATUS_TRANSITION_META[status] || { label: status, icon: null };
              return {
                label: meta.label,
                icon: meta.icon,
                onClick: () => handleStatusChange(ficha, status),
              } as ActionMenuEntry;
            }),
          ]
        : [];

    return [
      {
        label: "Ver ficha",
        icon: <Eye size={16} strokeWidth={1.5} />,
        onClick: () => router.push(`/fichas/${ficha.id}`),
      },
      {
        label: "Ver PDF",
        icon: <FileText size={16} strokeWidth={1.5} />,
        onClick: () => router.push(`/fichas/${ficha.id}/pdf`),
      },
      ...statusItems,
      ...(canDeleteDatasheet(tenantUser?.role)
        ? [
            { type: "divider" as const } as ActionMenuEntry,
            {
              label: "Eliminar",
              icon: <Trash2 size={16} strokeWidth={1.5} />,
              onClick: () => setConfirmDelete(ficha),
              danger: true,
            } as ActionMenuEntry,
          ]
        : []),
    ];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <Header
        title="Biblioteca de Productos"
        subtitle={`${filteredDatasheets.length} productos encontrados`}
        actions={
          <Link
            href="/generator"
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
          >
            <Plus size={16} strokeWidth={1.5} /> Nueva Ficha
          </Link>
        }
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 py-3 border-b border-slate-200 mb-4">
        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DatasheetStatus | "all")}
            className="appearance-none border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 cursor-pointer transition-colors duration-150"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            strokeWidth={1.5}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors duration-150"
          >
            <X size={14} strokeWidth={1.5} />
            Limpiar
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors duration-150 ${
              viewMode === "grid"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-md transition-colors duration-150 ${
              viewMode === "table"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:ring-offset-1 transition-colors duration-150"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse mt-2" />
              <div className="flex gap-2 mt-4">
                <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      ) : filteredDatasheets.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
          <p className="text-lg font-medium text-slate-800">Sin productos todavía</p>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? "Prueba a cambiar los filtros"
              : "Sube tu primer archivo para empezar"}
          </p>
          {!hasActiveFilters && (
            <Link
              href="/generator"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
            >
              <Plus size={16} strokeWidth={1.5} /> Subir Archivo
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {filteredDatasheets.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={canDeleteDatasheet(tenantUser?.role) ? () => setConfirmDelete(product) : undefined}
              allowedTransitions={getAllowedTransitions(tenantUser?.role, product.status)}
              onStatusChange={(newStatus) => handleStatusChange(product, newStatus)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Código
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Artículo
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Material
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Lote
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Fecha
                  </th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3 bg-slate-50">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasheets.map((ficha) => (
                  <tr
                    key={ficha.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors duration-150 group"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-slate-500 tabular-nums">
                        {ficha.project_code || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/fichas/${ficha.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-[#1e3a5f] transition-colors"
                      >
                        {ficha.article_name || "Sin nombre"}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {ficha.finish || "Sin acabado"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {ficha.material || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {ficha.batch_name ? (
                        <Link
                          href="/lotes"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors duration-150"
                        >
                          <Layers size={12} strokeWidth={2} />
                          {ficha.batch_name}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={ficha.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(ficha.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <ActionMenu items={buildTableRowMenu(ficha)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
