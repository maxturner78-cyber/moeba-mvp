import React, { useState, useEffect, useRef } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import DevelopmentBarStack from "@/components/vitals/DevelopmentBarStack";

/* ─── Check-In Form (inline) ─── */
const sliderQuestions = [
  { key: "confidence", label: "How confident are you feeling?" },
  { key: "workload", label: "How manageable was your workload?" },
  { key: "support", label: "How supported by your manager?" },
];

const CheckInForm: React.FC<{ onSubmit: () => void }> = ({ onSubmit }) => {
  const [values, setValues] = useState<Record<string, number>>({
    confidence: 5,
    workload: 5,
    support: 5,
    questions: 3,
    selfRating: 5,
  });
  const [stretch, setStretch] = useState("");
  const [more, setMore] = useState("");

  const set = (k: string, v: number) => setValues((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ paddingTop: 20 }}>
      {sliderQuestions.map((q) => (
        <div key={q.key} style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 10 }}>
            {q.label}
          </label>
          <div className="flex items-center gap-3">
            <span className="font-mono-data" style={{ fontSize: 12, color: "#9CA3AF", width: 16 }}>1</span>
            <input
              type="range" min={1} max={10} value={values[q.key]}
              onChange={(e) => set(q.key, +e.target.value)}
              style={{ flex: 1, accentColor: "#22C55E", cursor: "pointer" }}
            />
            <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", width: 20, textAlign: "right" }}>
              {values[q.key]}
            </span>
          </div>
        </div>
      ))}

      {/* Questions count */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 10 }}>
          How many questions did you ask this week?
        </label>
        <input
          type="number" min={0} max={50} value={values.questions}
          onChange={(e) => set("questions", +e.target.value)}
          style={{
            width: 80, padding: "8px 12px", border: "1px solid #E8E8E8", borderRadius: 8,
            fontSize: 14, fontFamily: "'JetBrains Mono', monospace", color: "#0F0F0F",
            outline: "none",
          }}
        />
      </div>

      {/* Textarea 1 */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 10 }}>
          What stretched you most?
        </label>
        <textarea
          value={stretch} onChange={(e) => setStretch(e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid #E8E8E8", borderRadius: 8,
            fontSize: 14, color: "#374151", resize: "vertical", outline: "none", lineHeight: 1.6,
          }}
        />
      </div>

      {/* Textarea 2 */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 10 }}>
          What do you want to do more of?
        </label>
        <textarea
          value={more} onChange={(e) => setMore(e.target.value)}
          rows={3}
          style={{
            width: "100%", padding: "10px 14px", border: "1px solid #E8E8E8", borderRadius: 8,
            fontSize: 14, color: "#374151", resize: "vertical", outline: "none", lineHeight: 1.6,
          }}
        />
      </div>

      {/* Self-rating */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 14, fontWeight: 500, color: "#374151", display: "block", marginBottom: 10 }}>
          Overall self-rating
        </label>
        <div className="flex items-center gap-3">
          <span className="font-mono-data" style={{ fontSize: 12, color: "#9CA3AF", width: 16 }}>1</span>
          <input
            type="range" min={1} max={10} value={values.selfRating}
            onChange={(e) => set("selfRating", +e.target.value)}
            style={{ flex: 1, accentColor: "#22C55E", cursor: "pointer" }}
          />
          <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", width: 20, textAlign: "right" }}>
            {values.selfRating}
          </span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        style={{
          padding: "10px 28px",
          background: "#22C55E",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          borderRadius: 100,
          cursor: "pointer",
          transition: "background 150ms ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
      >
        Submit Check-In
      </button>
    </div>
  );
};

/* ─── Weekly Insight Card (always visible, check-in CTA blended in) ─── */
const WeeklyInsightCard: React.FC<{
  checkInState: "prompt" | "form" | "done";
  onStartCheckIn: () => void;
  formVisible: boolean;
  onSubmitCheckIn: () => void;
}> = ({ checkInState, onStartCheckIn, formVisible, onSubmitCheckIn }) => (
  <div
    style={{
      background: "#F0FDF4",
      border: "1px solid #DCFCE7",
      borderRadius: 10,
      padding: "24px 28px",
      position: "relative",
      marginBottom: 40,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0, top: 12, bottom: 12,
        width: 3, background: "#22C55E", borderRadius: 2,
      }}
    />

    {/* Header */}
    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
      <div
        style={{
          width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
          animation: "pulse-scale 2s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#15803D" }}>
        Weekly Insight
      </span>
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
        Week 12 · Generated today
      </span>
    </div>

    {/* Insight body — always visible */}
    <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginTop: 14 }}>
      <p style={{ marginBottom: 12 }}>
        Your work on the Meridian audit workpapers landed really well this week — the quality is clearly there, and it's being noticed. You might not feel it yet, but you're performing stronger than you give yourself credit for. Trust that a bit more.
      </p>
      <p style={{ marginBottom: 12 }}>
        One thing to watch: you went quieter this week — fewer questions, less reaching out. Your best weeks tend to be the ones where you're actively pulling people in. Try picking one thing you're unsure about before your next team meeting and just asking. That habit compounds.
      </p>
      <p>
        Your confidence is solid, which is great. But your workload is creeping up — it's the highest it's been in{" "}
        <span className="font-mono-data" style={{ fontWeight: 600 }}>6</span> weeks. If things are piling up, flag it now rather than pushing through silently. Raising it early is a sign of good judgement, not weakness.
      </p>
    </div>

    {/* Divider */}
    <div style={{ borderTop: "1px solid #DCFCE7", margin: "20px 0 16px" }} />

    {/* Check-in CTA or form or done state */}
    {checkInState === "prompt" && (
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}>
          Ready for this week's check-in?
        </div>
        <button
          onClick={onStartCheckIn}
          className="flex items-center gap-1"
          style={{
            padding: "9px 22px",
            background: "#22C55E",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 100,
            cursor: "pointer",
            transition: "background 150ms ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
        >
          Start Check-In <ChevronRight size={16} />
        </button>
      </div>
    )}

    {checkInState === "form" && (
      <div
        style={{
          opacity: formVisible ? 1 : 0,
          transform: formVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", marginBottom: 4 }}>
          Weekly Check-In
        </div>
        <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>
          Be honest — this builds your development profile.
        </p>
        <CheckInForm onSubmit={onSubmitCheckIn} />
      </div>
    )}

    {checkInState === "done" && (
      <div className="flex items-center gap-2 animate-fade-in">
        <CheckCircle size={16} color="#22C55E" strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "#15803D" }}>
          Check-in submitted — your Week 13 insight will generate on Monday
        </span>
      </div>
    )}
  </div>
);

/* ─── Main Page ─── */
const MyVitals: React.FC = () => {
  const [checkInState, setCheckInState] = useState<"prompt" | "form" | "done">("prompt");
  const [formVisible, setFormVisible] = useState(false);

  const handleStartCheckIn = () => {
    setCheckInState("form");
    setTimeout(() => setFormVisible(true), 30);
  };

  const handleSubmit = () => {
    setFormVisible(false);
    setTimeout(() => setCheckInState("done"), 250);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* SECTION 1: Weekly Insight + Check-In */}
      <WeeklyInsightCard
        checkInState={checkInState}
        onStartCheckIn={handleStartCheckIn}
        formVisible={formVisible}
        onSubmitCheckIn={handleSubmit}
      />

      {/* SECTION 2: Development Profile */}
      <div style={{ marginBottom: 40 }}>
        <DevelopmentBarStack />
      </div>

      {/* SECTION 3: Focus Areas */}
      <div style={{ marginBottom: 40 }}>
        <h3
          className="font-heading"
          style={{ fontSize: 17, fontWeight: 500, color: "#0F0F0F", marginBottom: 16 }}
        >
          This week's focus
        </h3>

        <div className="flex flex-col" style={{ gap: 12 }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8E8E8",
              borderRadius: 10,
              padding: "20px 20px 20px 24px",
              position: "relative",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                position: "absolute", left: 0, top: 12, bottom: 12,
                width: 3, background: "#F59E0B", borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B45309", marginBottom: 8 }}>
              Curiosity & Learning
            </div>
            <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
              <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>4.8</span>
              <span style={{ fontSize: 12, color: "#EF4444" }}>↓ declining 3 weeks</span>
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              Your question frequency dropped from 5/week to 2. Try this: before each team meeting, write down one question you'd like to ask. Even "how did you approach that?" counts.
            </p>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E8E8E8",
              borderRadius: 10,
              padding: "20px 20px 20px 24px",
              position: "relative",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                position: "absolute", left: 0, top: 12, bottom: 12,
                width: 3, background: "#F59E0B", borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B45309", marginBottom: 8 }}>
              Self-Awareness Alignment
            </div>
            <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
              <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>5.2</span>
              <span style={{ fontSize: 12, color: "#EF4444" }}>↓ gap widening</span>
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              There's a growing gap between how you rate yourself and how others rate you — they're rating you higher. You may be underestimating your impact. Pay attention to the positive feedback you receive this week.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Value Prop */}
      <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", paddingBottom: 24 }}>
        This insight was generated from 12 weeks of continuous data — something a quarterly PDP review can't provide.
      </p>
    </div>
  );
};

export default MyVitals;
