import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle, Check, ChevronRight, AlertCircle } from "lucide-react";
import {
  useGraduates,
  useManagerCheckIns,
  useSkillProficiency,
  usePreparedCheckIn,
} from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { AdaptiveQuestion } from "@/lib/adaptive";
import { buildCarriedDimensionScores } from "@/lib/carryForward";

const CURRENT_MANAGER_ID = "dddd0001-0000-0000-0000-000000000001"; // David Liu

const REASON_LABEL: Record<NonNullable<AdaptiveQuestion["reason"]>, string> = {
  baseline: "Baseline",
  always: "",
  rotation: "Skill rotation",
  pattern_break: "Pattern break — fresh check",
  first_exposure: "First time on this skill",
  declining: "Trending down — your input matters",
};

const AssessTeam: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: graduates = [], isLoading } = useGraduates(CURRENT_MANAGER_ID);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const grad = graduates[selectedIdx] ?? graduates[0];
  const gradId = grad?.id ?? "";
  const gradName = grad?.full_name ?? "";

  const {
    data: prepared,
    isLoading: preparedLoading,
    error: preparedError,
    refetch: refetchPrepared,
  } = usePreparedCheckIn(gradId, "manager");

  // Manager's prior check-ins for this graduate — used to pre-populate
  const { data: managerHistory } = useManagerCheckIns(gradId, 5);
  // Skill proficiency for the graduate — fallback for skill prepop
  const { data: proficiencyData } = useSkillProficiency(gradId);

  // Per-question state
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [adjusting, setAdjusting] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [freeText, setFreeText] = useState<Record<string, string>>({});

  // Hardcoded extras (kept from original UX)
  const [understanding, setUnderstanding] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Build prepop lookup from manager's most recent check-in
  const lastDimensionScores = useMemo(() => {
    const latest = managerHistory?.[0];
    return (latest?.dimension_scores ?? {}) as Record<string, number>;
  }, [managerHistory]);

  const lastSkillScores = useMemo(() => {
    // Walk through history newest → oldest to find most recent rating per skill
    const map: Record<string, number> = {};
    for (const row of managerHistory ?? []) {
      const skills = (row as any).skill_scores as Record<string, number> | undefined;
      if (!skills) continue;
      for (const [slug, val] of Object.entries(skills)) {
        if (!(slug in map) && typeof val === "number") map[slug] = val;
      }
    }
    return map;
  }, [managerHistory]);

  // Fallback skill prepop from graduate's proficiency (manager view shows current_level)
  const proficiencySkillMap = useMemo(() => {
    const m: Record<string, number> = {};
    for (const row of proficiencyData ?? []) {
      if (row.skill_node?.slug && typeof row.current_level === "number") {
        m[row.skill_node.slug] = row.current_level;
      }
    }
    return m;
  }, [proficiencyData]);

  // Stable key per question (used for confirmed/adjusting/values maps)
  const questionKey = (q: AdaptiveQuestion, idx: number): string => {
    if (q.type === "dimension" && q.dimensionKey) return `dim:${q.dimensionKey}`;
    if (q.type === "skill" && q.skillSlug) return `skill:${q.skillSlug}`;
    if (q.type === "free_text") return `ft:${q.label}`;
    return `q:${idx}:${q.label}`;
  };

  // Get the pre-populated value for a question (or null if none available)
  const getPrepopValue = (q: AdaptiveQuestion): number | null => {
    if (q.type === "dimension" && q.dimensionKey) {
      const v = lastDimensionScores[q.dimensionKey];
      return typeof v === "number" ? v : null;
    }
    if (q.type === "skill" && q.skillSlug) {
      if (typeof lastSkillScores[q.skillSlug] === "number") return lastSkillScores[q.skillSlug];
      // Fallback: graduate's proficiency (only useful if > 0)
      const prof = proficiencySkillMap[q.skillSlug];
      return typeof prof === "number" && prof > 0 ? prof : null;
    }
    return null;
  };

  // Initialize default values when prepared questions arrive (or graduate changes)
  useEffect(() => {
    if (!prepared) return;
    const nextValues: Record<string, number> = {};
    for (let i = 0; i < prepared.questions.length; i++) {
      const q = prepared.questions[i];
      if (q.type === "dimension" || q.type === "skill") {
        const k = questionKey(q, i);
        const prepop = getPrepopValue(q);
        nextValues[k] = prepop ?? 5;
      }
    }
    setValues(nextValues);
    setConfirmed({});
    setAdjusting({});
    setFreeText({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepared, lastDimensionScores, lastSkillScores, proficiencySkillMap]);

  const resetForm = () => {
    setConfirmed({});
    setAdjusting({});
    setValues({});
    setFreeText({});
    setUnderstanding(5);
    setSubmitted(false);
    setSubmitting(false);
  };

  const handleConfirm = (key: string) => {
    setConfirmed((p) => ({ ...p, [key]: true }));
    setAdjusting((p) => ({ ...p, [key]: false }));
  };

  const handleAdjust = (key: string) => {
    setAdjusting((p) => ({ ...p, [key]: true }));
    setConfirmed((p) => ({ ...p, [key]: false }));
  };

  const nextGrad = graduates[(selectedIdx + 1) % Math.max(graduates.length, 1)];
  const nextGradName = nextGrad?.full_name ?? "";

  const handleNext = () => {
    setSelectedIdx((selectedIdx + 1) % Math.max(graduates.length, 1));
    resetForm();
  };

  const handleSelectChange = (idx: number) => {
    setSelectedIdx(idx);
    resetForm();
  };

  /* ── Loading / empty states ────────────────────────────────── */

  if (isLoading) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!graduates.length) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto", color: "#9CA3AF", fontSize: 14 }}>
        No graduates assigned.
      </div>
    );
  }

  /* ── Submit ────────────────────────────────────────────────── */

  const buildRow = async () => {
    const today = new Date().toISOString().split("T")[0];
    const askedDimensionScores: Record<string, number> = {};
    const skill_scores: Record<string, number> = {};
    const free_text: Record<string, string> = {};

    if (prepared) {
      for (let i = 0; i < prepared.questions.length; i++) {
        const q = prepared.questions[i];
        const k = questionKey(q, i);
        if (q.type === "dimension" && q.dimensionKey) {
          askedDimensionScores[q.dimensionKey] = values[k] ?? getPrepopValue(q) ?? 5;
        } else if (q.type === "skill" && q.skillSlug) {
          skill_scores[q.skillSlug] = values[k] ?? getPrepopValue(q) ?? 5;
        } else if (q.type === "free_text") {
          free_text[q.label] = freeText[k] ?? "";
        }
      }
    }

    const weekNumber = prepared?.week_number ?? grad.week_number;
    const { dimensionScores: dimension_scores, carriedForward: carried_forward } =
      await buildCarriedDimensionScores({
        role: "manager",
        graduateId: grad.id,
        weekNumber,
        actorId: CURRENT_MANAGER_ID,
        askedDimensionScores,
      });

    const row: Record<string, unknown> = {
      manager_id: CURRENT_MANAGER_ID,
      graduate_id: grad.id,
      week_number: weekNumber,
      check_in_date: today,
      dimension_scores,
      free_text,
      manager_confidence: understanding,
      carried_forward,
    };
    if (Object.keys(skill_scores).length > 0) {
      row.skill_scores = skill_scores;
    }
    return row;
  };

  const handleSubmit = async () => {
    if (!prepared) return;
    setSubmitting(true);
    const row = await buildRow();

    const { error } = await supabase.from("weekly_check_ins_manager").insert(row as any);

    if (error) {
      if ((error as any).code === "23505") {
        toast("You've already submitted this week's assessment.", {
          action: {
            label: "Update instead",
            onClick: async () => {
              const updatePayload: Record<string, unknown> = {
                dimension_scores: row.dimension_scores,
                free_text: row.free_text,
                manager_confidence: row.manager_confidence,
                check_in_date: row.check_in_date,
              };
              if ((row as any).skill_scores) updatePayload.skill_scores = (row as any).skill_scores;

              const { error: upErr } = await supabase
                .from("weekly_check_ins_manager")
                .update(updatePayload)
                .eq("manager_id", CURRENT_MANAGER_ID)
                .eq("graduate_id", grad.id)
                .eq("week_number", row.week_number as number);
              if (upErr) {
                toast.error("Update failed: " + upErr.message);
              } else {
                queryClient.invalidateQueries({ queryKey: ["managerCheckIns", grad.id] });
                toast.success(`Assessment updated — next: ${nextGradName}.`);
                setSubmitted(true);
              }
            },
          },
        });
        setSubmitting(false);
        return;
      }
      toast.error("Save failed: " + error.message);
      setSubmitting(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["managerCheckIns", grad.id] });
    toast.success(`Assessment saved — next: ${nextGradName}.`);
    setSubmitting(false);
    setSubmitted(true);
  };

  /* ── Submitted screen ──────────────────────────────────────── */

  if (submitted) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 500, color: "#15803D", marginBottom: 8 }}>
            Assessment for {gradName} submitted ✓
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-1"
            style={{
              background: "#22C55E", color: "#fff", borderRadius: 100,
              padding: "10px 24px", fontSize: 14, fontWeight: 500, border: "none",
              cursor: "pointer", marginTop: 16, transition: "background 120ms ease, transform 80ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Next: {nextGradName} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Question rows ─────────────────────────────────────────── */

  const renderSliderRow = (q: AdaptiveQuestion, idx: number, hasPrepop: boolean) => {
    const k = questionKey(q, idx);
    const isConfirmed = confirmed[k];
    const isAdjusting = adjusting[k] || !hasPrepop; // no prepop → always show slider
    const currentVal = values[k] ?? 5;
    const reasonNote = q.reason && REASON_LABEL[q.reason] ? REASON_LABEL[q.reason] : "";
    const labelText = q.type === "skill" ? (q.label || q.skillSlug || "") : q.label;
    const sublabel = q.type === "skill" ? q.prompt : reasonNote;

    return (
      <div
        key={k}
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #F3F4F6",
          opacity: isConfirmed ? 0.65 : 1,
          transition: "opacity 200ms ease",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", textTransform: q.type === "skill" ? "capitalize" : "none" }}>
              {labelText}
            </div>
            {sublabel && (
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                {sublabel}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasPrepop && !isAdjusting ? (
              <>
                <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 500, color: "#0F0F0F" }}>
                  {currentVal}
                </span>
                {isConfirmed ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "4px 12px", background: "#DCFCE7", color: "#15803D",
                    borderRadius: 100, fontSize: 12, fontWeight: 500,
                  }}>
                    <Check size={12} /> Confirmed
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConfirm(k)}
                      style={{
                        padding: "4px 12px", background: "#DCFCE7", color: "#15803D",
                        borderRadius: 100, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                        transition: "background 100ms ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#BBF7D0"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#DCFCE7"; }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleAdjust(k)}
                      style={{
                        padding: "4px 12px", background: "transparent", color: "#6B7280",
                        borderRadius: 100, fontSize: 12, fontWeight: 500,
                        border: "1px solid #E8E8E8", cursor: "pointer",
                        transition: "border-color 100ms ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9CA3AF"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8E8E8"; }}
                    >
                      Adjust
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="range" min={1} max={10}
                  value={currentVal}
                  onChange={(e) => setValues((p) => ({ ...p, [k]: +e.target.value }))}
                  className="gs-slider"
                  style={{
                    width: 100,
                    background: `linear-gradient(to right, #22C55E ${((currentVal - 1) / 9) * 100}%, #E5E7EB ${((currentVal - 1) / 9) * 100}%)`,
                  }}
                />
                <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 500, color: "#0F0F0F", width: 28, textAlign: "center" }}>
                  {currentVal}
                </span>
                {hasPrepop && (
                  <button
                    onClick={() => handleConfirm(k)}
                    style={{
                      padding: "4px 12px", background: "#DCFCE7", color: "#15803D",
                      borderRadius: 100, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                    }}
                  >
                    Done
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Question lists ────────────────────────────────────────── */

  const sliderQuestions = (prepared?.questions ?? []).filter(
    (q) => q.type === "dimension" || q.type === "skill",
  );
  const freeTextQuestions = (prepared?.questions ?? []).filter((q) => q.type === "free_text");

  const sliderTotal = sliderQuestions.length;
  const sliderConfirmed = sliderQuestions.filter((q, i) => {
    const k = questionKey(q, prepared!.questions.indexOf(q));
    return !!confirmed[k];
  }).length;
  const estimatedSeconds = (prepared?.questions.length ?? 0) * 15;

  /* ── Render ────────────────────────────────────────────────── */

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 className="font-heading" style={{ fontSize: 22, fontWeight: 500, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
        Weekly assessment
      </h1>
      <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>
        Friday afternoon — your weekly observations on each graduate
      </p>

      {/* Graduate selector */}
      <div style={{ marginBottom: 24 }}>
        <select
          value={selectedIdx}
          onChange={(e) => handleSelectChange(Number(e.target.value))}
          style={{
            width: "100%", padding: "10px 14px", fontSize: 14, color: "#0F0F0F",
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", cursor: "pointer",
          }}
        >
          {graduates.map((g, i) => (
            <option key={g.id} value={i}>{g.full_name} — {g.job_title} · W{g.week_number}</option>
          ))}
        </select>
      </div>

      {/* Loading prepared questions */}
      {preparedLoading && (
        <>
          <Skeleton className="h-12 w-full mb-3" />
          <Skeleton className="h-64 w-full mb-3" />
          <Skeleton className="h-32 w-full" />
        </>
      )}

      {/* Error */}
      {preparedError && !preparedLoading && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: 20,
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>
          <AlertCircle size={32} color="#DC2626" strokeWidth={1.5} style={{ marginBottom: 12 }} />
          <div className="font-heading" style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 6 }}>
            Couldn't load this week's questions
          </div>
          <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>
            {preparedError instanceof Error ? preparedError.message : "Please try again."}
          </div>
          <button
            onClick={() => refetchPrepared()}
            style={{
              background: "#22C55E", color: "#fff", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Prepared content */}
      {prepared && !preparedLoading && !preparedError && (
        <>
          {/* Info card */}
          <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 14, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>
              Based on {gradName.split(" ")[0]}'s patterns, here's what I'd expect this week.{" "}
              <span style={{ fontWeight: 500 }}>Confirm or adjust.</span>
            </p>
          </div>

          {/* Assessment card — slider rows */}
          {sliderQuestions.length > 0 && (
            <div style={{
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              marginBottom: 20,
            }}>
              {sliderQuestions.map((q) => {
                const idx = prepared.questions.indexOf(q);
                const hasPrepop = getPrepopValue(q) !== null;
                return renderSliderRow(q, idx, hasPrepop);
              })}
            </div>
          )}

          {/* Free text questions */}
          {freeTextQuestions.map((q) => {
            const idx = prepared.questions.indexOf(q);
            const k = questionKey(q, idx);
            const isAreaToImprove = /improve|support/i.test(q.label);
            return (
              <div key={k} style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                  {q.label}
                </label>
                {isAreaToImprove && (
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>
                    Not shown to {gradName.split(" ")[0]} directly
                  </div>
                )}
                <textarea
                  value={freeText[k] ?? ""}
                  onChange={(e) => setFreeText((p) => ({ ...p, [k]: e.target.value }))}
                  placeholder={q.prompt || q.label}
                  className="gs-textarea"
                  rows={3}
                  style={{
                    width: "100%", padding: 14, fontSize: 13, fontFamily: "Inter, sans-serif",
                    border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
                    lineHeight: 1.6, color: "#374151",
                  }}
                />
              </div>
            );
          })}

          {/* Understanding slider — kept from original UX */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 4 }}>
              How well do you understand how this person is really doing?
            </label>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10 }}>
              It's ok to say you're not sure — that's useful data
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono-data" style={{ fontSize: 12, color: "#9CA3AF", width: 16 }}>1</span>
              <input
                type="range" min={1} max={10} value={understanding}
                onChange={(e) => setUnderstanding(+e.target.value)}
                className="gs-slider"
                style={{
                  flex: 1,
                  background: `linear-gradient(to right, #22C55E ${((understanding - 1) / 9) * 100}%, #E5E7EB ${((understanding - 1) / 9) * 100}%)`,
                }}
              />
              <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", width: 20, textAlign: "right" }}>
                {understanding}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>
              <span className="font-mono-data" style={{ fontWeight: 600 }}>{sliderConfirmed}</span> of{" "}
              <span className="font-mono-data" style={{ fontWeight: 600 }}>{sliderTotal}</span> confirmed · ~{estimatedSeconds} seconds
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "10px 24px", background: submitting ? "#86EFAC" : "#22C55E", color: "#fff",
                borderRadius: 100, fontSize: 14, fontWeight: 500, border: "none",
                cursor: submitting ? "not-allowed" : "pointer", transition: "background 120ms ease, transform 80ms ease",
              }}
              onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "#22C55E"; }}
              onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {submitting ? "Saving…" : "Submit Assessment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AssessTeam;