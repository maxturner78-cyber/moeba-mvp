// Detect Missed Check-Ins
// Pure SQL/logic Edge Function — no Claude calls.
// For each graduate, determines whether the self/manager/peer check-ins for the
// target week have been submitted. If we've passed Tuesday 23:59 AEST, missing
// self/manager check-ins are flagged. Results upserted into
// check_in_completion_log keyed on (graduate_id, week_number).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function computeWeekNumber(hireDate: string): number {
  return Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(hireDate).getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    ),
  );
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

    let body: { week_number?: number } = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    // Compute Sydney time and determine if we've passed Tuesday 23:59 AEST.
    // Week starts Monday 00:00 AEST. Sunday is treated as past-Tuesday for
    // pilot simplicity.
    const nowUtc = new Date();
    const sydneyNow = new Date(
      nowUtc.toLocaleString("en-US", { timeZone: "Australia/Sydney" }),
    );
    const dayOfWeek = sydneyNow.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const isPastTuesday = dayOfWeek >= 3 || dayOfWeek === 0;

    // Load all graduates
    const { data: graduates, error: gErr } = await supabase
      .from("users")
      .select("id, full_name, hire_date")
      .eq("role", "graduate");
    if (gErr) throw gErr;

    let missedSelfCount = 0;
    let missedManagerCount = 0;
    const perGraduate: Array<{
      graduate_id: string;
      full_name: string;
      week_number: number;
      missed_self: boolean;
      missed_manager: boolean;
    }> = [];

    for (const grad of graduates ?? []) {
      const currentWeek = grad.hire_date ? computeWeekNumber(grad.hire_date) : 1;
      const week = body.week_number ?? currentWeek;

      const { data: selfRow } = await supabase
        .from("weekly_check_ins_self")
        .select("id")
        .eq("graduate_id", grad.id)
        .eq("week_number", week)
        .maybeSingle();
      const selfSubmitted = !!selfRow;

      const { data: managerRow } = await supabase
        .from("weekly_check_ins_manager")
        .select("id")
        .eq("graduate_id", grad.id)
        .eq("week_number", week)
        .maybeSingle();
      const managerSubmitted = !!managerRow;

      const { data: peerRows } = await supabase
        .from("weekly_check_ins_peer")
        .select("id")
        .eq("graduate_id", grad.id)
        .eq("week_number", week);
      const peerSubmitted = (peerRows ?? []).length > 0;

      const missedSelf = !selfSubmitted && isPastTuesday;
      const missedManager = !managerSubmitted && isPastTuesday;

      const { error: upErr } = await supabase
        .from("check_in_completion_log")
        .upsert(
          {
            graduate_id: grad.id,
            week_number: week,
            self_submitted: selfSubmitted,
            manager_submitted: managerSubmitted,
            peer_submitted: peerSubmitted,
            missed_self: missedSelf,
            missed_manager: missedManager,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "graduate_id,week_number" },
        );

      if (upErr) {
        console.error("upsert check_in_completion_log failed:", upErr);
        return new Response(
          JSON.stringify({
            success: false,
            error: `upsert failed: ${upErr.message}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      if (missedSelf) missedSelfCount++;
      if (missedManager) missedManagerCount++;

      perGraduate.push({
        graduate_id: grad.id,
        full_name: grad.full_name,
        week_number: week,
        missed_self: missedSelf,
        missed_manager: missedManager,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        is_past_tuesday: isPastTuesday,
        graduates_checked: perGraduate.length,
        missed_self_count: missedSelfCount,
        missed_manager_count: missedManagerCount,
        per_graduate: perGraduate,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (err) {
    console.error("detect-missed-checkins error:", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});