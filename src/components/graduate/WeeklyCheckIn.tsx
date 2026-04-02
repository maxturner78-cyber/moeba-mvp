import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import FormSlider from "@/components/forms/FormSlider";

const WeeklyCheckIn: React.FC = () => {
  const [confidence, setConfidence] = useState(5);
  const [workload, setWorkload] = useState(5);
  const [support, setSupport] = useState(5);
  const [questions, setQuestions] = useState(3);
  const [stretched, setStretched] = useState("");
  const [moreOf, setMoreOf] = useState("");
  const [selfRating, setSelfRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Weekly Check-In
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 28 }}>
          ~2 minutes. Be honest — this builds your development profile.
        </p>

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
            onClick={() => setSubmitted(true)}
            className="gs-btn-primary"
            style={{
              width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8,
              padding: "12px 20px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
            }}
          >
            Submit Check-In
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCheckIn;
