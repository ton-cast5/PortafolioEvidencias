import { createClient } from "@/lib/supabase/client";
import type {
  Subject,
  Unit,
  Topic,
  Evidence,
  SubjectWithUnits,
  DashboardStats,
  SearchResult,
  EvidenceType,
  TopicType,
  SubjectPortfolioData,
} from "@/lib/types";
import { DEFAULT_UNIVERSITY, DEFAULT_DIVISION } from "@/lib/types";

const supabase = () => createClient();

export async function getCurrentUser() {
  const { data: { user } } = await supabase().auth.getUser();
  return user;
}

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase()
    .from("subjects")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getSubjectWithUnits(subjectId: string): Promise<SubjectWithUnits | null> {
  const { data: subject, error: subjectError } = await supabase()
    .from("subjects")
    .select("*")
    .eq("id", subjectId)
    .single();

  if (subjectError) throw subjectError;

  const { data: units, error: unitsError } = await supabase()
    .from("units")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_index", { ascending: true });

  if (unitsError) throw unitsError;

  const unitsWithTopics = await Promise.all(
    (units ?? []).map(async (unit) => {
      const { data: topics } = await supabase()
        .from("topics")
        .select("*")
        .eq("unit_id", unit.id)
        .order("created_at", { ascending: true });

      const topicsWithEvidences = await Promise.all(
        (topics ?? []).map(async (topic) => {
          const { data: evidences } = await supabase()
            .from("evidences")
            .select("*")
            .eq("topic_id", topic.id)
            .order("created_at", { ascending: false });

          return { ...topic, evidences: evidences ?? [] };
        })
      );

      return { ...unit, topics: topicsWithEvidences };
    })
  );

  return { ...subject, units: unitsWithTopics };
}

export async function createSubject(name: string, description: string): Promise<Subject> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase()
    .from("subjects")
    .insert({
      name,
      description,
      user_id: user.id,
      university: DEFAULT_UNIVERSITY,
      division: DEFAULT_DIVISION,
      course_name: name,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubject(
  id: string,
  updates: Partial<
    Pick<Subject, "name" | "description"> & SubjectPortfolioData
  >
): Promise<Subject> {
  const { data, error } = await supabase()
    .from("subjects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSubjectPortfolio(
  id: string,
  data: SubjectPortfolioData & { name?: string; description?: string }
): Promise<Subject> {
  return updateSubject(id, data);
}

export async function deleteSubject(id: string): Promise<void> {
  const { error } = await supabase().from("subjects").delete().eq("id", id);
  if (error) throw error;
}

export async function seedCompiladoresPortfolio(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase().rpc("seed_compiladores_portfolio", {
    p_user_id: user.id,
  });

  if (error) throw error;
  return data;
}

export async function createUnit(
  subjectId: string,
  title: string,
  description: string,
  orderIndex: number
): Promise<Unit> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase()
    .from("units")
    .insert({
      title,
      description,
      order_index: orderIndex,
      subject_id: subjectId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUnit(
  id: string,
  updates: Partial<Pick<Unit, "title" | "description" | "order_index">>
): Promise<Unit> {
  const { data, error } = await supabase()
    .from("units")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUnit(id: string): Promise<void> {
  const { error } = await supabase().from("units").delete().eq("id", id);
  if (error) throw error;
}

export async function createTopic(
  unitId: string,
  title: string,
  description: string,
  topicType: TopicType = "tema"
): Promise<Topic> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase()
    .from("topics")
    .insert({
      title,
      description,
      topic_type: topicType,
      unit_id: unitId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTopic(
  id: string,
  updates: Partial<Pick<Topic, "title" | "description" | "topic_type">>
): Promise<Topic> {
  const { data, error } = await supabase()
    .from("topics")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase().from("topics").delete().eq("id", id);
  if (error) throw error;
}

export async function createEvidence(
  topicId: string,
  data: {
    title: string;
    description?: string;
    type: EvidenceType;
    content?: string;
    file_url?: string;
    tags?: string[];
    due_date?: string;
  }
): Promise<Evidence> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const { data: evidence, error } = await supabase()
    .from("evidences")
    .insert({
      ...data,
      topic_id: topicId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return evidence;
}

export async function updateEvidence(
  id: string,
  updates: Partial<
    Pick<Evidence, "title" | "description" | "type" | "content" | "file_url" | "tags" | "due_date">
  >
): Promise<Evidence> {
  const { data, error } = await supabase()
    .from("evidences")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvidence(id: string): Promise<void> {
  const { error } = await supabase().from("evidences").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error("No autenticado");

  const filePath = `${user.id}/${path}/${Date.now()}_${file.name}`;

  const { error } = await supabase().storage
    .from("evidencias")
    .upload(filePath, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase().storage
    .from("evidencias")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getDashboardStats(subjectId: string): Promise<DashboardStats> {
  const subject = await getSubjectWithUnits(subjectId);
  if (!subject) {
    return {
      totalEvidences: 0,
      totalUnits: 0,
      totalTopics: 0,
      unitProgress: [],
    };
  }

  let totalEvidences = 0;
  let totalTopics = 0;

  const unitProgress = subject.units.map((unit) => {
    const topicsCount = unit.topics.length;
    totalTopics += topicsCount;

    const topicsWithEvidence = unit.topics.filter((t) => t.evidences.length > 0).length;
    const evidenceCount = unit.topics.reduce((acc, t) => acc + t.evidences.length, 0);
    totalEvidences += evidenceCount;

    return {
      unitId: unit.id,
      unitTitle: unit.title,
      orderIndex: unit.order_index,
      totalTopics: topicsCount,
      topicsWithEvidence,
      percentage: topicsCount > 0 ? Math.round((topicsWithEvidence / topicsCount) * 100) : 0,
      evidenceCount,
    };
  });

  return {
    totalEvidences,
    totalUnits: subject.units.length,
    totalTopics,
    unitProgress,
  };
}

export async function searchPortfolio(
  subjectId: string,
  query: string
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const subject = await getSubjectWithUnits(subjectId);
  if (!subject) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const unit of subject.units) {
    if (
      unit.title.toLowerCase().includes(q) ||
      unit.description?.toLowerCase().includes(q)
    ) {
      results.push({
        type: "unit",
        id: unit.id,
        title: unit.title,
        description: unit.description,
      });
    }

    for (const topic of unit.topics) {
      if (
        topic.title.toLowerCase().includes(q) ||
        topic.description?.toLowerCase().includes(q)
      ) {
        results.push({
          type: "topic",
          id: topic.id,
          title: topic.title,
          description: topic.description,
          parentTitle: unit.title,
        });
      }

      for (const evidence of topic.evidences) {
        if (
          evidence.title.toLowerCase().includes(q) ||
          evidence.description?.toLowerCase().includes(q) ||
          evidence.content?.toLowerCase().includes(q) ||
          evidence.tags?.some((t) => t.toLowerCase().includes(q))
        ) {
          results.push({
            type: "evidence",
            id: evidence.id,
            title: evidence.title,
            description: evidence.description,
            parentTitle: topic.title,
            unitTitle: unit.title,
          });
        }
      }
    }
  }

  return results;
}

export async function signOut() {
  const { error } = await supabase().auth.signOut();
  if (error) throw error;
}
