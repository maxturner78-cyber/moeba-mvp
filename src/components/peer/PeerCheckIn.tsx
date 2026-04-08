import React, { useState } from "react";
import { CheckCircle, Users } from "lucide-react";
import FormSlider from "@/components/forms/FormSlider";
import { graduates } from "@/data/sampleData";

const PeerCheckIn: React.FC = () => {
  const [selectedGrad, setSelectedGrad] = useState(graduates[0].id);
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

  const grad = graduates.find((g) => g.id === selectedGrad);

  if (submitted) {
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 600, color: "#15803D", marginBottom: 8 }}>
            Peer feedback submitted ✓
          </div>
          <div style={{ fontSize: 14, color: "#374151" }}>
            Thanks for supporting {grad?.name.split(" ")[0]}'s development
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Peer / Buddy Check-In
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
          ~3 minutes. Your observations help build a complete picture of how {grad?.name.split(" ")[0]} is settling in.
        </p>

        {/* Info card */}
        <div style={{
          background: "#F0FDF4", borderRadius: 8, padding: 14, marginBottom: 24,
          display: "flex", alignItems: "start", gap: 10,
        }}>
          <Users size={16} color="#15803D" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
            As their assigned buddy, your perspective is invaluable during the first 8 weeks. You see things their manager doesn't — how they interact with the team day-to-day, whether they're asking questions, and how they handle the learning curve.
          </p>
        </div>

        {/* Graduate selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
            Who are you providing feedback for?
          </label>
          <select
            value={selectedGrad}
            onChange={(e) => setSelectedGrad(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", fontSize: 14,
              border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
              background: "#fff", color: "#0F0F0F", cursor: "pointer",
            }}
          >
            {graduates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} — {g.role} · Week {g.week}
              </option>
            ))}
          </select>
        </div>

        <div className="animate-fade-in" style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 28,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <FormSlider
            label={`How well does ${grad?.name.split(" ")[0]} collaborate with the team?`}
            value={collaboration} onChange={setCollaboration}
            leftLabel="Keeps to themselves" rightLabel="Fully integrated"
          />

          <FormSlider
            label={`How reliable is ${grad?.name.split(" ")[0]} when given tasks?`}
            value={reliability} onChange={setReliability}
            leftLabel="Needs chasing" rightLabel="Always delivers"
          />

          <FormSlider
            label={`How effectively does ${grad?.name.split(" ")[0]} communicate?`}
            value={communication} onChange={setCommunication}
            leftLabel="Unclear / hesitant" rightLabel="Clear & confident"
          />

          <FormSlider
            label={`Does ${grad?.name.split(" ")[0]} take initiative or wait to be told?`}
            value={initiative} onChange={setInitiative}
            leftLabel="Waits for direction" rightLabel="Proactively contributes"
          />

          <FormSlider
            label={`How confident does ${grad?.name.split(" ")[0]} seem day-to-day?`}
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
            { label: `What's ${grad?.name.split(" ")[0]} doing really well?`, value: strengths, onChange: setStrengths },
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
            label={`Overall, how is ${grad?.name.split(" ")[0]} tracking in their first weeks?`}
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
