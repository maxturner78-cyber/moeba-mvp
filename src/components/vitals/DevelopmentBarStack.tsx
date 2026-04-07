import React, { useEffect, useState } from "react";

type Trend = "up" | "down" | "stable";

interface DimensionRow {
  name: string;
  score: number;
  trend: Trend;
  sparkline: number[];
}

const dimensions: DimensionRow[] = [
  { name: "Feedback Application", score: 8.1, trend: "up", sparkline: [7.0, 7.5, 7.8, 7.5, 8.0, 7.8, 8.0, 8.1] },
  { name: "Team Connection", score: 7.4, trend: "up", sparkline: [6.2, 6.5, 6.8, 7.0, 7.0, 7.2, 7.3, 7.4] },
  { name: "Manager Relationship", score: 7.1, trend: "up", sparkline: [6.0, 6.2, 6.5, 6.8, 6.8, 7.0, 7.0, 7.1] },
  { name: "Resilience", score: 6.8, trend: "stable", sparkline: [6.5, 6.8, 6.5, 6.2, 6.5, 6.8, 6.8, 6.8] },
  { name: "Workload Management", score: 6.0, trend: "stable", sparkline: [6.5, 6.2, 6.5, 6.0, 6.0, 6.2, 5.8, 6.0] },
  { name: "Confidence Stability", score: 5.5, trend: "down", sparkline: [7.8, 7.5, 7.0, 6.5, 6.0, 5.8, 5.5, 5.5] },
  { name: "Initiative & Voice", score: 5.3, trend: "down", sparkline: [6.5, 6.2, 6.0, 5.8, 5.8, 5.5, 5.5, 5.3] },
  { name: "Self-Awareness", score: 5.2, trend: "down", sparkline: [6.8, 6.5, 6.2, 6.0, 5.8, 5.5, 5.3, 5.2] },
  { name: "Curiosity & Learning", score: 4.8, trend: "down", sparkline: [6.0, 5.8, 5.5, 5.5, 5.2, 5.0, 5.0, 4.8] },
];

const getScoreColor = (score: number) => {
  if (score >= 7) return "#22C55E";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
};

const getTrendColor = (sparkline: number[]) => {
  const first = sparkline[0];
  const last = sparkline[sparkline.length - 1];
  const diff = last - first;
  if (diff > 0.3) return "#22C55E";
  if (diff < -0.3) return "#EF4444";
  return "#9CA3AF";
};

const getTrendLabel = (sparkline: number[]) => {
  const first = sparkline[0];
  const last = sparkline[sparkline.length - 1];
  const diff = last - first;
  const absDiff = Math.abs(diff).toFixed(1);
  if (diff > 0.3) return `+${absDiff}`;
  if (diff < -0.3) return `−${absDiff}`;
  return "—";
};

const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 48;
  const height = 16;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={2} fill={color} />
    </svg>
  );
};

const DevelopmentBarStack: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const improving = dimensions.filter(d => d.sparkline[d.sparkline.length - 1] - d.sparkline[0] > 0.3).length;
  const steady = dimensions.filter(d => Math.abs(d.sparkline[d.sparkline.length - 1] - d.sparkline[0]) <= 0.3).length;
  const declining = dimensions.filter(d => d.sparkline[d.sparkline.length - 1] - d.sparkline[0] < -0.3).length;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E8E8",
        borderRadius: 10,
        padding: 24,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <h3
        className="font-heading"
        style={{ fontSize: 17, fontWeight: 500, color: "#0F0F0F", marginBottom: 4 }}
      >
        Your development profile
      </h3>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
        Blended from your self-assessment and manager observations · 12 weeks
      </p>

      <div>
        {dimensions.map((dim, i) => {
          const barColor = getScoreColor(dim.score);
          const trendColor = getTrendColor(dim.sparkline);
          const trendLabel = getTrendLabel(dim.sparkline);
          const isBottomGroup = i >= 6;

          return (
            <div
              key={dim.name}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 48px 36px",
                alignItems: "center",
                gap: 8,
                padding: "10px 4px",
                borderBottom: i < dimensions.length - 1 ? "1px solid #F5F5F5" : "none",
                background: isBottomGroup ? "#FEFCE8" : "transparent",
                borderRadius: isBottomGroup && i === 6 ? "4px 4px 0 0" : isBottomGroup && i === 8 ? "0 0 4px 4px" : undefined,
                transition: "background 100ms ease",
                cursor: "default",
              }}
              className="dimension-row-hover"
            >
              {/* Name */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {dim.name}
              </span>

              {/* Bar */}
              <div
                style={{
                  position: "relative",
                  height: 8,
                  background: "#F3F4F6",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: barColor,
                    width: animated ? `${(dim.score / 10) * 100}%` : "0%",
                    transition: `width 500ms ease-out`,
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>

              {/* Score */}
              <span
                className="font-mono-data"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: barColor,
                  textAlign: "right",
                }}
              >
                {dim.score.toFixed(1)}
              </span>

              {/* Trend change label */}
              <span
                className="font-mono-data"
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: trendColor,
                  textAlign: "right",
                }}
              >
                {trendLabel}
              </span>

              {/* Mini sparkline */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <MiniSparkline data={dim.sparkline} color={trendColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 16 }}>
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#22C55E" }}>{improving}</span>
        {" improving · "}
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#9CA3AF" }}>{steady}</span>
        {" steady · "}
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#EF4444" }}>{declining}</span>
        {" declining"}
      </p>
    </div>
  );
};

export default DevelopmentBarStack;
