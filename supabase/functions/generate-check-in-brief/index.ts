// Generate Check-In Brief
// Loads a graduate's recent check-in data, computes what changed, asks Claude
// to write a concise 1-1 coaching brief, and upserts to generated_insights.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============================================================================
// Inlined Claude client (mirrors src/lib/claude.ts verbatim)
// ============================================================================

const CLAUDE_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 2000;
const DEFAULT_TEMPERATURE = 0.7;

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeCallOptions {
  apiKey: string;
  system?: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  temperature?: number;
}

interface ClaudeResponse {
  success: boolean;
  text: string | null;
  parsedJson: unknown | null;
  error: string | null;
  usage?: { input_tokens: number; output_tokens: number };
}

function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```json\s*([\s\S]*?)\s*```$/);
  const jsonText = fenceMatch ? fenceMatch[1].trim() : trimmed;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

async function callClaude(options: ClaudeCallOptions): Promise<ClaudeResponse> {
  const {
    apiKey,
    system,
    messages,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
  } = options;

  const body: Record<string, unknown> = {
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (system) body.system = system;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      return {
        success: false,
        text: null,
        parsedJson: null,
        error: `Claude API ${response.status}: ${responseBody}`,
      };
    }

    const data = JSON.parse(responseBody);
    const text = data?.content?.[0]?.text ?? null;

    if (!text) {
      return {
        success: false,
        text: null,
        parsedJson: null,
        error: "Claude API response missing text content",
      };
    }

    const parsedJson = extractJson(text);

    return {
      success: true,
      text,
      parsedJson,
      error: null,
      usage: data?.usage,
    };
  } catch (err) {
    return {
      success: false,
      text: null,
      parsedJson: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ============================================================================
// Helpers
// ============================================================================

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
];

const DIMENSION_LABELS: Record<string, string> = {
  confidence: "Confidence Stability",
  workloadMgmt: "Workload Management",
  managerRelationship: "Manager Relationship",
  teamConnection: "Team Connection",
  curiosity: "Curiosity & Learning",
  initiative: "Initiative & Voice",
  resilience: "Resilience",
  feedbackApplication: "Feedback Application",
  ownershipFollowThrough: "Ownership & Follow-Through",
};

function computeWeekNumber(hireDate: string): number {
  return Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(hireDate).getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  );
}

function computeWhatChanged(
  selfRows: Array<{
    week_number: number;
    dimension_scores: Record<string, number>;
  }>,
  mgrRows: Array<{
    week_number: number;
    dimension_scores: Record<string, number>;
  }>,
  peerRows: Array<{
    week_number: number;
    dimension_scores: Record<string, number>;
  }>,
  currentWeek: number,
): Array<{ text: string; weight: number }> {
  const changes: Array<{ text: string; weight: number }> = [];

  for (const dim of BEHAVIOURAL_DIMENSIONS) {
    const selfScores = selfRows
      .filter((r) => r.week_number <= currentWeek)
      .sort((a, b) => b.week_number - a.week_number)
      .map((r) => r.dimension_scores[dim])
      .filter((v): v is number => typeof v === "number");

    const mgrScores = mgrRows
      .filter((r) => r.week_number <= currentWeek)
      .sort((a, b) => b.week_number - a.week_number)
      .map((r) => r.dimension_scores[dim])
      .filter((v): v is number => typeof v === "number");

    const peerScores = peerRows
      .filter((r) => r.week_number <= currentWeek)
      .sort((a, b) => b.week_number - a.week_number)
      .map((r) => r.dimension_scores[dim])
      .filter((v): v is number => typeof v === "number");

    const weighted = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const w0 = weighted(selfScores);
    const w1 = weighted(selfScores.slice(1));
    const m0 = weighted(mgrScores);
    const p0 = weighted(peerScores);

    const cur = w0 ?? m0 ?? p0;
    const prev = w1 ?? cur;

    if (cur !== null && prev !== null && Math.abs(cur - prev) >= 1.5) {
      changes.push({
        text: `${DIMENSION_LABELS[dim] ?? dim} went from ${prev.toFixed(1)} to ${cur.toFixed(1)} this week`,
        weight: Math.abs(cur - prev),
      });
    }

    if (selfScores.length >= 3) {
      const w0s = selfScores[0];
      const w1s = selfScores[1];
      const w2s = selfScores[2];
      if (w0s < w1s && w1s < w2s) {
        changes.push({
          text: `${DIMENSION_LABELS[dim] ?? dim} declining over 3 weeks — now ${w0s.toFixed(1)}`,
          weight: w2s - w0s,
        });
      }
    }
  }

  changes.sort((a, b) => b.weight - a.weight);
  if (changes.length === 0) {
    return [{ text: "No major changes from last week", weight: 0 }];
  }
  return changes.slice(0, 3);
}

// ============================================================================
// Handler
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = (await req.json().catch(() => ({}))) as {
      graduate_id?: string;
      week_number?: number;
    };

    if (!body.graduate_id) {
      return new Response(
        JSON.stringify({ success: false, error: "graduate_id required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // 1. Load graduate
    const { data: grad, error: gErr } = await supabase
      .from("users")
      .select("id, full_name, hire_date")
      .eq("id", body.graduate_id)
      .eq("role", "graduate")
      .maybeSingle();

    if (gErr) throw gErr;
    if (!grad) {
      return new Response(
        JSON.stringify({ success: false, error: "Graduate not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
      );
    }

    const currentWeek = body.week_number ??
      (grad.hire_date ? computeWeekNumber(grad.hire_date) : 1);

    // 2. Load context
    const [
      { data: selfRows },
      { data: mgrRows },
      { data: peerRows },
      { data: gapRows },
      { data: adaptiveRows },
    ] = await Promise.all([
      supabase
        .from("weekly_check_ins_self")
        .select("week_number, dimension_scores, free_text")
        .eq("graduate_id", grad.id)
        .gte("week_number", currentWeek - 4)
        .lte("week_number", currentWeek)
        .order("week_number", { ascending: true }),
      supabase
        .from("weekly_check_ins_manager")
        .select("week_number, dimension_scores")
        .eq("graduate_id", grad.id)
        .gte("week_number", currentWeek - 4)
        .lte("week_number", currentWeek)
        .order("week_number", { ascending: true }),
      supabase
        .from("weekly_check_ins_peer")
        .select("week_number, dimension_scores")
        .eq("graduate_id", grad.id)
        .gte("week_number", currentWeek - 4)
        .lte("week_number", currentWeek)
        .order("week_number", { ascending: true }),
      supabase
        .from("perception_gaps")
        .select("dimension_or_skill, self_score, manager_score, peer_score, gap_value, gap_direction")
        .eq("graduate_id", grad.id)
        .eq("week_number", currentWeek)
        .eq("layer", "behavioural")
        .order("gap_value", { ascending: false })
        .limit(3),
      supabase
        .from("adaptive_check_in_state")
        .select("dimension_key, is_muted, stability_weeks, last_asked_week")
        .eq("graduate_id", grad.id),
    ]);

    // 3. Compute what_changed deterministically
    const whatChanged = computeWhatChanged(
      (selfRows ?? []) as Array<{
        week_number: number;
        dimension_scores: Record<string, number>;
      }>,
      (mgrRows ?? []) as Array<{
        week_number: number;
        dimension_scores: Record<string, number>;
      }>,
      (peerRows ?? []) as Array<{
        week_number: number;
        dimension_scores: Record<string, number>;
      }>,
      currentWeek,
    );

    // 4. Build Claude prompt
    const mutedDimensions = (adaptiveRows ?? [])
      .filter((r: { is_muted: boolean }) => r.is_muted)
      .map((r: { dimension_key: string; stability_weeks: number }) => ({
        dimension: r.dimension_key,
        stable_weeks: r.stability_weeks,
      }));

    const system =
      "You are a coach advising a manager on what to say in their 1-1 with a graduate THIS WEEK. Output should be specific, data-grounded, actionable, and 45 seconds to read. No generic advice. Reference the actual numbers.";

    const userPrompt = `Graduate: ${grad.full_name}
Week number: ${currentWeek}

Triangulated perception gaps (top 3):
${JSON.stringify(
  (gapRows ?? []).map((g) => ({
    dimension: g.dimension_or_skill,
    self: g.self_score,
    manager: g.manager_score,
    peer: g.peer_score,
    gap: g.gap_value,
    direction: g.gap_direction,
  })),
  null,
  2,
)}

What changed this week (computed):
${JSON.stringify(whatChanged.map((c) => c.text), null, 2)}

Muted dimensions (stable, not being asked):
${JSON.stringify(mutedDimensions, null, 2)}

Recent self-reported free-text responses (graduate's own words, most recent first):
${JSON.stringify(
  (selfRows ?? []).map((r) => ({
    week: r.week_number,
    free_text: (r as unknown as { free_text?: unknown }).free_text ?? null,
  })),
  null,
  2,
)}

Return ONLY this JSON shape:
{
  "what_this_suggests": "2-3 sentence interpretation grounding the gaps in behaviour",
  "what_to_say": "3-4 sentences the manager can use as an opening in their 1-1",
  "one_question_to_ask": "A single question that would uncover the underlying issue"
}`;

    // 5. Call Claude
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const claude = await callClaude({
      apiKey,
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 1800,
      temperature: 0.6,
    });

    // 6. Build payload
    let payload: Record<string, unknown>;
    let generation_status: "success" | "fallback" | "error" = "success";
    let error_message: string | null = null;

    if (!claude.success) {
      generation_status = "error";
      error_message = claude.error;
      payload = {
        week_number: currentWeek,
        what_changed: whatChanged.map((c) => c.text),
        what_this_suggests:
          "The data shows some shifts this week. Review the perception gaps and what changed to understand where to focus.",
        what_to_say:
          "I've been looking at your check-in data this week. I'd like to hear how you're feeling about your progress and if anything's been particularly challenging.",
        one_question_to_ask:
          "What's one thing that's been on your mind this week that we haven't talked about yet?",
      };
    } else {
      let parsed = claude.parsedJson as
        | {
            what_this_suggests?: unknown;
            what_to_say?: unknown;
            one_question_to_ask?: unknown;
          }
        | null;

      if (!parsed && claude.text) {
        parsed = extractJson(claude.text) as typeof parsed;
      }

      if (
        parsed &&
        typeof parsed.what_this_suggests === "string" &&
        typeof parsed.what_to_say === "string" &&
        typeof parsed.one_question_to_ask === "string"
      ) {
        payload = {
          week_number: currentWeek,
          what_changed: whatChanged.map((c) => c.text),
          what_this_suggests: parsed.what_this_suggests,
          what_to_say: parsed.what_to_say,
          one_question_to_ask: parsed.one_question_to_ask,
        };
      } else {
        generation_status = "fallback";
        error_message = "Claude returned text but JSON shape was invalid";
        payload = {
          week_number: currentWeek,
          what_changed: whatChanged.map((c) => c.text),
          what_this_suggests:
            "The data shows some shifts this week. Review the perception gaps and what changed to understand where to focus.",
          what_to_say:
            "I've been looking at your check-in data this week. I'd like to hear how you're feeling about your progress and if anything's been particularly challenging.",
          one_question_to_ask:
            "What's one thing that's been on your mind this week that we haven't talked about yet?",
        };
      }
    }

    // 7. Upsert
    const { error: upErr } = await supabase
      .from("generated_insights")
      .upsert(
        {
          graduate_id: body.graduate_id,
          manager_id: null,
          week_number: currentWeek,
          surface_type: "check_in_brief",
          payload,
          generated_at: new Date().toISOString(),
          generation_status,
          error_message: generation_status !== "success" ? error_message : null,
        },
        { onConflict: "graduate_id,week_number,surface_type" },
      );

    if (upErr) {
      console.error("upsert generated_insights failed:", upErr);
      return new Response(
        JSON.stringify({ success: false, error: `upsert failed: ${upErr.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        week_number: currentWeek,
        generation_status,
        payload,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("generate-check-in-brief error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
