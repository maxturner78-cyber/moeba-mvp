import React from "react";
import { graduates } from "@/data/sampleData";
import StatusBadge from "@/components/StatusBadge";

const dimensions = [
  { key: "selfAwareness", label: "Self-Aw." },
  { key: "confidence", label: "Confid." },
  { key: "curiosity", label: "Curios." },
  { key: "managerRelationship", label: "Mgr Rel." },
  { key: "teamConnection", label: "Team" },
  { key: "feedbackApplication", label: "Feedbk." },
  { key: "workloadMgmt", label: "Wkload" },
  { key: "initiative", label: "Initiat." },
  { key: "resilience", label: "Resil." },
] as const;

const cellColor = (v: number) => {
  if (v >= 7) return "#22C55E";
  if (v >= 5) return "#F59E0B";
  return "#EF4444";
};

const managerGroups = [
  { manager: "David Liu", ids: ["g1", "g4", "g6"] },
  { manager: "Rebecca Torres", ids: ["g2", "g3", "g5"] },
];

const firmAvg = dimensions.map((d) => {
  const sum = graduates.reduce((acc, g) => acc + (g.dimensions as any)[d.key], 0);
  return sum / graduates.length;
});

/* Manager bar data */
const managerData = managerGroups.map((mg) => {
  const team = graduates.filter((g) => mg.ids.includes(g.id));
  const avgs = dimensions.map((d) => {
    const s = team.reduce((acc, g) => acc + (g.dimensions as any)[d.key], 0);
    return s / team.length;
  });
  const overallAvg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  const gap = mg.manager === "David Liu" ? 2.8 : 0.6;
  return { ...mg, avgs, overallAvg, gap, count: team.length };
});

const ProgramOverview: React.FC = () => {
  const metrics = [
    { label: "Total Graduates", value: "6", color: "#0F0F0F" },
    { label: "Accelerating", value: "2", sub: "(33%)", color: "#22C55E" },
    { label: "Needs Attention", value: "2", sub: "(33%)", color: "#EF4444" },
    { label: "Avg Development Score", value: "6.4", trend: "→ stable", trendColor: "#9CA3AF", color: "#0F0F0F" },
    { label: "Avg Perception Gap", value: "1.8", sub: "pts", trend: "firm-wide", trendColor: "#9CA3AF", color: "#0F0F0F" },
    { label: "Retention Rate", value: "83%", color: "#22C55E", trend: "vs 65% industry avg", trendColor: "#9CA3AF" },
  ];

  return (
    <div>
      {/* Header */}
      <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 4 }}>
        Program Intelligence
      </h1>
      <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 24 }}>Q1 2026 · Graduate Cohort</p>

      {/* Top Metrics */}
      <div className="gs-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              {m.label}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-data" style={{ fontSize: 28, fontWeight: 600, color: m.color }}>{m.value}</span>
              {m.sub && <span style={{ fontSize: 13, color: m.color }}>{m.sub}</span>}
              {m.trend && <span style={{ fontSize: 11, color: m.trendColor }}>{m.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Cohort Heatmap */}
      <div style={{
        background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)", marginBottom: 24,
      }}>
        <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
          Cohort Development Heatmap
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ width: 200, textAlign: "left", padding: "8px 12px" }} />
                {dimensions.map((d) => (
                  <th key={d.key} style={{
                    textAlign: "center", padding: "8px 6px", fontSize: 11, fontWeight: 500,
                    color: "#9CA3AF", whiteSpace: "nowrap",
                  }}>
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {managerGroups.map((mg) => (
                <React.Fragment key={mg.manager}>
                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        padding: "10px 12px 6px", fontSize: 11, fontWeight: 500,
                        textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF",
                        background: "#F9FAFB",
                      }}
                    >
                      {mg.manager}'s Team
                    </td>
                  </tr>
                  {graduates
                    .filter((g) => mg.ids.includes(g.id))
                    .map((g) => (
                      <tr key={g.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F" }}>{g.name}</span>
                            <StatusBadge status={g.status} />
                          </div>
                        </td>
                        {dimensions.map((d) => {
                          const val = (g.dimensions as any)[d.key] as number;
                          return (
                            <td key={d.key} style={{ textAlign: "center", padding: "10px 6px" }}>
                              <div
                                style={{
                                  width: 12, height: 12, borderRadius: "50%",
                                  background: cellColor(val), margin: "0 auto",
                                }}
                                title={`${d.label}: ${val.toFixed(1)}`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight */}
      <div style={{
        background: "#F0FDF4", border: "1px solid #DCFCE7", borderRadius: 10, padding: 20, paddingLeft: 24,
        position: "relative", marginBottom: 32,
      }}>
        <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "#22C55E", borderRadius: 2 }} />
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>
          Graduates under David Liu show 40% lower confidence scores than those under Rebecca Torres. Perception gaps are 2.1× wider. This may indicate a management style difference worth investigating.
        </p>
      </div>

      {/* Manager Effectiveness */}
      <h3 className="font-heading" style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}>
        Manager Effectiveness
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        {managerData.map((md) => {
          const isGood = md.manager === "Rebecca Torres";
          return (
            <div key={md.manager} style={{
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}>{md.manager}</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>
                {md.count} direct reports · Avg gap: <span className="font-mono-data" style={{ fontWeight: 500 }}>{md.gap}</span> pts · Avg score: <span className="font-mono-data" style={{ fontWeight: 500 }}>{md.overallAvg.toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 12, color: isGood ? "#22C55E" : "#EF4444", fontWeight: 500, marginBottom: 16 }}>
                {isGood ? "All graduates accelerating or steady" : "2 graduates with declining confidence"}
              </div>
              <div className="flex flex-col gap-2">
                {dimensions.map((d, di) => {
                  const val = md.avgs[di];
                  const avg = firmAvg[di];
                  const atOrAbove = val >= avg;
                  return (
                    <div key={d.key} className="flex items-center gap-2">
                      <span style={{ width: 52, fontSize: 11, color: "#6B7280", flexShrink: 0 }}>{d.label}</span>
                      <div style={{ flex: 1, height: 8, background: "#F3F4F6", borderRadius: 4, position: "relative" }}>
                        <div style={{
                          width: `${(val / 10) * 100}%`, height: 8, borderRadius: 4,
                          background: atOrAbove ? "#22C55E" : "#EF4444",
                        }} />
                        <div style={{
                          position: "absolute", left: `${(avg / 10) * 100}%`, top: -2, bottom: -2,
                          width: 1.5, background: "#374151", borderRadius: 1,
                        }} />
                      </div>
                      <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 500, color: "#374151", width: 24, textAlign: "right" }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                <div style={{ width: 10, height: 1.5, background: "#374151" }} />
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>Firm average</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ROI Card */}
      <div style={{
        background: "#111111", borderRadius: 12, padding: 32,
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      }}>
        {[
          { label: "Estimated Savings", value: "$336,000", color: "#fff", sub: "" },
          { label: "Prevented Resignations", value: "2", color: "#fff", sub: "at $168K each" },
          { label: "Interventions", value: "8", color: "#fff", sub: "triggered · 5 resolved" },
          { label: "Platform ROI", value: "6,100%", color: "#22C55E", sub: "" },
        ].map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
              {item.label}
            </div>
            <div className="font-mono-data" style={{ fontSize: 36, fontWeight: 600, color: item.color, lineHeight: 1, marginBottom: 4 }}>
              {item.value}
            </div>
            {item.sub && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{item.sub}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramOverview;
