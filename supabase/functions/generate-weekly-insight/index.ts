// Generate Weekly Insight
// Loads graduate's recent history + perception gaps, asks Claude to write a
// personalised 3-paragraph weekly insight, and upserts to generated_insights.

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
// Handler
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
] as const;

const FALLBACK_PAYLOAD = (week: number) => ({
  week_number: week,
  paragraphs: [
    "We're analysing your week's data — your full insight will be ready shortly.",
    "Your perception gaps this week are available on the Perception Gap tab.",
    "Complete this week's check-in to keep your data current.",
  ],
  call_to_action: "Start this week's check-in",
});

function computeWeekNumber(hireDate: string): number {
  return Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(hireDate).getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  );
}

function summariseScores(rows: Array<{ week_number: number; dimension_scores: unknown }>) {
  return rows.map((r) => ({
    week: r.week_number,
    scores: r.dimension_scores,
  }));
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
      .select("id, full_name, role, hire_date, manager_id")
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

    const week =
      body.week_number ?? (grad.hire_date ? computeWeekNumber(grad.hire_date) : 1);

    // 2. Load history (last 4 weeks <= target)
    const [{ data: selfRows }, { data: managerRows }, { data: peerRows }, { data: gaps }] =
      await Promise.all([
        supabase
          .from("weekly_check_ins_self")
          .select("week_number, dimension_scores, free_text")
          .eq("graduate_id", grad.id)
          .lte("week_number", week)
          .order("week_number", { ascending: false })
          .limit(4),
        supabase
          .from("weekly_check_ins_manager")
          .select("week_number, dimension_scores, skill_scores")
          .eq("graduate_id", grad.id)
          .lte("week_number", week)
          .order("week_number", { ascending: false })
          .limit(4),
        supabase
          .from("weekly_check_ins_peer")
          .select("week_number, dimension_scores")
          .eq("graduate_id", grad.id)
          .lte("week_number", week)
          .order("week_number", { ascending: false })
          .limit(4),
        supabase
          .from("perception_gaps")
          .select("dimension_or_skill, self_score, manager_score, peer_score, gap_value, gap_direction")
          .eq("graduate_id", grad.id)
          .eq("week_number", week)
          .eq("layer", "behavioural")
          .order("gap_value", { ascending: false }),
      ]);

    const currentSelf = selfRows?.find((r) => r.week_number === week) ?? null;
    const currentManager = managerRows?.find((r) => r.week_number === week) ?? null;
    const currentPeer = peerRows?.find((r) => r.week_number === week) ?? null;
    const topGaps = (gaps ?? []).slice(0, 3);

    // 3. Build prompt
    const system =
      "You are a performance coach writing directly to a graduate accountant in their weekly development insight. Your tone is direct, honest, specific, and kind. No generic filler like 'keep up the great work!' — ground everything in the data you're given. Address the graduate by their first name. Cite specific numbers (e.g., 'your self-rating of 3.8 vs your manager's 2.9'). Output ONLY valid JSON matching the requested schema, with no preamble or markdown fences.";

    const userPrompt = `Graduate: ${grad.full_name}
Week number: ${week}

Current week (week ${week}) behavioural scores:
- Self: ${JSON.stringify(currentSelf?.dimension_scores ?? null)}
- Manager: ${JSON.stringify(currentManager?.dimension_scores ?? null)}
- Peer: ${JSON.stringify(currentPeer?.dimension_scores ?? null)}
- Self free-text: ${JSON.stringify(currentSelf?.free_text ?? null)}

Behavioural dimension keys (9): ${BEHAVIOURAL_DIMENSIONS.join(", ")}

Top 3 perception gaps this week (largest first):
${JSON.stringify(topGaps, null, 2)}

Self-check-in history (most recent first, up to 4 weeks):
${JSON.stringify(summariseScores(selfRows ?? []), null, 2)}

Manager-check-in history (most recent first, up to 4 weeks):
${JSON.stringify(summariseScores(managerRows ?? []), null, 2)}

Peer-check-in history (most recent first, up to 4 weeks):
${JSON.stringify(summariseScores(peerRows ?? []), null, 2)}

Write exactly 3 paragraphs:
- Paragraph 1: what's going well (1-2 sentences, cite specific numbers)
- Paragraph 2: what the data is saying you may not see (the perception gap)
- Paragraph 3: one specific action to take this week

Return ONLY this JSON shape:
{
  "paragraphs": ["...", "...", "..."],
  "call_to_action": "Start this week's check-in"
}`;

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const claude = await callClaude({
      apiKey,
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 1500,
      temperature: 0.7,
    });

    let payload: Record<string, unknown>;
    let generation_status: "success" | "fallback" | "error";
    let error_message: string | null = null;

    if (!claude.success) {
      generation_status = "error";
      error_message = claude.error;
      payload = FALLBACK_PAYLOAD(week);
    } else {
      let parsed = claude.parsedJson as
        | { paragraphs?: unknown; call_to_action?: unknown }
        | null;

      if (!parsed && claude.text) {
        parsed = extractJson(claude.text) as typeof parsed;
      }

      if (
        parsed &&
        Array.isArray(parsed.paragraphs) &&
        typeof parsed.call_to_action === "string"
      ) {
        generation_status = "success";
        payload = {
          week_number: week,
          paragraphs: parsed.paragraphs,
          call_to_action: parsed.call_to_action,
        };
      } else {
        generation_status = "fallback";
        error_message = "Claude returned text but JSON shape was invalid";
        payload = FALLBACK_PAYLOAD(week);
      }
    }

    // Upsert
    const { error: upErr } = await supabase
      .from("generated_insights")
      .upsert(
        {
          graduate_id: grad.id,
          manager_id: null,
          week_number: week,
          surface_type: "weekly_insight",
          payload,
          generated_at: new Date().toISOString(),
          generation_status,
          ...(error_message ? { error_message } : {}),
        },
        { onConflict: "graduate_id,week_number,surface_type" },
      );

    if (upErr) {
      console.error("upsert generated_insights failed:", upErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        week_number: week,
        generation_status,
        payload,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    console.error("generate-weekly-insight error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});