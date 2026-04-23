import React, { useState, useEffect } from "react";
import { CheckCircle, Users, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FormSlider from "@/components/forms/FormSlider";
import { usePeerAssignedGraduates, useGraduate, usePreparedCheckIn } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdaptiveQuestion } from "@/lib/adaptive";
import { buildCarriedDimensionScores } from "@/lib/carryForward";

const CURRENT_PEER_ID = 'bbbb0001-0000-0000-0000-000000000001'; // Alex Wright

const PeerCheckIn: React.FC = () => {
  const { data: assignedGrads = [], isLoading } = usePeerAssignedGraduates(CURRENT_PEER_ID);
  const [selectedGradId, setSelectedGradId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [freeText, setFreeText] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Default to first assigned graduate once loaded
  const activeId = selectedGradId ?? assignedGrads[0]?.graduate_id ?? null;
  const grad = assignedGrads.find((g) => g.graduate_id === activeId);
  const { data: graduateDetail } = useGraduate(activeId ?? "");
  const firstName = grad?.full_name?.split(" ")[0] ?? "them";

  const {
    data: prepared,
    isLoading: prepLoading,
    error: prepError,
    refetch: prepRefetch,
  } = usePreparedCheckIn(activeId ?? "", "peer");

  // Reset form state when graduate changes
  useEffect(() => {
    setScores({});
    setFreeText({});
    setSubmitted(false);
  }, [activeId]);

  // Build a stable key for each question (dimensionKey or label fallback)
  const keyFor = (q: AdaptiveQuestion, idx: number): string => {
    if (q.type === "dimension" && q.dimensionKey) return q.dimensionKey;
    if (q.type === "dimension") return `dim_${q.label.toLowerCase().replace(/\s+/g, "_")}`;
    return `${q.type}_${idx}`;
  };

  const personalize = (text: string) => text.replace(/\[name\]/g, firstName);

  const dimensionQuestions = (prepared?.questions ?? []).filter((q) => q.type === "dimension");
  const freeTextQuestions = (prepared?.questions ?? []).filter((q) => q.type === "free_text");

  const totalQuestions = dimensionQuestions.length + freeTextQuestions.length;
  const estSeconds = totalQuestions * 15;

  const handleSubmit = async () => {
    if (!activeId || !graduateDetail || !prepared || submitting) return;
    setSubmitting(true);

    const askedDimensionScores: Record<string, number> = {};
    dimensionQuestions.forEach((q, idx) => {
      const k = keyFor(q, idx);
      const v = scores[k];
      if (typeof v === "number") askedDimensionScores[k] = v;
    });

    const { dimensionScores: dimension_scores, carriedForward: carried_forward } =
      await buildCarriedDimensionScores({
        role: "peer",
        graduateId: activeId,
        weekNumber: prepared.week_number,
        actorId: CURRENT_PEER_ID,
        askedDimensionScores,
      });

    const free_text: Record<string, string> = {};
    freeTextQuestions.forEach((q, idx) => {
      const k = keyFor(q, idx);
      const v = freeText[k];
      if (v && v.trim()) free_text[q.label] = v;
    });

    const row = {
      peer_id: CURRENT_PEER_ID,
      graduate_id: activeId,
      week_number: prepared.week_number,
      dimension_scores,
      free_text,
      carried_forward,
    };

    const { error } = await supabase.from("weekly_check_ins_peer").insert(row);

    if (error) {
      if (error.code === "23505") {
        toast("You've already submitted peer feedback this week.", {
          action: {
            label: "Update instead",
            onClick: async () => {
              const { error: updateErr } = await supabase
                .from("weekly_check_ins_peer")
                .update({ dimension_scores, free_text })
                .eq("peer_id", CURRENT_PEER_ID)
                .eq("graduate_id", activeId)
                .eq("week_number", prepared.week_number);

              if (updateErr) {
                toast.error("Failed to update peer feedback.");
              } else {
                queryClient.invalidateQueries({ queryKey: ["peerCheckIns", activeId] });
                toast.success("Peer feedback updated.");
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

    queryClient.invalidateQueries({ queryKey: ["peerCheckIns", activeId] });
    toast.success("Peer feedback submitted. Thank you.");
    setSubmitted(true);
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 8 }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-6" />
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!assignedGrads.length) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div style={{ fontSize: 14, color: "#9CA3AF" }}>No graduates currently assigned to you.</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>
            Peer feedback submitted ✓
          </div>
          <div style={{ fontSize: 14, color: "#374151" }}>
            Thanks for supporting {firstName}'s development
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Peer Check-In
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
          Your observations help build a complete picture of how {firstName} is settling in.
        </p>

        {/* Info card */}
        <div style={{
          background: "#F0FDF4", borderRadius: 8, padding: 14, marginBottom: 24,
          display: "flex", alignItems: "start", gap: 10,
        }}>
          <Users size={16} color="#15803D" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
            As their assigned peer, your perspective is invaluable. You see things their manager doesn't — how they interact with the team day-to-day, whether they're asking questions, and how they handle the learning curve.
          </p>
        </div>

        {/* Graduate selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
            Who are you providing feedback for?
          </label>
          <select
            value={activeId ?? ""}
            onChange={(e) => setSelectedGradId(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", fontSize: 14,
              border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
              background: "#fff", color: "#0F0F0F", cursor: "pointer",
            }}
          >
            {assignedGrads.map((g) => (
              <option key={g.graduate_id} value={g.graduate_id}>
                {g.full_name} — {g.job_title}
              </option>
            ))}
          </select>
        </div>

        {/* Loading prepared questions */}
        {prepLoading && (
          <div>
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {/* Error state */}
        {prepError && !prepLoading && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: 16,
            display: "flex", flexDirection: "column", gap: 10,
          }}>
            <p style={{ fontSize: 14, color: "#991B1B", margin: 0 }}>
              Couldn't load this week's questions. Please try again.
            </p>
            <button
              onClick={() => prepRefetch()}
              style={{
                alignSelf: "flex-start", background: "#fff", border: "1px solid #FECACA",
                borderRadius: 6, padding: "6px 12px", fontSize: 13, color: "#991B1B",
                cursor: "pointer", fontWeight: 500,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* No questions needed (muted) */}
        {!prepLoading && !prepError && prepared && totalQuestions === 0 && (
          <div className="animate-fade-in" style={{
            background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 24,
            display: "flex", gap: 14, alignItems: "start",
          }}>
            <Sparkles size={20} color="#15803D" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: "#15803D", marginBottom: 6 }}>
                No peer input needed this week
              </div>
              <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
                {firstName}'s baseline is established. You'll be asked again in 2 weeks.
              </p>
            </div>
          </div>
        )}

        {/* Question form */}
        {!prepLoading && !prepError && prepared && totalQuestions > 0 && (
          <>
            <div className="font-mono-data" style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 10, textAlign: "right" }}>
              {totalQuestions} question{totalQuestions === 1 ? "" : "s"} this week — ~{estSeconds} seconds
            </div>

            <div className="animate-fade-in" style={{
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}>
              {dimensionQuestions.map((q, idx) => {
                const k = keyFor(q, idx);
                return (
                  <FormSlider
                    key={k}
                    label={personalize(q.prompt)}
                    value={scores[k] ?? 5}
                    onChange={(v) => setScores((prev) => ({ ...prev, [k]: v }))}
                    leftLabel={q.leftLabel ? personalize(q.leftLabel) : undefined}
                    rightLabel={q.rightLabel ? personalize(q.rightLabel) : undefined}
                  />
                );
              })}

              {freeTextQuestions.map((q, idx) => {
                const k = keyFor(q, dimensionQuestions.length + idx);
                return (
                  <div key={k} style={{ marginBottom: 28 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                      {personalize(q.label)}
                    </label>
                    <textarea
                      value={freeText[k] ?? ""}
                      onChange={(e) => setFreeText((prev) => ({ ...prev, [k]: e.target.value }))}
                      rows={3}
                      placeholder={personalize(q.prompt)}
                      style={{
                        width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
                        border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
                        minHeight: 80, lineHeight: 1.5,
                      }}
                    />
                  </div>
                );
              })}

              <button
                onClick={handleSubmit}
                disabled={submitting || !graduateDetail}
                style={{
                  width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8,
                  padding: "12px 20px", fontSize: 14, fontWeight: 500, border: "none",
                  cursor: submitting ? "wait" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Submitting…" : "Submit Peer Feedback"}
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 20 }}>
              Your feedback is combined with manager and self-assessments to build a complete development picture. Individual responses are never shared directly.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PeerCheckIn;
