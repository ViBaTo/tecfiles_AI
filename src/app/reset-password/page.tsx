"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "password" | "confirm" | null
  >(null);
  const { updatePassword } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{
        background:
          "linear-gradient(180deg, #060d17 0%, #0a1525 50%, #0d1a2d 100%)",
      }}
    >
      <div
        className={`w-full max-w-[420px] relative z-10 transition-all duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="text-center mb-14">
          <span className="text-white text-3xl font-bold tracking-tight block">
            DOSSIER
          </span>
          <span className="text-white/40 text-xs tracking-[0.15em] uppercase font-medium">
            by VIBATO
          </span>
        </div>

        {/* Header */}
        <div className="mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {success ? "Contrasena actualizada" : "Nueva contrasena"}
          </h2>
          <p className="text-white/50 text-base">
            {success
              ? "Tu contrasena ha sido cambiada correctamente"
              : "Introduce tu nueva contrasena"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-red-400 text-sm font-medium">Error</p>
              <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2
                  className="w-6 h-6 text-green-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-white/50 text-sm">
                Redirigiendo al panel...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className={`block text-xs font-medium uppercase tracking-wider mb-3 transition-colors duration-200 ${
                    focusedField === "password"
                      ? "text-white/80"
                      : "text-white/50"
                  }`}
                >
                  Nueva contrasena
                </label>
                <div className="relative flex items-center">
                  <div
                    className={`absolute left-3 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      focusedField === "password"
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white/8 text-white/40"
                    }`}
                  >
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-15 pr-14 py-3.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/10 focus:border-white/25 transition-all duration-200"
                    placeholder="Minimo 6 caracteres"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      showPassword
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white/8 text-white/40 hover:bg-white/12 hover:text-white/60"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="mb-8">
                <label
                  htmlFor="confirm-password"
                  className={`block text-xs font-medium uppercase tracking-wider mb-3 transition-colors duration-200 ${
                    focusedField === "confirm"
                      ? "text-white/80"
                      : "text-white/50"
                  }`}
                >
                  Confirmar contrasena
                </label>
                <div className="relative flex items-center">
                  <div
                    className={`absolute left-3 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      focusedField === "confirm"
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white/8 text-white/40"
                    }`}
                  >
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-15 pr-14 py-3.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/10 focus:border-white/25 transition-all duration-200"
                    placeholder="Repite tu contrasena"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className={`absolute right-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      showConfirmPassword
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white/8 text-white/40 hover:bg-white/12 hover:text-white/60"
                    }`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg font-medium text-sm bg-[#1e3a5f] hover:bg-[#16304f] text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      strokeWidth={1.5}
                    />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <span>Actualizar contrasena</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-white/25 text-xs tracking-wider">
          Powered by VIBATO
        </p>
      </div>
    </div>
  );
}
