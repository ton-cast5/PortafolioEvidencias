"use client";

import type { Evidence } from "@/lib/types";
import { isImageFile, isPdfFile, isCodeFile } from "@/lib/utils/helpers";

interface FilePreviewProps {
  evidence: Evidence;
}

export function FilePreview({ evidence }: FilePreviewProps) {
  if (evidence.type === "apunte" && evidence.content) {
    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: evidence.content }}
      />
    );
  }

  if (!evidence.file_url) {
    return (
      <p className="text-center text-gray-500 py-8">No hay contenido para previsualizar</p>
    );
  }

  if (isImageFile(evidence.file_url)) {
    return (
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={evidence.file_url}
          alt={evidence.title}
          className="max-h-[70vh] rounded-lg object-contain"
        />
      </div>
    );
  }

  if (isPdfFile(evidence.file_url)) {
    return (
      <iframe
        src={evidence.file_url}
        className="h-[70vh] w-full rounded-lg border border-gray-200 dark:border-gray-700"
        title={evidence.title}
      />
    );
  }

  if (isCodeFile(evidence.file_url)) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Archivo de código — descarga para ver el contenido completo
        </p>
        <a
          href={evidence.file_url}
          download
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Descargar archivo
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center py-8">
      <p className="text-gray-500">Vista previa no disponible para este tipo de archivo</p>
      <a
        href={evidence.file_url}
        download
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Descargar archivo
      </a>
    </div>
  );
}
