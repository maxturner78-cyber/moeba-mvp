import React from "react";
import { type Status } from "@/data/sampleData";
import { statusBadgeStyles, statusLabels } from "@/data/teamData";

const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const s = statusBadgeStyles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        background: s.bg,
        color: s.color,
        borderRadius: 100,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {statusLabels[status]}
    </span>
  );
};

export default StatusBadge;
