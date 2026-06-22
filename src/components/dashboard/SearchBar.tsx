"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { searchPortfolio } from "@/lib/services/portfolio";
import type { SearchResult } from "@/lib/types";

interface SearchBarProps {
  subjectId: string;
  onResultClick: (result: SearchResult) => void;
}

export function SearchBar({ subjectId, onResultClick }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        const data = await searchPortfolio(subjectId, query);
        setResults(data);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, subjectId]);

  const typeLabels = { unit: "Unidad", topic: "Tema", evidence: "Evidencia" };
  const typeColors = {
    unit: "text-amber-500",
    topic: "text-blue-500",
    evidence: "text-emerald-500",
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar unidades, temas o evidencias..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 md:w-80"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 md:w-80">
          {results.slice(0, 8).map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => {
                onResultClick(result);
                setIsOpen(false);
                setQuery("");
              }}
              className="flex w-full flex-col gap-0.5 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${typeColors[result.type]}`}>
                  {typeLabels[result.type]}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {result.title}
                </span>
              </div>
              {result.parentTitle && (
                <span className="text-xs text-gray-500">{result.parentTitle}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 text-center text-sm text-gray-500 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:w-80">
          No se encontraron resultados
        </div>
      )}
    </div>
  );
}
