import React from "react";

const graduates = [
  { name: "Sarah Chen", role: "Associate · Wk 14", badge: "urgent", badgeBg: "#FEF2F2", badgeColor: "#DC2626", metric: "gap: 2.0", metricColor: "#EF4444", urgent: true },
  { name: "Alex Rodriguez", role: "Associate · Wk 8", badge: "urgent", badgeBg: "#FEF2F2", badgeColor: "#DC2626", metric: "↓ 2q/wk", metricColor: "#EF4444", urgent: true },
  { name: "Priya Sharma", role: "Associate · Wk 22", badge: "watch", badgeBg: "#FFFBEB", badgeColor: "#D97706", metric: "conf dip", metricColor: "#F59E0B", urgent: false },
  { name: "Tyler Morrison", role: "Associate · Wk 18", badge: "watch", badgeBg: "#FFFBEB", badgeColor: "#D97706", metric: "load: 8.8", metricColor: "#F59E0B", urgent: false },
  { name: "Marcus Johnson", role: "Associate · Wk 26", badge: "thriving", badgeBg: "#F0FDF4", badgeColor: "#15803D", metric: "8.2 tri", metricColor: "#22C55E", urgent: false },
  { name: "Emma Thompson", role: "Associate · Wk 28", badge: "thriving", badgeBg: "#F0FDF4", badgeColor: "#15803D", metric: "7.8 conf", metricColor: "#22C55E", urgent: false },
];

const teamStats = [
  { label: "avg growth index", value: "5.9" },
  { label: "avg perception gap", value: "1.8" },
  { label: "check-in rate", value: "83%" },
  { label: "avg q/week", value: "4.1" },
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

const TeamBrief: React.FC = () => {
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
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 16 }}>
          TEAM SIGNAL FEED
        </div>

        {graduates.map((g, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid #E8E8E8",
              padding: "14px 0",
              borderLeft: g.urgent ? "3px solid rgba(239,68,68,0.3)" : "3px solid transparent",
              paddingLeft: g.urgent ? 10 : 0,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 2 }}>{g.name}</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6 }}>{g.role}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 100, background: g.badgeBg, color: g.badgeColor }}>
                {g.badge}
              </span>
              <span className="font-mono-data" style={{ fontSize: 11, color: g.metricColor }}>{g.metric}</span>
            </div>
          </div>
        ))}

        <div style={{ borderTop: "1px solid #E8E8E8", marginTop: 16, paddingTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 12 }}>
            TEAM HEALTH W14
          </div>
          {teamStats.map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>{s.label}</span>
              <span className="font-mono-data" style={{ fontSize: 13, color: "#0F0F0F" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", position: "relative" }}>
        <div style={{ padding: "0 32px", flex: 1, overflowY: "auto", paddingBottom: 80 }}>
          {/* Header bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E8E8E8", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="live-dot" />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F" }}>gradsense — manager agent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#9CA3AF" }}>j.park@swangroup.com.au · 6 reports</span>
              <span style={{ background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100 }}>2 urgent</span>
            </div>
          </div>

          {/* Message 1 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:15 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>Morning. Two people need your attention today, not this week.</p>
              <p style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 700 }}>Sarah Chen</span> — her perception gap hit <span className="font-mono-data" style={{ fontWeight: 600 }}>2.0</span> points this week. She rates herself <span className="font-mono-data" style={{ fontWeight: 600 }}>5.5</span>. You rated her <span className="font-mono-data" style={{ fontWeight: 600 }}>7.5</span> last Tuesday. She thinks she's failing. You think she's fine. Neither of you knows the other's number. This gap has widened three consecutive weeks. At <span className="font-mono-data" style={{ fontWeight: 600 }}>2.5</span> points it becomes very hard to close without a formal conversation.
              </p>
              <p style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 700 }}>Alex Rodriguez</span> — question frequency dropped from <span className="font-mono-data" style={{ fontWeight: 600 }}>6/week</span> in week 5 to <span className="font-mono-data" style={{ fontWeight: 600 }}>2/week</span> this week. Across three consecutive weeks. That's the MIT Sloan disengagement signal. He's not struggling with the work. He's withdrawing from it.
              </p>
              <p style={{ fontWeight: 600, color: "#22C55E" }}>
                Both of these are 15-minute conversations. Both have scripts ready.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <ActionBtn>script: sarah →</ActionBtn>
              <ActionBtn>script: alex →</ActionBtn>
              <ActionBtn>full team →</ActionBtn>
            </div>
          </div>

          {/* User Message */}
          <div style={{ marginBottom: 32, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "70%", background: "#F0FDF4", borderRadius: "10px 10px 2px 10px", padding: "12px 16px", fontSize: 14, color: "#0F0F0F" }}>
              give me the script for sarah
            </div>
          </div>

          {/* Message 3 */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>GRADSENSE AGENT</span>
              <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8 }}>07:16 · mon w14</span>
            </div>
            <div style={{ fontSize: 15, color: "#0F0F0F", lineHeight: 1.7 }}>
              <p style={{ marginBottom: 16 }}>The goal: let Sarah tell you how she's doing before you tell her how you see her. If you lead with your rating, she'll nod and internalise nothing. <span style={{ fontWeight: 600 }}>Ask first.</span></p>
              <p style={{ marginBottom: 16 }}>Open with: <em>"I wanted to check in on how you're finding things. How would you rate your own performance this week — honestly?"</em></p>
              <p style={{ marginBottom: 16 }}>Listen. She'll likely say 5 or 6. Don't correct immediately.</p>
              <p style={{ marginBottom: 16 }}>Then: <em>"That's interesting. From my side, I'd put you at <span className="font-mono-data" style={{ fontWeight: 600 }}>7.5</span>. Here's specifically why —"</em> and reference the Meridian deliverable and the client feedback from Thursday.</p>
              <p style={{ marginBottom: 16 }}>The goal isn't to convince her she's wrong. It's to show her what you see that she doesn't. <span style={{ fontWeight: 600 }}>Name the gap. Make it visible.</span> That's the first step to closing it.</p>
              <p style={{ marginBottom: 16 }}>Ask before you leave: <em>"What's one thing you're unsure about right now that you haven't asked anyone about?"</em></p>
              <p>This should take <span className="font-mono-data" style={{ fontWeight: 600 }}>12-15</span> minutes. Follow up next week — if the gap narrows by even <span className="font-mono-data" style={{ fontWeight: 600 }}>0.5</span> points, the intervention is working.</p>
            </div>
          </div>
        </div>

        {/* Chat input */}
        <div style={{ position: "sticky", bottom: 0, padding: "16px 32px", background: "linear-gradient(transparent, #FFFFFF 20%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Ask about any team member or situation..."
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

export default TeamBrief;
