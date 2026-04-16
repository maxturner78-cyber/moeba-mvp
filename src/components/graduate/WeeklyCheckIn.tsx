import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FormSlider from "@/components/forms/FormSlider";
import { useGraduate, useSkillNodesGrouped, useSkillProficiency } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

const CURRENT_GRADUATE_ID = "cccc0001-0000-0000-0000-000000000001"; // Sarah Chen
const COMPANY_ID = "11111111-1111-1111-1111-111111111111";

const CLUSTER_LABELS: Record<string, string> = {
  core: "Core",
  audit: "Audit",
  client: "Client",
  tax: "Tax",
  compliance: "Compliance",
};

const WeeklyCheckIn: React.FC = () => {
  const [confidence, setConfidence] = useState(5);
  const [workload, setWorkload] = useState(5);
  const [support, setSupport] = useState(5);
  const [questions, setQuestions] = useState(3);
  const [stretched, setStretched] = useState("");
  const [moreOf, setMoreOf] = useState("");
  const [selfRating, setSelfRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Work log state
  const [projectName, setProjectName] = useState("");
  const [checkedSlugs, setCheckedSlugs] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const { data: graduate } = useGraduate(CURRENT_GRADUATE_ID);
  const { data: skillGroups } = useSkillNodesGrouped(COMPANY_ID);
  const { data: proficiencyData } = useSkillProficiency(CURRENT_GRADUATE_ID);
  const queryClient = useQueryClient();

  // Build a map of slug → current_level from proficiency data
  const profMap = useMemo(() => {
    const m: Record<string, number> = {};
    if (proficiencyData) {
      for (const row of proficiencyData) {
        if (row.skill_node?.slug) {
          m[row.skill_node.slug] = row.current_level;
        }
      }
    }
    return m;
  }, [proficiencyData]);

  // Set of slugs that have current_level > 0
  const assessedSlugs = useMemo(
    () => new Set(Object.entries(profMap).filter(([, v]) => v > 0).map(([k]) => k)),
    [profMap],
  );

  // Initialize checked slugs and expanded clusters once data loads
  useEffect(() => {
    if (initialized || !skillGroups || !proficiencyData) return;

    // Pre-check skills where current_level > 0
    setCheckedSlugs(new Set(assessedSlugs));

    // Expand clusters that have at least one assessed skill
    const expanded = new Set<string>();
    for (const [cluster, nodes] of Object.entries(skillGroups)) {
      if (nodes.some((n) => assessedSlugs.has(n.slug))) {
        expanded.add(cluster);
      }
    }
    setExpandedClusters(expanded);
    setInitialized(true);
  }, [skillGroups, proficiencyData, assessedSlugs, initialized]);

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
    if (!graduate || submitting) return;
    setSubmitting(true);

    const dimension_scores = {
      confidence,
      workload,
      managerSupport: support,
      selfRating,
      questionsAsked: questions,
    };

    const free_text = {
      stretched_by: stretched,
      more_of: moreOf,
    };

    const selfRow = {
      graduate_id: CURRENT_GRADUATE_ID,
      week_number: graduate.week_number,
      check_in_date: new Date().toISOString().split("T")[0],
      dimension_scores,
      free_text,
      carried_forward: [],
    };

    const skillSlugsArray = [...checkedSlugs];

    // Determine is_first_exposure: true if any checked slug has no proficiency or current_level === 0
    const is_first_exposure = skillSlugsArray.some(
      (slug) => !(slug in profMap) || profMap[slug] === 0,
    );

    const workLogRow = {
      graduate_id: CURRENT_GRADUATE_ID,
      week_number: graduate.week_number,
      project_name: projectName.trim() || "Unspecified",
      skill_slugs: skillSlugsArray,
      is_first_exposure,
    };

    // Submit both in parallel
    const [selfResult, workLogResult] = await Promise.all([
      supabase.from("weekly_check_ins_self").insert(selfRow),
      supabase.from("work_log_entries").insert(workLogRow),
    ]);

    // Handle self check-in result
    if (selfResult.error) {
      if (selfResult.error.code === "23505") {
        toast("You've already submitted this week's check-in.", {
          action: {
            label: "Update instead",
            onClick: async () => {
              const { error: updateErr } = await supabase
                .from("weekly_check_ins_self")
                .update({ dimension_scores, free_text, check_in_date: selfRow.check_in_date })
                .eq("graduate_id", CURRENT_GRADUATE_ID)
                .eq("week_number", graduate.week_number);

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

    // Handle work log result (non-blocking — check-in still counts as submitted)
    if (workLogResult.error) {
      if (workLogResult.error.code === "23505") {
        // Silently update
        await supabase
          .from("work_log_entries")
          .update({ project_name: workLogRow.project_name, skill_slugs: workLogRow.skill_slugs, is_first_exposure })
          .eq("graduate_id", CURRENT_GRADUATE_ID)
          .eq("week_number", graduate.week_number);
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

  const clusterOrder = ["core", "audit", "client", "tax", "compliance"];
  const orderedClusters = clusterOrder.filter((c) => skillGroups?.[c]?.length);

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Weekly Check-In
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 28 }}>
          ~2 minutes. Be honest — this builds your development profile.
        </p>

        {/* This week's work section */}
        <div className="animate-fade-in" style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          marginBottom: 20,
        }}>
          <div className="font-heading" style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
            This week's work
          </div>

          {/* Project input */}
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

          {/* Skill checkboxes grouped by cluster */}
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

        {/* Existing check-in form */}
        <div className="animate-fade-in" style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <FormSlider label="How confident are you feeling in your work this week?" value={confidence} onChange={setConfidence}
            leftLabel="Really struggling" rightLabel="Fully in my stride" />

          <FormSlider label="How manageable was your workload?" value={workload} onChange={setWorkload}
            leftLabel="Overwhelmed" rightLabel="Comfortable" />

          <FormSlider label="How supported did you feel by your manager this week?" value={support} onChange={setSupport}
            leftLabel="On my own" rightLabel="Fully supported" />

          {/* Number input */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
              How many questions did you ask your manager or team?
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={questions}
              onChange={(e) => setQuestions(Number(e.target.value))}
              className="gs-number-input"
              style={{
                width: 80, textAlign: "center", padding: "8px 12px",
                fontSize: 16, border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
              }}
            />
          </div>

          {/* Textareas */}
          {[
            { label: "What stretched you most this week?", value: stretched, onChange: setStretched },
            { label: "What do you want to do more of?", value: moreOf, onChange: setMoreOf },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                {f.label}
              </label>
              <textarea
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="gs-textarea"
                rows={3}
                style={{
                  width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
                  border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
                  minHeight: 80, lineHeight: 1.5,
                }}
              />
            </div>
          ))}

          <FormSlider label="Overall, how would you rate your own performance this week?" value={selfRating} onChange={setSelfRating}
            leftLabel="Poor" rightLabel="Excellent" />

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
