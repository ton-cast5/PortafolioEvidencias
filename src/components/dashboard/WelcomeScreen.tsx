"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createSubject, seedCompiladoresPortfolio } from "@/lib/services/portfolio";

interface WelcomeScreenProps {
  onSuccess: (subjectId: string) => void;
  onSignOut: () => void;
}

export function WelcomeScreen({ onSuccess, onSignOut }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const subject = await createSubject(name.trim(), description.trim());
      onSuccess(subject.id);
    } catch {
      alert("Error al crear la materia");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplate = async () => {
    setLoadingTemplate(true);
    try {
      const subjectId = await seedCompiladoresPortfolio();
      if (subjectId) onSuccess(subjectId);
    } catch {
      alert("Error al cargar la plantilla");
    } finally {
      setLoadingTemplate(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bienvenido a tu Portafolio
        </h1>
        <p className="mt-2 max-w-md text-gray-500">
          Crea tu primera materia para organizar unidades, temas y evidencias académicas.
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <Input
          id="subject-name"
          label="Nombre de la materia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Compiladores, Bases de datos..."
          required
        />
        <Textarea
          id="subject-desc"
          label="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción de la materia..."
        />
        <Button type="submit" className="w-full" disabled={loading || !name.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear materia"
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="mb-3 text-sm text-gray-400">¿Quieres empezar con un temario predefinido?</p>
        <Button
          variant="secondary"
          onClick={handleTemplate}
          disabled={loadingTemplate}
        >
          {loadingTemplate ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando plantilla...
            </>
          ) : (
            "Usar plantilla de Compiladores"
          )}
        </Button>
      </div>

      <button
        onClick={onSignOut}
        className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
