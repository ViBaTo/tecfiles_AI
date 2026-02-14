import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Datasheet } from "@/lib/supabase/types";
import { formatValue, formatSpecKey } from "@/lib/formatters";

// ── Brand colours ───────────────────────────────
const BRAND = {
  primary: [30, 58, 95] as [number, number, number], // #1e3a5f
  dark: [15, 23, 42] as [number, number, number], // slate-900
  muted: [100, 116, 139] as [number, number, number], // slate-500
  light: [241, 245, 249] as [number, number, number], // slate-100
  white: [255, 255, 255] as [number, number, number],
};

const PAGE_WIDTH = 210; // A4 mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── Main export ─────────────────────────────────
export function generateFichaPdf(datasheet: Datasheet): void {
  const doc = new jsPDF("p", "mm", "a4");
  let y = MARGIN;

  // ─── Header ────────────────────────────────────
  y = drawHeader(doc, datasheet, y);

  // ─── Basic product info ────────────────────────
  y = drawBasicInfo(doc, datasheet, y);

  // ─── Description ───────────────────────────────
  if (datasheet.generated_description) {
    y = drawDescription(doc, datasheet.generated_description, y);
  }

  // ─── Technical Specs Table ─────────────────────
  const specs = (datasheet.technical_specs || {}) as Record<string, unknown>;
  const entries = Object.entries(specs).filter(
    ([, v]) => v !== null && v !== undefined
  );
  if (entries.length > 0) {
    y = drawSpecsTable(doc, entries, y);
  }

  // ─── Footer ────────────────────────────────────
  drawFooter(doc);

  // ─── Download ──────────────────────────────────
  const filename = [datasheet.project_code, datasheet.article_name]
    .filter(Boolean)
    .join("_")
    .replace(/\s+/g, "_");

  doc.save(`${filename || "ficha"}.pdf`);
}

// ── Section renderers ───────────────────────────

function drawHeader(doc: jsPDF, ds: Datasheet, y: number): number {
  // Brand bar
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, PAGE_WIDTH, 32, "F");

  // Product name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...BRAND.white);
  doc.text(ds.article_name || "Sin nombre", MARGIN, 15);

  // Project code
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(200, 210, 225);
  doc.text(`Código: ${ds.project_code || "-"}`, MARGIN, 24);

  return y + 22; // below the brand bar
}

function drawBasicInfo(doc: jsPDF, ds: Datasheet, y: number): number {
  const fields = [
    { label: "Material", value: ds.material },
    { label: "Acabado", value: ds.finish },
    { label: "Dimensiones", value: ds.dimensions },
    { label: "Peso", value: ds.weight },
  ].filter((f) => f.value);

  if (fields.length === 0) return y;

  const colWidth = CONTENT_WIDTH / fields.length;

  // Light background strip
  doc.setFillColor(...BRAND.light);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 18, 2, 2, "F");

  fields.forEach((field, i) => {
    const x = MARGIN + i * colWidth + 6;

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    doc.text(field.label.toUpperCase(), x, y + 6);

    // Value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.dark);
    doc.text(field.value || "-", x, y + 13);
  });

  return y + 26;
}

function drawDescription(doc: jsPDF, description: string, y: number): number {
  // Check if we need a new page
  if (y > 250) {
    doc.addPage();
    y = MARGIN;
  }

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text("Descripción", MARGIN, y);
  y += 6;

  // Divider line
  doc.setDrawColor(...BRAND.light);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
  y += 5;

  // Description text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // slate-600
  const lines = doc.splitTextToSize(description, CONTENT_WIDTH);
  doc.text(lines, MARGIN, y);
  y += lines.length * 5 + 8;

  return y;
}

function drawSpecsTable(
  doc: jsPDF,
  entries: [string, unknown][],
  y: number
): number {
  // Check if we need a new page
  if (y > 240) {
    doc.addPage();
    y = MARGIN;
  }

  // Section title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.dark);
  doc.text("Especificaciones Técnicas", MARGIN, y);
  y += 6;

  // Divider line
  doc.setDrawColor(...BRAND.light);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
  y += 3;

  // Build table rows
  const tableBody = entries.map(([key, value]) => [
    formatSpecKey(key).toUpperCase(),
    formatValue(value),
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Especificación", "Valor"]],
    body: tableBody,
    theme: "plain",
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 5, right: 5 },
      textColor: BRAND.dark,
      lineColor: BRAND.light,
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: BRAND.primary,
      textColor: BRAND.white,
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    columnStyles: {
      0: {
        fontStyle: "bold",
        cellWidth: 60,
        textColor: BRAND.muted,
        fontSize: 8,
      },
      1: {
        cellWidth: CONTENT_WIDTH - 60,
      },
    },
  });

  // Return the Y position after the table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable.finalY + 10;
}

function drawFooter(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);

    // Date
    const date = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Generado: ${date}`, MARGIN, 287);

    // Page number
    doc.text(`Página ${i} de ${pageCount}`, PAGE_WIDTH - MARGIN, 287, {
      align: "right",
    });

    // Bottom line
    doc.setDrawColor(...BRAND.light);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 284, PAGE_WIDTH - MARGIN, 284);
  }
}
