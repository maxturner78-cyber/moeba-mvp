import React from "react";

export interface FocusAreaPayloadItem {
  dimension_key: string;
  label: string;
  current_score: number;
  trend: string;
  coaching_text: string;
  how_manager_can_help?: string;
}

interface FocusAreaCardProps {
  area: FocusAreaPayloadItem;
  showManagerHelp: boolean;
}

const FocusAreaCard: React.FC<FocusAreaCardProps> = ({ area, showManagerHelp }) => {
  const isDeclining = /declin/i.test(area.trend);
  const isImproving = /improv/i.test(area.trend);
  const trendColor = isDeclining ? "#EF4444" : isImproving ? "#22C55E" : "#9CA3AF";
  const trendArrow = isDeclining ? "↓" : isImproving ? "↑" : "→";

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E8E8",
        borderRadius: 10,
        padding: "20px 20px 20px 24px",
        position: "relative",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          background: "#F59E0B",
          borderRadius: 2,
        }}
      />
      <div
        className="font-heading"
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#B45309",
          marginBottom: 8,
        }}
      >
        {area.label}
      </div>
      <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
        <span
          className="font-mono-data"
          style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}
        >
          {Number(area.current_score).toFixed(1)}
        </span>
        <span style={{ fontSize: 12, color: trendColor }}>
          {trendArrow} {area.trend}
        </span>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "#374151",
          lineHeight: 1.6,
          marginBottom: showManagerHelp && area.how_manager_can_help ? 12 : 0,
        }}
      >
        {area.coaching_text}
      </p>
      {showManagerHelp && area.how_manager_can_help && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#15803D",
              marginBottom: 6,
            }}
          >
            How You Can Help
          </div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            {area.how_manager_can_help}
          </p>
        </>
      )}
    </div>
  );
};

export default FocusAreaCard;