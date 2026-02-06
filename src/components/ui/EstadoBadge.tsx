import { ESTADOS, EstadoKey } from "@/lib/data";

interface EstadoBadgeProps {
  estado: EstadoKey;
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = ESTADOS[estado] || ESTADOS.borrador;
  const Icon = config.icon;
  
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <Icon size={12} strokeWidth={2} className={estado === "generando" ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
}
