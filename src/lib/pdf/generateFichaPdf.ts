import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Datasheet, Template } from "@/lib/supabase/types";
import { formatValue, formatSpecKey } from "@/lib/formatters";

// ── Types for template brand_config and layout ──
interface BrandConfig {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  logo_url?: string;
  fonts?: {
    heading?: string;
    body?: string;
  };
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

interface LayoutConfig {
  show_source_image?: boolean;
  show_basic_info?: boolean;
  show_description?: boolean;
  show_specs_table?: boolean;
  show_components?: boolean;
  header_height?: number;
  sections_order?: string[];
}

type RGB = [number, number, number];

// ── Default brand colours ───────────────────────
const DEFAULT_BRAND = {
  primary: [30, 58, 95] as RGB, // #1e3a5f
  dark: [15, 23, 42] as RGB, // slate-900
  muted: [100, 116, 139] as RGB, // slate-500
  light: [241, 245, 249] as RGB, // slate-100
  white: [255, 255, 255] as RGB,
};

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297; // A4 mm
const DEFAULT_MARGIN = 20;

/**
 * Parse a hex color string like "#1e3a5f" into an [R, G, B] tuple.
 */
function hexToRgb(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

/**
 * Build a resolved brand object from an optional template configuration,
 * falling back to the default brand values.
 */
function resolveBrand(template?: Template | null) {
  const brand = { ...DEFAULT_BRAND };

  if (!template) return brand;

  const config = template.brand_config as BrandConfig | null;
  if (!config?.colors) return brand;

  if (config.colors.primary) {
    brand.primary = hexToRgb(config.colors.primary) || DEFAULT_BRAND.primary;
  }
  if (config.colors.secondary) {
    brand.dark = hexToRgb(config.colors.secondary) || DEFAULT_BRAND.dark;
  }

  return brand;
}

function resolveMargin(template?: Template | null): number {
  const config = template?.brand_config as BrandConfig | null;
  return config?.margins?.left || config?.margins?.top || DEFAULT_MARGIN;
}

function resolveLayout(template?: Template | null): LayoutConfig {
  const layout = template?.layout as LayoutConfig | null;
  return {
    show_source_image: layout?.show_source_image ?? true,
    show_basic_info: layout?.show_basic_info ?? true,
    show_description: layout?.show_description ?? true,
    show_specs_table: layout?.show_specs_table ?? true,
    show_components: layout?.show_components ?? true,
    header_height: layout?.header_height ?? 32,
    sections_order: layout?.sections_order ?? [
      "source_image",
      "basic_info",
      "description",
      "specs_table",
    ],
  };
}

// ── Main export ─────────────────────────────────
export async function generateFichaPdf(
  datasheet: Datasheet,
  datasheetId: string,
  template?: Template | null
): Promise<void> {
  const BRAND = resolveBrand(template);
  const MARGIN = resolveMargin(template);
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
  const layout = resolveLayout(template);

  const doc = new jsPDF("p", "mm", "a4");
  let y = MARGIN;

  // ─── Header ────────────────────────────────────
  y = drawHeader(doc, datasheet, y, BRAND, MARGIN, CONTENT_WIDTH, layout.header_height ?? 32);

  // ─── Render sections in configured order ───────
  for (const section of layout.sections_order || []) {
    switch (section) {
      case "source_image":
        if (layout.show_source_image && datasheet.source_file_url) {
          y = await drawSourceImage(doc, datasheetId, y, MARGIN, CONTENT_WIDTH);
        }
        break;

      case "basic_info":
        if (layout.show_basic_info) {
          y = drawBasicInfo(doc, datasheet, y, BRAND, MARGIN, CONTENT_WIDTH);
        }
        break;

      case "description":
        if (layout.show_description && datasheet.generated_description) {
          y = drawDescription(
            doc,
            datasheet.generated_description,
            y,
            BRAND,
            MARGIN,
            CONTENT_WIDTH
          );
        }
        break;

      case "specs_table": {
        if (!layout.show_specs_table) break;
        const specs = (datasheet.technical_specs || {}) as Record<
          string,
          unknown
        >;
        const entries = Object.entries(specs).filter(
          ([, v]) => v !== null && v !== undefined
        );
        if (entries.length > 0) {
          y = drawSpecsTable(doc, entries, y, BRAND, MARGIN, CONTENT_WIDTH);
        }
        break;
      }
    }
  }

  // ─── Footer ────────────────────────────────────
  drawFooter(doc, BRAND, MARGIN);

  // ─── Download ──────────────────────────────────
  const filename = [datasheet.project_code, datasheet.article_name]
    .filter(Boolean)
    .join("_")
    .replace(/\s+/g, "_");

  doc.save(`${filename || "ficha"}.pdf`);
}

// ── Source image renderer ───────────────────────

async function renderPdfPageToImage(
  pdfUrl: string,
  scale: number = 2
): Promise<string | null> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const response = await fetch(pdfUrl);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas,
    } as unknown as Parameters<typeof page.render>[0]).promise;

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch (err) {
    console.error("Failed to render source PDF page:", err);
    return null;
  }
}

async function drawSourceImage(
  doc: jsPDF,
  datasheetId: string,
  y: number,
  margin: number,
  contentWidth: number
): Promise<number> {
  const imageDataUrl = await renderPdfPageToImage(`/api/files/${datasheetId}`);
  if (!imageDataUrl) return y;

  const imgProps = doc.getImageProperties(imageDataUrl);
  const imgAspect = imgProps.width / imgProps.height;

  const maxWidth = contentWidth;
  const maxHeight = PAGE_HEIGHT - y - margin - 60;

  let imgW = maxWidth;
  let imgH = imgW / imgAspect;

  if (imgH > maxHeight) {
    imgH = maxHeight;
    imgW = imgH * imgAspect;
  }

  const imgX = margin + (contentWidth - imgW) / 2;
  doc.addImage(imageDataUrl, "JPEG", imgX, y, imgW, imgH);
  y += imgH + 8;

  return y;
}

// ── Section renderers ───────────────────────────

function drawHeader(
  doc: jsPDF,
  ds: Datasheet,
  y: number,
  brand: typeof DEFAULT_BRAND,
  margin: number,
  _contentWidth: number,
  headerHeight: number
): number {
  doc.setFillColor(...brand.primary);
  doc.rect(0, 0, PAGE_WIDTH, headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...brand.white);
  doc.text(ds.article_name || "Sin nombre", margin, headerHeight * 0.47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 210, 225);
  doc.text(
    `Código: ${ds.project_code || "-"}`,
    margin,
    headerHeight * 0.75
  );

  return y + (headerHeight - margin + 10);
}

function drawBasicInfo(
  doc: jsPDF,
  ds: Datasheet,
  y: number,
  brand: typeof DEFAULT_BRAND,
  margin: number,
  contentWidth: number
): number {
  const fields = [
    { label: "Material", value: ds.material },
    { label: "Acabado", value: ds.finish },
    { label: "Dimensiones", value: ds.dimensions },
    { label: "Peso", value: ds.weight },
  ].filter((f) => f.value);

  if (fields.length === 0) return y;

  if (y > PAGE_HEIGHT - 40) {
    doc.addPage();
    y = margin;
  }

  const colWidth = contentWidth / fields.length;

  doc.setFillColor(...brand.light);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");

  fields.forEach((field, i) => {
    const x = margin + i * colWidth + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...brand.muted);
    doc.text(field.label.toUpperCase(), x, y + 6);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...brand.dark);
    doc.text(field.value || "-", x, y + 13);
  });

  return y + 26;
}

function drawDescription(
  doc: jsPDF,
  description: string,
  y: number,
  brand: typeof DEFAULT_BRAND,
  margin: number,
  contentWidth: number
): number {
  if (y > 250) {
    doc.addPage();
    y = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...brand.dark);
  doc.text("Descripción", margin, y);
  y += 6;

  doc.setDrawColor(...brand.light);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const lines = doc.splitTextToSize(description, contentWidth);
  doc.text(lines, margin, y);
  y += lines.length * 5 + 8;

  return y;
}

function drawSpecsTable(
  doc: jsPDF,
  entries: [string, unknown][],
  y: number,
  brand: typeof DEFAULT_BRAND,
  margin: number,
  contentWidth: number
): number {
  if (y > 240) {
    doc.addPage();
    y = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...brand.dark);
  doc.text("Especificaciones Técnicas", margin, y);
  y += 6;

  doc.setDrawColor(...brand.light);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 3;

  const tableBody = entries.map(([key, value]) => [
    formatSpecKey(key).toUpperCase(),
    formatValue(value),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Especificación", "Valor"]],
    body: tableBody,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      textColor: brand.dark,
      lineColor: brand.light,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: brand.primary,
      textColor: brand.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 60,
        textColor: brand.muted,
        fontSize: 8,
      },
      1: {
        cellWidth: contentWidth - 60,
      },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY + 10;
}

function drawFooter(
  doc: jsPDF,
  brand: typeof DEFAULT_BRAND,
  margin: number
): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...brand.muted);

    const date = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generado: ${date}`, margin, 287);

    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - margin, 287, {
      align: "right",
    });

    doc.setDrawColor(...brand.light);
    doc.setLineWidth(0.3);
    doc.line(margin, 284, PAGE_WIDTH - margin, 284);
  }
}
