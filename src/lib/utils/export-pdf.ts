import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SubjectWithUnits } from "@/lib/types";
import { EVIDENCE_TYPE_LABELS } from "@/lib/types";

export function exportPortfolioToPDF(subject: SubjectWithUnits) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246);
  doc.text(subject.name, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  if (subject.description) {
    const descLines = doc.splitTextToSize(subject.description, pageWidth - 40);
    doc.text(descLines, pageWidth / 2, 30, { align: "center" });
  }

  doc.setFontSize(9);
  doc.text(
    `Generado: ${new Date().toLocaleDateString("es-MX", { dateStyle: "long" })}`,
    pageWidth / 2,
    42,
    { align: "center" }
  );

  let yPos = 52;

  for (const unit of subject.units) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text(unit.title, 14, yPos);
    yPos += 7;

    if (unit.description) {
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const unitDesc = doc.splitTextToSize(unit.description, pageWidth - 28);
      doc.text(unitDesc, 14, yPos);
      yPos += unitDesc.length * 4 + 4;
    }

    for (const topic of unit.topics) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setTextColor(59, 130, 246);
      doc.text(`  ${topic.title}`, 14, yPos);
      yPos += 6;

      if (topic.evidences.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [["Evidencia", "Tipo", "Tags", "Fecha"]],
          body: topic.evidences.map((e) => [
            e.title,
            EVIDENCE_TYPE_LABELS[e.type],
            e.tags?.join(", ") || "—",
            e.due_date || new Date(e.created_at).toLocaleDateString("es-MX"),
          ]),
          margin: { left: 20 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] },
        });
        yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      } else {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("    Sin evidencias", 14, yPos);
        yPos += 8;
      }
    }

    yPos += 6;
  }

  doc.save(`${subject.name.replace(/\s+/g, "_")}_portafolio.pdf`);
}
