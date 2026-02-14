"use client";

import { FileText } from "lucide-react";

interface SourceFileViewerProps {
  datasheetId: string;
  hasSourceFile: boolean;
}

export function SourceFileViewer({ datasheetId, hasSourceFile }: SourceFileViewerProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <FileText size={15} strokeWidth={1.5} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-900">Plano Original</h3>
      </div>

      {hasSourceFile ? (
        <div className="bg-slate-50">
          <iframe
            src={`/api/files/${datasheetId}`}
            className="w-full"
            style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
            title="Plano original"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-slate-50/50">
          <FileText size={48} className="mb-3 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm font-medium text-slate-500">Sin archivo de origen</p>
          <p className="text-xs text-slate-400 mt-1">
            Suba un plano o PDF para visualizarlo aquí
          </p>
        </div>
      )}
    </div>
  );
}
