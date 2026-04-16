import React, { useState } from "react";
import { CheckCircle, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FormSlider from "@/components/forms/FormSlider";
import { usePeerAssignedGraduates, useGraduate } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const CURRENT_PEER_ID = 'bbbb0001-0000-0000-0000-000000000001'; // Alex Wright

const PeerCheckIn: React.FC = () => {
  const { data: assignedGrads = [], isLoading } = usePeerAssignedGraduates(CURRENT_PEER_ID);
  const [selectedGradId, setSelectedGradId] = useState<string | null>(null);
  const [collaboration, setCollaboration] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [initiative, setInitiative] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [workQuality, setWorkQuality] = useState(5);
  const [strengths, setStrengths] = useState("");
  const [support, setSupport] = useState("");
  const [overall, setOverall] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Default to first assigned graduate once loaded
  const activeId = selectedGradId ?? assignedGrads[0]?.graduate_id ?? null;
  const grad = assignedGrads.find((g) => g.graduate_id === activeId);
  const { data: graduateDetail } = useGraduate(activeId ?? "");
  const firstName = grad?.full_name?.split(" ")[0] ?? "them";

  const handleSubmit = async () => {
    if (!activeId || !graduateDetail || submitting) return;
    setSubmitting(true);

    const dimension_scores = {
      collaboration,
      reliability,
      communication,
      initiative,
      confidence,
      workQuality,
      overall,
    };

    const free_text = {
      doing_well: strengths,
      support_needed: support,
    };

    const row = {
      peer_id: CURRENT_PEER_ID,
      graduate_id: activeId,
      week_number: graduateDetail.week_number,
      dimension_scores,
      free_text,
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
                .eq("week_number", graduateDetail.week_number);

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
          ~3 minutes. Your observations help build a complete picture of how {firstName} is settling in.
        </p>

        {/* Info card */}
        <div style={{
          background: "#F0FDF4", borderRadius: 8, padding: 14, marginBottom: 24,
          display: "flex", alignItems: "start", gap: 10,
        }}>
          <Users size={16} color="#15803D" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
            As their assigned peer, your perspective is invaluable during the first 8 weeks. You see things their manager doesn't — how they interact with the team day-to-day, whether they're asking questions, and how they handle the learning curve.
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

        <div className="animate-fade-in" style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <FormSlider
            label={`How well does ${firstName} collaborate with the team?`}
            value={collaboration} onChange={setCollaboration}
            leftLabel="Keeps to themselves" rightLabel="Fully integrated"
          />

          <FormSlider
            label={`How reliable is ${firstName} when given tasks?`}
            value={reliability} onChange={setReliability}
            leftLabel="Needs chasing" rightLabel="Always delivers"
          />

          <FormSlider
            label={`How effectively does ${firstName} communicate?`}
            value={communication} onChange={setCommunication}
            leftLabel="Unclear / hesitant" rightLabel="Clear & confident"
          />

          <FormSlider
            label={`Does ${firstName} take initiative or wait to be told?`}
            value={initiative} onChange={setInitiative}
            leftLabel="Waits for direction" rightLabel="Proactively contributes"
          />

          <FormSlider
            label={`How confident does ${firstName} seem day-to-day?`}
            value={confidence} onChange={setConfidence}
            leftLabel="Seems uncertain" rightLabel="Comfortable & assured"
          />

          <FormSlider
            label={`How would you rate the quality of their work from what you've seen?`}
            value={workQuality} onChange={setWorkQuality}
            leftLabel="Needs improvement" rightLabel="Consistently strong"
          />

          {/* Textareas */}
          {[
            { label: `What's ${firstName} doing really well?`, value: strengths, onChange: setStrengths },
            { label: `Where could they use more support or guidance?`, value: support, onChange: setSupport },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                {f.label}
              </label>
              <textarea
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                rows={3}
                style={{
                  width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
                  border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
                  minHeight: 80, lineHeight: 1.5,
                }}
              />
            </div>
          ))}

          <FormSlider
            label={`Overall, how is ${firstName} tracking in their first weeks?`}
            value={overall} onChange={setOverall}
            leftLabel="Struggling" rightLabel="Thriving"
          />

          <button
            onClick={() => setSubmitted(true)}
            style={{
              width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8,
              padding: "12px 20px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
            }}
          >
            Submit Peer Feedback
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 20 }}>
          Your feedback is combined with manager and self-assessments to build a complete development picture. Individual responses are never shared directly.
        </p>
      </div>
    </div>
  );
};

export default PeerCheckIn;
