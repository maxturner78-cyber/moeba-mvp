import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  computeStatus,
  computeCombinedDimensionScore,
  computeTrendDelta,
} from "@/lib/scoring";
import type { AdaptiveQuestion } from "@/lib/adaptive";

export type GraduateStatus = "accelerating" | "steady" | "stalling" | "attention";

/* ── Helper ────────────────────────────────────────────────────── */

export function computeWeekNumber(hireDate: string | Date): number {
  const hire = new Date(hireDate).getTime();
  const now = Date.now();
  return Math.max(1, Math.floor((now - hire) / (7 * 24 * 60 * 60 * 1000)));
}

const STALE = 30_000;

/* ── Users ─────────────────────────────────────────────────────── */

export function useGraduates(managerId?: string) {
  return useQuery({
    queryKey: ["graduates", managerId ?? "all"],
    staleTime: STALE,
    queryFn: async () => {
      let q = supabase
        .from("users")
        .select("id, full_name, job_title, hire_date, manager_id")
        .eq("role", "graduate");

      if (managerId) q = q.eq("manager_id", managerId);

      const { data, error } = await q;
      if (error) throw error;

      // Fetch unique manager ids to resolve names
      const managerIds = [...new Set((data ?? []).map((g) => g.manager_id).filter(Boolean))] as string[];
      let managerMap: Record<string, string> = {};

      if (managerIds.length > 0) {
        const { data: managers, error: mErr } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", managerIds);
        if (mErr) throw mErr;
        managerMap = Object.fromEntries((managers ?? []).map((m) => [m.id, m.full_name]));
      }

      return (data ?? []).map((g) => ({
        ...g,
        week_number: g.hire_date ? computeWeekNumber(g.hire_date) : 1,
        manager_name: g.manager_id ? managerMap[g.manager_id] ?? null : null,
      }));
    },
  });
}

export function useGraduate(graduateId: string) {
  return useQuery({
    queryKey: ["graduate", graduateId],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, job_title, hire_date, manager_id")
        .eq("id", graduateId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      let manager_name: string | null = null;
      if (data.manager_id) {
        const { data: mgr } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", data.manager_id)
          .maybeSingle();
        manager_name = mgr?.full_name ?? null;
      }

      return {
        ...data,
        week_number: data.hire_date ? computeWeekNumber(data.hire_date) : 1,
        manager_name,
      };
    },
  });
}

/* ── Check-ins ─────────────────────────────────────────────────── */

export function useSelfCheckIns(graduateId: string, limit?: number) {
  return useQuery({
    queryKey: ["selfCheckIns", graduateId, limit ?? "all"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("weekly_check_ins_self")
        .select("*")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: false });

      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useManagerCheckIns(graduateId: string, limit?: number) {
  return useQuery({
    queryKey: ["managerCheckIns", graduateId, limit ?? "all"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("weekly_check_ins_manager")
        .select("*")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: false });

      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePeerCheckIns(graduateId: string, limit?: number) {
  return useQuery({
    queryKey: ["peerCheckIns", graduateId, limit ?? "all"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("weekly_check_ins_peer")
        .select("id, peer_id, graduate_id, week_number, dimension_scores, free_text, submitted_at")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: false });

      if (limit) q = q.limit(limit);

      const { data, error } = await q;
      if (error) throw error;

      // Resolve peer names
      const peerIds = [...new Set((data ?? []).map((r) => r.peer_id))] as string[];
      let peerMap: Record<string, string> = {};
      if (peerIds.length > 0) {
        const { data: peers, error: pErr } = await supabase
          .from("users")
          .select("id, full_name")
          .in("id", peerIds);
        if (pErr) throw pErr;
        peerMap = Object.fromEntries((peers ?? []).map((p) => [p.id, p.full_name]));
      }

      return (data ?? []).map((r) => ({
        ...r,
        peer_name: peerMap[r.peer_id] ?? null,
      }));
    },
  });
}

/* ── Skills ────────────────────────────────────────────────────── */

export function useSkillNodes(companyId: string) {
  return useQuery({
    queryKey: ["skillNodes", companyId],
    staleTime: STALE,
    enabled: !!companyId,
    queryFn: async () => {
      const { data: fw, error: fwErr } = await supabase
        .from("competency_frameworks")
        .select("id")
        .eq("company_id", companyId)
        .eq("active", true)
        .maybeSingle();
      if (fwErr) throw fwErr;
      if (!fw) return [];

      const { data, error } = await supabase
        .from("skill_nodes")
        .select("*")
        .eq("framework_id", fw.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type SkillNodeRow = {
  id: string;
  slug: string;
  name: string;
  cluster: string;
  framework_id: string;
  promotion_required: boolean;
};

export type SkillNodesGrouped = Record<string, SkillNodeRow[]>;

export function useSkillNodesGrouped(companyId: string) {
  return useQuery({
    queryKey: ["skillNodesGrouped", companyId],
    staleTime: STALE,
    enabled: !!companyId,
    queryFn: async () => {
      const { data: fw, error: fwErr } = await supabase
        .from("competency_frameworks")
        .select("id")
        .eq("company_id", companyId)
        .eq("active", true)
        .maybeSingle();
      if (fwErr) throw fwErr;
      if (!fw) return {} as SkillNodesGrouped;

      const { data, error } = await supabase
        .from("skill_nodes")
        .select("id, slug, name, cluster, framework_id, promotion_required")
        .eq("framework_id", fw.id)
        .order("name");
      if (error) throw error;

      const grouped: SkillNodesGrouped = {};
      for (const node of data ?? []) {
        const cluster = node.cluster ?? "other";
        if (!grouped[cluster]) grouped[cluster] = [];
        grouped[cluster].push(node as SkillNodeRow);
      }
      return grouped;
    },
  });
}

export function useSkillEdges(companyId: string) {
  return useQuery({
    queryKey: ["skillEdges", companyId],
    staleTime: STALE,
    enabled: !!companyId,
    queryFn: async () => {
      const { data: fw, error: fwErr } = await supabase
        .from("competency_frameworks")
        .select("id")
        .eq("company_id", companyId)
        .eq("active", true)
        .maybeSingle();
      if (fwErr) throw fwErr;
      if (!fw) return [];

      const { data, error } = await supabase
        .from("skill_edges")
        .select("*")
        .eq("framework_id", fw.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSkillProficiency(graduateId: string) {
  return useQuery({
    queryKey: ["skillProficiency", graduateId],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_proficiency")
        .select("current_level, last_assessed_week, skill_node_id, skill_nodes(id, slug, name, cluster, promotion_required)")
        .eq("graduate_id", graduateId);
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        skill_node: row.skill_nodes,
        current_level: row.current_level,
        last_assessed_week: row.last_assessed_week,
      }));
    },
  });
}

export function useSkillSnapshot(graduateId: string, monthsAgo?: number) {
  const proficiency = useSkillProficiency(graduateId);

  const filtered = proficiency.data && monthsAgo != null
    ? (() => {
        // Estimate current week from the max last_assessed_week in the dataset
        const currentWeek = Math.max(...proficiency.data.map((r) => r.last_assessed_week), 1);
        const cutoff = currentWeek - monthsAgo * 4;
        return proficiency.data.filter((r) => r.last_assessed_week <= cutoff);
      })()
    : proficiency.data;

  return {
    data: filtered ?? undefined,
    isLoading: proficiency.isLoading,
    error: proficiency.error,
  };
}

/* ── Work log ──────────────────────────────────────────────────── */

export function useWorkLogEntries(graduateId: string, weekRange?: [number, number]) {
  return useQuery({
    queryKey: ["workLogEntries", graduateId, weekRange ?? "all"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("work_log_entries")
        .select("*")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: false });

      if (weekRange) {
        q = q.gte("week_number", weekRange[0]).lte("week_number", weekRange[1]);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ── Perception gaps ───────────────────────────────────────────── */

export function usePerceptionGaps(
  graduateId: string,
  weekNumber?: number,
  layer?: "behavioural" | "skill",
) {
  return useQuery({
    queryKey: ["perceptionGaps", graduateId, weekNumber ?? "latest", layer ?? "all"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("perception_gaps")
        .select("*")
        .eq("graduate_id", graduateId);

      if (weekNumber != null) q = q.eq("week_number", weekNumber);
      if (layer) q = q.eq("layer", layer);

      q = q.order("week_number", { ascending: false });

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ── Generated insights ────────────────────────────────────────── */

export function useGeneratedInsight(
  graduateId: string,
  insightType: string,
  weekNumber?: number,
) {
  return useQuery({
    queryKey: ["generatedInsight", graduateId, insightType, weekNumber ?? "latest"],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async () => {
      let q = supabase
        .from("generated_insights")
        .select("*")
        .eq("graduate_id", graduateId)
        .eq("insight_type", insightType)
        .order("week_number", { ascending: false })
        .limit(1);

      if (weekNumber != null) q = q.eq("week_number", weekNumber);

      const { data, error } = await q;
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}

export function useWeeklyInsight(graduateId: string, weekNumber?: number) {
  return useQuery({
    queryKey: ["weekly-insight", graduateId, weekNumber ?? "latest"],
    enabled: !!graduateId && weekNumber != null,
    staleTime: 60 * 60 * 1000, // 1 hour — insights regenerate weekly anyway
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_insights")
        .select("payload, generation_status, generated_at")
        .eq("graduate_id", graduateId)
        .eq("week_number", weekNumber as number)
        .eq("surface_type", "weekly_insight")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useTeamBrief(managerId: string, weekNumber?: number) {
  return useQuery({
    queryKey: ["team-brief", managerId, weekNumber ?? "latest"],
    enabled: !!managerId && weekNumber != null,
    staleTime: 60 * 60 * 1000, // 1 hour
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_insights")
        .select("payload, generation_status, generated_at")
        .eq("manager_id", managerId)
        .eq("week_number", weekNumber as number)
        .eq("surface_type", "team_brief")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCheckInBrief(graduateId: string, weekNumber?: number) {
  return useGeneratedInsight(graduateId, "check_in_brief", weekNumber);
}

/* ── Peer Assignments ──────────────────────────────────────────── */

export function usePeerAssignedGraduates(peerId: string) {
  return useQuery({
    queryKey: ["peer-assigned-graduates", peerId],
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peer_assignments")
        .select("graduate_id, users!peer_assignments_graduate_id_fkey(full_name, job_title)")
        .eq("peer_id", peerId)
        .eq("active", true);

      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        graduate_id: row.graduate_id as string,
        full_name: (row.users?.full_name ?? "") as string,
        job_title: (row.users?.job_title ?? "") as string,
      }));
    },
  });
}

/* ── Status computation ────────────────────────────────────────── */

type GapRowMin = {
  graduate_id: string;
  week_number: number;
  layer: string;
  dimension_or_skill: string;
  self_score: number | null;
  manager_score: number | null;
  peer_score: number | null;
  gap_value: number | null;
};

type SelfRowMin = {
  graduate_id: string;
  week_number: number;
  dimension_scores: any;
};

function computeStatusFromRows(
  gapRows: GapRowMin[],
  currentSelf: SelfRowMin | null,
  priorSelf: SelfRowMin | null,
): GraduateStatus {
  if (!gapRows || gapRows.length === 0) return "steady";

  const behavioural = gapRows.filter((r) => r.layer === "behavioural");
  const useRows = behavioural.length > 0 ? behavioural : gapRows;

  const combined = useRows
    .map((r) => {
      try {
        return computeCombinedDimensionScore(r.self_score, r.manager_score, r.peer_score).score;
      } catch {
        return null;
      }
    })
    .filter((v): v is number => v !== null);

  const avgDimensionScore = combined.length > 0
    ? combined.reduce((a, b) => a + b, 0) / combined.length
    : 0;

  const maxGap = Math.max(0, ...gapRows.map((r) => Math.abs(Number(r.gap_value ?? 0))));

  let decliningCount = 0;
  const curScores = (currentSelf?.dimension_scores ?? {}) as Record<string, number>;
  const priorScores = (priorSelf?.dimension_scores ?? {}) as Record<string, number>;
  if (curScores && priorScores) {
    for (const key of Object.keys(curScores)) {
      const cur = curScores[key];
      const prior = priorScores[key];
      if (typeof cur !== "number" || typeof prior !== "number") continue;
      const { label } = computeTrendDelta(cur, prior);
      if (label === "declining") decliningCount++;
    }
  }

  return computeStatus({ avgDimensionScore, maxGap, decliningCount });
}

export function useGraduateStatus(graduateId: string) {
  return useQuery({
    queryKey: ["graduateStatus", graduateId],
    staleTime: STALE,
    enabled: !!graduateId,
    queryFn: async (): Promise<GraduateStatus> => {
      // Resolve current week from latest perception_gaps row
      const { data: latest, error: latestErr } = await supabase
        .from("perception_gaps")
        .select("week_number")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: false })
        .limit(1);
      if (latestErr) throw latestErr;
      if (!latest || latest.length === 0) return "steady";

      const currentWeek = latest[0].week_number as number;

      const [{ data: gaps, error: gErr }, { data: selfRows, error: sErr }] = await Promise.all([
        supabase
          .from("perception_gaps")
          .select("graduate_id, week_number, layer, dimension_or_skill, self_score, manager_score, peer_score, gap_value")
          .eq("graduate_id", graduateId)
          .eq("week_number", currentWeek),
        supabase
          .from("weekly_check_ins_self")
          .select("graduate_id, week_number, dimension_scores")
          .eq("graduate_id", graduateId)
          .in("week_number", [currentWeek, currentWeek - 1]),
      ]);
      if (gErr) throw gErr;
      if (sErr) throw sErr;

      const cur = (selfRows ?? []).find((r: any) => r.week_number === currentWeek) ?? null;
      const prev = (selfRows ?? []).find((r: any) => r.week_number === currentWeek - 1) ?? null;

      return computeStatusFromRows((gaps ?? []) as GapRowMin[], cur as any, prev as any);
    },
  });
}

export function useGraduateStatusBatch(graduateIds: string[]) {
  const sortedKey = [...graduateIds].sort().join(",");
  return useQuery({
    queryKey: ["graduateStatusBatch", sortedKey],
    staleTime: STALE,
    enabled: graduateIds.length > 0,
    queryFn: async (): Promise<Record<string, GraduateStatus>> => {
      // 1. Latest week per graduate (from perception_gaps)
      const { data: allGaps, error: gErr } = await supabase
        .from("perception_gaps")
        .select("graduate_id, week_number, layer, dimension_or_skill, self_score, manager_score, peer_score, gap_value")
        .in("graduate_id", graduateIds);
      if (gErr) throw gErr;

      const latestWeek = new Map<string, number>();
      for (const r of allGaps ?? []) {
        const cur = latestWeek.get(r.graduate_id);
        if (cur === undefined || r.week_number > cur) latestWeek.set(r.graduate_id, r.week_number);
      }

      // 2. Pull self check-ins for the relevant weeks (latest + prior) per graduate.
      const { data: allSelf, error: sErr } = await supabase
        .from("weekly_check_ins_self")
        .select("graduate_id, week_number, dimension_scores")
        .in("graduate_id", graduateIds);
      if (sErr) throw sErr;

      const result: Record<string, GraduateStatus> = {};
      for (const id of graduateIds) {
        const week = latestWeek.get(id);
        if (week === undefined) {
          result[id] = "steady";
          continue;
        }
        const gaps = (allGaps ?? []).filter((r) => r.graduate_id === id && r.week_number === week) as GapRowMin[];
        const cur = (allSelf ?? []).find((r) => r.graduate_id === id && r.week_number === week) ?? null;
        const prev = (allSelf ?? []).find((r) => r.graduate_id === id && r.week_number === week - 1) ?? null;
        result[id] = computeStatusFromRows(gaps, cur as any, prev as any);
      }
      return result;
    },
  });
}

/* ── Prepared Check-In (Edge Function) ─────────────────────────── */

export interface PreparedCheckIn {
  questions: AdaptiveQuestion[];
  week_number: number;
}

export function usePreparedCheckIn(
  graduateId: string,
  targetRole: "self" | "manager" | "peer",
) {
  return useQuery<PreparedCheckIn>({
    queryKey: ["preparedCheckIn", graduateId, targetRole],
    staleTime: STALE,
    enabled: !!graduateId && !!targetRole,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("prepare-check-in", {
        body: { graduate_id: graduateId, target_role: targetRole },
      });
      if (error) throw error;
      if (!data) throw new Error("No data returned from prepare-check-in");
      return {
        questions: (data.questions ?? []) as AdaptiveQuestion[],
        week_number: data.week_number ?? 0,
      };
    },
  });
}
