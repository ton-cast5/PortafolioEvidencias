"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, ChevronDown, Plus, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { Subject } from "@/lib/types";

interface SubjectSelectorProps {
  subjects: Subject[];
  currentSubjectId: string;
  onSelect: (subjectId: string) => void;
  onCreate: () => void;
  onEdit: (subject: Subject) => void;
}

export function SubjectSelector({
  subjects,
  currentSubjectId,
  onSelect,
  onCreate,
  onEdit,
}: SubjectSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = subjects.find((s) => s.id === currentSubjectId);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative border-b border-gray-200 p-4 dark:border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg p-1 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
            {current?.name ?? "Seleccionar materia"}
          </p>
          <p className="text-xs text-gray-500">
            {subjects.length} {subjects.length === 1 ? "materia" : "materias"}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="max-h-56 overflow-y-auto">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="group flex items-center gap-1 px-1"
              >
                <button
                  onClick={() => {
                    onSelect(subject.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    subject.id === currentSubjectId
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="flex-1 truncate text-left">{subject.name}</span>
                  {subject.id === currentSubjectId && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(subject);
                    setOpen(false);
                  }}
                  className="rounded p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-blue-600 group-hover:opacity-100 dark:hover:bg-gray-800"
                  title="Editar materia"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-1 pt-1 dark:border-gray-800">
            <button
              onClick={() => {
                onCreate();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              <Plus className="h-4 w-4" />
              Nueva materia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
