"use client";

import { useEffect, useState } from "react";
import type { Evidence } from "@/lib/types";
import { EVIDENCE_TYPE_LABELS } from "@/lib/types";
import {
  isImageFile,
  isPdfFile,
  isCodeFile,
  isEmptyHtml,
  formatDate,
  getFileExtension,
} from "@/lib/utils/helpers";
import { Calendar, Download, FileText } from "lucide-react";

interface FilePreviewProps {
  evidence: Evidence;
}

function EvidenceMeta({ evidence }: { evidence: Evidence }) {
  return (
    <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {EVIDENCE_TYPE_LABELS[evidence.type]}
        </span>
        {evidence.due_date && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            Entrega: {formatDate(evidence.due_date)}
          </span>
        )}
      </div>

      {evidence.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{evidence.description}</p>
      )}

      {evidence.tags && evidence.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {evidence.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeFileViewer({ url, title }: { url: string; title: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const ext = getFileExtension(url);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setCode(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="space-y-3 text-center py-6">
        <p className="text-sm text-gray-500">No se pudo cargar la vista previa del codigo</p>
        <a
          href={url}
          download
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Descargar archivo
        </a>
      </div>
    );
  }

  if (code === null) {
    return <p className="py-8 text-center text-sm text-gray-500">Cargando archivo...</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {title}.{ext}
        </span>
        <a
          href={url}
          download
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          <Download className="h-3.5 w-3.5" />
          Descargar
        </a>
      </div>
      <pre className="max-h-[50vh] overflow-auto bg-gray-950 p-4 text-xs leading-relaxed text-green-400">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FileSection({ evidence }: { evidence: Evidence }) {
  const url = evidence.file_url;
  if (!url) return null;

  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <FileText className="h-4 w-4" />
        Archivo adjunto
      </h4>

      {isImageFile(url) && (
        <div className="flex justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={evidence.title} className="max-h-[60vh] rounded-lg object-contain" />
        </div>
      )}

      {isPdfFile(url) && (
        <iframe
          src={url}
          className="h-[65vh] w-full rounded-lg border border-gray-200 dark:border-gray-700"
          title={evidence.title}
        />
      )}

      {!isImageFile(url) && !isPdfFile(url) && isCodeFile(url) && (
        <CodeFileViewer url={url} title={evidence.title} />
      )}

      {!isImageFile(url) && !isPdfFile(url) && !isCodeFile(url) && (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="mb-3 text-sm text-gray-500">
            Vista previa no disponible para este tipo de archivo
          </p>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Descargar archivo
          </a>
        </div>
      )}
    </div>
  );
}

export function FilePreview({ evidence }: FilePreviewProps) {
  const hasContent = evidence.content && !isEmptyHtml(evidence.content);
  const hasFile = !!evidence.file_url;
  const hasAnything = hasContent || hasFile || evidence.description;

  if (!hasAnything) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Esta evidencia no tiene contenido adjunto todavia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EvidenceMeta evidence={evidence} />

      {hasContent && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {evidence.type === "apunte" ? "Contenido del apunte" : "Texto de la entrega"}
          </h4>
          <div
            className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            dangerouslySetInnerHTML={{ __html: evidence.content! }}
          />
        </div>
      )}

      {hasFile && <FileSection evidence={evidence} />}
    </div>
  );
}

export function canPreviewEvidence(evidence: Evidence): boolean {
  return !!(
    evidence.file_url ||
    (evidence.content && !isEmptyHtml(evidence.content)) ||
    evidence.description?.trim()
  );
}
