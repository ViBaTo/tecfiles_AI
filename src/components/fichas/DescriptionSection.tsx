"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Loader, Copy, Check } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

interface DescriptionSectionProps {
  description: string | null;
  descriptionLanguage: string | null;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

const LANGUAGES = [
  { code: "es", label: "ES", full: "Español" },
  { code: "en", label: "EN", full: "English" },
  { code: "fr", label: "FR", full: "Français" },
  { code: "de", label: "DE", full: "Deutsch" },
];

export function DescriptionSection({
  description,
  descriptionLanguage,
  selectedLanguage,
  onLanguageChange,
  onGenerate,
  isGenerating,
}: DescriptionSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!description) return;
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast.success("Descripción copiada al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const currentLangFull =
    LANGUAGES.find((l) => l.code === descriptionLanguage)?.full || descriptionLanguage;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} strokeWidth={1.5} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900">
            Descripción Generada
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Language pills */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                  selectedLanguage === lang.code
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Regenerate */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors duration-150 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader size={14} className="animate-spin" strokeWidth={1.5} />
            ) : (
              <RefreshCw size={14} strokeWidth={1.5} />
            )}
            {isGenerating ? "Generando..." : "Regenerar"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {description ? (
          <div>
            <div className="relative group">
              <p className="text-sm text-slate-600 leading-relaxed pr-8">
                {description}
              </p>
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="absolute top-0 right-0 p-1.5 rounded-md text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-150"
                title="Copiar descripción"
              >
                {copied ? (
                  <Check size={14} strokeWidth={1.5} className="text-emerald-500" />
                ) : (
                  <Copy size={14} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              {descriptionLanguage && (
                <span className="text-[11px] text-slate-400 font-medium">
                  Idioma: {currentLangFull}
                </span>
              )}
              <span className="text-[11px] text-slate-400 tabular-nums">
                {description.length} caracteres
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-amber-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">
              Sin descripción generada
            </p>
            <p className="text-xs text-slate-400 mb-4">
              Genera una descripción comercial con IA
            </p>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#1e3a5f] px-5 py-2.5 rounded-lg hover:bg-[#16304f] transition-colors duration-150 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader size={14} className="animate-spin" strokeWidth={1.5} />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles size={14} strokeWidth={1.5} />
                  Generar con IA
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
