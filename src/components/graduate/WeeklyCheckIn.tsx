import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FormSlider from "@/components/forms/FormSlider";
import {
  useGraduate,
  useSkillNodesGrouped,
  useSkillProficiency,
  usePreparedCheckIn,
} from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import type { AdaptiveQuestion } from "@/lib/adaptive";
import { buildCarriedDimensionScores } from "@/lib/carryForward";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const CLUSTER_LABELS: Record<string, string> = {
  core: "Core",
  audit: "Audit",
  client: "Client",
  tax: "Tax",
  compliance: "Compliance",
};

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E8E8E8",
  borderRadius: 10,
  padding: 28,
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
};

const WeeklyCheckIn: React.FC = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const CURRENT_GRADUATE_ID = user?.id ?? "";
  const COMPANY_ID = user?.company_id ?? "";
  const { data: graduate } = useGraduate(CURRENT_GRADUATE_ID);
  const { data: skillGroups } = useSkillNodesGrouped(COMPANY_ID);
  const { data: proficiencyData } = useSkillProficiency(CURRENT_GRADUATE_ID);
  const {
    data: prepared,
    isLoading: preparedLoading,
    error: preparedError,
    refetch: refetchPrepared,
  } = usePreparedCheckIn(CURRENT_GRADUATE_ID, "self");
  const queryClient = useQueryClient();

  // Dynamic answer state — keyed by question identifier
  const [dimensionScores, setDimensionScores] = useState<Record<string, number>>({});
  const [skillScores, setSkillScores] = useState<Record<string, number>>({});
  const [freeText, setFreeText] = useState<Record<string, string>>({});

  // Work log state (only used when a work_log question is included)
  const [projectName, setProjectName] = useState("");
  const [checkedSlugs, setCheckedSlugs] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [workLogInitialized, setWorkLogInitialized] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Build a map of slug → current_level
  const profMap = useMemo(() => {
    const m: Record<string, number> = {};
    if (proficiencyData) {
      for (const row of proficiencyData) {
        if (row.skill_node?.slug) m[row.skill_node.slug] = row.current_level;
      }
    }
    return m;
  }, [proficiencyData]);

  const assessedSlugs = useMemo(
    () => new Set(Object.entries(profMap).filter(([, v]) => v > 0).map(([k]) => k)),
    [profMap],
  );

  // Initialize work log defaults (pre-check assessed skills, expand active clusters)
  useEffect(() => {
    if (workLogInitialized || !skillGroups || !proficiencyData) return;
    setCheckedSlugs(new Set(assessedSlugs));
    const expanded = new Set<string>();
    for (const [cluster, nodes] of Object.entries(skillGroups)) {
      if (nodes.some((n) => assessedSlugs.has(n.slug))) expanded.add(cluster);
    }
    setExpandedClusters(expanded);
    setWorkLogInitialized(true);
  }, [skillGroups, proficiencyData, assessedSlugs, workLogInitialized]);

  // Initialize default slider values (5) for each asked dimension/skill question
  useEffect(() => {
    if (!prepared) return;
    setDimensionScores((prev) => {
      const next = { ...prev };
      for (const q of prepared.questions) {
        if (q.type === "dimension" && q.dimensionKey && next[q.dimensionKey] === undefined) {
          next[q.dimensionKey] = 5;
        }
      }
      return next;
    });
    setSkillScores((prev) => {
      const next = { ...prev };
      for (const q of prepared.questions) {
        if (q.type === "skill" && q.skillSlug && next[q.skillSlug] === undefined) {
          next[q.skillSlug] = 5;
        }
      }
      return next;
    });
  }, [prepared]);

  const toggleSlug = (slug: string) => {
    setCheckedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleCluster = (cluster: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(cluster)) next.delete(cluster);
      else next.add(cluster);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!graduate || !prepared || submitting) return;
    setSubmitting(true);

    // Build dimension_scores from only the asked dimensions
    const askedDimensionScores: Record<string, number> = {};
    for (const q of prepared.questions) {
      if (q.type === "dimension" && q.dimensionKey) {
        askedDimensionScores[q.dimensionKey] = dimensionScores[q.dimensionKey] ?? 5;
      }
    }

    // Carry-forward unasked dimensions from the prior self check-in
    const weekNumber = prepared.week_number || graduate.week_number;
    const { dimensionScores: dimension_scores, carriedForward: carried_forward } =
      await buildCarriedDimensionScores({
        role: "self",
        graduateId: CURRENT_GRADUATE_ID,
        weekNumber,
        askedDimensionScores,
      });

    const skill_scores: Record<string, number> = {};
    for (const q of prepared.questions) {
      if (q.type === "skill" && q.skillSlug) {
        skill_scores[q.skillSlug] = skillScores[q.skillSlug] ?? 5;
      }
    }

    const free_text: Record<string, string> = {};
    for (const q of prepared.questions) {
      if (q.type === "free_text") {
        free_text[q.label] = freeText[q.label] ?? "";
      }
    }

    const hasWorkLog = prepared.questions.some((q) => q.type === "work_log");

    const selfRow: Record<string, unknown> = {
      graduate_id: CURRENT_GRADUATE_ID,
      week_number: weekNumber,
      check_in_date: new Date().toISOString().split("T")[0],
      dimension_scores,
      free_text,
      carried_forward,
    };
    if (Object.keys(skill_scores).length > 0) {
      selfRow.skill_scores = skill_scores;
    }

    const promises: Array<PromiseLike<any>> = [
      supabase.from("weekly_check_ins_self").insert(selfRow as any),
    ];

    let workLogRow: any = null;
    if (hasWorkLog) {
      const skillSlugsArray = [...checkedSlugs];
      const is_first_exposure = skillSlugsArray.some(
        (slug) => !(slug in profMap) || profMap[slug] === 0,
      );
      workLogRow = {
        graduate_id: CURRENT_GRADUATE_ID,
        week_number: prepared.week_number || graduate.week_number,
        project_name: projectName.trim() || "Unspecified",
        skill_slugs: skillSlugsArray,
        is_first_exposure,
      };
      promises.push(supabase.from("work_log_entries").insert(workLogRow));
    }

    const results = await Promise.all(promises);
    const selfResult = results[0];
    const workLogResult = hasWorkLog ? results[1] : null;

    if (selfResult.error) {
      if (selfResult.error.code === "23505") {
        toast("You've already submitted this week's check-in.", {
          action: {
            label: "Update instead",
            onClick: async () => {
              const { error: updateErr } = await supabase
                .from("weekly_check_ins_self")
                .update({
                  dimension_scores,
                  free_text,
                  check_in_date: selfRow.check_in_date,
                  ...(Object.keys(skill_scores).length > 0 ? { skill_scores } : {}),
                })
                .eq("graduate_id", CURRENT_GRADUATE_ID)
                .eq("week_number", selfRow.week_number);

              if (updateErr) {
                toast.error("Failed to update check-in.");
              } else {
                queryClient.invalidateQueries({ queryKey: ["selfCheckIns", CURRENT_GRADUATE_ID] });
                toast.success("Check-in updated.");
                setSubmitted(true);
              }
            },
          },
        });
      } else {
        toast.error("Something went wrong — please try again.");
      }
      setSubmitting(false);
      return;
    }

    if (workLogResult?.error) {
      if (workLogResult.error.code === "23505" && workLogRow) {
        await supabase
          .from("work_log_entries")
          .update({
            project_name: workLogRow.project_name,
            skill_slugs: workLogRow.skill_slugs,
            is_first_exposure: workLogRow.is_first_exposure,
          })
          .eq("graduate_id", CURRENT_GRADUATE_ID)
          .eq("week_number", workLogRow.week_number);
      } else {
        toast.error("Work log couldn't be saved, but your check-in was submitted.");
      }
    }

    queryClient.invalidateQueries({ queryKey: ["selfCheckIns", CURRENT_GRADUATE_ID] });
    queryClient.invalidateQueries({ queryKey: ["workLogEntries", CURRENT_GRADUATE_ID] });
    toast.success("Check-in submitted — see you next week.");
    setSubmitted(true);
    setSubmitting(false);
  };

  /* ── Render states ──────────────────────────────────────────── */

  if (submitted) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>
            Check-in submitted ✓
          </div>
          <div style={{ fontSize: 14, color: "#374151" }}>See you next week, Sarah</div>
        </div>
      </div>
    );
  }

  if (preparedLoading) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 8 }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          <div style={{ height: 30, width: "60%", background: "#F3F4F6", borderRadius: 6, marginBottom: 12 }} />
          <div style={{ height: 14, width: "80%", background: "#F3F4F6", borderRadius: 6, marginBottom: 28 }} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ ...CARD_STYLE, marginBottom: 16 }}>
              <div style={{ height: 14, width: "70%", background: "#F3F4F6", borderRadius: 4, marginBottom: 12 }} />
              <div style={{ height: 8, width: "100%", background: "#F3F4F6", borderRadius: 4 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (preparedError || !prepared) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center" style={{ maxWidth: 420, textAlign: "center" }}>
          <AlertCircle size={40} color="#DC2626" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", marginBottom: 8 }}>
            Couldn't load this week's check-in
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 20 }}>
            {preparedError instanceof Error ? preparedError.message : "Please try again."}
          </div>
          <button
            onClick={() => refetchPrepared()}
            style={{
              background: "#22C55E", color: "#fff", borderRadius: 8,
              padding: "10px 18px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Counter ────────────────────────────────────────────────── */

  // Count user-facing questions (work_log counted as 1, free_text as 1, sliders as 1)
  const questionCount = prepared.questions.length;
  const estimatedSeconds = questionCount * 15;

  /* ── Work log section (used only when a work_log question exists) ── */

  const clusterOrder = ["core", "audit", "client", "tax", "compliance"];
  const orderedClusters = clusterOrder.filter((c) => skillGroups?.[c]?.length);

  const renderWorkLog = () => (
    <div className="animate-fade-in" style={{ ...CARD_STYLE, marginBottom: 20 }}>
      <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
        This week's work
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
          Projects I worked on this week
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Q3 audit engagement, tax return prep…"
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14,
            border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
            fontFamily: "Inter, sans-serif",
          }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 12 }}>
          Skills I used or developed
        </label>

        {orderedClusters.map((cluster) => {
          const nodes = skillGroups![cluster];
          const isExpanded = expandedClusters.has(cluster);
          const checkedCount = nodes.filter((n) => checkedSlugs.has(n.slug)).length;

          return (
            <div key={cluster} style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => toggleCluster(cluster)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, width: "100%",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 0", fontSize: 13, fontWeight: 600,
                  color: "#374151", textTransform: "capitalize",
                }}
              >
                {isExpanded
                  ? <ChevronDown size={14} color="#9CA3AF" />
                  : <ChevronRight size={14} color="#9CA3AF" />}
                {CLUSTER_LABELS[cluster] ?? cluster}
                {checkedCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 500, color: "#22C55E",
                    background: "#F0FDF4", borderRadius: 10, padding: "1px 7px",
                    marginLeft: 4,
                  }}>
                    {checkedCount}
                  </span>
                )}
                {!isExpanded && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#9CA3AF", marginLeft: "auto" }}>
                    Show {CLUSTER_LABELS[cluster]?.toLowerCase() ?? cluster}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "4px 16px", paddingLeft: 20, paddingBottom: 8,
                }}>
                  {nodes.map((node) => (
                    <label
                      key={node.slug}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontSize: 13, color: "#374151", cursor: "pointer",
                        padding: "4px 0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checkedSlugs.has(node.slug)}
                        onChange={() => toggleSlug(node.slug)}
                        style={{ accentColor: "#22C55E", width: 15, height: 15 }}
                      />
                      {node.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, margin: 0 }}>
        Tick everything you worked on, even briefly. This helps us track your growth.
      </p>
    </div>
  );

  /* ── Render a single dynamic question ────────────────────────── */

  const renderQuestion = (q: AdaptiveQuestion, idx: number) => {
    if (q.type === "work_log") {
      return <React.Fragment key={`wl-${idx}`}>{renderWorkLog()}</React.Fragment>;
    }

    if (q.type === "dimension" && q.dimensionKey) {
      return (
        <FormSlider
          key={`dim-${q.dimensionKey}-${idx}`}
          label={q.prompt || q.label}
          value={dimensionScores[q.dimensionKey] ?? 5}
          onChange={(v) => setDimensionScores((s) => ({ ...s, [q.dimensionKey!]: v }))}
          leftLabel={q.leftLabel}
          rightLabel={q.rightLabel}
        />
      );
    }

    if (q.type === "skill" && q.skillSlug) {
      const stateKey = q.skillSlug;
      return (
        <FormSlider
          key={`skill-${stateKey}-${idx}`}
          label={q.prompt || q.label}
          value={skillScores[stateKey] ?? 5}
          onChange={(v) => setSkillScores((s) => ({ ...s, [stateKey]: v }))}
          leftLabel={q.leftLabel}
          rightLabel={q.rightLabel}
        />
      );
    }

    if (q.type === "free_text") {
      return (
        <div key={`ft-${q.label}-${idx}`} style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
            {q.label}
          </label>
          <textarea
            value={freeText[q.label] ?? ""}
            onChange={(e) => setFreeText((s) => ({ ...s, [q.label]: e.target.value }))}
            placeholder={q.label}
            className="gs-textarea"
            rows={3}
            style={{
              width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
              border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
              minHeight: 80, lineHeight: 1.5,
            }}
          />
        </div>
      );
    }

    return null;
  };

  // Split: work_log renders as its own card (above the form card).
  // All other questions go inside the main form card.
  const workLogQuestions = prepared.questions.filter((q) => q.type === "work_log");
  const formQuestions = prepared.questions.filter((q) => q.type !== "work_log");

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Weekly Check-In
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
          ~2 minutes. Be honest — this builds your development profile.
        </p>
        <p className="font-mono-data" style={{ fontSize: 12, color: "#6B7280", marginBottom: 24 }}>
          {questionCount} questions this week — ~{estimatedSeconds} seconds
        </p>

        {workLogQuestions.map((q, i) => renderQuestion(q, i))}

        <div className="animate-fade-in" style={CARD_STYLE}>
          {formQuestions.map((q, i) => renderQuestion(q, i))}

          <button
            onClick={handleSubmit}
            disabled={submitting || !graduate}
            className="gs-btn-primary"
            style={{
              width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8,
              padding: "12px 20px", fontSize: 14, fontWeight: 500, border: "none",
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Submit Check-In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCheckIn;