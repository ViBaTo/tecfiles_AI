"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
  Sparkles,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const features = [
    {
      icon: FileText,
      title: "Fichas Tecnicas",
      description: "Gestion centralizada de documentacion tecnica de producto",
    },
    {
      icon: Sparkles,
      title: "Generacion con IA",
      description: "Crea fichas automaticamente con inteligencia artificial",
    },
    {
      icon: Shield,
      title: "Seguro y Confiable",
      description: "Tus datos protegidos con los mas altos estandares",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className={`hidden lg:flex lg:w-[55%] relative overflow-hidden transition-all duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #0a1628 0%, #122240 25%, #1a3358 50%, #1e3a5f 75%, #234a72 100%)",
          }}
        />

        {/* Subtle radial overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(30, 58, 95, 0.3) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 70%, rgba(30, 58, 95, 0.2) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 xl:p-16 w-full min-h-screen">
          <div className="w-full max-w-lg">
            {/* Logo & Title */}
            <div
              className={`text-center mb-16 transition-all duration-700 delay-300 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="mb-8">
                <h1 className="text-white text-5xl font-bold tracking-tight">
                  DOSSIER
                </h1>
                <p className="text-white/50 text-sm font-medium tracking-[0.2em] uppercase mt-2">
                  by VIBATO
                </p>
              </div>
              <p className="text-white/40 text-lg font-light">
                Sistema integral de gestion documental
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-5 rounded-xl bg-white/6 border border-white/10 transition-all duration-700 hover:bg-white/10 hover:border-white/20 ${
                    mounted
                      ? "translate-x-0 opacity-100"
                      : "translate-x-[-20px] opacity-0"
                  }`}
                  style={{ transitionDelay: `${500 + index * 150}ms` }}
                >
                  <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center border border-white/15 shrink-0">
                    <feature.icon className="w-5 h-5 text-white/70" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className={`mt-16 text-center transition-all duration-700 delay-1000 ${
                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-4">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-white/20" />
                <span className="text-white/30 text-xs tracking-widest font-medium">
                  Powered by VIBATO
                </span>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Right Panel - Login Form */}
      <div
        className="w-full lg:w-[45%] flex items-center justify-center px-6 py-10 sm:p-10 lg:p-16 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #060d17 0%, #0a1525 50%, #0d1a2d 100%)",
        }}
      >
        <div
          className={`w-full max-w-[420px] relative z-10 transition-all duration-700 delay-200 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-14">
            <div>
              <span className="text-white text-3xl font-bold tracking-tight block">
                DOSSIER
              </span>
              <span className="text-white/40 text-xs tracking-[0.15em] uppercase font-medium">
                by VIBATO
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Bienvenido de vuelta
            </h2>
            <p className="text-white/50 text-base">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-red-400 text-sm font-medium">
                  Error de autenticacion
                </p>
                <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className={`block text-xs font-medium uppercase tracking-wider mb-3 transition-colors duration-200 ${
                    focusedField === "email" ? "text-white/80" : "text-white/50"
                  }`}
                >
                  Correo electronico
                </label>
                <div className="relative flex items-center">
                  <div
                    className={`absolute left-3 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      focusedField === "email"
                        ? "bg-[#1e3a5f] text-white"
                        : "bg-white/8 text-white/40"
                    }`}
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-15 pr-4 py-3.5 rounded-lg bg-white/8 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:bg-white/10 focus:border-white/25 transition-all duration-200"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="password"
                    className={`block text-xs font-medium uppercase tracking-wider transition-colors duration-200 ${
                      focusedField === "password" ? "text-white/80" : "text-white/50"
                    }`}
                  >
                    Contrasena
                  </label>
                  <button
                    type="button"
                    className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
                  >
                    Olvidaste tu contrasena?
                  </button>
                </div>
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
                    placeholder="********"
                    required
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-lg font-medium text-sm bg-[#1e3a5f] hover:bg-[#16304f] text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar sesion</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm">
              No tienes cuenta?{" "}
              <button className="text-white/70 hover:text-white font-medium transition-colors duration-150">
                Solicitar acceso
              </button>
            </p>
          </div>

          {/* Mobile Footer */}
          <p className="lg:hidden mt-10 text-center text-white/25 text-xs tracking-wider">
            Powered by VIBATO
          </p>
        </div>
      </div>
    </div>
  );
}
