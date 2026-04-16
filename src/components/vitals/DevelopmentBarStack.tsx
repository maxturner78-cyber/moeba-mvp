import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface DimensionRow {
  key: string;
  label: string;
  currentScore: number;
  priorScore: number;
  delta: number;
  status: "improving" | "declining" | "steady";
}

const getScoreColor = (score: number) => {
  if (score >= 7) return "#22C55E";
  if (score >= 5) return "#F59E0B";
  return "#EF4444";
};

const getStatusColor = (status: DimensionRow["status"]) => {
  if (status === "improving") return "#22C55E";
  if (status === "declining") return "#EF4444";
  return "#9CA3AF";
};

const getDeltaLabel = (delta: number, status: DimensionRow["status"]) => {
  if (status === "improving") return `+${Math.abs(delta).toFixed(1)}`;
  if (status === "declining") return `−${Math.abs(delta).toFixed(1)}`;
  return "—";
};

interface Props {
  dimensions?: DimensionRow[];
  isLoading?: boolean;
}

const DevelopmentBarStack: React.FC<Props> = ({ dimensions, isLoading }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (!isLoading && dimensions) {
      const t = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(t);
    }
  }, [isLoading, dimensions]);

  if (isLoading || !dimensions) {
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
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-64 mb-5" />
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2" style={{ padding: "10px 4px" }}>
            <Skeleton className="h-3 w-[150px]" />
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
    );
  }

  // Sort high to low
  const sorted = [...dimensions].sort((a, b) => b.currentScore - a.currentScore);

  const improving = sorted.filter(d => d.status === "improving").length;
  const steady = sorted.filter(d => d.status === "steady").length;
  const declining = sorted.filter(d => d.status === "declining").length;

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
        Blended from your self-assessment and manager observations
      </p>

      <div>
        {sorted.map((dim, i) => {
          const barColor = getScoreColor(dim.currentScore);
          const statusColor = getStatusColor(dim.status);
          const deltaLabel = getDeltaLabel(dim.delta, dim.status);
          const isBottomGroup = i >= 6;

          return (
            <div
              key={dim.key}
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr 48px 36px",
                alignItems: "center",
                gap: 8,
                padding: "10px 4px",
                borderBottom: i < sorted.length - 1 ? "1px solid #F5F5F5" : "none",
                background: isBottomGroup ? "#FEFCE8" : "transparent",
                borderRadius: isBottomGroup && i === 6 ? "4px 4px 0 0" : isBottomGroup && i === sorted.length - 1 ? "0 0 4px 4px" : undefined,
                transition: "background 100ms ease",
                cursor: "default",
              }}
              className="dimension-row-hover"
            >
              <span
                style={{
                  fontSize: 13, fontWeight: 500, color: "#374151",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                {dim.label}
              </span>

              <div style={{ position: "relative", height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: 8, borderRadius: 4, background: barColor,
                    width: animated ? `${(dim.currentScore / 10) * 100}%` : "0%",
                    transition: "width 500ms ease-out",
                    transitionDelay: `${i * 60}ms`,
                  }}
                />
              </div>

              <span className="font-mono-data" style={{ fontSize: 14, fontWeight: 600, color: barColor, textAlign: "right" }}>
                {dim.currentScore.toFixed(1)}
              </span>

              <span className="font-mono-data" style={{ fontSize: 11, fontWeight: 500, color: statusColor, textAlign: "right" }}>
                {deltaLabel}
              </span>
            </div>
          );
        })}
      </div>

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
