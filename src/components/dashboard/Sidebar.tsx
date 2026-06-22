"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { SubjectSelector } from "@/components/dashboard/SubjectSelector";
import type { Subject, SubjectWithUnits, Unit, Topic } from "@/lib/types";

interface SidebarProps {
  subjects: Subject[];
  subject: SubjectWithUnits;
  selectedTopicId: string | null;
  selectedUnitId: string | null;
  onSelectSubject: (subjectId: string) => void;
  onCreateSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onSelectTopic: (topicId: string, unitId: string) => void;
  onSelectUnit: (unitId: string) => void;
  onAddUnit: () => void;
  onAddTopic: (unitId: string) => void;
  onEditUnit: (unit: Unit) => void;
  onDeleteUnit: (unit: Unit) => void;
  onEditTopic: (topic: Topic) => void;
  onDeleteTopic: (topic: Topic) => void;
}

export function Sidebar({
  subjects,
  subject,
  selectedTopicId,
  selectedUnitId,
  onSelectSubject,
  onCreateSubject,
  onEditSubject,
  onSelectTopic,
  onSelectUnit,
  onAddUnit,
  onAddTopic,
  onEditUnit,
  onDeleteUnit,
  onEditTopic,
  onDeleteTopic,
}: SidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(
    new Set(subject.units.map((u) => u.id))
  );

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <SubjectSelector
        subjects={subjects}
        currentSubjectId={subject.id}
        onSelect={onSelectSubject}
        onCreate={onCreateSubject}
        onEdit={onEditSubject}
      />

      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Unidades
          </span>
          <button
            onClick={onAddUnit}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
            title="Agregar unidad"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {subject.units.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center dark:border-gray-800">
            <p className="text-sm text-gray-500">Sin unidades aún</p>
            <button
              onClick={onAddUnit}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Agregar primera unidad
            </button>
          </div>
        ) : (
          <nav className="space-y-1">
            {subject.units.map((unit) => {
              const isExpanded = expandedUnits.has(unit.id);
              const evidenceCount = unit.topics.reduce(
                (acc, t) => acc + t.evidences.length,
                0
              );

              return (
                <div key={unit.id}>
                  <div
                    className={cn(
                      "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                      selectedUnitId === unit.id && !selectedTopicId
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                    <span
                      className="flex-1 truncate font-medium"
                      onClick={() => onSelectUnit(unit.id)}
                    >
                      {unit.title}
                    </span>
                    <span className="text-xs text-gray-400">{evidenceCount}</span>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddTopic(unit.id); }}
                        className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Agregar tema"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditUnit(unit); }}
                        className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                        title="Editar unidad"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit); }}
                        className="rounded p-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                        title="Eliminar unidad"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2 dark:border-gray-800">
                      {unit.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={cn(
                            "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
                            selectedTopicId === topic.id
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50"
                          )}
                          onClick={() => onSelectTopic(topic.id, unit.id)}
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 truncate">{topic.title}</span>
                          {topic.evidences.length > 0 && (
                            <span className="text-xs text-gray-400">
                              {topic.evidences.length}
                            </span>
                          )}
                          <div className="hidden group-hover:flex items-center gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); onEditTopic(topic); }}
                              className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteTopic(topic); }}
                              className="rounded p-0.5 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {unit.topics.length === 0 && (
                        <p className="px-2 py-1 text-xs text-gray-400 italic">Sin temas</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </aside>
  );
}
