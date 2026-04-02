import React, { useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

const timelineData = [
  { week: "W1", score: 6.8 },
  { week: "W2", score: 7.0 },
  { week: "W3", score: 6.9 },
  { week: "W4", score: 6.5 },
  { week: "W5", score: 6.8 },
  { week: "W6", score: 7.0 },
  { week: "W7", score: 7.1 },
  { week: "W8", score: 6.9 },
  { week: "W9", score: 6.2 },
  { week: "W10", score: 6.5 },
  { week: "W11", score: 6.4 },
  { week: "W12", score: 6.4 },
];

const annotations = [
  { week: "W4", label: "First client presentation" },
  { week: "W9", label: "Workload spike" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#111111",
        borderRadius: 8,
        padding: "10px 14px",
        border: "none",
      }}
    >
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>
        {label}
      </div>
      <div
        className="font-mono-data"
        style={{ fontSize: 14, color: "#FFFFFF", fontWeight: 500 }}
      >
        {payload[0].value.toFixed(1)}
      </div>
    </div>
  );
};

const ProgressTimeline: React.FC = () => {
  const renderAnnotationDot = useCallback((props: any) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#FFFFFF"
        stroke="#22C55E"
        strokeWidth={2}
      />
    );
  }, []);

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
        style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 20 }}
      >
        Development Journey
      </h3>

      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="#F3F4F6"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="week"
              axisLine={{ stroke: "#E8E8E8" }}
              tickLine={false}
              tick={{ fontSize: 11, fontFamily: "Inter, sans-serif", fill: "#9CA3AF" }}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#22C55E"
              strokeWidth={2}
              fill="url(#greenGrad)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#FFFFFF",
                stroke: "#22C55E",
                strokeWidth: 2,
              }}
            />
            {annotations.map((a) => {
              const point = timelineData.find((d) => d.week === a.week);
              if (!point) return null;
              return (
                <ReferenceDot
                  key={a.week}
                  x={a.week}
                  y={point.score}
                  r={4}
                  fill="#FFFFFF"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  shape={renderAnnotationDot}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 justify-center" style={{ marginTop: 12 }}>
        {annotations.map((a) => (
          <div key={a.week} className="flex items-center gap-1.5">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                border: "2px solid #F59E0B",
                background: "#FFFFFF",
              }}
            />
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>
              {a.week}: {a.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTimeline;
