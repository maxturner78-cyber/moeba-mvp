import React from "react";

const signalCards = [
  {
    label: "PERCEPTION GAP",
    value: "2.0 pts",
    valueColor: "#EF4444",
    detail: "↑ widening · 3 weeks",
    mini: [
      { label: "you", value: "5.5", color: "#EF4444", pct: 55 },
      { label: "mgr", value: "7.5", color: "#22C55E", pct: 75 },
    ],
  },
  {
    label: "CONFIDENCE TRAJECTORY",
    value: "5.5 / 10",
    valueColor: "#F59E0B",
    detail: "↓ -1.2 vs last month",
  },
  {
    label: "CURIOSITY",
    value: "4.8 / 10",
    valueColor: "#F59E0B",
    detail: "↓ questions declining",
  },
  {
    label: "MANAGER RELATIONSHIP",
    value: "7.1 / 10",
    valueColor: "#22C55E",
    detail: "↑ improving · 4 weeks",
  },
  {
    label: "INITIATIVE",
    value: "5.3 / 10",
    valueColor: "#F59E0B",
    detail: "↓ below cohort avg",
  },
  {
    label: "RESILIENCE",
    value: "6.8 / 10",
    valueColor: "#22C55E",
    detail: "→ recovery: 6 days",
  },
];

const focusAreas = [
  { name: "Curiosity & Learning", color: "#F59E0B" },
  { name: "Self-Awareness", color: "#F59E0B" },
  { name: "Initiative & Voice", color: "#F59E0B" },
];

const ActionBtn: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <button
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "8px 16px",
      background: "#F0FDF4",
      border: "1px solid #DCFCE7",
      borderRadius: 100,
      color: "#15803D",
      fontFamily: '"Inter", sans-serif',
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 150ms ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#DCFCE7";
      e.currentTarget.style.borderColor = "#22C55E";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#F0FDF4";
      e.currentTarget.style.borderColor = "#DCFCE7";
    }}
  >
    {children}
  </button>
);

const MyCoach: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100%", margin: "-32px", minHeight: "calc(100vh - 48px)" }}>
      {/* Left Panel */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          background: "#F5F5F4",
          borderRight: "1px solid #E8E8E8",
          padding: 20,
          overflowY: "auto",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF" }}>
          LIVE SIGNALS
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, marginBottom: 16 }}>
          w14 · updated today
        </div>

        {signalCards.map((s, i) => (
          <div key={i} style={{ borderBottom: "1px solid #E8E8E8", padding: "14px 0" }}>
            <div style={{ fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3AF", marginBottom: 4 }}>
              {s.label}
            </div>
            <div className="font-mono-data" style={{ fontSize: 22, fontWeight: 700, color: s.valueColor }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              {s.detail}
            </div>
            {s.mini && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {s.mini.map((m) => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "#9CA3AF", width: 24, textAlign: "right" }}>{m.label}</span>
                    <div style={{ width: 100, height: 4, background: "#E8E8E8", borderRadius: 2, position: "relative" }}>
                      <div style={{ width: `${m.pct}%`, height: 4, background: m.color, borderRadius: 2 }} />
                    </div>
                    <span className="font-mono-data" style={{ fontSize: 11, color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ borderTop: "1px solid #E8E8E8", marginTop: 16, paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 12 }}>
            DEVELOPMENT PILLARS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {focusAreas.map((a) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                {a.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", position: "relative" }}>
        <div style={{ padding: "0 32px", flex: 1, overflowY: "auto", paddingBottom: 80 }}>
          {/* Header bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E8E8E8", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F" }}>gradsense — development agent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>sarah.chen@swangroup.com.au</span>
              <span style={{ background: "#F0FDF4", color: "#15803D", fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100 }}>live · w14</span>
            </div>
          </div>

          {/* Message 1 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:42 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>Good morning Sarah. I've been watching your signals overnight.</p>
              <p style={{ marginBottom: 16 }}>One thing needs your attention today.</p>
              <p style={{ marginBottom: 16 }}>
                Your manager rated you <span className="font-mono-data" style={{ fontWeight: 600 }}>7.5/10</span> last week. You rated yourself <span className="font-mono-data" style={{ fontWeight: 600 }}>5.5/10</span>. That's a <span className="font-mono-data" style={{ fontWeight: 600 }}>2.0</span> point gap — and it's been widening for three consecutive weeks. You think you're struggling. The data says you're not.
              </p>
              <p style={{ marginBottom: 16 }}>
                This gap is invisible to both of you until someone names it. The research says 85% of people who leave have exactly this pattern in their last 90 days.
              </p>
              <p style={{ fontWeight: 600, color: "#22C55E" }}>
                You're not at risk because of performance. You're at risk because of perception.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <ActionBtn>close the gap today →</ActionBtn>
              <ActionBtn>full analysis →</ActionBtn>
              <ActionBtn>why this happens →</ActionBtn>
            </div>
          </div>

          {/* Message 2 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:43 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>
                Also — <span style={{ fontWeight: 600 }}>9 days without a proactive update to your manager</span>. In hybrid, silence reads as disengagement even when you're working hard. Your visibility score dropped from <span className="font-mono-data" style={{ fontWeight: 600 }}>5.8 → 3.2</span> this month.
              </p>
              <p>
                One Friday update fixes this. I've drafted one based on your week 13 check-in and the Meridian project milestone. Want me to show it?
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <ActionBtn>show the draft →</ActionBtn>
              <ActionBtn>I'll write my own →</ActionBtn>
            </div>
          </div>
        </div>

        {/* Chat input */}
        <div style={{ position: "sticky", bottom: 0, padding: "16px 32px", background: "linear-gradient(transparent, #FFFFFF 20%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Ask your development coach anything..."
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "1px solid #E8E8E8",
                borderRadius: 10,
                background: "#F9FAFB",
                fontSize: 14,
                color: "#0F0F0F",
                outline: "none",
                fontFamily: '"Inter", sans-serif',
              }}
              readOnly
            />
            <button
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#22C55E",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoach;
