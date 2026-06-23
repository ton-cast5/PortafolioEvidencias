"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import { updateSubjectPortfolio } from "@/lib/services/portfolio";
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
    programa: subject.programa ?? "",
    name: subject.name,
    description: subject.description ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubjectPortfolio(subject.id, form);
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
            Programa de la materia
          </h3>
          <RichTextEditor content={form.programa} onChange={(v) => set("programa", v)} placeholder="Descripción general del programa, enfoque y contenidos..." />
        </section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar datos"}</Button>
        </div>
      </form>
    </Modal>
  );
}
