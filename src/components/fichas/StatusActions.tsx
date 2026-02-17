"use client";

import { Check, X, Send, Globe, ShieldAlert } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import type { DatasheetStatus, UserRole } from "@/lib/supabase/types";
import {
  canSendToReview,
  canApproveReject,
  canPublish,
} from "@/lib/permissions";

interface StatusActionsProps {
  status: DatasheetStatus;
  userRole?: UserRole;
  onStatusChange: (newStatus: DatasheetStatus) => Promise<void>;
}

export function StatusActions({
  status,
  userRole,
  onStatusChange,
}: StatusActionsProps) {
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

  if (
    status === "published" ||
    status === "uploading" ||
    status === "extracting" ||
    status === "error"
  ) {
    return null;
  }

  const showSendToReview = status === "draft" && canSendToReview(userRole);
  const showApprove = status === "review" && canApproveReject(userRole);
  const showReject = status === "review" && canApproveReject(userRole);
  const showPublish = status === "approved" && canPublish(userRole);

  // Show a message when the user cannot perform any action on the current status
  const hasNoActions =
    !showSendToReview && !showApprove && !showReject && !showPublish;

  if (hasNoActions) {
    const roleLabels: Record<string, string> = {
      draft: "Solo editores y administradores pueden enviar a revisión.",
      review: "Solo revisores y administradores pueden aprobar o rechazar.",
      approved: "Solo revisores y administradores pueden publicar.",
    };

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Acciones</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldAlert size={16} strokeWidth={1.5} className="text-slate-400" />
            {roleLabels[status] || "No hay acciones disponibles para tu rol."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Acciones</h3>
      </div>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {showSendToReview && (
            <button
              onClick={() => handleChange("review")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
            >
              <Send size={15} strokeWidth={1.5} />
              Enviar a revisión
            </button>
          )}
          {showApprove && (
            <button
              onClick={() => handleChange("approved")}
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors duration-150"
            >
              <Check size={15} strokeWidth={1.5} />
              Aprobar
            </button>
          )}
          {showReject && (
            <button
              onClick={() => handleChange("draft")}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150"
            >
              <X size={15} strokeWidth={1.5} />
              Rechazar
            </button>
          )}
          {showPublish && (
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
