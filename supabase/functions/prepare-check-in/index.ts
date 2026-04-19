// Prepare Check-In
// Loads a graduate's full history, runs the adaptive question planner, persists
// any state updates + audit rows, and returns the question list for the requested role.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// Inlined adaptive engine (mirrors src/lib/adaptive.ts verbatim)
// ============================================================================

type DimensionKey =
  | "confidence" | "workloadMgmt" | "managerRelationship" | "teamConnection"
  | "curiosity" | "initiative" | "resilience" | "feedbackApplication"
  | "ownershipFollowThrough";

const ALL_DIMENSION_KEYS: DimensionKey[] = [
  "confidence", "workloadMgmt", "managerRelationship", "teamConnection",
  "curiosity", "initiative", "resilience", "feedbackApplication",
  "ownershipFollowThrough"
];

const BASELINE_WEEKS = 6;

const DIMENSION_QUESTIONS: Record<DimensionKey, {
  label: string;
  selfPrompt: string;
  managerPrompt: string;
  peerPrompt?: string;
  leftLabel: string;
  rightLabel: string;
}> = {
  confidence: {
    label: "Confidence Stability",
    selfPrompt: "How are you feeling in your role this week?",
    managerPrompt: "How confident did [name] seem this week?",
    peerPrompt: "How confident did [name] seem in team interactions?",
    leftLabel: "Really struggling",
    rightLabel: "Fully in my stride"
  },
  workloadMgmt: {
    label: "Workload Management",
    selfPrompt: "How is your workload right now?",
    managerPrompt: "How well is [name] managing their workload?",
    leftLabel: "Overwhelmed",
    rightLabel: "Comfortable"
  },
  managerRelationship: {
    label: "Manager Relationship",
    selfPrompt: "How would you describe your working relationship with your manager?",
    managerPrompt: "How is your working relationship with [name]?",
    leftLabel: "Distant / strained",
    rightLabel: "Strong and open"
  },
  teamConnection: {
    label: "Team Connection",
    selfPrompt: "How connected do you feel to your team?",
    managerPrompt: "How well is [name] integrating with the team?",
    peerPrompt: "How well is [name] integrating with the team?",
    leftLabel: "Keeps to themselves",
    rightLabel: "Fully integrated"
  },
  curiosity: {
    label: "Curiosity & Learning",
    selfPrompt: "How much are you actively exploring and learning this week?",
    managerPrompt: "How much curiosity is [name] showing?",
    leftLabel: "Coasting",
    rightLabel: "Actively exploring"
  },
  initiative: {
    label: "Initiative & Voice",
    selfPrompt: "How often are you taking action without being asked?",
    managerPrompt: "How proactive is [name]?",
    peerPrompt: "Is [name] taking initiative?",
    leftLabel: "Waits for direction",
    rightLabel: "Proactively contributes"
  },
  resilience: {
    label: "Resilience",
    selfPrompt: "When things got hard this week, how did you hold up?",
    managerPrompt: "How well does [name] recover from setbacks?",
    leftLabel: "Easily knocked",
    rightLabel: "Bounces back quickly"
  },
  feedbackApplication: {
    label: "Feedback Application",
    selfPrompt: "How well did you apply feedback from previous weeks?",
    managerPrompt: "How well does [name] apply feedback?",
    leftLabel: "Doesn't act on it",
    rightLabel: "Applies immediately"
  },
  ownershipFollowThrough: {
    label: "Ownership & Follow-Through",
    selfPrompt: "How consistently did you follow through on commitments this week?",
    managerPrompt: "How consistently does [name] follow through?",
    peerPrompt: "Does [name] deliver on what they commit to?",
    leftLabel: "Drops the ball",
    rightLabel: "Always delivers"
  }
};

interface SelfCheckInRow {
  week_number: number;
  dimension_scores: Record<string, number>;
}

interface ManagerCheckInRow {
  week_number: number;
  dimension_scores: Record<string, number>;
  skill_scores?: Record<string, number>;
  questions_observed?: number;
}

interface WorkLogEntry {
  week_number: number;
  project_name: string;
  skill_slugs: string[];
  is_first_exposure: boolean;
}

interface AdaptiveStateRow {
  dimension_key: string;
  stability_weeks: number;
  last_score: number | null;
  is_muted: boolean;
  last_asked_week: number | null;
  next_rotation_week: number | null;
}

interface SkillProficiencyRow {
  skill_slug: string;
  current_level: number;
  last_assessed_week: number | null;
}

interface AdaptiveQuestion {
  type: 'dimension' | 'skill' | 'work_log' | 'free_text';
  dimensionKey?: DimensionKey;
  skillSlug?: string;
  label: string;
  prompt: string;
  leftLabel?: string;
  rightLabel?: string;
  reason: 'baseline' | 'always' | 'rotation' | 'pattern_break' | 'first_exposure' | 'declining';
}

interface AdaptiveStateUpdate {
  dimension_key: string;
  stability_weeks?: number;
  is_muted?: boolean;
  last_score?: number;
  last_asked_week?: number;
  next_rotation_week?: number;
}

interface AdaptiveInput {
  graduateId: string;
  weekNumber: number;
  selfHistory: SelfCheckInRow[];
  managerHistory: ManagerCheckInRow[];
  workLogHistory: WorkLogEntry[];
  adaptiveState: AdaptiveStateRow[];
  skillProficiency: SkillProficiencyRow[];
}

interface QuestionPlan {
  selfQuestions: AdaptiveQuestion[];
  managerQuestions: AdaptiveQuestion[];
  peerQuestions: AdaptiveQuestion[];
  stateUpdates: AdaptiveStateUpdate[];
}

function detectStability(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  window = 3,
): { isStable: boolean; avgScore: number | null } {
  const recent = selfHistory
    .filter(h => h.week_number >= currentWeek - window && h.week_number < currentWeek)
    .map(h => h.dimension_scores[dimensionKey])
    .filter(v => typeof v === "number");

  if (recent.length < window) return { isStable: false, avgScore: null };

  const max = Math.max(...recent);
  const min = Math.min(...recent);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  return { isStable: (max - min) <= 1.0, avgScore: avg };
}

function detectPatternBreak(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  stableScore: number,
): boolean {
  const thisWeek = selfHistory.find(h => h.week_number === currentWeek);
  if (!thisWeek) return false;
  const score = thisWeek.dimension_scores[dimensionKey];
  if (typeof score !== "number") return false;
  return Math.abs(score - stableScore) >= 1.0;
}

function detectDecline(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  stableScore: number,
  threshold = 2.0,
): boolean {
  const thisWeek = selfHistory.find(h => h.week_number === currentWeek);
  if (!thisWeek) return false;
  const score = thisWeek.dimension_scores[dimensionKey];
  if (typeof score !== "number") return false;
  return (stableScore - score) >= threshold;
}

function firstExposureSkills(
  workLogHistory: WorkLogEntry[],
  targetWeek: number,
): string[] {
  const skills = new Set<string>();
  for (const entry of workLogHistory) {
    if (entry.week_number === targetWeek && entry.is_first_exposure) {
      for (const slug of entry.skill_slugs) skills.add(slug);
    }
  }
  return Array.from(skills);
}

function rotationSkill(
  skillProficiency: SkillProficiencyRow[],
  currentWeek: number,
): string | null {
  const eligible = skillProficiency
    .filter(s => s.current_level > 0 &&
                 (s.last_assessed_week === null || s.last_assessed_week <= currentWeek - 3))
    .sort((a, b) => (a.last_assessed_week ?? 0) - (b.last_assessed_week ?? 0));
  return eligible[0]?.skill_slug ?? null;
}

function addDimensionQuestion(
  list: AdaptiveQuestion[],
  dim: DimensionKey,
  role: 'self' | 'manager',
  reason: AdaptiveQuestion['reason'],
) {
  const q = DIMENSION_QUESTIONS[dim];
  list.push({
    type: 'dimension',
    dimensionKey: dim,
    label: q.label,
    prompt: role === 'self' ? q.selfPrompt : q.managerPrompt,
    leftLabel: q.leftLabel,
    rightLabel: q.rightLabel,
    reason,
  });
}

function addSkillQuestion(
  list: AdaptiveQuestion[],
  skillSlug: string,
  role: 'self' | 'manager',
  reason: AdaptiveQuestion['reason'],
) {
  const prompt = role === 'self'
    ? `How confident do you feel about ${skillSlug.replace(/-/g, ' ')}?`
    : `How would you rate [name]'s competency on ${skillSlug.replace(/-/g, ' ')}?`;
  list.push({
    type: 'skill',
    skillSlug,
    label: skillSlug.replace(/-/g, ' '),
    prompt,
    leftLabel: 'Not yet confident',
    rightLabel: 'Fully confident',
    reason,
  });
}

function buildPeerQuestions(_input: AdaptiveInput): AdaptiveQuestion[] {
  const list: AdaptiveQuestion[] = [];

  const peerDimensions: DimensionKey[] = ['confidence', 'teamConnection', 'initiative', 'ownershipFollowThrough'];
  for (const dim of peerDimensions) {
    const q = DIMENSION_QUESTIONS[dim];
    if (!q.peerPrompt) continue;
    list.push({
      type: 'dimension',
      dimensionKey: dim,
      label: q.label,
      prompt: q.peerPrompt,
      leftLabel: q.leftLabel,
      rightLabel: q.rightLabel,
      reason: 'baseline',
    });
  }

  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Collaboration", prompt: "How well does [name] work with others?",
    leftLabel: "Keeps to themselves", rightLabel: "Fully integrated", reason: 'baseline',
  });
  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Reliability", prompt: "How reliably does [name] deliver?",
    leftLabel: "Needs chasing", rightLabel: "Always delivers", reason: 'baseline',
  });
  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Communication", prompt: "How clearly does [name] communicate?",
    leftLabel: "Unclear / hesitant", rightLabel: "Clear & confident", reason: 'baseline',
  });

  return list;
}

function buildBaselinePlan(input: AdaptiveInput): QuestionPlan {
  const selfQuestions: AdaptiveQuestion[] = [];
  const managerQuestions: AdaptiveQuestion[] = [];

  for (const dim of ALL_DIMENSION_KEYS) {
    addDimensionQuestion(selfQuestions, dim, 'self', 'baseline');
  }
  for (const dim of ALL_DIMENSION_KEYS) {
    addDimensionQuestion(managerQuestions, dim, 'manager', 'baseline');
  }

  selfQuestions.push({
    type: 'work_log', label: "This week's work",
    prompt: "What projects and skills did you touch this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What stretched you most this week?",
    prompt: "What stretched you most this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What do you want to do more of?",
    prompt: "What do you want to do more of?", reason: 'always',
  });

  managerQuestions.push({
    type: 'free_text', label: "One thing they did well",
    prompt: "One specific thing [name] did well this week", reason: 'always',
  });
  managerQuestions.push({
    type: 'free_text', label: "Area to improve or support",
    prompt: "One area to improve or support", reason: 'always',
  });

  const peerQuestions = buildPeerQuestions(input);
  return { selfQuestions, managerQuestions, peerQuestions, stateUpdates: [] };
}

function planCheckIn(input: AdaptiveInput): QuestionPlan {
  const { weekNumber } = input;

  if (weekNumber <= BASELINE_WEEKS) {
    return buildBaselinePlan(input);
  }

  const selfQuestions: AdaptiveQuestion[] = [];
  const managerQuestions: AdaptiveQuestion[] = [];
  const stateUpdates: AdaptiveStateUpdate[] = [];

  for (const dim of ALL_DIMENSION_KEYS) {
    const state = input.adaptiveState.find(s => s.dimension_key === dim);
    const { isStable, avgScore } = detectStability(input.selfHistory, dim, weekNumber);

    if (state && avgScore !== null &&
        detectDecline(input.selfHistory, dim, weekNumber, avgScore)) {
      addDimensionQuestion(selfQuestions, dim, 'self', 'declining');
      addDimensionQuestion(managerQuestions, dim, 'manager', 'declining');
      stateUpdates.push({
        dimension_key: dim,
        is_muted: false,
        stability_weeks: 0,
        last_asked_week: weekNumber,
      });
      continue;
    }

    if (state?.is_muted && state.last_score !== null &&
        detectPatternBreak(input.selfHistory, dim, weekNumber, state.last_score)) {
      addDimensionQuestion(selfQuestions, dim, 'self', 'pattern_break');
      addDimensionQuestion(managerQuestions, dim, 'manager', 'pattern_break');
      stateUpdates.push({
        dimension_key: dim,
        last_asked_week: weekNumber,
      });
      continue;
    }

    if (isStable && avgScore !== null) {
      stateUpdates.push({
        dimension_key: dim,
        is_muted: true,
        stability_weeks: (state?.stability_weeks ?? 0) + 1,
        last_score: avgScore,
      });
      continue;
    }

    addDimensionQuestion(selfQuestions, dim, 'self', 'baseline');
    addDimensionQuestion(managerQuestions, dim, 'manager', 'baseline');
    stateUpdates.push({
      dimension_key: dim,
      last_asked_week: weekNumber,
    });
  }

  const firstExposure = firstExposureSkills(input.workLogHistory, weekNumber - 1);
  for (const skillSlug of firstExposure) {
    addSkillQuestion(selfQuestions, skillSlug, 'self', 'first_exposure');
    addSkillQuestion(managerQuestions, skillSlug, 'manager', 'first_exposure');
  }

  if (weekNumber >= 13) {
    const rotSkill = rotationSkill(input.skillProficiency, weekNumber);
    if (rotSkill) {
      addSkillQuestion(selfQuestions, rotSkill, 'self', 'rotation');
      addSkillQuestion(managerQuestions, rotSkill, 'manager', 'rotation');
    }
  }

  selfQuestions.push({
    type: 'work_log', label: "This week's work",
    prompt: "What projects and skills did you touch this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What stretched you most this week?",
    prompt: "What stretched you most this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What do you want to do more of?",
    prompt: "What do you want to do more of?", reason: 'always',
  });

  managerQuestions.push({
    type: 'free_text', label: "One thing they did well",
    prompt: "One specific thing [name] did well this week", reason: 'always',
  });
  managerQuestions.push({
    type: 'free_text', label: "Area to improve or support",
    prompt: "One area to improve or support", reason: 'always',
  });

  const peerQuestions = buildPeerQuestions(input);
  return { selfQuestions, managerQuestions, peerQuestions, stateUpdates };
}

// ============================================================================
// Edge Function handler
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json().catch(() => ({}));
    const graduateId: string | undefined = body.graduate_id;
    const targetRole: 'self' | 'manager' | 'peer' | undefined = body.target_role;
    const weekNumberOverride: number | undefined = body.week_number;

    if (!graduateId || !targetRole) {
      return new Response(
        JSON.stringify({ error: "graduate_id and target_role are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }
    if (!['self', 'manager', 'peer'].includes(targetRole)) {
      return new Response(
        JSON.stringify({ error: "target_role must be 'self', 'manager' or 'peer'" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // Load graduate (for hire_date)
    const { data: graduate, error: gradErr } = await supabase
      .from("users")
      .select("id, hire_date")
      .eq("id", graduateId)
      .eq("role", "graduate")
      .single();

    if (gradErr || !graduate) {
      return new Response(
        JSON.stringify({ error: `Graduate not found: ${gradErr?.message ?? 'unknown'}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
      );
    }

    // Compute week number — match frontend formula (no +1)
    const weekNumber = weekNumberOverride ?? Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(graduate.hire_date).getTime()) /
        (7 * 24 * 60 * 60 * 1000),
      ),
    );

    // Load full history in parallel
    const [
      selfRes,
      managerRes,
      workLogRes,
      stateRes,
      profRes,
    ] = await Promise.all([
      supabase
        .from("weekly_check_ins_self")
        .select("week_number, dimension_scores")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: true }),
      supabase
        .from("weekly_check_ins_manager")
        .select("week_number, dimension_scores, skill_scores, questions_observed")
        .eq("graduate_id", graduateId)
        .order("week_number", { ascending: true }),
      supabase
        .from("work_log_entries")
        .select("week_number, project_name, skill_slugs, is_first_exposure")
        .eq("graduate_id", graduateId),
      supabase
        .from("adaptive_check_in_state")
        .select("dimension_key, stability_weeks, last_score, is_muted, last_asked_week, next_rotation_week")
        .eq("graduate_id", graduateId),
      supabase
        .from("skill_proficiency")
        .select("current_level, last_assessed_week, skill_nodes!inner(slug)")
        .eq("graduate_id", graduateId),
    ]);

    for (const r of [selfRes, managerRes, workLogRes, stateRes, profRes]) {
      if (r.error) {
        throw new Error(`History load failed: ${r.error.message}`);
      }
    }

    const selfHistory: SelfCheckInRow[] = (selfRes.data ?? []) as any;
    const managerHistory: ManagerCheckInRow[] = (managerRes.data ?? []) as any;
    const workLogHistory: WorkLogEntry[] = (workLogRes.data ?? []) as any;
    const adaptiveState: AdaptiveStateRow[] = (stateRes.data ?? []) as any;
    const skillProficiency: SkillProficiencyRow[] = ((profRes.data ?? []) as any[]).map(
      (row: any) => ({
        skill_slug: row.skill_nodes?.slug,
        current_level: row.current_level,
        last_assessed_week: row.last_assessed_week,
      }),
    ).filter((s) => !!s.skill_slug);

    const plan = planCheckIn({
      graduateId,
      weekNumber,
      selfHistory,
      managerHistory,
      workLogHistory,
      adaptiveState,
      skillProficiency,
    });

    let questions: AdaptiveQuestion[];
    if (targetRole === 'self') questions = plan.selfQuestions;
    else if (targetRole === 'manager') questions = plan.managerQuestions;
    else questions = plan.peerQuestions;

    // Persist state updates
    let stateUpdatesApplied = 0;
    if (plan.stateUpdates.length > 0) {
      const rows = plan.stateUpdates.map((u) => ({
        graduate_id: graduateId,
        dimension_key: u.dimension_key,
        ...(u.stability_weeks !== undefined && { stability_weeks: u.stability_weeks }),
        ...(u.is_muted !== undefined && { is_muted: u.is_muted }),
        ...(u.last_score !== undefined && { last_score: u.last_score }),
        ...(u.last_asked_week !== undefined && { last_asked_week: u.last_asked_week }),
        ...(u.next_rotation_week !== undefined && { next_rotation_week: u.next_rotation_week }),
      }));

      const { error: upsertErr } = await supabase
        .from("adaptive_check_in_state")
        .upsert(rows, { onConflict: "graduate_id,dimension_key" });

      if (upsertErr) {
        throw new Error(`adaptive_check_in_state upsert failed: ${upsertErr.message}`);
      }
      stateUpdatesApplied = rows.length;
    }

    // Audit: log every question asked
    if (questions.length > 0) {
      const auditRows = questions.map((q) => ({
        graduate_id: graduateId,
        week_number: weekNumber,
        target_role: targetRole,
        question_type: q.type,
        dimension_key: q.dimensionKey ?? null,
        skill_slug: q.skillSlug ?? null,
        reason: q.reason,
      }));

      const { error: auditErr } = await supabase
        .from("check_in_questions_asked")
        .insert(auditRows);

      if (auditErr) {
        // Audit failure shouldn't block returning the questions — log & continue
        console.error("check_in_questions_asked insert failed:", auditErr.message);
      }
    }

    return new Response(
      JSON.stringify({
        questions,
        week_number: weekNumber,
        state_updates_applied: stateUpdatesApplied,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("prepare-check-in error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
