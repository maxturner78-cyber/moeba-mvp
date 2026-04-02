import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import FormSlider from "@/components/forms/FormSlider";

const graduates = ["Sarah Chen", "Tyler Morrison", "Emily Zhang", "Marcus Johnson", "Priya Patel", "James Park"];

const AssessTeam: React.FC = () => {
  const [selected, setSelected] = useState("");
  const [workQuality, setWorkQuality] = useState(5);
  const [proactivity, setProactivity] = useState(5);
  const [feedbackResponse, setFeedbackResponse] = useState(5);
  const [questions, setQuestions] = useState(3);
  const [didWell, setDidWell] = useState("");
  const [improve, setImprove] = useState("");
  const [overall, setOverall] = useState(5);
  const [understanding, setUnderstanding] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setSubmitted(false);
    setSelected("");
    setWorkQuality(5); setProactivity(5); setFeedbackResponse(5);
    setQuestions(3); setDidWell(""); setImprove("");
    setOverall(5); setUnderstanding(5);
  };

  if (submitted) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>
            Assessment for {selected} submitted ✓
          </div>
          <button onClick={reset} className="gs-btn-primary" style={{
            background: "#22C55E", color: "#fff", borderRadius: 8, padding: "10px 24px",
            fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", marginTop: 16,
          }}>
            Assess next graduate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Assess Team
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 28 }}>
          Your weekly assessment of each graduate. Takes ~3 minutes per person.
        </p>

        <div className="animate-fade-in" style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
              Select a graduate
            </label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)} style={{
              width: "100%", padding: "10px 14px", fontSize: 14, color: selected ? "#0F0F0F" : "#9CA3AF",
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", cursor: "pointer",
            }}>
              <option value="" disabled>Choose a graduate…</option>
              {graduates.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {selected && (
            <>
              <FormSlider label="How would you rate their work quality this week?" value={workQuality} onChange={setWorkQuality}
                leftLabel="Poor" rightLabel="Excellent" />
              <FormSlider label="How proactive were they?" value={proactivity} onChange={setProactivity}
                helper="Did they take initiative or wait to be told?" leftLabel="Passive" rightLabel="Highly proactive" />
              <FormSlider label="How well did they respond to feedback?" value={feedbackResponse} onChange={setFeedbackResponse}
                leftLabel="Resistant" rightLabel="Absorbed & applied" />

              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                  How many times did they ask you questions?
                </label>
                <input type="number" min={0} max={50} value={questions} onChange={(e) => setQuestions(Number(e.target.value))}
                  className="gs-number-input" style={{
                    width: 80, textAlign: "center", padding: "8px 12px", fontSize: 16,
                    border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
                  }} />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                  What's one specific thing they did well?
                </label>
                <textarea value={didWell} onChange={(e) => setDidWell(e.target.value)} className="gs-textarea" rows={3}
                  style={{ width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
                    border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical", minHeight: 80, lineHeight: 1.5 }} />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                  One area where they could improve or need support?
                </label>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>Not shown to the graduate directly</div>
                <textarea value={improve} onChange={(e) => setImprove(e.target.value)} className="gs-textarea" rows={3}
                  style={{ width: "100%", padding: 14, fontSize: 14, fontFamily: "Inter, sans-serif",
                    border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical", minHeight: 80, lineHeight: 1.5 }} />
              </div>

              <FormSlider label="Overall rating" value={overall} onChange={setOverall}
                leftLabel="Below expectations" rightLabel="Exceptional" />
              <FormSlider label="How well do you feel you understand how this person is really doing?" value={understanding} onChange={setUnderstanding}
                helper="It's ok to say you're not sure — that's useful information" leftLabel="Not sure at all" rightLabel="Very clear picture" />

              <button onClick={() => setSubmitted(true)} className="gs-btn-primary" style={{
                width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8,
                padding: "12px 20px", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
              }}>
                Submit Assessment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessTeam;
