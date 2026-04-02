import React, { useEffect, useState } from "react";

type Trend = "up" | "down" | "stable";

interface DimensionRow {
  name: string;
  score: number;
  trend: Trend;
  benchmark: number;
  sparkline: number[];
}

const dimensions: DimensionRow[] = [
  { name: "Feedback Application", score: 8.1, trend: "up", benchmark: 7.2, sparkline: [7.0, 7.5, 7.8, 7.5, 8.0, 7.8, 8.0, 8.1] },
  { name: "Team Connection", score: 7.4, trend: "up", benchmark: 6.8, sparkline: [6.2, 6.5, 6.8, 7.0, 7.0, 7.2, 7.3, 7.4] },
  { name: "Manager Relationship", score: 7.1, trend: "up", benchmark: 6.9, sparkline: [6.0, 6.2, 6.5, 6.8, 6.8, 7.0, 7.0, 7.1] },
  { name: "Resilience", score: 6.8, trend: "stable", benchmark: 6.5, sparkline: [6.5, 6.8, 6.5, 6.2, 6.5, 6.8, 6.8, 6.8] },
  { name: "Workload Management", score: 6.0, trend: "stable", benchmark: 6.3, sparkline: [6.5, 6.2, 6.5, 6.0, 6.0, 6.2, 5.8, 6.0] },
  { name: "Confidence Stability", score: 5.5, trend: "down", benchmark: 6.8, sparkline: [7.8, 7.5, 7.0, 6.5, 6.0, 5.8, 5.5, 5.5] },
  { name: "Initiative & Voice", score: 5.3, trend: "down", benchmark: 6.4, sparkline: [6.5, 6.2, 6.0, 5.8, 5.8, 5.5, 5.5, 5.3] },
  { name: "Self-Awareness", score: 5.2, trend: "down", benchmark: 6.5, sparkline: [6.8, 6.5, 6.2, 6.0, 5.8, 5.5, 5.3, 5.2] },
  { name: "Curiosity & Learning", score: 4.8, trend: "down", benchmark: 6.2, sparkline: [6.0, 5.8, 5.5, 5.5, 5.2, 5.0, 5.0, 4.8] },
];

const getScoreColor = (score: number) => {
  if (score >= 7) return "#22C55E";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
};


const DevelopmentBarStack: React.FC = () => {
  const [animated, setAnimated] = useState(false);
  const [hoveredBenchmark, setHoveredBenchmark] = useState<number | null>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const above = dimensions.filter(d => d.score > d.benchmark).length;
  const atAvg = dimensions.filter(d => Math.abs(d.score - d.benchmark) <= 0.3).length;
  const below = dimensions.filter(d => d.score < d.benchmark - 0.3).length;

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
        style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 4 }}
      >
        Development Profile
      </h3>
      <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 20 }}>
        Blended from your self-assessment, manager observations, and peer feedback
      </p>

      <div>
        {dimensions.map((dim, i) => {
          const barColor = getScoreColor(dim.score);
          const { Icon, color: trendColor } = getTrendConfig(dim.trend);
          const isBottomGroup = i >= 6;

          return (
            <div
              key={dim.name}
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 48px",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: i < dimensions.length - 1 ? "1px solid #F5F5F5" : "none",
                background: isBottomGroup ? "#FEFCE8" : "transparent",
                borderRadius: isBottomGroup && i === 6 ? "4px 4px 0 0" : isBottomGroup && i === 8 ? "0 0 4px 4px" : undefined,
                paddingLeft: 4,
                paddingRight: 4,
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
                  overflow: "visible",
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
                {/* Benchmark marker */}
                <div
                  style={{
                    position: "absolute",
                    left: `${(dim.benchmark / 10) * 100}%`,
                    top: -4,
                    width: 2,
                    height: 16,
                    background: "rgba(15,15,15,0.15)",
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredBenchmark(i)}
                  onMouseLeave={() => setHoveredBenchmark(null)}
                >
                  {hoveredBenchmark === i && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 22,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#111111",
                        borderRadius: 6,
                        padding: "6px 10px",
                        whiteSpace: "nowrap",
                        fontSize: 11,
                        color: "#FFFFFF",
                        zIndex: 10,
                      }}
                    >
                      Cohort average: {dim.benchmark}
                    </div>
                  )}
                </div>
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

              {/* Trend */}
              <Icon size={14} color={trendColor} strokeWidth={2} />

              {/* Sparkline */}
              <MicroSparkline data={dim.sparkline} color={trendColor} />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 16 }}>
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#22C55E" }}>{above}</span>
        {" dimensions above cohort average · "}
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#9CA3AF" }}>{atAvg}</span>
        {" at average · "}
        <span className="font-mono-data" style={{ fontWeight: 600, color: "#F59E0B" }}>{below}</span>
        {" below average"}
      </p>
    </div>
  );
};

export default DevelopmentBarStack;
