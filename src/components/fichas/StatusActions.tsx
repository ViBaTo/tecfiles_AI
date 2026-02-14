"use client";

import { Check, X, Send, Globe } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { DatasheetStatus } from "@/lib/supabase/types";

interface StatusActionsProps {
  status: DatasheetStatus;
  onStatusChange: (newStatus: DatasheetStatus) => Promise<void>;
}

export function StatusActions({ status, onStatusChange }: StatusActionsProps) {
  const { toast } = useToast();

  const handleChange = async (newStatus: DatasheetStatus) => {
    try {
      await onStatusChange(newStatus);
      const labels: Record<string, string> = {
        review: "Enviado a revisión",
        approved: "Ficha aprobada",
        draft: "Devuelto a borrador",
        published: "Ficha publicada",
      };
      toast.success(labels[newStatus] || "Estado actualizado");
    } catch {
      toast.error("Error al cambiar el estado");
    }
  };

  // No actions for published status
  if (status === "published" || status === "uploading" || status === "extracting" || status === "error") {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Acciones</h3>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {status === "draft" && (
            <button
              onClick={() => handleChange("review")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
            >
              <Send size={15} strokeWidth={1.5} />
              Enviar a revisión
            </button>
          )}
          {status === "review" && (
            <>
              <button
                onClick={() => handleChange("approved")}
                className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors duration-150"
              >
                <Check size={15} strokeWidth={1.5} />
                Aprobar
              </button>
              <button
                onClick={() => handleChange("draft")}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
              >
                <X size={15} strokeWidth={1.5} />
                Rechazar
              </button>
            </>
          )}
          {status === "approved" && (
            <button
              onClick={() => handleChange("published")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-lg bg-[#1e3a5f] hover:bg-[#16304f] transition-colors duration-150"
            >
              <Globe size={15} strokeWidth={1.5} />
              Publicar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
