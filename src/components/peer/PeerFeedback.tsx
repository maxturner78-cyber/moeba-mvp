import React, { useState } from "react";
import { CheckCircle } from "lucide-react";

const colleagues = ["Sarah Chen", "Marcus Johnson", "Priya Patel", "Tyler Morrison", "James Park"];

const RatingSlider: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", marginBottom: 10 }}>{label}</div>
      <div className="flex items-center gap-3">
        <div style={{ flex: 1 }}>
          <input
            type="range" min={1} max={10} value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="gs-slider"
            style={{
              width: "100%",
              background: `linear-gradient(to right, #22C55E 0%, #22C55E ${pct}%, #E8E8E8 ${pct}%, #E8E8E8 100%)`,
            }}
          />
        </div>
        <span className="font-mono-data" style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", width: 28, textAlign: "right" }}>
          {value}
        </span>
      </div>
    </div>
  );
};

const PeerFeedback: React.FC = () => {
  const [selected, setSelected] = useState("");
  const [collaboration, setCollaboration] = useState(7);
  const [reliability, setReliability] = useState(7);
  const [communication, setCommunication] = useState(7);
  const [overall, setOverall] = useState(7);
  const [freeText, setFreeText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(1);

  const handleSubmit = () => {
    setSubmitted(true);
    setReviewedCount((c) => c + 1);
  };

  const handleNext = () => {
    setSubmitted(false);
    setSelected("");
    setCollaboration(7);
    setReliability(7);
    setCommunication(7);
    setOverall(7);
    setFreeText("");
  };

  return (
    <div className="flex justify-center" style={{ paddingTop: 8 }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Monthly Peer Feedback
        </h1>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.65, marginBottom: 24 }}>
          Your honest feedback helps your colleagues see strengths they don't recognise in themselves. All responses are anonymised.
        </p>

        <div style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          {submitted ? (
            <div className="flex flex-col items-center" style={{ padding: "32px 0" }}>
              <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}>
                Feedback for {selected} submitted ✓
              </div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
                {reviewedCount} of 5 colleagues reviewed
              </div>
              <div className="flex items-center gap-2" style={{ marginBottom: 24 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: i < reviewedCount ? "#22C55E" : "transparent",
                      border: i < reviewedCount ? "none" : "1.5px solid #D1D5DB",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={handleNext}
                style={{
                  background: "#22C55E", color: "#fff", borderRadius: 8, padding: "10px 24px",
                  fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
              >
                Review next colleague
              </button>
            </div>
          ) : (
            <>
              {/* Dropdown */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                  Select a colleague
                </label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 14, color: selected ? "#0F0F0F" : "#9CA3AF",
                    background: "#fff", border: "1px solid #E8E8E8", borderRadius: 8, outline: "none",
                    cursor: "pointer", appearance: "auto",
                  }}
                >
                  <option value="" disabled>Choose a colleague…</option>
                  {colleagues.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {selected && (
                <>
                  <RatingSlider label="How would you rate their collaboration?" value={collaboration} onChange={setCollaboration} />
                  <RatingSlider label="How reliable are they?" value={reliability} onChange={setReliability} />
                  <RatingSlider label="How effective is their communication?" value={communication} onChange={setCommunication} />
                  <RatingSlider label="Overall, how would you rate them as a colleague?" value={overall} onChange={setOverall} />

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
                      What's one thing this person does that makes your work better?
                    </label>
                    <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      placeholder="Be specific — this gets shared anonymously as a strength"
                      rows={3}
                      style={{
                        width: "100%", padding: "10px 14px", fontSize: 14, color: "#0F0F0F",
                        border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
                        fontFamily: "Inter, sans-serif", lineHeight: 1.5,
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    style={{
                      width: "100%", background: "#22C55E", color: "#fff", borderRadius: 8, padding: "12px 20px",
                      fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
                  >
                    Submit Feedback
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerFeedback;
