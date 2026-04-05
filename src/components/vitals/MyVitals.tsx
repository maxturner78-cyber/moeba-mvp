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

/* ─── Weekly Insight ─── */
const WeeklyInsight: React.FC = () => (
  <div>
    <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#15803D" }}>
        Weekly Insight
      </span>
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
        Week 12 · Generated today
      </span>
    </div>
    <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7 }}>
      Your confidence held steady at{" "}
      <span className="font-mono-data" style={{ fontWeight: 600 }}>7</span> this week, and your manager rated your work quality at{" "}
      <span className="font-mono-data" style={{ fontWeight: 600 }}>8</span> — that's strong alignment. One thing to watch: your question frequency dropped to{" "}
      <span className="font-mono-data" style={{ fontWeight: 600 }}>2</span> this week, down from an average of{" "}
      <span className="font-mono-data" style={{ fontWeight: 600 }}>5</span>. In weeks where you ask more questions, your output tends to be rated higher. Is there something you're stuck on that you haven't raised yet?
    </p>
    <div className="flex items-center gap-1.5" style={{ marginTop: 16 }}>
      <CheckCircle size={14} color="#22C55E" strokeWidth={2} />
      <span style={{ fontSize: 12, color: "#9CA3AF" }}>Check-in submitted Mar 28</span>
    </div>
  </div>
);

/* ─── Main Page ─── */
const MyVitals: React.FC = () => {
  const [checkInState, setCheckInState] = useState<"prompt" | "form" | "insight">("prompt");
  const [formVisible, setFormVisible] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleStartCheckIn = () => {
    setCheckInState("form");
    setTimeout(() => setFormVisible(true), 30);
  };

  const handleSubmit = () => {
    setFormVisible(false);
    setTimeout(() => setCheckInState("insight"), 250);
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* SECTION 1: Check-In / Insight */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #DCFCE7",
          borderRadius: 10,
          padding: "24px 28px",
          paddingLeft: 28,
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

        {checkInState === "prompt" && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#0F0F0F", marginBottom: 6 }}>
              Ready for your weekly check-in?
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              This takes about 90 seconds. Your responses generate this week's personalised insight.
            </p>
            <button
              onClick={handleStartCheckIn}
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
            ref={formRef}
            style={{
              opacity: formVisible ? 1 : 0,
              transform: formVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 200ms ease, transform 200ms ease",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 500, color: "#0F0F0F", marginBottom: 4 }}>
              Weekly Check-In
            </div>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
              ~2 minutes. Be honest — this builds your development profile.
            </p>
            <CheckInForm onSubmit={handleSubmit} />
          </div>
        )}

        {checkInState === "insight" && (
          <div className="animate-fade-in">
            <WeeklyInsight />
          </div>
        )}
      </div>

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
          {/* Card 1 */}
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

          {/* Card 2 */}
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
