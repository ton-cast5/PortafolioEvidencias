"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Eye,
  Calendar,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/editors/RichTextEditor";
import {
  createEvidence,
  updateEvidence,
  deleteEvidence,
  uploadFile,
} from "@/lib/services/portfolio";
import type { Evidence, EvidenceType, Topic } from "@/lib/types";
import {
  EVIDENCE_TYPE_LABELS,
  EVIDENCE_TYPE_COLORS,
  TOPIC_TYPE_LABELS,
  COMMON_TAGS,
} from "@/lib/types";
import { formatDate } from "@/lib/utils/helpers";
import { FilePreview } from "@/components/evidence/FilePreview";

interface EvidenceManagerProps {
  topic: Topic;
  evidences: Evidence[];
  subjectName: string;
  unitTitle: string;
  onRefresh: () => void;
}

export function EvidenceManager({
  topic,
  evidences,
  subjectName,
  unitTitle,
  onRefresh,
}: EvidenceManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "apunte" as EvidenceType,
    content: "",
    tags: [] as string[],
    due_date: "",
    file: null as File | null,
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "apunte",
      content: "",
      tags: [],
      due_date: "",
      file: null,
    });
    setEditingEvidence(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (evidence: Evidence) => {
    setEditingEvidence(evidence);
    setForm({
      title: evidence.title,
      description: evidence.description ?? "",
      type: evidence.type,
      content: evidence.content ?? "",
      tags: evidence.tags ?? [],
      due_date: evidence.due_date ?? "",
      file: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fileUrl = editingEvidence?.file_url ?? undefined;

      if (form.file) {
        const storagePath = `${subjectName}/${unitTitle}/${topic.title}`;
        fileUrl = await uploadFile(form.file, storagePath);
      }

      const payload = {
        title: form.title,
        description: form.description || undefined,
        type: form.type,
        content: form.content || undefined,
        file_url: fileUrl,
        tags: form.tags,
        due_date: form.due_date || undefined,
      };

      if (editingEvidence) {
        await updateEvidence(editingEvidence.id, payload);
      } else {
        await createEvidence(topic.id, payload);
      }

      setShowModal(false);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Error al guardar la evidencia");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evidence: Evidence) => {
    if (!confirm(`¿Eliminar "${evidence.title}"?`)) return;
    try {
      await deleteEvidence(evidence.id);
      onRefresh();
    } catch {
      alert("Error al eliminar");
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {TOPIC_TYPE_LABELS[topic.topic_type ?? "tema"]}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{topic.title}</h2>
          {topic.description && (
            <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
          )}
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          Nueva evidencia
        </Button>
      </div>

      {evidences.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
          <FileIcon className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-3 text-gray-500">No hay evidencias en este tema</p>
          <Button onClick={openCreate} variant="secondary" size="sm" className="mt-4">
            Agregar primera evidencia
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {evidences.map((evidence) => (
            <div
              key={evidence.id}
              className="group rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <Badge className={EVIDENCE_TYPE_COLORS[evidence.type]}>
                  {EVIDENCE_TYPE_LABELS[evidence.type]}
                </Badge>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {(evidence.file_url || evidence.content) && (
                    <button
                      onClick={() => {
                        setPreviewEvidence(evidence);
                        setShowPreview(true);
                      }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(evidence)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evidence)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white">{evidence.title}</h3>
              {evidence.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{evidence.description}</p>
              )}

              {evidence.tags && evidence.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {evidence.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                {evidence.due_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(evidence.due_date)}
                  </span>
                )}
                {evidence.file_url && (
                  <a
                    href={evidence.file_url}
                    download
                    className="flex items-center gap-1 text-blue-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-3 w-3" />
                    Descargar
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingEvidence ? "Editar evidencia" : "Nueva evidencia"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Textarea
            label="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <div className="flex gap-2">
              {(["apunte", "tarea", "proyecto"] as EvidenceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                    form.type === type
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {EVIDENCE_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {form.type === "apunte" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contenido del apunte
              </label>
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm({ ...form, content })}
              />
            </div>
          )}

          {(form.type === "tarea" || form.type === "proyecto") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción o texto (opcional)
              </label>
              <RichTextEditor
                content={form.content}
                onChange={(content) => setForm({ ...form, content })}
                placeholder="Instrucciones, notas o descripción de la entrega..."
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              {form.type === "apunte"
                ? "Imagen o documento (opcional)"
                : form.type === "tarea"
                  ? "Archivo: PDF, imagen, código o documento"
                  : "Archivo: código, PDF, imagen, etc."}
            </label>
            <input
              type="file"
              onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
              accept={
                form.type === "apunte"
                  ? ".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                  : "*"
              }
              className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-400"
            />
            {editingEvidence?.file_url && !form.file && (
              <p className="mt-1 text-xs text-gray-400">Archivo actual conservado</p>
            )}
          </div>

          <Input
            label="Fecha de entrega (opcional)"
            type="date"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.tags.includes(tag)
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : editingEvidence ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showPreview}
        onClose={() => { setShowPreview(false); setPreviewEvidence(null); }}
        title={previewEvidence?.title ?? "Vista previa"}
        size="xl"
      >
        {previewEvidence && (
          <FilePreview evidence={previewEvidence} />
        )}
      </Modal>
    </div>
  );
}
