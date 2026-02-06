import {
  LayoutDashboard,
  FileUp,
  FileText,
  Palette,
  Layers,
  Users,
  Edit3,
  Loader,
  Eye,
  CheckCircle,
  FileCheck,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

// Types
export interface Ficha {
  id: number;
  codigo: string;
  articulo: string;
  familia: string;
  estado: EstadoKey;
  fecha: string;
  material: string;
  acabado: string;
}

export type EstadoKey = "borrador" | "generando" | "revision" | "aprobado" | "publicado" | "error";

export interface EstadoConfig {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
}

export interface NavItem {
  key: string;
  icon: LucideIcon;
  label: string;
  href: string;
}

// Mock Data
export const MOCK_FICHAS: Ficha[] = [
  { id: 1, codigo: "250030", articulo: "APLIQUE BAÑO", familia: "Iluminación Baño", estado: "aprobado", fecha: "2026-02-03", material: "Metal / Cristal", acabado: "Fumé / Negro" },
  { id: 2, codigo: "250031", articulo: "LÁMPARA COLGANTE", familia: "Colgantes", estado: "revision", fecha: "2026-02-04", material: "Latón / Vidrio", acabado: "Dorado Satinado" },
  { id: 3, codigo: "250032", articulo: "APLIQUE PARED", familia: "Apliques", estado: "borrador", fecha: "2026-02-04", material: "Aluminio", acabado: "Blanco Mate" },
  { id: 4, codigo: "250033", articulo: "DOWNLIGHT EMPOTRABLE", familia: "Empotrados", estado: "generando", fecha: "2026-02-05", material: "Aluminio / PC", acabado: "Negro" },
  { id: 5, codigo: "250034", articulo: "LÁMPARA DE PIE", familia: "Pie", estado: "publicado", fecha: "2026-01-28", material: "Acero / Mármol", acabado: "Negro / Carrara" },
  { id: 6, codigo: "250035", articulo: "APLIQUE EXTERIOR", familia: "Exterior", estado: "error", fecha: "2026-02-05", material: "Acero Inox", acabado: "Grafito" },
  { id: 7, codigo: "250036", articulo: "FOCO CARRIL", familia: "Técnica", estado: "publicado", fecha: "2026-01-25", material: "Aluminio", acabado: "Negro Mate" },
  { id: 8, codigo: "250037", articulo: "TIRA LED PERFIL", familia: "Técnica", estado: "aprobado", fecha: "2026-02-01", material: "Aluminio / LED", acabado: "Anodizado Natural" },
];

export const ESTADOS: Record<EstadoKey, EstadoConfig> = {
  borrador: { label: "Borrador", color: "#64748b", bg: "#f1f5f9", icon: Edit3 },
  generando: { label: "Generando", color: "#f59e0b", bg: "#fef3c7", icon: Loader },
  revision: { label: "En Revisión", color: "#000000", bg: "#f5f5f5", icon: Eye },
  aprobado: { label: "Aprobado", color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
  publicado: { label: "Publicado", color: "#ffffff", bg: "#000000", icon: FileCheck },
  error: { label: "Error", color: "#ef4444", bg: "#fee2e2", icon: AlertCircle },
};

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { key: "generator", icon: FileUp, label: "Generador", href: "/generator" },
  { key: "fichas", icon: FileText, label: "Fichas", href: "/fichas" },
  { key: "plantillas", icon: Palette, label: "Plantillas", href: "/plantillas" },
  { key: "lotes", icon: Layers, label: "Lotes", href: "/lotes" },
  { key: "usuarios", icon: Users, label: "Usuarios", href: "/usuarios" },
];

// Helper function to get ficha by id
export function getFichaById(id: number): Ficha | undefined {
  return MOCK_FICHAS.find(f => f.id === id);
}

// Helper function to get ficha by codigo
export function getFichaByCodigo(codigo: string): Ficha | undefined {
  return MOCK_FICHAS.find(f => f.codigo === codigo);
}
