"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Layers,
  Loader,
  MoreHorizontal,
  Upload,
  X,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useBatchJobs } from "@/hooks/useBatchJobs";
import { useTenant } from "@/hooks/useTenant";
import { useDatasheets } from "@/hooks/useDatasheets";
import { createClient } from "@/lib/supabase/client";

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

type BatchMode = "upload" | "regenerate" | "re_extract";

export default function LotesPage() {
  const { tenant } = useTenant();
  const { batches, loading, error, createBatch } = useBatchJobs({
    tenantId: tenant?.id,
  });
  const { datasheets } = useDatasheets({ tenantId: tenant?.id });

  const [showModal, setShowModal] = useState(false);
  const [batchMode, setBatchMode] = useState<BatchMode>("upload");
  const [batchName, setBatchName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDatasheetIds, setSelectedDatasheetIds] = useState<string[]>(
    []
  );
  const [batchLanguage, setBatchLanguage] = useState("es");
  const [isProcessing, setIsProcessing] = useState(false);

  const supabase = createClient();

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(Array.from(e.target.files));
      }
    },
    []
  );

  const toggleDatasheet = useCallback((id: string) => {
    setSelectedDatasheetIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }, []);

  const selectAllDraftDatasheets = useCallback(() => {
    const draftIds = datasheets
      .filter(
        (ds) =>
          ds.status === "draft" ||
          ds.status === "review" ||
          ds.status === "approved"
      )
      .map((ds) => ds.id);
    setSelectedDatasheetIds(draftIds);
  }, [datasheets]);

  const handleStartBatch = useCallback(async () => {
    if (!tenant?.id) return;
    setIsProcessing(true);

    try {
      if (batchMode === "upload") {
        if (selectedFiles.length === 0) return;

        const name =
          batchName.trim() ||
          `Lote ${new Date().toLocaleDateString("es-ES")}`;
        const result = await createBatch(name, selectedFiles.length);
        if (result.error || !result.data) {
          throw new Error(result.error || "Failed to create batch");
        }
        const batchId = result.data.id;

        // Upload each file to storage and create datasheet records
        const datasheetIds: string[] = [];
        const { data: user } = await supabase.auth.getUser();

        for (const file of selectedFiles) {
          const filePath = `${tenant.id}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("datasheets")
            .upload(filePath, file);

          if (uploadError) {
            console.error("Upload error for", file.name, uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from("datasheets")
            .getPublicUrl(filePath);

          const { data: ds, error: dsError } = await supabase
            .from("ds_datasheets")
            .insert({
              tenant_id: tenant.id,
              source_file_url: urlData.publicUrl,
              source_file_name: file.name,
              status: "uploading" as const,
              created_by: user.user?.id || null,
            })
            .select()
            .single();

          if (dsError || !ds) {
            console.error("Datasheet creation error for", file.name, dsError);
            continue;
          }

          // Create processing job
          await supabase.from("ds_processing_jobs").insert({
            tenant_id: tenant.id,
            datasheet_id: ds.id,
            job_type: "extraction" as const,
            status: "pending" as const,
          });

          await supabase
            .from("ds_datasheets")
            .update({ status: "extracting" as const })
            .eq("id", ds.id);

          datasheetIds.push(ds.id);
        }

        // Trigger batch processing
        if (datasheetIds.length > 0) {
          await fetch("/api/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              batchId,
              datasheetIds,
              mode: "extract_and_generate",
              language: batchLanguage,
            }),
          });
        }
      } else {
        // Regenerate or re-extract mode
        if (selectedDatasheetIds.length === 0) return;

        const modeLabel = batchMode === "regenerate" ? "Regenerar" : "Re-extraer";
        const name =
          batchName.trim() ||
          `${modeLabel} ${new Date().toLocaleDateString("es-ES")}`;
        const result = await createBatch(name, selectedDatasheetIds.length);
        if (result.error || !result.data) {
          throw new Error(result.error || "Failed to create batch");
        }

        await fetch("/api/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            batchId: result.data.id,
            datasheetIds: selectedDatasheetIds,
            mode: batchMode,
            language: batchLanguage,
          }),
        });
      }

      // Reset and close
      setShowModal(false);
      setBatchName("");
      setSelectedFiles([]);
      setSelectedDatasheetIds([]);
    } catch (err) {
      console.error("Batch start error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [
    tenant,
    batchMode,
    batchName,
    selectedFiles,
    selectedDatasheetIds,
    batchLanguage,
    createBatch,
    supabase,
  ]);

  const openNewBatch = () => {
    setBatchMode("upload");
    setBatchName("");
    setSelectedFiles([]);
    setSelectedDatasheetIds([]);
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const datasheetCandidates = datasheets.filter(
    (ds) =>
      ds.status === "draft" ||
      ds.status === "review" ||
      ds.status === "approved"
  );

  return (
    <div>
      <Header
        title="Procesamiento por Lotes"
        subtitle="Gestiona el procesamiento masivo de planos"
        actions={
          <button
            onClick={openNewBatch}
            className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
          >
            <Plus size={16} strokeWidth={1.5} /> Nuevo Lote
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader
            size={24}
            className="animate-spin text-slate-400"
            strokeWidth={1.5}
          />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-6 text-sm">
          Error al cargar lotes: {error}
        </div>
      ) : batches.length === 0 ? (
        <div className="py-16 text-center">
          <Layers
            size={48}
            className="mx-auto mb-4 text-slate-300"
            strokeWidth={1.5}
          />
          <p className="text-lg font-medium text-slate-800">
            Sin lotes procesados
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Crea un lote para procesar múltiples archivos
          </p>
          <button
            onClick={openNewBatch}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
          >
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
                  const statusConfig =
                    STATUS_CONFIG[batch.status] || STATUS_CONFIG.pending;
                  const progress =
                    batch.total_files > 0
                      ? Math.round(
                          (batch.processed_files / batch.total_files) * 100
                        )
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
                                batch.status === "completed"
                                  ? "bg-emerald-500"
                                  : "bg-[#1e3a5f]"
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
                            {batch.failed_files} error
                            {batch.failed_files > 1 ? "es" : ""}
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

      {/* New Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Nuevo Lote
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Mode selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBatchMode("upload")}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === "upload"
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Upload size={16} strokeWidth={1.5} />
                  Subir PDFs
                </button>
                <button
                  onClick={() => setBatchMode("regenerate")}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === "regenerate"
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RefreshCw size={16} strokeWidth={1.5} />
                  Regenerar
                </button>
                <button
                  onClick={() => setBatchMode("re_extract")}
                  className={`flex-1 flex items-center gap-2 justify-center px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    batchMode === "re_extract"
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <RefreshCw size={16} strokeWidth={1.5} />
                  Re-extraer
                </button>
              </div>

              {/* Batch name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del lote (opcional)
                </label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder={
                    batchMode === "upload"
                      ? "Ej: Catálogo primavera 2026"
                      : "Ej: Regenerar descripciones EN"
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                />
              </div>

              {/* Language selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Idioma de generación
                </label>
                <select
                  value={batchLanguage}
                  onChange={(e) => setBatchLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              {batchMode === "upload" && (
                /* File upload */
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Archivos PDF
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-[#1e3a5f]/40 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="batch-files"
                    />
                    <label
                      htmlFor="batch-files"
                      className="cursor-pointer block"
                    >
                      <Upload
                        size={32}
                        className="mx-auto mb-2 text-slate-400"
                        strokeWidth={1.5}
                      />
                      <p className="text-sm text-slate-600">
                        Haz clic para seleccionar PDFs
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Se procesarán automáticamente con IA
                      </p>
                    </label>
                  </div>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-slate-600 mt-2">
                      {selectedFiles.length} archivo
                      {selectedFiles.length > 1 ? "s" : ""} seleccionado
                      {selectedFiles.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}

              {(batchMode === "regenerate" || batchMode === "re_extract") && (
                /* Datasheet selection for regeneration / re-extraction */
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Fichas a regenerar
                    </label>
                    <button
                      onClick={selectAllDraftDatasheets}
                      className="text-xs text-[#1e3a5f] hover:underline"
                    >
                      Seleccionar todas ({datasheetCandidates.length})
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    {datasheetCandidates.length === 0 ? (
                      <p className="text-sm text-slate-400 p-4 text-center">
                        No hay fichas con datos extraídos
                      </p>
                    ) : (
                      datasheetCandidates.map((ds) => (
                        <label
                          key={ds.id}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDatasheetIds.includes(ds.id)}
                            onChange={() => toggleDatasheet(ds.id)}
                            className="rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-slate-900 truncate block">
                              {ds.article_name || "Sin nombre"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {ds.project_code || ds.id.slice(0, 8)}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedDatasheetIds.length > 0 && (
                    <p className="text-sm text-slate-600 mt-2">
                      {selectedDatasheetIds.length} ficha
                      {selectedDatasheetIds.length > 1 ? "s" : ""} seleccionada
                      {selectedDatasheetIds.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleStartBatch}
                disabled={
                  isProcessing ||
                  (batchMode === "upload" && selectedFiles.length === 0) ||
                  ((batchMode === "regenerate" || batchMode === "re_extract") &&
                    selectedDatasheetIds.length === 0)
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader
                      size={16}
                      className="animate-spin"
                      strokeWidth={1.5}
                    />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Layers size={16} strokeWidth={1.5} />
                    {batchMode === "upload"
                      ? `Procesar ${selectedFiles.length} archivo${selectedFiles.length !== 1 ? "s" : ""}`
                      : batchMode === "regenerate"
                        ? `Regenerar ${selectedDatasheetIds.length} ficha${selectedDatasheetIds.length !== 1 ? "s" : ""}`
                        : `Re-extraer ${selectedDatasheetIds.length} ficha${selectedDatasheetIds.length !== 1 ? "s" : ""}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
