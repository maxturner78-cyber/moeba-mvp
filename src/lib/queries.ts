import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  return useGeneratedInsight(graduateId, "weekly_insight", weekNumber);
}

export function useTeamBrief(managerId: string, weekNumber?: number) {
  return useGeneratedInsight(managerId, "team_brief", weekNumber);
}

export function useCheckInBrief(graduateId: string, weekNumber?: number) {
  return useGeneratedInsight(graduateId, "check_in_brief", weekNumber);
}
