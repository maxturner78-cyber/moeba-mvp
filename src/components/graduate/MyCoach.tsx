import React from "react";

const MONO = "'SF Mono', 'Fira Code', 'Cascadia Code', monospace";
const GREEN = "#4ade80";
const RED = "#f87171";

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

const Mono: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 14, color }}>{children}</span>
);

const MyCoach: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100%", margin: "-32px", minHeight: "calc(100vh - 48px)" }}>
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
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:42 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>Good morning Sarah. I've been watching your signals overnight.</p>
              <p style={{ marginBottom: 16 }}>One thing needs your attention today.</p>
              <p style={{ marginBottom: 16 }}>
                Your manager rated you <Mono>7.5/10</Mono> last week. You rated yourself <Mono>5.5/10</Mono>. That's a <Mono color={RED}>2.0</Mono> point gap — and it's been widening for three consecutive weeks. You think you're struggling. The data says you're not.
              </p>
              <p style={{ marginBottom: 16 }}>
                This gap is invisible to both of you until someone names it. The research says <Mono>85%</Mono> of people who leave have exactly this pattern in their last 90 days.
              </p>
              <p style={{ fontWeight: 600, color: GREEN }}>
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
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: GREEN }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:43 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>
                Also — <span style={{ fontWeight: 600 }}>9 days without a proactive update to your manager</span>. In hybrid, silence reads as disengagement even when you're working hard. Your visibility score dropped from <Mono>5.8 → 3.2</Mono> this month.
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
                background: GREEN,
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
