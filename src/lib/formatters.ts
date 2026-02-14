/**
 * Shared formatting utilities for technical spec values.
 * Used by both the UI components and PDF generation.
 */

export function formatSpecKey(key: string): string {
  return key.replace(/_/g, " ");
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value
        .map((item) =>
          typeof item === "object"
            ? Object.values(item as Record<string, unknown>)
                .filter(Boolean)
                .join(" - ")
            : String(item)
        )
        .join(", ");
    }
    return Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(
        ([k, v]) =>
          `${formatSpecKey(k)}: ${typeof v === "boolean" ? (v ? "Sí" : "No") : v}`
      )
      .join(" · ");
  }
  return String(value);
}

export function isLongValue(value: unknown): boolean {
  if (typeof value === "object" && value !== null) return true;
  const str = formatValue(value);
  return str.length > 60;
}
