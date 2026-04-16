// Compute Weekly Perception Gaps
// Computes per-dimension and per-skill perception gaps for a given graduate/week
// (or all graduates @ current week if no body), upserts perception_gaps,
// and updates skill_proficiency for any skills the manager rated this week.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.45.0/cors";

// ----- Inlined scoring helpers (mirrors src/lib/scoring.ts) -----
const round1 = (n: number) => Math.round(n * 10) / 10;

function computePerceptionGap(
  selfScore: number,
  managerScore: number,
  peerScore?: number | null,
) {
  const gap_value = round1(Math.abs(selfScore - managerScore));
  let gap_direction: "self_higher" | "manager_higher" | "aligned";
  if (selfScore > managerScore + 0.5) gap_direction = "self_higher";
  else if (managerScore > selfScore + 0.5) gap_direction = "manager_higher";
  else gap_direction = "aligned";

  let peer_corroborates: "self" | "manager" | "neither" | "no_peer";
  if (peerScore === null || peerScore === undefined) {
    peer_corroborates = "no_peer";
  } else {
    const dManager = Math.abs(peerScore - managerScore);
    const dSelf = Math.abs(peerScore - selfScore);
    if (dManager < dSelf) peer_corroborates = "manager";
    else if (dSelf < dManager) peer_corroborates = "self";
    else peer_corroborates = "neither";
  }
  return { gap_value, gap_direction, peer_corroborates };
}

function updateSkillProficiency(previous: number, newRating: number): number {
  if (previous === 0) return round1(newRating);
  return round1(0.3 * previous + 0.7 * newRating);
}

// ----- Behavioural dimension keys (9) -----
const BEHAVIOURAL_DIMENSIONS = [
  "confidence",
  "workloadMgmt",
  "managerRelationship",
  "teamConnection",
  "curiosity",
  "initiative",
  "resilience",
  "feedbackApplication",
  "ownershipFollowThrough",
] as const;

// Map manager keys → behavioural dim key. Anything unmapped falls back to overallRating.
const MANAGER_KEY_MAP: Record<string, string> = {
  workQuality: "workloadMgmt",
  proactivity: "initiative",
  feedbackResponse: "feedbackApplication",
};

function computeWeekNumber(hireDate: string): number {
  const ms = Date.now() - new Date(hireDate).getTime();
  const weeks = Math.floor(ms / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, weeks);
}

function avgPeerScore(peers: any[], dim: string): number | null {
  const vals: number[] = [];
  for (const p of peers) {
    const v = p?.dimension_scores?.[dim];
    if (typeof v === "number") vals.push(v);
  }
  if (vals.length === 0) return null;
  return round1(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function getManagerScoreForDim(managerScores: Record<string, number>, dim: string): number | null {
  // Look for explicit mapping first
  const mapped = Object.entries(MANAGER_KEY_MAP).find(([, v]) => v === dim)?.[0];
  if (mapped && typeof managerScores[mapped] === "number") return managerScores[mapped];
  if (typeof managerScores[dim] === "number") return managerScores[dim];
  if (typeof managerScores.overallRating === "number") return managerScores.overallRating;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let body: { graduate_id?: string; week_number?: number } = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    // Resolve graduate list
    let graduatesQ = supabase
      .from("users")
      .select("id, hire_date")
      .eq("role", "graduate");
    if (body.graduate_id) graduatesQ = graduatesQ.eq("id", body.graduate_id);
    const { data: graduates, error: gErr } = await graduatesQ;
    if (gErr) throw gErr;

    let gapsComputed = 0;
    let proficiencyUpdated = 0;
    let processed = 0;

    for (const grad of graduates ?? []) {
      const week = body.week_number ?? (grad.hire_date ? computeWeekNumber(grad.hire_date) : 1);

      // 1. Self
      const { data: self } = await supabase
        .from("weekly_check_ins_self")
        .select("dimension_scores")
        .eq("graduate_id", grad.id)
        .eq("week_number", week)
        .maybeSingle();

      // 2. Manager
      const { data: manager } = await supabase
        .from("weekly_check_ins_manager")
        .select("manager_id, dimension_scores, skill_scores")
        .eq("graduate_id", grad.id)
        .eq("week_number", week)
        .maybeSingle();

      // 3. Peers
      const { data: peers } = await supabase
        .from("weekly_check_ins_peer")
        .select("dimension_scores")
        .eq("graduate_id", grad.id)
        .eq("week_number", week);

      processed++;

      const selfScores = (self?.dimension_scores ?? {}) as Record<string, number>;
      const managerScores = (manager?.dimension_scores ?? {}) as Record<string, number>;
      const peerRows = peers ?? [];

      // 4. Behavioural dimension gaps
      for (const dim of BEHAVIOURAL_DIMENSIONS) {
        const selfScore = typeof selfScores[dim] === "number" ? selfScores[dim] : null;
        const managerScore = manager ? getManagerScoreForDim(managerScores, dim) : null;
        if (selfScore === null || managerScore === null) continue;

        const peerScore = avgPeerScore(peerRows, dim);
        const { gap_value, gap_direction } = computePerceptionGap(selfScore, managerScore, peerScore);

        const { error: upErr } = await supabase
          .from("perception_gaps")
          .upsert(
            {
              graduate_id: grad.id,
              week_number: week,
              layer: "dimension",
              dimension_or_skill: dim,
              self_score: selfScore,
              manager_score: managerScore,
              peer_score: peerScore,
              gap_value,
              gap_direction,
              computed_at: new Date().toISOString(),
            },
            { onConflict: "graduate_id,week_number,layer,dimension_or_skill" },
          );
        if (!upErr) gapsComputed++;
      }

      // 5 + 6. Skill gaps & proficiency updates
      const skillScores = (manager?.skill_scores ?? {}) as Record<string, number>;
      if (manager && skillScores && typeof skillScores === "object") {
        for (const [skillSlug, mRating] of Object.entries(skillScores)) {
          if (typeof mRating !== "number") continue;

          const sRating = typeof selfScores[skillSlug] === "number" ? selfScores[skillSlug] : null;
          const peerSkill = avgPeerScore(peerRows, skillSlug);
          const { gap_value, gap_direction } = computePerceptionGap(
            sRating ?? mRating,
            mRating,
            peerSkill,
          );

          await supabase.from("perception_gaps").upsert(
            {
              graduate_id: grad.id,
              week_number: week,
              layer: "skill",
              dimension_or_skill: skillSlug,
              self_score: sRating,
              manager_score: mRating,
              peer_score: peerSkill,
              gap_value: sRating === null ? 0 : gap_value,
              gap_direction: sRating === null ? "aligned" : gap_direction,
              computed_at: new Date().toISOString(),
            },
            { onConflict: "graduate_id,week_number,layer,dimension_or_skill" },
          );
          gapsComputed++;

          // Update skill_proficiency
          const { data: skillNode } = await supabase
            .from("skill_nodes")
            .select("id")
            .eq("slug", skillSlug)
            .maybeSingle();
          if (!skillNode) continue;

          const { data: prof } = await supabase
            .from("skill_proficiency")
            .select("current_level")
            .eq("graduate_id", grad.id)
            .eq("skill_node_id", skillNode.id)
            .maybeSingle();

          const previous = prof?.current_level ?? 0;
          const newLevel = updateSkillProficiency(previous, mRating);

          const { error: profErr } = await supabase
            .from("skill_proficiency")
            .upsert(
              {
                graduate_id: grad.id,
                skill_node_id: skillNode.id,
                current_level: newLevel,
                last_assessed_week: week,
                last_assessed_by: manager.manager_id,
                last_updated: new Date().toISOString(),
              },
              { onConflict: "graduate_id,skill_node_id" },
            );
          if (!profErr) proficiencyUpdated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        graduates_processed: processed,
        gaps_computed: gapsComputed,
        proficiency_updated: proficiencyUpdated,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("compute-weekly-gaps error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
