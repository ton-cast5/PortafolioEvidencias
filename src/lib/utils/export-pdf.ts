import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
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
const MARGIN = 56.69; // ~20mm en pt
const FOOTER = 36;
const FONT = "helvetica";
const MAX_CANVAS_HEIGHT = 12000;

const RICH_HTML_STYLES = `
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  line-height: 1.5;
  text-align: justify;
  color: #000;
  background: #fff;
  word-spacing: normal;
  letter-spacing: normal;
`;

type PdfContext = {
  doc: jsPDF;
  y: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  pdfAttachments: string[];
};

function lineStep(fontSize: number): number {
  return fontSize * LINE_HEIGHT;
}

function newPage(ctx: PdfContext) {
  ctx.doc.addPage();
  ctx.y = MARGIN;
}

function ensureSpace(ctx: PdfContext, needed: number) {
  if (ctx.y + needed > ctx.pageHeight - FOOTER) {
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
  const trimmed = text.trim();
  if (!trimmed) return;

  setBodyStyle(ctx.doc);
  const maxWidth = ctx.contentWidth - indent;
  const lines = ctx.doc.splitTextToSize(trimmed, maxWidth);
  const step = lineStep(FONT_SIZE);

  for (const line of lines) {
    ensureSpace(ctx, step);
    ctx.doc.text(line, MARGIN + indent, ctx.y, {
      align: "justify",
      maxWidth,
    });
    ctx.y += step;
  }
}

function addParagraphs(ctx: PdfContext, text: string, indent = 0) {
  const blocks = text.trim().split(/\n\n+/);
  for (let i = 0; i < blocks.length; i++) {
    addJustifiedText(ctx, blocks[i], indent);
    if (i < blocks.length - 1) {
      ctx.y += FONT_SIZE * 0.4;
    }
  }
}

function addHeading(ctx: PdfContext, text: string, level: 1 | 2 | 3 = 1) {
  const sizes = { 1: 16, 2: 14, 3: 12 };
  const size = sizes[level];
  const spaceBefore = level === 1 ? 14 : level === 2 ? 10 : 8;
  const spaceAfter = level === 1 ? 8 : 6;

  ctx.y += spaceBefore;
  ensureSpace(ctx, lineStep(size) + spaceAfter);

  ctx.doc.setFont(FONT, "bold");
  ctx.doc.setFontSize(size);
  ctx.doc.setLineHeightFactor(LINE_HEIGHT);
  ctx.doc.setTextColor(0, 0, 0);

  const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth);
  const step = lineStep(size);

  for (const line of lines) {
    ensureSpace(ctx, step);
    ctx.doc.text(line, MARGIN, ctx.y);
    ctx.y += step;
  }

  ctx.y += spaceAfter;
  setBodyStyle(ctx.doc);
}

function htmlToPlainText(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, " ");
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText || div.textContent || "";
}

function hasRichFormatting(html: string): boolean {
  return /<(h[1-6]|ul|ol|li|strong|b|em|i|u|blockquote)[\s>]/i.test(html);
}

function injectRichHtmlStyles(): () => void {
  const id = "pdf-export-rich-styles";
  if (document.getElementById(id)) {
    return () => undefined;
  }

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    #pdf-export-root p { margin: 0 0 10pt; }
    #pdf-export-root p:last-child { margin-bottom: 0; }
    #pdf-export-root h1, #pdf-export-root h2, #pdf-export-root h3 {
      font-weight: bold; margin: 14pt 0 8pt; line-height: 1.3;
    }
    #pdf-export-root h1 { font-size: 16pt; }
    #pdf-export-root h2 { font-size: 14pt; }
    #pdf-export-root h3 { font-size: 12pt; }
    #pdf-export-root ul, #pdf-export-root ol { margin: 0 0 10pt; padding-left: 24pt; }
    #pdf-export-root li { margin-bottom: 4pt; }
    #pdf-export-root li p { margin: 0; }
    #pdf-export-root strong, #pdf-export-root b { font-weight: bold; }
    #pdf-export-root em, #pdf-export-root i { font-style: italic; }
    #pdf-export-root u { text-decoration: underline; }
  `;
  document.head.appendChild(style);
  return () => style.remove();
}

async function renderHtmlToCanvas(html: string, widthPx = 680): Promise<HTMLCanvasElement | null> {
  if (!html.trim() || typeof document === "undefined") return null;

  const cleanupStyles = injectRichHtmlStyles();
  const container = document.createElement("div");
  container.id = "pdf-export-root";
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${widthPx}px; padding: 0;
    box-sizing: border-box;
    ${RICH_HTML_STYLES}
  `;
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    return await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
  } catch (err) {
    console.warn("html2canvas fallo, usando texto plano:", err);
    return null;
  } finally {
    document.body.removeChild(container);
    cleanupStyles();
  }
}

async function addCanvasToPdf(ctx: PdfContext, canvas: HTMLCanvasElement) {
  if (!canvas.width || !canvas.height) return;

  const imgWidthPt = ctx.contentWidth;
  const imgHeightPt = (canvas.height * imgWidthPt) / canvas.width;
  if (!Number.isFinite(imgHeightPt) || imgHeightPt <= 0) return;

  let offsetPt = 0;
  let guard = 0;
  const maxSlices = Math.ceil(imgHeightPt / 10) + 50;

  while (offsetPt < imgHeightPt - 0.5 && guard < maxSlices) {
    guard += 1;
    const available = ctx.pageHeight - FOOTER - ctx.y;
    if (available < 12) {
      newPage(ctx);
      continue;
    }

    const sliceHeightPt = Math.min(imgHeightPt - offsetPt, available);
    if (sliceHeightPt <= 0) break;

    const srcYPx = (offsetPt / imgHeightPt) * canvas.height;
    const sliceHeightPx = (sliceHeightPt / imgHeightPt) * canvas.height;

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = Math.max(1, Math.ceil(sliceHeightPx));

    const sctx = sliceCanvas.getContext("2d");
    if (!sctx) break;

    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    sctx.drawImage(
      canvas,
      0,
      srcYPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceCanvas.height
    );

    let dataUrl: string;
    try {
      dataUrl = sliceCanvas.toDataURL("image/jpeg", 0.92);
    } catch {
      dataUrl = sliceCanvas.toDataURL("image/png");
    }

    ctx.doc.addImage(dataUrl, "JPEG", MARGIN, ctx.y, imgWidthPt, sliceHeightPt);

    ctx.y += sliceHeightPt + 2;
    offsetPt += sliceHeightPt;

    if (offsetPt < imgHeightPt - 0.5) {
      newPage(ctx);
    }
  }

  ctx.y += 6;
}

/** Renderiza HTML con el formato original (negritas, listas, etc.) */
async function addRichHtmlBlock(ctx: PdfContext, html: string) {
  try {
    const canvas = await renderHtmlToCanvas(html);
    if (!canvas || canvas.height > MAX_CANVAS_HEIGHT) {
      addParagraphs(ctx, htmlToPlainText(html));
      return;
    }
    await addCanvasToPdf(ctx, canvas);
  } catch (err) {
    console.warn("Error renderizando HTML enriquecido:", err);
    addParagraphs(ctx, htmlToPlainText(html));
  }
}

/** Texto estructurado para descripciones y evidencias */
async function addHtmlBlock(ctx: PdfContext, html: string) {
  const plain = htmlToPlainText(html);
  if (!plain.trim()) return;

  if (hasRichFormatting(html)) {
    await addRichHtmlBlock(ctx, html);
    return;
  }

  const paragraphs = plain.split(/\n+/).filter((p) => p.trim());
  for (let i = 0; i < paragraphs.length; i++) {
    addJustifiedText(ctx, paragraphs[i]);
    if (i < paragraphs.length - 1) {
      ctx.y += FONT_SIZE * 0.35;
    }
  }
  ctx.y += 4;
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
    const maxH = 140;
    if (w > maxW) {
      h = (h * maxW) / w;
      w = maxW;
    }
    if (h > maxH) {
      w = (w * maxH) / h;
      h = maxH;
    }

    ensureSpace(ctx, h + (caption ? 14 : 0) + 8);
    if (caption) {
      setBodyStyle(ctx.doc);
      ctx.doc.setFont(FONT, "italic");
      ctx.doc.text(caption, MARGIN, ctx.y);
      ctx.y += lineStep(FONT_SIZE);
    }
    const format = url.toLowerCase().includes(".png") ? "PNG" : "JPEG";
    ctx.doc.addImage(dataUrl, format, MARGIN, ctx.y, w, h);
    ctx.y += h + 10;
    setBodyStyle(ctx.doc);
  } catch {
    addJustifiedText(ctx, `[Imagen no disponible]`);
  }
}

async function addEvidence(ctx: PdfContext, evidence: Evidence) {
  ctx.y += 4;
  addHeading(ctx, `${EVIDENCE_TYPE_LABELS[evidence.type]}: ${evidence.title}`, 3);

  if (evidence.description) {
    addParagraphs(ctx, evidence.description);
    ctx.y += 4;
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
        `[Archivo adjunto (${ext?.toUpperCase() || "DOC"}): ${evidence.title}]`
      );
    }
  }

  ctx.y += 8;
}

function addCoverPage(ctx: PdfContext, subject: SubjectWithUnits) {
  const center = ctx.pageWidth / 2;
  let y = 48;

  const addCentered = (text: string, size: number, bold = false, gap = 10) => {
    ctx.doc.setFont(FONT, bold ? "bold" : "normal");
    ctx.doc.setFontSize(size);
    ctx.doc.setLineHeightFactor(LINE_HEIGHT);
    ctx.doc.setTextColor(0, 0, 0);
    const lines = ctx.doc.splitTextToSize(text, ctx.contentWidth);
    const step = lineStep(size);
    for (const line of lines) {
      if (y + step > ctx.pageHeight - FOOTER) {
        newPage(ctx);
        y = MARGIN;
      }
      ctx.doc.text(line, center, y, { align: "center" });
      y += step;
    }
    y += gap;
  };

  addCentered(subject.university ?? DEFAULT_UNIVERSITY, 14, true, 6);
  addCentered(subject.division ?? DEFAULT_DIVISION, 12, false, 18);

  if (subject.project_name) {
    addCentered(subject.project_name, 18, true, 24);
  } else {
    addCentered("PORTAFOLIO DE EVIDENCIAS", 18, true, 24);
  }

  const fields: [string, string | null | undefined][] = [
    ["Licenciatura", subject.degree],
    ["Codigo de asignatura", subject.course_code],
    ["Asignatura", subject.course_name ?? subject.name],
    ["Grupo", subject.group_name],
    ["Docente", subject.teacher_name],
    ["Estudiante", subject.student_name],
  ];

  const step = lineStep(FONT_SIZE);
  const labelIndent = 24;

  for (const [label, value] of fields) {
    if (!value) continue;

    if (y + step * 2 > ctx.pageHeight - FOOTER) {
      newPage(ctx);
      y = MARGIN;
    }

    setBodyStyle(ctx.doc);
    ctx.doc.setFont(FONT, "bold");
    const labelText = `${label}:`;
    const labelW = ctx.doc.getTextWidth(labelText) + 4;

    ctx.doc.text(labelText, MARGIN + labelIndent, y);
    ctx.doc.setFont(FONT, "normal");

    const valLines = ctx.doc.splitTextToSize(value, ctx.contentWidth - labelIndent * 2 - labelW);
    ctx.doc.text(valLines[0], MARGIN + labelIndent + labelW, y);

    for (let i = 1; i < valLines.length; i++) {
      y += step;
      if (y + step > ctx.pageHeight - FOOTER) {
        newPage(ctx);
        y = MARGIN;
      }
      ctx.doc.text(valLines[i], MARGIN + labelIndent + labelW, y);
    }

    y += step + 4;
  }

  y += 12;
  if (y + 14 > ctx.pageHeight - FOOTER) {
    newPage(ctx);
    y = MARGIN;
  }

  ctx.doc.setFontSize(10);
  ctx.doc.setTextColor(100, 100, 100);
  ctx.doc.text(
    `Generado: ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`,
    center,
    y,
    { align: "center" }
  );

  ctx.y = y + 14;
}

async function appendPdfFromUrl(doc: PDFDocument, url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const bytes = await res.arrayBuffer();
    const attachDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await doc.copyPages(attachDoc, attachDoc.getPageIndices());
    pages.forEach((p) => doc.addPage(p));
  } catch (err) {
    console.warn("No se pudo adjuntar PDF:", url, err);
  }
}

async function mergePortfolioPdf(
  frontBytes: ArrayBuffer,
  bodyBytes: ArrayBuffer,
  programaUrl: string | null,
  evidenceUrls: string[]
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(frontBytes, { ignoreEncryption: true });

  if (programaUrl) {
    await appendPdfFromUrl(doc, programaUrl);
  }

  const bodyDoc = await PDFDocument.load(bodyBytes, { ignoreEncryption: true });
  const bodyPages = await doc.copyPages(bodyDoc, bodyDoc.getPageIndices());
  bodyPages.forEach((p) => doc.addPage(p));

  for (const url of evidenceUrls) {
    await appendPdfFromUrl(doc, url);
  }

  return doc.save();
}

async function addPageNumbersToPdf(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    // Sin acentos: Helvetica WinAnsi no soporta caracteres como "á"
    const text = `Pagina ${index + 1} de ${total}`;
    const textWidth = font.widthOfTextAtSize(text, 9);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 22,
      size: 9,
      font,
      color: rgb(0.47, 0.47, 0.47),
    });
  });

  return doc.save();
}

async function buildUnitsSection(ctx: PdfContext, subject: SubjectWithUnits) {
  addHeading(ctx, "CONTENIDO POR UNIDADES", 1);

  for (const unit of subject.units) {
    ctx.y += 4;
    addHeading(ctx, unit.title, 2);
    if (unit.description) {
      addParagraphs(ctx, unit.description);
      ctx.y += 4;
    }

    for (const topic of unit.topics) {
      ctx.y += 2;
      const typeLabel = TOPIC_TYPE_LABELS[topic.topic_type ?? "tema"];
      addHeading(ctx, `${typeLabel}: ${topic.title}`, 3);
      if (topic.description) {
        addParagraphs(ctx, topic.description);
        ctx.y += 4;
      }

      if (topic.evidences.length === 0) {
        addJustifiedText(ctx, "Sin evidencias registradas.");
        ctx.y += 6;
        continue;
      }

      for (const evidence of topic.evidences) {
        await addEvidence(ctx, evidence);
      }
    }
  }
}

function createPdfContext(): PdfContext {
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  return {
    doc,
    y: MARGIN,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - MARGIN * 2,
    pdfAttachments: [],
  };
}

function downloadPdfBlob(blob: Blob, fileName: string) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function buildAndDownloadPdf(
  subject: SubjectWithUnits,
  fileName: string,
  includePrograma: boolean,
  includeEvidencePdfs: boolean
) {
  const frontCtx = createPdfContext();

  addCoverPage(frontCtx, subject);
  newPage(frontCtx);

  if (subject.encuadre) {
    addHeading(frontCtx, "ENCUADRE", 1);
    await addRichHtmlBlock(frontCtx, subject.encuadre);
  }

  if (includePrograma && subject.programa_file_url) {
    newPage(frontCtx);
    addHeading(frontCtx, "PROGRAMA DE LA MATERIA", 1);
  }

  const bodyCtx = createPdfContext();
  await buildUnitsSection(bodyCtx, subject);

  const programaUrl = includePrograma ? subject.programa_file_url : null;
  const evidenceUrls = includeEvidencePdfs ? bodyCtx.pdfAttachments : [];

  let pdfBytes: Uint8Array;

  try {
    const merged = await mergePortfolioPdf(
      frontCtx.doc.output("arraybuffer"),
      bodyCtx.doc.output("arraybuffer"),
      programaUrl,
      evidenceUrls
    );
    pdfBytes = await addPageNumbersToPdf(merged);
  } catch (mergeErr) {
    console.warn("Merge PDF fallo, usando exportacion simple:", mergeErr);
    const merged = await mergePortfolioPdf(
      frontCtx.doc.output("arraybuffer"),
      bodyCtx.doc.output("arraybuffer"),
      null,
      []
    );
    try {
      pdfBytes = await addPageNumbersToPdf(merged);
    } catch {
      pdfBytes = new Uint8Array(merged);
    }
  }

  downloadPdfBlob(
    new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
    fileName
  );
}

export async function exportPortfolioToPDF(subject: SubjectWithUnits): Promise<void> {
  const fileName = `${(subject.course_name ?? subject.name).replace(/\s+/g, "_")}_portafolio.pdf`;

  try {
    await buildAndDownloadPdf(subject, fileName, true, true);
  } catch (err) {
    console.error("Error exportando PDF:", err);
    throw new Error(
      err instanceof Error ? err.message : "No se pudo generar el PDF del portafolio"
    );
  }
}
