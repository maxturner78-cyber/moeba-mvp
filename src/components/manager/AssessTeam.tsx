import React, { useState } from "react";
import { CheckCircle, Check, ChevronRight } from "lucide-react";
import { graduates } from "@/data/sampleData";

interface DimRow {
  key: string;
  name: string;
  value: number;
  note: string;
  prePop: boolean;
}

const getDimensions = (name: string): DimRow[] => {
  const isSarah = name === "Sarah Chen";
  return [
    { key: "quality", name: "Work quality", value: isSarah ? 8 : 7, note: isSarah ? "Same as last 6 weeks" : "Consistent", prePop: true },
    { key: "proactivity", name: "Proactivity", value: isSarah ? 5 : 6, note: isSarah ? "Same as last 3 weeks" : "Stable", prePop: true },
    { key: "feedback", name: "Feedback response", value: isSarah ? 8 : 7, note: isSarah ? "Same as last 4 weeks" : "Consistent", prePop: true },
    { key: "questions", name: "Questions observed", value: 0, note: "Trending down — your observation needed", prePop: false },
    { key: "overall", name: "Overall rating", value: isSarah ? 8 : 7, note: isSarah ? "Same as last 6 weeks" : "Consistent", prePop: true },
  ];
};

const AssessTeam: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [adjusting, setAdjusting] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, number>>({});
  const [questions, setQuestions] = useState<number | "">("");
  const [didWell, setDidWell] = useState("");
  const [improve, setImprove] = useState("");
  const [understanding, setUnderstanding] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const grad = graduates[selectedIdx];
  const dims = getDimensions(grad.name);
  const confirmedCount = Object.values(confirmed).filter(Boolean).length + (questions !== "" ? 1 : 0);

  const handleConfirm = (key: string) => {
    setConfirmed((p) => ({ ...p, [key]: true }));
    setAdjusting((p) => ({ ...p, [key]: false }));
  };

  const handleAdjust = (key: string) => {
    setAdjusting((p) => ({ ...p, [key]: true }));
    setConfirmed((p) => ({ ...p, [key]: false }));
  };

  const handleNext = () => {
    const nextIdx = (selectedIdx + 1) % graduates.length;
    setSelectedIdx(nextIdx);
    setConfirmed({});
    setAdjusting({});
    setValues({});
    setQuestions("");
    setDidWell("");
    setImprove("");
    setUnderstanding(5);
    setSubmitted(false);
  };

  const handleSelectChange = (idx: number) => {
    setSelectedIdx(idx);
    setConfirmed({});
    setAdjusting({});
    setValues({});
    setQuestions("");
    setDidWell("");
    setImprove("");
    setUnderstanding(5);
    setSubmitted(false);
  };

  if (submitted) {
    const nextGrad = graduates[(selectedIdx + 1) % graduates.length];
    return (
      <div className="flex justify-center" style={{ paddingTop: 48 }}>
        <div className="flex flex-col items-center animate-fade-in" style={{ maxWidth: 400, textAlign: "center" }}>
          <CheckCircle size={48} color="#22C55E" strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <div className="font-heading" style={{ fontSize: 18, fontWeight: 500, color: "#15803D", marginBottom: 8 }}>
            Assessment for {grad.name} submitted ✓
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
            Next: {nextGrad.name} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

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
            <option key={g.name} value={i}>{g.name} — {g.role} · W{g.week}</option>
          ))}
        </select>
      </div>

      {/* Info card */}
      <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 14, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: "#166534", margin: 0 }}>
          Based on {grad.name.split(" ")[0]}'s patterns from the Meridian audit engagement, here's what I'd expect this week.{" "}
          <span style={{ fontWeight: 500 }}>Confirm or adjust.</span>
        </p>
      </div>

      {/* Assessment card */}
      <div style={{
        background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        marginBottom: 20,
      }}>
        {dims.map((dim, i) => {
          const isConfirmed = confirmed[dim.key];
          const isAdjusting = adjusting[dim.key];
          const currentVal = values[dim.key] ?? dim.value;

          return (
            <div
              key={dim.key}
              style={{
                padding: "16px 20px",
                borderBottom: i < dims.length - 1 ? "1px solid #F3F4F6" : "none",
                opacity: isConfirmed ? 0.65 : 1,
                transition: "opacity 200ms ease",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F" }}>{dim.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{dim.note}</div>
                </div>
                <div className="flex items-center gap-3">
                  {dim.prePop ? (
                    <>
                      {isAdjusting ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="range" min={1} max={10}
                            value={currentVal}
                            onChange={(e) => setValues((p) => ({ ...p, [dim.key]: +e.target.value }))}
                            className="gs-slider"
                            style={{ width: 100, background: `linear-gradient(to right, #22C55E ${((currentVal - 1) / 9) * 100}%, #E5E7EB ${((currentVal - 1) / 9) * 100}%)` }}
                          />
                          <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 500, color: "#0F0F0F", width: 28, textAlign: "center" }}>
                            {currentVal}
                          </span>
                          <button
                            onClick={() => handleConfirm(dim.key)}
                            style={{
                              padding: "4px 12px", background: "#DCFCE7", color: "#15803D",
                              borderRadius: 100, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer",
                            }}
                          >
                            Done
                          </button>
                        </div>
                      ) : (
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
                                onClick={() => handleConfirm(dim.key)}
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
                                onClick={() => handleAdjust(dim.key)}
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
                      )}
                    </>
                  ) : (
                    <input
                      type="number" min={0} max={50}
                      value={questions}
                      onChange={(e) => setQuestions(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="—"
                      className="gs-number-input font-mono-data"
                      style={{
                        width: 64, textAlign: "center", padding: "6px 8px", fontSize: 18, fontWeight: 500,
                        border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", color: "#0F0F0F",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Textareas */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
          One specific thing she did well this week
        </label>
        <textarea
          value={didWell}
          onChange={(e) => setDidWell(e.target.value)}
          placeholder="Be specific — e.g. 'the Meridian workpapers were audit-ready first time'"
          className="gs-textarea"
          rows={3}
          style={{
            width: "100%", padding: 14, fontSize: 13, fontFamily: "Inter, sans-serif",
            border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
            lineHeight: 1.6, color: "#374151",
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 8 }}>
          One area to improve or support
        </label>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>Not shown to {grad.name.split(" ")[0]} directly</div>
        <textarea
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          placeholder="e.g. 'needs to escalate client queries sooner rather than trying to resolve alone'"
          className="gs-textarea"
          rows={3}
          style={{
            width: "100%", padding: 14, fontSize: 13, fontFamily: "Inter, sans-serif",
            border: "1px solid #E8E8E8", borderRadius: 8, outline: "none", resize: "vertical",
            lineHeight: 1.6, color: "#374151",
          }}
        />
      </div>

      {/* Understanding slider */}
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
          <span className="font-mono-data" style={{ fontWeight: 600 }}>{confirmedCount}</span> of{" "}
          <span className="font-mono-data" style={{ fontWeight: 600 }}>5</span> confirmed · ~45 seconds
        </span>
        <button
          onClick={() => setSubmitted(true)}
          style={{
            padding: "10px 24px", background: "#22C55E", color: "#fff",
            borderRadius: 100, fontSize: 14, fontWeight: 500, border: "none",
            cursor: "pointer", transition: "background 120ms ease, transform 80ms ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Submit Assessment
        </button>
      </div>
    </div>
  );
};

export default AssessTeam;
