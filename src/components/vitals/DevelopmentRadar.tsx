import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const currentData = [
  { dimension: "Ownership & Follow-Through", value: 5.2, prev: 6.0 },
  { dimension: "Confidence", value: 5.5, prev: 7.0 },
  { dimension: "Curiosity", value: 4.8, prev: 5.5 },
  { dimension: "Manager Rel.", value: 7.1, prev: 6.5 },
  { dimension: "Team Connection", value: 7.4, prev: 6.8 },
  { dimension: "Feedback", value: 8.1, prev: 7.5 },
  { dimension: "Workload", value: 6.0, prev: 6.5 },
  { dimension: "Initiative", value: 5.3, prev: 6.0 },
  { dimension: "Resilience", value: 6.8, prev: 6.5 },
];

const CustomAngleAxisTick = ({ payload, x, y, cx, cy }: any) => {
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nudge = 14;
  const nx = x + (dx / len) * nudge;
  const ny = y + (dy / len) * nudge;

  return (
    <text
      x={nx}
      y={ny}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: 11,
        fontFamily: "Inter, sans-serif",
        fill: "#9CA3AF",
      }}
    >
      {payload.value}
    </text>
  );
};

const DevelopmentRadar: React.FC = () => {
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

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <RadarChart data={currentData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#F0F0F0" />
            <PolarAngleAxis dataKey="dimension" tick={CustomAngleAxisTick} />
            <Radar
              name="4 weeks ago"
              dataKey="prev"
              stroke="#D1D5DB"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="transparent"
              dot={false}
            />
            <Radar
              name="Current"
              dataKey="value"
              stroke="#22C55E"
              strokeWidth={2}
              fill="#22C55E"
              fillOpacity={0.12}
              dot={{
                r: 5,
                fill: "#22C55E",
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 justify-center" style={{ marginTop: 8, marginBottom: 4 }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 2, background: "#22C55E", borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 2, background: "#D1D5DB", borderRadius: 1, borderTop: "1px dashed #D1D5DB" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>4 weeks ago</span>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentRadar;
