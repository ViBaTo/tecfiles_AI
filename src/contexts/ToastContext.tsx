"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

// ── Types ─────────────────────────────────────────
type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
  };
}

// ── Context ───────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Icons & styles per type ───────────────────────
const TOAST_CONFIG: Record<
  ToastType,
  { icon: typeof CheckCircle; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  info: {
    icon: Info,
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
  },
};

// ── Provider ──────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismiss after 4s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast: ToastContextValue["toast"] = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    info: (msg) => addToast("info", msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const cfg = TOAST_CONFIG[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-medium ${cfg.bg} ${cfg.border} animate-slideIn min-w-[300px] max-w-[420px]`}
            >
              <Icon size={18} strokeWidth={1.5} className={`${cfg.text} shrink-0 mt-0.5`} />
              <p className={`text-sm font-medium ${cfg.text} flex-1`}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className={`shrink-0 p-0.5 rounded hover:bg-black/5 ${cfg.text} opacity-60 hover:opacity-100 transition-opacity`}
              >
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
