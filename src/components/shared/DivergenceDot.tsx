import React from "react";

export interface DivergenceDotProps {
  selfScore: number;
  managerScore: number;
  peerScore?: number;
  min?: number;
  max?: number;
  maxGap: number;
  delay: number;
  animated: boolean;
}

const getGapColor = (gap: number) => {
  if (gap > 2.5) return "#EF4444";
  if (gap >= 1.5) return "#F59E0B";
  return "#22C55E";
};

export function DivergenceDot({
  selfScore,
  managerScore,
  peerScore,
  min = 1,
  max = 10,
  maxGap,
  delay,
  animated,
}: DivergenceDotProps) {
  const color = getGapColor(maxGap);
  const range = max - min;
  const selfPos = ((selfScore - min) / range) * 100;
  const managerPos = ((managerScore - min) / range) * 100;
  const peerPos = peerScore != null ? ((peerScore - min) / range) * 100 : null;
  const allPositions = [selfPos, managerPos, ...(peerPos != null ? [peerPos] : [])];
  const left = Math.min(...allPositions);
  const right = Math.max(...allPositions);
  const width = right - left;
  const center = 50;

  type DotInfo = { pos: number; color: string; label: string; z: number };
  const dots: DotInfo[] = [
    { pos: selfPos, color: "#6366F1", label: String(selfScore), z: 3 },
    { pos: managerPos, color: "#22C55E", label: String(managerScore), z: 2 },
    ...(peerPos != null && peerScore != null ? [{ pos: peerPos, color: "#F59E0B", label: String(peerScore), z: 1 }] : []),
  ];

  const sorted = [...dots].sort((a, b) => a.pos - b.pos);
  const labelOffsets: Map<DotInfo, number> = new Map();
  sorted.forEach((dot, i) => {
    let yOff = 20;
    if (i > 0) {
      const prev = sorted[i - 1];
      const gap = Math.abs(dot.pos - prev.pos);
      if (gap < 6) {
        const prevOff = labelOffsets.get(prev) ?? 20;
        yOff = prevOff === 20 ? -4 : 20;
      }
    }
    labelOffsets.set(dot, yOff);
  });

  return (
    <div style={{ position: "relative", height: 32, width: "100%" }}>
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 1, background: "#E8E8E8" }} />
      <div style={{
        position: "absolute", top: 13, height: 2, background: color, borderRadius: 1, opacity: 0.4,
        left: animated ? `${left}%` : `${center}%`,
        width: animated ? `${width}%` : "0%",
        transition: `left 500ms ease-out ${delay + 800}ms, width 500ms ease-out ${delay + 800}ms`,
      }} />
      {dots.map((dot, i) => {
        const labelY = labelOffsets.get(dot) ?? 20;
        return (
          <React.Fragment key={i}>
            <div style={{
              position: "absolute", top: 9, width: 10, height: 10, borderRadius: "50%",
              background: dot.color, boxShadow: `0 1px 3px ${dot.color}44`,
              left: animated ? `calc(${dot.pos}% - 5px)` : `calc(${center}% - 5px)`,
              transition: `left 500ms ease-out ${delay + 800}ms`, zIndex: dot.z,
            }} />
            <span className="font-mono-data" style={{
              position: "absolute", top: labelY, fontSize: 9, color: dot.color, whiteSpace: "nowrap",
              left: animated ? `calc(${dot.pos}% - 6px)` : `calc(${center}% - 6px)`,
              transition: `left 500ms ease-out ${delay + 800}ms`,
            }}>{dot.label}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}
