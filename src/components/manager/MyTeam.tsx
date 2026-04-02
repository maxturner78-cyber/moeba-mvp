import React from "react";
import { ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, YAxis,
} from "recharts";
import { teamGraduates, statusColors, statusLabels, type TeamGraduate } from "@/data/teamData";
import StatusBadge from "@/components/StatusBadge";
import MiniAreaSparkline from "@/components/MiniAreaSparkline";

/* ── Confidence chart data ── */
const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
const confidenceChartData = weeks.map((w, i) => {
  const row: Record<string, string | number> = { week: w };
  teamGraduates.forEach((g) => { row[g.id] = g.confidenceTrend[i]; });
  return row;
});

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ fontSize: 12 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.stroke }} />
          <span style={{ color: "rgba(255,255,255,0.6)" }}>
            {teamGraduates.find((g) => g.id === p.dataKey)?.name}
          </span>
          <span className="font-mono-data" style={{ color: "#fff", fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Perception gap data ── */
const gapData = [...teamGraduates]
  .sort((a, b) => b.perceptionGap - a.perceptionGap)
  .map((g) => ({ name: g.name, gap: g.perceptionGap, status: g.status }));

const gapColor = (gap: number) => {
  if (gap >= 2.5) return "#EF4444";
  if (gap >= 1.0) return "#F59E0B";
  return "#22C55E";
};

const GapTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{payload[0].payload.name}</div>
      <div className="font-mono-data" style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}>
        {payload[0].value.toFixed(1)} pts
      </div>
    </div>
  );
};

interface MyTeamProps {
  onSelectGraduate: (id: string) => void;
}

const MyTeam: React.FC<MyTeamProps> = ({ onSelectGraduate }) => {
  const counts = {
    total: teamGraduates.length,
    accelerating: teamGraduates.filter((g) => g.status === "accelerating").length,
    steady: teamGraduates.filter((g) => g.status === "steady").length,
    attention: teamGraduates.filter((g) => g.status === "attention").length + teamGraduates.filter((g) => g.status === "stalling").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em" }}>
          My Team
        </h1>
        <button
          style={{
            background: "#22C55E", color: "#fff", borderRadius: 8, padding: "10px 20px",
            fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
        >
          Assess Team
        </button>
      </div>

      {/* Top Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Graduates", value: counts.total, color: "#0F0F0F" },
          { label: "Accelerating", value: counts.accelerating, color: "#22C55E", trend: "↑ consistent", trendColor: "#22C55E" },
          { label: "Steady", value: counts.steady, color: "#6B7280" },
          { label: "Needs Attention", value: counts.attention, color: "#EF4444", trend: "action needed", trendColor: "#EF4444" },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              {m.label}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-data" style={{ fontSize: 28, fontWeight: 600, color: m.color }}>
                {m.value}
              </span>
              {m.trend && (
                <span style={{ fontSize: 12, color: m.trendColor }}>{m.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Team List */}
      <div
        style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          marginBottom: 24, overflow: "hidden",
        }}
      >
        {teamGraduates.map((g, i) => {
          const sc = statusColors[g.status];
          return (
            <div
              key={g.id}
              onClick={() => onSelectGraduate(g.id)}
              className="flex items-center transition-colors"
              style={{
                padding: "16px 20px",
                borderBottom: i < teamGraduates.length - 1 ? "1px solid #F3F4F6" : "none",
                cursor: "pointer",
                gap: 16,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: sc.bg, color: sc.text,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {g.initials}
              </div>

              {/* Name + role */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{g.role} · W{g.week}</div>
              </div>

              {/* Status badge */}
              <div style={{ width: 130, flexShrink: 0 }}>
                <StatusBadge status={g.status} />
              </div>

              {/* Signal */}
              <div
                style={{
                  flex: 1, fontSize: 13, color: "#374151",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {g.signal}
              </div>

              {/* Sparkline */}
              <div style={{ flexShrink: 0 }}>
                <MiniAreaSparkline data={g.confidenceTrend} color={sc.line} />
              </div>

              {/* Chevron */}
              <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Bottom Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Confidence Trends */}
        <div style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
            Team Confidence Trends
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <LineChart data={confidenceChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
                <XAxis dataKey="week" axisLine={{ stroke: "#E8E8E8" }} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip />} cursor={false} />
                {teamGraduates.map((g) => {
                  const isHighlighted = g.status === "attention" || g.status === "stalling";
                  return (
                    <Line
                      key={g.id}
                      type="monotone"
                      dataKey={g.id}
                      stroke={isHighlighted ? statusColors[g.status].line : "#D1D5DB"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      dot={false}
                      activeDot={isHighlighted ? { r: 3, fill: statusColors[g.status].line, stroke: "#fff", strokeWidth: 2 } : false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-3" style={{ marginTop: 12 }}>
            {teamGraduates.map((g) => (
              <div key={g.id} className="flex items-center gap-1.5">
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[g.status].line }} />
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{g.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Perception Gap */}
        <div style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
            Perception Gap Distribution
          </h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={gapData} layout="vertical" margin={{ top: 5, right: 40, left: 0, bottom: 0 }}>
                <CartesianGrid horizontal={false} vertical stroke="#F3F4F6" strokeDasharray="4 4" />
                <XAxis type="number" domain={[0, 4]} hide />
                <YAxis
                  type="category" dataKey="name" width={100}
                  axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                />
                <Tooltip content={<GapTooltip />} cursor={false} />
                <Bar dataKey="gap" radius={[0, 4, 4, 0]} barSize={14}
                  label={{ position: "right", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fill: "#374151", formatter: (v: number) => v.toFixed(1) }}
                >
                  {gapData.map((d, i) => (
                    <Cell key={i} fill={gapColor(d.gap)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeam;
