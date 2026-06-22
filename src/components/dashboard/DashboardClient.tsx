"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Moon,
  Sun,
  LogOut,
  Download,
  Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { EvidenceManager } from "@/components/evidence/EvidenceManager";
import { UnitFormModal, TopicFormModal } from "@/components/forms/CrudModals";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  getSubjectWithUnits,
  getDashboardStats,
  deleteUnit,
  deleteTopic,
  signOut,
  seedCompiladoresPortfolio,
  getSubjects,
} from "@/lib/services/portfolio";
import { exportPortfolioToPDF } from "@/lib/utils/export-pdf";
import type { SubjectWithUnits, Unit, Topic, DashboardStats, SearchResult } from "@/lib/types";

export function DashboardClient() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [subject, setSubject] = useState<SubjectWithUnits | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [view, setView] = useState<"dashboard" | "topic" | "unit">("dashboard");

  const [unitModal, setUnitModal] = useState<{ open: boolean; editing?: Unit | null }>({ open: false });
  const [topicModal, setTopicModal] = useState<{ open: boolean; unitId: string; editing?: Topic | null }>({
    open: false,
    unitId: "",
  });

  const loadData = useCallback(async () => {
    try {
      const subjects = await getSubjects();
      if (subjects.length === 0) {
        setSubject(null);
        setStats(null);
        setLoading(false);
        return;
      }

      const subjectData = await getSubjectWithUnits(subjects[0].id);
      const statsData = await getDashboardStats(subjects[0].id);

      setSubject(subjectData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedCompiladoresPortfolio();
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Error al inicializar el portafolio. Asegúrate de haber ejecutado las migraciones SQL en Supabase.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const handleExportPDF = () => {
    if (subject) exportPortfolioToPDF(subject);
  };

  const handleSearchResult = (result: SearchResult) => {
    if (result.type === "unit") {
      setSelectedUnitId(result.id);
      setSelectedTopicId(null);
      setView("unit");
    } else if (result.type === "topic" || result.type === "evidence") {
      const unit = subject?.units.find((u) =>
        u.topics.some((t) => t.id === result.id || t.evidences.some((e) => e.id === result.id))
      );
      const topic = unit?.topics.find(
        (t) => t.id === result.id || t.evidences.some((e) => e.id === result.id)
      );
      if (topic && unit) {
        setSelectedTopicId(topic.id);
        setSelectedUnitId(unit.id);
        setView("topic");
      }
    }
  };

  const selectedTopic = subject?.units
    .flatMap((u) => u.topics.map((t) => ({ ...t, unitTitle: u.title, unitId: u.id })))
    .find((t) => t.id === selectedTopicId);

  const selectedUnit = subject?.units.find((u) => u.id === selectedUnitId);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenido al Portafolio
          </h1>
          <p className="mt-2 text-gray-500">
            Inicializa tu portafolio de Compiladores con las 6 unidades del temario
          </p>
        </div>
        <Button onClick={handleSeed} disabled={seeding} size="lg">
          {seeding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Inicializando...
            </>
          ) : (
            "Inicializar portafolio de Compiladores"
          )}
        </Button>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar
        subject={subject}
        selectedTopicId={selectedTopicId}
        selectedUnitId={selectedUnitId}
        onSelectTopic={(topicId, unitId) => {
          setSelectedTopicId(topicId);
          setSelectedUnitId(unitId);
          setView("topic");
        }}
        onSelectUnit={(unitId) => {
          setSelectedUnitId(unitId);
          setSelectedTopicId(null);
          setView("unit");
        }}
        onAddUnit={() => setUnitModal({ open: true })}
        onAddTopic={(unitId) => setTopicModal({ open: true, unitId })}
        onEditUnit={(unit) => setUnitModal({ open: true, editing: unit })}
        onDeleteUnit={async (unit) => {
          if (confirm(`¿Eliminar "${unit.title}" y todos sus temas?`)) {
            await deleteUnit(unit.id);
            loadData();
            if (selectedUnitId === unit.id) setView("dashboard");
          }
        }}
        onEditTopic={(topic) => {
          setTopicModal({ open: true, unitId: topic.unit_id, editing: topic });
        }}
        onDeleteTopic={async (topic) => {
          if (confirm(`¿Eliminar "${topic.title}"?`)) {
            await deleteTopic(topic.id);
            loadData();
            if (selectedTopicId === topic.id) setView("dashboard");
          }
        }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setView("dashboard");
                setSelectedTopicId(null);
                setSelectedUnitId(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === "dashboard"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>
            <SearchBar subjectId={subject.id} onResultClick={handleSearchResult} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {view === "dashboard" && stats && <DashboardOverview stats={stats} />}

          {view === "unit" && selectedUnit && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedUnit.title}
              </h2>
              {selectedUnit.description && (
                <p className="mt-2 text-gray-500">{selectedUnit.description}</p>
              )}
              <div className="mt-6 grid gap-3">
                {selectedUnit.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setView("topic");
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{topic.title}</h3>
                      {topic.description && (
                        <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {topic.evidences.length} evidencias
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "topic" && selectedTopic && (
            <EvidenceManager
              topic={selectedTopic}
              evidences={selectedTopic.evidences ?? []}
              unitTitle={selectedTopic.unitTitle}
              onRefresh={loadData}
            />
          )}
        </main>
      </div>

      <UnitFormModal
        isOpen={unitModal.open}
        onClose={() => setUnitModal({ open: false })}
        subjectId={subject.id}
        unitCount={subject.units.length}
        editingUnit={unitModal.editing}
        onSuccess={loadData}
      />

      <TopicFormModal
        isOpen={topicModal.open}
        onClose={() => setTopicModal({ open: false, unitId: "" })}
        unitId={topicModal.unitId}
        editingTopic={topicModal.editing}
        onSuccess={loadData}
      />
    </div>
  );
}
