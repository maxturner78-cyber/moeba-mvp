import React, { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Copy } from "lucide-react";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Line, ComposedChart,
} from "recharts";
import StatusBadge from "@/components/StatusBadge";

/* ── Data ── */
const perceptionData = [
  { dim: "Self-Awareness", self: 5.2, manager: 8.0, peer: 7.5 },
  { dim: "Confidence", self: 5.5, manager: 7.8, peer: 7.2 },
  { dim: "Curiosity", self: 4.8, manager: 5.5, peer: 6.0 },
  { dim: "Manager Rel.", self: 5.0, manager: 7.5, peer: null },
  { dim: "Team Connection", self: 6.0, manager: 7.0, peer: 7.4 },
  { dim: "Feedback", self: 6.5, manager: 8.0, peer: 7.8 },
  { dim: "Workload", self: 6.0, manager: 7.0, peer: null },
  { dim: "Initiative", self: 5.3, manager: 5.5, peer: 6.0 },
  { dim: "Resilience", self: 6.8, manager: 7.0, peer: 7.2 },
];

const weeks = Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}` }));
const confidenceArr = [8, 8, 7, 5, 6, 7, 7, 6, 5, 5, 5, 5];
const selfRatingArr = [7, 7, 6, 5, 6, 6, 6, 5, 5, 5, 5, 5];
const managerRatingArr = [7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8];
const questionsArr = [6, 7, 5, 4, 6, 5, 5, 4, 3, 2, 2, 1];
const workloadArr = [6, 6, 7, 7, 7, 7, 6, 7, 9, 7, 7, 6];

const confData = weeks.map((w, i) => ({ ...w, value: confidenceArr[i] }));
const perfData = weeks.map((w, i) => ({ ...w, self: selfRatingArr[i], manager: managerRatingArr[i] }));
const qData = weeks.map((w, i) => ({ ...w, value: questionsArr[i] }));
const wlData = weeks.map((w, i) => ({ ...w, value: workloadArr[i] }));

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.stroke || p.fill || p.color }} />
          <span className="font-mono-data" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Perception Bar Group ── */
const BarGroup: React.FC<{ dim: string; self: number; manager: number; peer: number | null }> = ({ dim, self, manager, peer }) => {
  const maxW = 100; // percentage scale out of 10
  const bars = [
    { label: "Self", value: self, color: "#6366F1" },
    { label: "Manager", value: manager, color: "#F59E0B" },
    ...(peer !== null ? [{ label: "Peer", value: peer, color: "#22C55E" }] : []),
  ];
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>{dim}</div>
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2" style={{ marginBottom: 3 }}>
          <div style={{ width: "100%", height: 8, background: "#F3F4F6", borderRadius: 4, position: "relative" }}>
            <div style={{ width: `${(b.value / 10) * maxW}%`, height: 8, background: b.color, borderRadius: 4 }} />
          </div>
          <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 500, color: "#374151", width: 24, textAlign: "right", flexShrink: 0 }}>
            {b.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ── Trend tabs ── */
type TrendTab = "confidence" | "performance" | "questions" | "workload";

const TrendChart: React.FC<{ tab: TrendTab }> = ({ tab }) => {
  const common = {
    xAxis: <XAxis dataKey="week" axisLine={{ stroke: "#E8E8E8" }} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />,
    grid: <CartesianGrid horizontal vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />,
    tooltip: <Tooltip content={<DarkTooltip />} cursor={false} />,
  };

  if (tab === "confidence") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={confData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          {common.grid}{common.xAxis}{common.tooltip}
          <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} fill="url(#confGrad)" dot={false}
            activeDot={{ r: 4, fill: "#fff", stroke: "#EF4444", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "performance") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={perfData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          {common.grid}{common.xAxis}{common.tooltip}
          <Area type="monotone" dataKey="manager" stroke="transparent" fill="url(#gapFill)" />
          <Line type="monotone" dataKey="self" stroke="#6366F1" strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: "#fff", stroke: "#6366F1", strokeWidth: 2 }} />
          <Line type="monotone" dataKey="manager" stroke="#F59E0B" strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: "#fff", stroke: "#F59E0B", strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "questions") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={qData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          {common.grid}{common.xAxis}{common.tooltip}
          <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={18}>
            {qData.map((d, i) => (
              <Cell key={i} fill={d.value >= 3 ? "#22C55E" : d.value === 2 ? "#F59E0B" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={wlData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        {common.grid}{common.xAxis}{common.tooltip}
        <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#wlGrad)" dot={false}
          activeDot={{ r: 4, fill: "#fff", stroke: "#F59E0B", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ── Main Component ── */
interface Props {
  onBack: () => void;
}

const GraduateProfile: React.FC<Props> = ({ onBack }) => {
  const [trendTab, setTrendTab] = useState<TrendTab>("confidence");
  const [retentionOpen, setRetentionOpen] = useState(false);

  const trendTabs: { id: TrendTab; label: string }[] = [
    { id: "confidence", label: "Confidence" },
    { id: "performance", label: "Performance" },
    { id: "questions", label: "Questions" },
    { id: "workload", label: "Workload" },
  ];

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 transition-colors"
        style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
      >
        <ArrowLeft size={14} /> My Team
      </button>

      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
            <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em" }}>
              Sarah Chen
            </h1>
            <StatusBadge status="attention" />
          </div>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>Graduate Associate · Week 12 · Manager: David Liu</p>
        </div>
        <div className="flex gap-2">
          {["Copy Check-In Brief", "Generate Q1 Review"].map((label) => (
            <button
              key={label}
              style={{
                background: "#fff", color: "#374151", border: "1px solid #E8E8E8", borderRadius: 8,
                padding: "10px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Three columns */}
      <div style={{ display: "grid", gridTemplateColumns: "35% 35% 30%", gap: 20, marginBottom: 24 }}>
        {/* Col 1: Perception Gap */}
        <div style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}>
            Perception Gap Analysis
          </h3>
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            {[
              { color: "#6366F1", label: "Self" },
              { color: "#F59E0B", label: "Manager" },
              { color: "#22C55E", label: "Peer" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{l.label}</span>
              </div>
            ))}
          </div>
          {perceptionData.map((d) => (
            <BarGroup key={d.dim} dim={d.dim} self={d.self} manager={d.manager} peer={d.peer} />
          ))}
          <div style={{ background: "#FEF2F2", borderRadius: 8, padding: 12, marginTop: 8 }}>
            <p style={{ fontSize: 12, color: "#DC2626", lineHeight: 1.5 }}>
              <span className="font-mono-data" style={{ fontWeight: 600 }}>Average perception gap: 2.3 points</span>
              {" "}— Sarah consistently rates herself lower than her manager and peers rate her
            </p>
          </div>
        </div>

        {/* Col 2: Trend Charts */}
        <div style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <div className="flex items-center gap-0" style={{ marginBottom: 16, borderBottom: "1px solid #F3F4F6" }}>
            {trendTabs.map((t) => {
              const active = trendTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTrendTab(t.id)}
                  style={{
                    padding: "8px 14px", fontSize: 13, fontWeight: active ? 600 : 400,
                    color: active ? "#22C55E" : "#9CA3AF", background: "none", border: "none",
                    borderBottom: active ? "2px solid #22C55E" : "2px solid transparent",
                    cursor: "pointer", marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <TrendChart tab={trendTab} />
          {trendTab === "performance" && (
            <div className="flex items-center gap-4 justify-center" style={{ marginTop: 8 }}>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 2, background: "#6366F1", borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Self-rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div style={{ width: 10, height: 2, background: "#F59E0B", borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>Manager rating</span>
              </div>
            </div>
          )}
        </div>

        {/* Col 3: Check-In Brief */}
        <div
          style={{
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20, paddingLeft: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            position: "sticky", top: 32, alignSelf: "start",
            borderLeft: "3px solid #22C55E",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F0F0F", marginBottom: 2 }}>
            Check-In Brief — Week 12
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
            Prepared for your 1-on-1 with Sarah
          </div>

          {/* What Changed */}
          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
            WHAT CHANGED
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
            {[
              "Confidence dropped from 7 → 5 (second consecutive decline)",
              "Questions dropped from 4 → 1 (lowest in 8 weeks)",
              "You rated her 8/10, she rated herself 5/10 — 3-point gap",
              "Peer connection held steady at 7.4",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2" style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB", marginTop: 7, flexShrink: 0 }} />
                {t}
              </li>
            ))}
          </ul>

          <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
            WHAT THIS SUGGESTS
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>
            Sarah may be experiencing imposter syndrome. She's performing well by your assessment and peers', but doesn't see it. Declining confidence + reduced questions = someone withdrawing because they believe they're failing.
          </p>

          <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
            WHAT TO SAY
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, marginBottom: 16 }}>
            Open with specific recognition — reference the client deliverable you rated 8/10. Then ask how she thinks it went. If she rates herself lower, name the gap gently: "That's interesting — from my side, I thought it was excellent. Here's why..."
          </p>

          <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

          <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
            ONE QUESTION TO ASK
          </div>
          <div style={{ background: "#F0FDF4", borderRadius: 6, padding: 12, marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "#15803D", fontWeight: 500, margin: 0 }}>
              "What's one thing you're unsure about right now that you haven't asked anyone about yet?"
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>Estimated conversation: ~10 min</span>
            <button
              className="flex items-center gap-1"
              style={{
                background: "#fff", color: "#374151", border: "1px solid #E8E8E8", borderRadius: 6,
                padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer",
              }}
            >
              <Copy size={12} /> Copy Brief
            </button>
          </div>
        </div>
      </div>

      {/* Retention Intelligence — collapsible */}
      <div style={{
        background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        overflow: "hidden",
      }}>
        <button
          onClick={() => setRetentionOpen(!retentionOpen)}
          className="flex items-center justify-between w-full transition-colors"
          style={{ padding: "16px 20px", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <span className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: "#0F0F0F" }}>
            Retention Intelligence
          </span>
          {retentionOpen ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
        </button>
        {retentionOpen && (
          <div style={{ padding: "0 20px 20px 20px" }}>
            <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />
            <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#374151" }}>Attrition probability:</span>
              <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 600, color: "#EF4444" }}>68%</span>
              <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>— Elevated</span>
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Primary drivers:</span> Perception gap (3.0 pts), Confidence trajectory (declining 6 weeks), Question frequency (below threshold)
            </p>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 500 }}>Recommendation:</span> Calibration conversation within 48 hours
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraduateProfile;
