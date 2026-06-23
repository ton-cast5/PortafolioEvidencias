"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createUnit, updateUnit, createTopic, updateTopic, createSubject, updateSubject } from "@/lib/services/portfolio";
import type { Unit, Topic, Subject, TopicType } from "@/lib/types";
import { TOPIC_TYPE_LABELS } from "@/lib/types";

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  unitCount: number;
  editingUnit?: Unit | null;
  onSuccess: () => void;
}

export function UnitFormModal({
  isOpen,
  onClose,
  subjectId,
  unitCount,
  editingUnit,
  onSuccess,
}: UnitFormModalProps) {
  const [title, setTitle] = useState(editingUnit?.title ?? "");
  const [description, setDescription] = useState(editingUnit?.description ?? "");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setTitle(editingUnit?.title ?? "");
    setDescription(editingUnit?.description ?? "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, { title, description });
      } else {
        await createUnit(subjectId, title, description, unitCount + 1);
      }
      onSuccess();
      onClose();
    } catch {
      alert("Error al guardar la unidad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUnit ? "Editar unidad" : "Nueva unidad"}
    >
      <form onSubmit={handleSubmit} className="space-y-4" onFocus={handleOpen}>
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Unidad 7: Nuevo tema"
          required
        />
        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la unidad..."
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : editingUnit ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitId: string;
  editingTopic?: Topic | null;
  onSuccess: () => void;
}

export function TopicFormModal({
  isOpen,
  onClose,
  unitId,
  editingTopic,
  onSuccess,
}: TopicFormModalProps) {
  const [title, setTitle] = useState(editingTopic?.title ?? "");
  const [description, setDescription] = useState(editingTopic?.description ?? "");
  const [topicType, setTopicType] = useState<TopicType>(editingTopic?.topic_type ?? "tema");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTopic) {
        await updateTopic(editingTopic.id, { title, description, topic_type: topicType });
      } else {
        await createTopic(unitId, title, description, topicType);
      }
      onSuccess();
      onClose();
    } catch {
      alert("Error al guardar el tema");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTopic ? `Editar ${TOPIC_TYPE_LABELS[topicType].toLowerCase()}` : "Nuevo tema o clase"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo
          </label>
          <div className="flex gap-2">
            {(["tema", "clase"] as TopicType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTopicType(type)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  topicType === type
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                }`}
              >
                {TOPIC_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={topicType === "clase" ? "Clase 1: Introducción" : "1.1 Nuevo tema"}
          required
        />
        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del tema..."
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : editingTopic ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  onSuccess: (subjectId?: string) => void;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  editingSubject,
  onSuccess,
}: SubjectFormModalProps) {
  const [name, setName] = useState(editingSubject?.name ?? "");
  const [description, setDescription] = useState(editingSubject?.description ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, { name, description });
        onSuccess();
      } else {
        const subject = await createSubject(name, description);
        onSuccess(subject.id);
      }
      onClose();
    } catch {
      alert("Error al guardar la materia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSubject ? "Editar materia" : "Nueva materia"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Compiladores, Cálculo..."
          required
        />
        <Textarea
          label="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la materia..."
        />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : editingSubject ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
