"use client";

import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { updateSubjectPortfolio, uploadFile } from "@/lib/services/portfolio";
import type { Subject } from "@/lib/types";
import { DEFAULT_UNIVERSITY, DEFAULT_DIVISION } from "@/lib/types";

interface PortfolioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onSuccess: () => void;
}

export function PortfolioSettingsModal({
  isOpen,
  onClose,
  subject,
  onSuccess,
}: PortfolioSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [programaFile, setProgramaFile] = useState<File | null>(null);
  const [programaUrl, setProgramaUrl] = useState(subject.programa_file_url ?? "");

  const [form, setForm] = useState({
    university: subject.university ?? DEFAULT_UNIVERSITY,
    division: subject.division ?? DEFAULT_DIVISION,
    project_name: subject.project_name ?? "",
    degree: subject.degree ?? "",
    course_code: subject.course_code ?? "",
    course_name: subject.course_name ?? subject.name,
    group_name: subject.group_name ?? "",
    teacher_name: subject.teacher_name ?? "",
    student_name: subject.student_name ?? "",
    encuadre: subject.encuadre ?? "",
    name: subject.name,
    description: subject.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let fileUrl = programaUrl || undefined;

      if (programaFile) {
        const storagePath = `${form.course_name || form.name}/programa`;
        fileUrl = await uploadFile(programaFile, storagePath);
        setProgramaUrl(fileUrl);
        setProgramaFile(null);
      }

      await updateSubjectPortfolio(subject.id, {
        ...form,
        programa_file_url: fileUrl ?? null,
      });
      onSuccess();
      onClose();
    } catch {
      alert("Error al guardar los datos del portafolio");
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Datos del portafolio" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Datos de presentación
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Universidad" value={form.university} onChange={(e) => set("university", e.target.value)} />
            <Input label="División académica" value={form.division} onChange={(e) => set("division", e.target.value)} />
            <Input label="Nombre del proyecto" value={form.project_name} onChange={(e) => set("project_name", e.target.value)} placeholder="Portafolio de evidencias" />
            <Input label="Licenciatura" value={form.degree} onChange={(e) => set("degree", e.target.value)} placeholder="Ej: Ingeniería en Computación" />
            <Input label="Código de asignatura" value={form.course_code} onChange={(e) => set("course_code", e.target.value)} placeholder="Ej: CCOM-301" />
            <Input label="Asignatura" value={form.course_name} onChange={(e) => set("course_name", e.target.value)} />
            <Input label="Grupo" value={form.group_name} onChange={(e) => set("group_name", e.target.value)} placeholder="Ej: 7-U" />
            <Input label="Nombre del docente" value={form.teacher_name} onChange={(e) => set("teacher_name", e.target.value)} />
            <Input label="Nombre del estudiante" value={form.student_name} onChange={(e) => set("student_name", e.target.value)} className="sm:col-span-2" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Materia
          </h3>
          <div className="grid gap-4">
            <Input label="Nombre de la materia (en el sistema)" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Textarea label="Descripción breve" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Encuadre
          </h3>
          <RichTextEditor content={form.encuadre} onChange={(v) => set("encuadre", v)} placeholder="Objetivos, competencias, criterios de evaluación..." />
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Programa de la materia (PDF)
          </h3>
          <p className="mb-3 text-sm text-gray-500">
            Sube el programa oficial de la materia en formato PDF. Se incluirá en la exportación del portafolio.
          </p>

          {programaUrl && !programaFile && (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <FileText className="h-5 w-5 shrink-0 text-red-500" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">Programa actual cargado</span>
              <a
                href={programaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Ver PDF <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setProgramaFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-400"
          />
          {programaFile && (
            <p className="mt-2 text-xs text-gray-500">
              Archivo seleccionado: {programaFile.name}
            </p>
          )}
        </section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar datos"}</Button>
        </div>
      </form>
    </Modal>
  );
}
