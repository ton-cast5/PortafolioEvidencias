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
