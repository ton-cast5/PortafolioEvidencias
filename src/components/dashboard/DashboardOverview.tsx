"use client";

import { BarChart3, FileText, Layers, BookMarked } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const cards = [
    {
      label: "Evidencias",
      value: stats.totalEvidences,
      icon: FileText,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Unidades",
      value: stats.totalUnits,
      icon: Layers,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Temas",
      value: stats.totalTopics,
      icon: BookMarked,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Progreso global",
      value: `${Math.round(
        stats.unitProgress.reduce((a, u) => a + u.percentage, 0) /
          Math.max(stats.unitProgress.length, 1)
      )}%`,
      icon: BarChart3,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Progreso por unidad
        </h3>
        <div className="space-y-4">
          {stats.unitProgress.map((unit) => (
            <div key={unit.unitId}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {unit.unitTitle}
                </span>
                <span className="text-gray-500">
                  {unit.topicsWithEvidence}/{unit.totalTopics} temas · {unit.evidenceCount} evidencias
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${unit.percentage}%` }}
                />
              </div>
              <p className="mt-1 text-right text-xs text-gray-400">{unit.percentage}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
