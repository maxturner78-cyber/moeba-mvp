// Generate Team Brief
// Loads a manager's team, flags graduates needing attention, asks Claude to write
// a concise per-graduate narrative, and upserts to generated_insights.

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

function computeWeekNumber(hireDate: string): number {
  return Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(hireDate).getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  );
}

function computeStatus(params: {
  avgDimensionScore: number;
  maxGap: number;
  decliningCount: number;
}): "accelerating" | "steady" | "stalling" | "attention" {
  const { avgDimensionScore, maxGap, decliningCount } = params;
  if (maxGap >= 2.5 || decliningCount >= 4 || avgDimensionScore < 5) return "attention";
  if (maxGap >= 1.5 || decliningCount >= 2) return "stalling";
  if (avgDimensionScore >= 7.5 && decliningCount === 0) return "accelerating";
  return "steady";
}

type Gap = {
  dimension_or_skill: string;
  self_score: number | null;
  manager_score: number | null;
  peer_score: number | null;
  gap_value: number;
  gap_direction: string | null;
};

type FlaggedGraduate = {
  id: string;
  full_name: string;
  firstName: string;
  currentWeek: number;
  status: "accelerating" | "steady" | "stalling" | "attention";
  topGaps: Gap[];
  workload: number | null;
  confidence: number | null;
  maxGap: number;
  reason: string;
};

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
      manager_id?: string;
      week_number?: number;
    };

    if (!body.manager_id) {
      return new Response(
        JSON.stringify({ success: false, error: "manager_id required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // 1. Load manager
    const { data: manager, error: mErr } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", body.manager_id)
      .eq("role", "manager")
      .maybeSingle();

    if (mErr) throw mErr;
    if (!manager) {
      return new Response(
        JSON.stringify({ success: false, error: "Manager not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 },
      );
    }

    // 2. Load team
    const { data: graduates, error: gErr } = await supabase
      .from("users")
      .select("id, full_name, hire_date")
      .eq("role", "graduate")
      .eq("manager_id", body.manager_id);

    if (gErr) throw gErr;

    const team = graduates ?? [];

    // 3. Per-graduate context
    const enriched: Array<{
      id: string;
      full_name: string;
      firstName: string;
      currentWeek: number;
      status: "accelerating" | "steady" | "stalling" | "attention";
      topGaps: Gap[];
      workload: number | null;
      confidence: number | null;
      maxGap: number;
    }> = [];

    for (const g of team) {
      const currentWeek = g.hire_date ? computeWeekNumber(g.hire_date) : 1;

      const [{ data: gapRows }, { data: selfRows }] = await Promise.all([
        supabase
          .from("perception_gaps")
          .select("dimension_or_skill, self_score, manager_score, peer_score, gap_value, gap_direction")
          .eq("graduate_id", g.id)
          .eq("week_number", currentWeek)
          .eq("layer", "behavioural")
          .order("gap_value", { ascending: false }),
        supabase
          .from("weekly_check_ins_self")
          .select("week_number, dimension_scores")
          .eq("graduate_id", g.id)
          .lte("week_number", currentWeek)
          .order("week_number", { ascending: false })
          .limit(1),
      ]);

      const gaps = (gapRows ?? []) as Gap[];
      const maxGap = gaps.length > 0 ? Number(gaps[0].gap_value) : 0;

      const latestSelf = selfRows?.[0] ?? null;
      const dimScores = (latestSelf?.dimension_scores ?? {}) as Record<string, number>;
      const workload =
        typeof dimScores.workloadMgmt === "number" ? dimScores.workloadMgmt : null;
      const confidence =
        typeof dimScores.confidence === "number" ? dimScores.confidence : null;

      // Avg of latest self dimension scores (proxy — no full triangulated history here)
      const dimVals = Object.values(dimScores).filter((v): v is number => typeof v === "number");
      const avgDimensionScore =
        dimVals.length > 0 ? dimVals.reduce((a, b) => a + b, 0) / dimVals.length : 7;

      const status = computeStatus({
        avgDimensionScore,
        maxGap,
        decliningCount: 0, // No multi-week trend computed here
      });

      enriched.push({
        id: g.id,
        full_name: g.full_name,
        firstName: g.full_name.split(" ")[0],
        currentWeek,
        status,
        topGaps: gaps.slice(0, 2),
        workload,
        confidence,
        maxGap,
      });
    }

    const maxWeek = enriched.reduce((m, g) => Math.max(m, g.currentWeek), 1);

    // 5. Compute flagged graduates
    const flagged: FlaggedGraduate[] = enriched
      .map((g) => {
        const reasons: string[] = [];
        if (g.status === "attention" || g.status === "stalling") reasons.push(g.status === "attention" ? "Attention" : "Stalling");
        if (g.maxGap >= 2.0) reasons.push("Perception gap");
        if (g.workload !== null && g.workload <= 3) reasons.push("Workload spike");
        if (g.confidence !== null && g.confidence <= 4) reasons.push("Confidence dip");
        const flag = reasons.length > 0;
        return flag ? { ...g, reason: reasons[0] } : null;
      })
      .filter((x): x is FlaggedGraduate => x !== null)
      .sort((a, b) => b.maxGap - a.maxGap)
      .slice(0, 2);

    // 6/7. Build payload
    let payload: Record<string, unknown>;
    let generation_status: "success" | "fallback" | "error" = "success";
    let error_message: string | null = null;

    const flaggedSerialised = flagged.map((g) => ({
      graduate_id: g.id,
      name: g.full_name,
      reason: g.reason,
      cta: `Open ${g.firstName}'s brief`,
    }));

    if (flagged.length === 0) {
      payload = {
        week_number: maxWeek,
        headline: "All tracking well this week",
        narrative_paragraphs: [
          "Your team's perception gaps are within healthy ranges. Keep up your weekly cadence.",
        ],
        flagged_graduates: [],
      };
    } else {
      const system =
        "You are writing a concise team brief for a busy manager. Your job is to tell them exactly which of their people need attention this week and what the specific issue is. Each paragraph names a specific graduate and cites specific numbers (perception gap value, workload score, confidence score). No filler like 'consider scheduling a one-on-one' — just the data. Output ONLY valid JSON with the schema shown, no preamble or markdown fences.";

      const userPrompt = `Manager: ${manager.full_name}
Week number: ${maxWeek}
Flagged graduates (${flagged.length}):
${JSON.stringify(
  flagged.map((g) => ({
    name: g.full_name,
    currentWeek: g.currentWeek,
    status: g.status,
    workload: g.workload,
    confidence: g.confidence,
    top_gaps: g.topGaps,
  })),
  null,
  2,
)}

Return ONLY this JSON shape:
{
  "headline": "${flagged.length} ${flagged.length === 1 ? "item needs" : "items need"} attention",
  "narrative_paragraphs": ["one paragraph per flagged graduate"]
}`;

      const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

      const claude = await callClaude({
        apiKey,
        system,
        messages: [{ role: "user", content: userPrompt }],
        maxTokens: 1500,
        temperature: 0.6,
      });

      if (!claude.success) {
        generation_status = "error";
        error_message = claude.error;
        payload = {
          week_number: maxWeek,
          headline: "Team brief is being prepared",
          narrative_paragraphs: ["Your team brief will be ready shortly."],
          flagged_graduates: flaggedSerialised,
        };
      } else {
        let parsed = claude.parsedJson as
          | { headline?: unknown; narrative_paragraphs?: unknown }
          | null;

        if (!parsed && claude.text) {
          parsed = extractJson(claude.text) as typeof parsed;
        }

        if (
          parsed &&
          typeof parsed.headline === "string" &&
          Array.isArray(parsed.narrative_paragraphs)
        ) {
          payload = {
            week_number: maxWeek,
            headline: parsed.headline,
            narrative_paragraphs: parsed.narrative_paragraphs,
            flagged_graduates: flaggedSerialised,
          };
        } else {
          generation_status = "fallback";
          error_message = "Claude returned text but JSON shape was invalid";
          payload = {
            week_number: maxWeek,
            headline: "Team brief is being prepared",
            narrative_paragraphs: ["Your team brief will be ready shortly."],
            flagged_graduates: flaggedSerialised,
          };
        }
      }
    }

    // 9. Upsert
    const { error: upErr } = await supabase
      .from("generated_insights")
      .upsert(
        {
          graduate_id: null,
          manager_id: body.manager_id,
          week_number: maxWeek,
          surface_type: "team_brief",
          payload,
          generated_at: new Date().toISOString(),
          generation_status,
          error_message: generation_status !== "success" ? error_message : null,
        },
        { onConflict: "manager_id,week_number,surface_type" },
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
        week_number: maxWeek,
        generation_status,
        payload,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("generate-team-brief error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});