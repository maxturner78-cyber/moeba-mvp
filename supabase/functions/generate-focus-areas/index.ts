// Generate Focus Areas
// Computes 1-2 dimensions a graduate should focus on this week (deterministic),
// then asks Claude to write coaching text addressed to both graduate and manager.
// Upserts to generated_insights with surface_type='focus_areas'.

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
// Constants & Helpers
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

interface FocusAreaCandidate {
  key: string;
  currentScore: number;
  gapValue: number;
  threeWeekDelta: number;
  focusScore: number;
  trend: "declining 3 weeks" | "stable" | "improving" | "declining";
}

function computeTrend(threeWeekDelta: number): FocusAreaCandidate["trend"] {
  if (threeWeekDelta < -1.5) return "declining 3 weeks";
  if (Math.abs(threeWeekDelta) <= 0.5) return "stable";
  if (threeWeekDelta > 0.5) return "improving";
  return "declining";
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

    const targetWeek = body.week_number ??
      (grad.hire_date ? computeWeekNumber(grad.hire_date) : 1);

    // 2. Load context
    const [{ data: selfRows }, { data: gapRows }] = await Promise.all([
      supabase
        .from("weekly_check_ins_self")
        .select("week_number, dimension_scores")
        .eq("graduate_id", grad.id)
        .gte("week_number", targetWeek - 4)
        .lte("week_number", targetWeek)
        .order("week_number", { ascending: true }),
      supabase
        .from("perception_gaps")
        .select("dimension_or_skill, self_score, manager_score, peer_score, gap_value, gap_direction")
        .eq("graduate_id", grad.id)
        .eq("week_number", targetWeek)
        .eq("layer", "behavioural"),
    ]);

    const selfHistory = (selfRows ?? []) as Array<{
      week_number: number;
      dimension_scores: Record<string, number>;
    }>;

    const gapByDim = new Map<string, {
      self_score: number | null;
      manager_score: number | null;
      peer_score: number | null;
      gap_value: number;
      gap_direction: string | null;
    }>();
    for (const g of (gapRows ?? [])) {
      gapByDim.set(g.dimension_or_skill, {
        self_score: g.self_score,
        manager_score: g.manager_score,
        peer_score: g.peer_score,
        gap_value: g.gap_value,
        gap_direction: g.gap_direction,
      });
    }

    // 3. Compute focus area candidates deterministically
    const candidates: FocusAreaCandidate[] = [];

    for (const dim of BEHAVIOURAL_DIMENSIONS) {
      const gap = gapByDim.get(dim);
      if (!gap) continue;

      const currentScore = gap.self_score ?? 0;
      const gapValue = gap.gap_value ?? 0;

      const currentSelfRow = selfHistory.find((r) => r.week_number === targetWeek);
      const threeWeeksAgoRow = selfHistory.find((r) => r.week_number === targetWeek - 3);
      const curSelf = currentSelfRow?.dimension_scores?.[dim];
      const oldSelf = threeWeeksAgoRow?.dimension_scores?.[dim];

      const threeWeekDelta =
        typeof curSelf === "number" && typeof oldSelf === "number"
          ? curSelf - oldSelf
          : 0;

      const focusScore = (gapValue * 2) + Math.max(0, -threeWeekDelta) * 1;

      candidates.push({
        key: dim,
        currentScore,
        gapValue,
        threeWeekDelta,
        focusScore,
        trend: computeTrend(threeWeekDelta),
      });
    }

    candidates.sort((a, b) => b.focusScore - a.focusScore);
    const focusAreas = candidates.filter((c) => c.focusScore > 2.0).slice(0, 2);

    // 4. If none, skip Claude
    if (focusAreas.length === 0) {
      const payload = {
        week_number: targetWeek,
        focus_areas: [],
      };

      const { error: upErr } = await supabase
        .from("generated_insights")
        .upsert(
          {
            graduate_id: body.graduate_id,
            manager_id: null,
            week_number: targetWeek,
            surface_type: "focus_areas",
            payload,
            generated_at: new Date().toISOString(),
            generation_status: "success",
            error_message: null,
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
          week_number: targetWeek,
          generation_status: "success",
          payload,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // 5. Build Claude prompt
    const system =
      "You are writing development coaching for the 1-2 dimensions a graduate accountant should focus on this week. Output is read by BOTH graduate and manager. Tone: direct, practical, specific. Cite the numbers. The coaching_text should address the graduate directly ('you'). The how_manager_can_help should address the manager directly ('ask', 'create space for'). Output ONLY valid JSON.";

    const focusAreasForPrompt = focusAreas.map((fa) => {
      const gap = gapByDim.get(fa.key);
      return {
        dimension: DIMENSION_LABELS[fa.key] ?? fa.key,
        current_score: fa.currentScore,
        trend: fa.trend,
        perception_gap_value: fa.gapValue,
        perception_gap_direction: gap?.gap_direction ?? null,
      };
    });

    const userPrompt = `Graduate: ${grad.full_name}
Week number: ${targetWeek}

Focus areas (in order):
${JSON.stringify(focusAreasForPrompt, null, 2)}

Return ONLY a JSON array in the SAME ORDER as the focus areas above:
[
  {
    "coaching_text": "3-4 sentences addressed to the graduate ('you')",
    "how_manager_can_help": "3-4 sentences addressed to the manager ('ask', 'create space for')"
  }
]`;

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const claude = await callClaude({
      apiKey,
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 1500,
      temperature: 0.7,
    });

    // 6. Build payload
    let generation_status: "success" | "fallback" | "error" = "success";
    let error_message: string | null = null;
    let coachingTexts: Array<{ coaching_text: string; how_manager_can_help: string }> = [];

    if (!claude.success) {
      generation_status = "error";
      error_message = claude.error;
      coachingTexts = focusAreas.map(() => ({
        coaching_text: "This dimension needs attention this week.",
        how_manager_can_help: "Ask open-ended questions about recent experience in this area.",
      }));
    } else {
      let parsed = claude.parsedJson;
      if (!parsed && claude.text) {
        parsed = extractJson(claude.text);
      }

      const isValidArray =
        Array.isArray(parsed) &&
        parsed.length === focusAreas.length &&
        parsed.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof (item as { coaching_text?: unknown }).coaching_text === "string" &&
            typeof (item as { how_manager_can_help?: unknown }).how_manager_can_help === "string",
        );

      if (isValidArray) {
        coachingTexts = (parsed as Array<{ coaching_text: string; how_manager_can_help: string }>)
          .map((item) => ({
            coaching_text: item.coaching_text,
            how_manager_can_help: item.how_manager_can_help,
          }));
      } else {
        generation_status = "fallback";
        error_message = "Claude returned text but JSON shape was invalid";
        coachingTexts = focusAreas.map(() => ({
          coaching_text: "This dimension needs attention this week.",
          how_manager_can_help: "Ask open-ended questions about recent experience in this area.",
        }));
      }
    }

    const payload = {
      week_number: targetWeek,
      focus_areas: focusAreas.map((fa, i) => ({
        dimension_key: fa.key,
        label: DIMENSION_LABELS[fa.key] ?? fa.key,
        current_score: fa.currentScore,
        trend: fa.trend,
        coaching_text: coachingTexts[i].coaching_text,
        how_manager_can_help: coachingTexts[i].how_manager_can_help,
      })),
    };

    // 7. Upsert
    const { error: upErr } = await supabase
      .from("generated_insights")
      .upsert(
        {
          graduate_id: body.graduate_id,
          manager_id: null,
          week_number: targetWeek,
          surface_type: "focus_areas",
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
        week_number: targetWeek,
        generation_status,
        payload,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("generate-focus-areas error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});