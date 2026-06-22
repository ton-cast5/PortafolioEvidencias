export type EvidenceType = "apunte" | "tarea" | "proyecto";

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  subject_id: string;
  user_id: string;
  created_at: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string | null;
  unit_id: string;
  user_id: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string | null;
  type: EvidenceType;
  file_url: string | null;
  content: string | null;
  topic_id: string;
  user_id: string;
  tags: string[];
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitWithTopics extends Unit {
  topics: TopicWithEvidences[];
}

export interface TopicWithEvidences extends Topic {
  evidences: Evidence[];
}

export interface SubjectWithUnits extends Subject {
  units: UnitWithTopics[];
}

export interface DashboardStats {
  totalEvidences: number;
  totalUnits: number;
  totalTopics: number;
  unitProgress: {
    unitId: string;
    unitTitle: string;
    orderIndex: number;
    totalTopics: number;
    topicsWithEvidence: number;
    percentage: number;
    evidenceCount: number;
  }[];
}

export interface SearchResult {
  type: "unit" | "topic" | "evidence";
  id: string;
  title: string;
  description: string | null;
  parentTitle?: string;
  unitTitle?: string;
}

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  apunte: "Apunte",
  tarea: "Tarea",
  proyecto: "Proyecto",
};

export const EVIDENCE_TYPE_COLORS: Record<EvidenceType, string> = {
  apunte: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tarea: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  proyecto: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export const COMMON_TAGS = [
  "importante",
  "examen",
  "proyecto",
  "práctica",
  "investigación",
  "pendiente",
];
