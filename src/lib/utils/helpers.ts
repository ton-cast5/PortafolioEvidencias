import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getFileExtension(url: string): string {
  return url.split(".").pop()?.toLowerCase() ?? "";
}

export function isImageFile(url: string): boolean {
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(getFileExtension(url));
}

export function isPdfFile(url: string): boolean {
  return getFileExtension(url) === "pdf";
}

export function isCodeFile(url: string): boolean {
  return ["js", "ts", "tsx", "jsx", "py", "java", "c", "cpp", "h", "lex", "y", "txt", "md"].includes(
    getFileExtension(url)
  );
}

/** Limpia segmentos de ruta para Supabase Storage (evita /, #, acentos, etc.) */
export function sanitizeStorageSegment(value: string): string {
  const cleaned = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[/\\?%*:|"<>#]/g, "-")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .slice(0, 80);

  return cleaned || "item";
}

export function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const ext = lastDot > 0 ? name.slice(lastDot).toLowerCase() : "";
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  return `${sanitizeStorageSegment(base)}${ext}`;
}

export function buildStoragePath(...segments: string[]): string {
  return segments.map(sanitizeStorageSegment).join("/");
}

export function isEmptyHtml(html: string): boolean {
  if (!html.trim()) return true;
  if (typeof document === "undefined") {
    return !html.replace(/<[^>]+>/g, "").trim();
  }
  const div = document.createElement("div");
  div.innerHTML = html;
  return !(div.innerText || div.textContent || "").trim();
}

export function formatSupabaseError(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string };
    if (e.message) return e.message;
    if (e.details) return e.details;
    if (e.hint) return e.hint;
  }
  return "Ocurrio un error inesperado";
}
