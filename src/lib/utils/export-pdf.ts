import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument } from "pdf-lib";
import type { SubjectWithUnits, Evidence } from "@/lib/types";
import {
  EVIDENCE_TYPE_LABELS,
  TOPIC_TYPE_LABELS,
  DEFAULT_UNIVERSITY,
  DEFAULT_DIVISION,
} from "@/lib/types";
import { isImageFile, isPdfFile, getFileExtension } from "@/lib/utils/helpers";

const FONT_SIZE = 12;
const LINE_HEIGHT = 1.5;
const MARGIN = 25;
const FONT = "helvetica";

type PdfContext = {
  doc: jsPDF;
  y: number;
  pageWidth: number;
  contentWidth: number;
  pdfAttachments: string[];
};

function newPage(ctx: PdfContext) {
  ctx.doc.addPage();
  ctx.y = MARGIN;
}

function ensureSpace(ctx: PdfContext, needed: number) {
  const pageHeight = ctx.doc.internal.pageSize.getHeight();
  if (ctx.y + needed > pageHeight - MARGIN) {
    newPage(ctx);
  }
}

function setBodyStyle(doc: jsPDF) {
  doc.setFont(FONT, "normal");
  doc.setFontSize(FONT_SIZE);
  doc.setLineHeightFactor(LINE_HEIGHT);
  doc.setTextColor(0, 0, 0);
}

function addJustifiedText(ctx: PdfContext, text: string, indent = 0) {
  if (!text.trim()) return;
  setBodyStyle(ctx.doc);
  const lines = ctx.doc.splitTextToSize(text.trim(), ctx.contentWidth - indent);
  const lineStep = (FONT_SIZE * LINE_HEIGHT) / ctx.doc.internal.scaleFactor;
  for (const line of lines) {
    ensureSpace(ctx, lineStep);
    ctx.doc.text(line, MARGIN + indent, ctx.y, {
      align: "justify",
      maxWidth: ctx.contentWidth - indent,
    });
    ctx.y += lineStep;
  }
}

function addHeading(ctx: PdfContext, text: string, level: 1 | 2 | 3 = 1) {
  const sizes = { 1: 16, 2: 14, 3: 12 };
  const spaceBefore = level === 1 ? 10 : 6;
  ctx.y += spaceBefore;
  ensureSpace(ctx, 20);
  ctx.doc.setFont(FONT, "bold");
  ctx.doc.setFontSize(sizes[level]);
  ctx.doc.setTextColor(0, 0, 0);
  const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth);
  const lineStep = (sizes[level] * LINE_HEIGHT) / ctx.doc.internal.scaleFactor;
  for (const line of lines) {
    ensureSpace(ctx, lineStep);
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += lineStep;
  }
  ctx.y += 4;
}

function htmlToPlainText(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

async function renderHtmlToCanvas(html: string, widthPx = 680): Promise<HTMLCanvasElement | null> {
  if (!html.trim() || typeof document === "undefined") return null;

  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${widthPx}px; padding: 16px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12pt; line-height: 1.5;
    text-align: justify; color: #000; background: #fff;
  `;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    return canvas;
  } finally {
    document.body.removeChild(container);
  }
}

async function addHtmlBlock(ctx: PdfContext, html: string) {
  const plain = htmlToPlainText(html);
  if (plain.trim()) {
    addJustifiedText(ctx, plain);
    ctx.y += 4;
    return;
  }

  const canvas = await renderHtmlToCanvas(html);
  if (!canvas) return;

  const imgWidth = ctx.contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pageHeight = ctx.doc.internal.pageSize.getHeight();
  let remaining = imgHeight;
  let srcY = 0;

  while (remaining > 0) {
    const available = pageHeight - MARGIN - ctx.y;
    const sliceHeight = Math.min(remaining, available);
    if (sliceHeight <= 10) {
      newPage(ctx);
      continue;
    }
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = (sliceHeight / imgWidth) * canvas.width;
    const sctx = sliceCanvas.getContext("2d");
    if (sctx) {
      sctx.drawImage(
        canvas,
        0,
        (srcY / imgWidth) * canvas.width,
        canvas.width,
        sliceCanvas.height,
        0,
        0,
        canvas.width,
        sliceCanvas.height
      );
      ctx.doc.addImage(
        sliceCanvas.toDataURL("image/png"),
        "PNG",
        MARGIN,
        ctx.y,
        imgWidth,
        sliceHeight
      );
    }
    ctx.y += sliceHeight;
    srcY += sliceHeight;
    remaining -= sliceHeight;
    if (remaining > 0) newPage(ctx);
  }
  ctx.y += 6;
}

async function addImageFromUrl(ctx: PdfContext, url: string, caption?: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    let w = img.width;
    let h = img.height;
    const maxW = ctx.contentWidth;
    const maxH = 120;
    if (w > maxW) {
      h = (h * maxW) / w;
      w = maxW;
    }
    if (h > maxH) {
      w = (w * maxH) / h;
      h = maxH;
    }

    ensureSpace(ctx, h + 12);
    if (caption) {
      setBodyStyle(ctx.doc);
      ctx.doc.setFont(FONT, "italic");
      ctx.doc.text(caption, MARGIN, ctx.y);
      ctx.y += 6;
    }
    const format = url.toLowerCase().includes(".png") ? "PNG" : "JPEG";
    ctx.doc.addImage(dataUrl, format, MARGIN, ctx.y, w, h);
    ctx.y += h + 8;
  } catch {
    addJustifiedText(ctx, `[Imagen no disponible: ${url}]`);
  }
}

async function addEvidence(ctx: PdfContext, evidence: Evidence) {
  addHeading(ctx, `${EVIDENCE_TYPE_LABELS[evidence.type]}: ${evidence.title}`, 3);

  if (evidence.description) {
    addJustifiedText(ctx, evidence.description);
  }

  if (evidence.content) {
    await addHtmlBlock(ctx, evidence.content);
  }

  if (evidence.file_url) {
    if (isPdfFile(evidence.file_url)) {
      ctx.pdfAttachments.push(evidence.file_url);
      addJustifiedText(ctx, `[Documento PDF adjunto: ${evidence.title}]`);
    } else if (isImageFile(evidence.file_url)) {
      await addImageFromUrl(ctx, evidence.file_url, evidence.title);
    } else {
      const ext = getFileExtension(evidence.file_url);
      addJustifiedText(
        ctx,
        `[Archivo adjunto (${ext?.toUpperCase() || "DOC"}): ${evidence.title} — ${evidence.file_url}]`
      );
    }
  }

  ctx.y += 4;
}

function addCoverPage(ctx: PdfContext, subject: SubjectWithUnits) {
  const center = ctx.pageWidth / 2;
  let y = 40;

  const addCentered = (text: string, size: number, bold = false, gap = 8) => {
    ctx.doc.setFont(FONT, bold ? "bold" : "normal");
    ctx.doc.setFontSize(size);
    ctx.doc.setTextColor(0, 0, 0);
    const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth);
    for (const line of lines) {
      ctx.doc.text(line, center, y, { align: "center" });
      y += (size * LINE_HEIGHT) / ctx.doc.internal.scaleFactor;
    }
    y += gap;
  };

  addCentered(subject.university ?? DEFAULT_UNIVERSITY, 14, true, 4);
  addCentered(subject.division ?? DEFAULT_DIVISION, 12, false, 16);

  if (subject.project_name) {
    addCentered(subject.project_name, 18, true, 20);
  } else {
    addCentered("PORTAFOLIO DE EVIDENCIAS", 18, true, 20);
  }

  const fields: [string, string | null | undefined][] = [
    ["Licenciatura", subject.degree],
    ["Código de asignatura", subject.course_code],
    ["Asignatura", subject.course_name ?? subject.name],
    ["Grupo", subject.group_name],
    ["Docente", subject.teacher_name],
    ["Estudiante", subject.student_name],
  ];

  setBodyStyle(ctx.doc);
  for (const [label, value] of fields) {
    if (!value) continue;
    ensureSpace(ctx, 10);
    ctx.doc.setFont(FONT, "bold");
    ctx.doc.text(`${label}:`, MARGIN + 20, y);
    ctx.doc.setFont(FONT, "normal");
    const labelW = ctx.doc.getTextWidth(`${label}: `);
    const valLines = ctx.doc.splitTextToSize(value, ctx.contentWidth - 40 - labelW);
    ctx.doc.text(valLines[0], MARGIN + 20 + labelW, y);
    if (valLines.length > 1) {
      for (let i = 1; i < valLines.length; i++) {
        y += (FONT_SIZE * LINE_HEIGHT) / ctx.doc.internal.scaleFactor;
        ctx.doc.text(valLines[i], MARGIN + 20 + labelW, y);
      }
    }
    y += (FONT_SIZE * LINE_HEIGHT) / ctx.doc.internal.scaleFactor + 2;
  }

  y += 10;
  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(100, 100, 100);
  ctx.doc.text(
    `Generado: ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`,
    center,
    y,
    { align: "center" }
  );

  ctx.y = y;
}

async function mergePdfAttachments(mainBytes: ArrayBuffer, urls: string[]): Promise<Uint8Array> {
  const mainDoc = await PDFDocument.load(mainBytes);

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const attachBytes = await res.arrayBuffer();
      const attachDoc = await PDFDocument.load(attachBytes);
      const pages = await mainDoc.copyPages(attachDoc, attachDoc.getPageIndices());
      pages.forEach((p) => mainDoc.addPage(p));
    } catch {
      // skip failed attachments
    }
  }

  return mainDoc.save();
}

export async function exportPortfolioToPDF(subject: SubjectWithUnits): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const ctx: PdfContext = {
    doc,
    y: MARGIN,
    pageWidth,
    contentWidth: pageWidth - MARGIN * 2,
    pdfAttachments: [],
  };

  addCoverPage(ctx, subject);
  newPage(ctx);

  if (subject.encuadre) {
    addHeading(ctx, "ENCUADRE", 1);
    await addHtmlBlock(ctx, subject.encuadre);
    newPage(ctx);
  }

  if (subject.programa) {
    addHeading(ctx, "PROGRAMA DE LA MATERIA", 1);
    await addHtmlBlock(ctx, subject.programa);
    newPage(ctx);
  }

  addHeading(ctx, "CONTENIDO POR UNIDADES", 1);

  for (const unit of subject.units) {
    addHeading(ctx, unit.title, 2);
    if (unit.description) {
      addJustifiedText(ctx, unit.description);
    }

    for (const topic of unit.topics) {
      const typeLabel = TOPIC_TYPE_LABELS[topic.topic_type ?? "tema"];
      addHeading(ctx, `${typeLabel}: ${topic.title}`, 3);
      if (topic.description) {
        addJustifiedText(ctx, topic.description);
      }

      if (topic.evidences.length === 0) {
        addJustifiedText(ctx, "Sin evidencias registradas.");
        continue;
      }

      for (const evidence of topic.evidences) {
        await addEvidence(ctx, evidence);
      }
    }
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const fileName = `${(subject.course_name ?? subject.name).replace(/\s+/g, "_")}_portafolio.pdf`;

  if (ctx.pdfAttachments.length > 0) {
    const mainBytes = doc.output("arraybuffer");
    const merged = await mergePdfAttachments(mainBytes, ctx.pdfAttachments);
    const blob = new Blob([new Uint8Array(merged)], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } else {
    doc.save(fileName);
  }
}
