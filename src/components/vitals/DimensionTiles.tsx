import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Trend = "up" | "down" | "flat";

interface DimensionTile {
  name: string;
  score: number;
  trend: Trend;
  sparkline: number[];
}

const tiles: DimensionTile[] = [
  { name: "Self-Awareness", score: 5.2, trend: "down", sparkline: [6.0, 5.8, 5.5, 5.2] },
  { name: "Confidence", score: 5.5, trend: "down", sparkline: [7.0, 6.5, 6.0, 5.5] },
  { name: "Curiosity", score: 4.8, trend: "down", sparkline: [5.5, 5.2, 5.0, 4.8] },
  { name: "Manager Rel.", score: 7.1, trend: "up", sparkline: [6.5, 6.7, 6.9, 7.1] },
  { name: "Team Connection", score: 7.4, trend: "up", sparkline: [6.8, 7.0, 7.2, 7.4] },
  { name: "Feedback", score: 8.1, trend: "up", sparkline: [7.5, 7.7, 7.9, 8.1] },
  { name: "Workload", score: 6.0, trend: "flat", sparkline: [6.5, 6.2, 6.1, 6.0] },
  { name: "Initiative", score: 5.3, trend: "down", sparkline: [6.0, 5.8, 5.5, 5.3] },
  { name: "Resilience", score: 6.8, trend: "flat", sparkline: [6.5, 6.6, 6.7, 6.8] },
];

const trendConfig: Record<Trend, { color: string; Icon: React.ComponentType<any> }> = {
  up: { color: "#22C55E", Icon: TrendingUp },
  down: { color: "#EF4444", Icon: TrendingDown },
  flat: { color: "#9CA3AF", Icon: Minus },
};

const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const width = 40;
  const height = 16;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const DimensionTiles: React.FC = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        marginTop: 16,
      }}
    >
      {tiles.map((tile) => {
        const { color, Icon } = trendConfig[tile.trend];
        return (
          <div
            key={tile.name}
            style={{
              padding: 12,
              border: "1px solid #E8E8E8",
              borderRadius: 8,
              background: "#FFFFFF",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F", marginBottom: 6 }}>
              {tile.name}
            </div>
            <div className="flex items-center justify-between">
              <span
                className="font-mono-data"
                style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}
              >
                {tile.score.toFixed(1)}
              </span>
              <div className="flex items-center gap-1.5">
                <Icon size={13} color={color} strokeWidth={2} />
                <MiniSparkline data={tile.sparkline} color={color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DimensionTiles;
