import React from "react";
import { ChevronRight } from "lucide-react";
import { teamGraduates, statusColors } from "@/data/teamData";
import StatusBadge from "@/components/StatusBadge";

interface MyTeamProps {
  onSelectGraduate: (id: string) => void;
}

const MyTeam: React.FC<MyTeamProps> = ({ onSelectGraduate }) => {
  return (
    <div>
      <h1 className="font-heading" style={{ fontSize: 26, fontWeight: 700, color: "#0F0F0F", letterSpacing: "-0.02em", marginBottom: 24 }}>
        My Team
      </h1>

      <div
        style={{
          background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          overflow: "hidden",
        }}
      >
        {teamGraduates.map((g, i) => {
          const sc = statusColors[g.status];
          return (
            <div
              key={g.id}
              onClick={() => onSelectGraduate(g.id)}
              className="flex items-center transition-colors"
              style={{
                padding: "16px 20px",
                borderBottom: i < teamGraduates.length - 1 ? "1px solid #F3F4F6" : "none",
                cursor: "pointer",
                gap: 16,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: sc.bg, color: sc.text,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {g.initials}
              </div>

              {/* Name + role */}
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{g.role} · W{g.week}</div>
              </div>

              {/* Status badge */}
              <div style={{ width: 130, flexShrink: 0 }}>
                <StatusBadge status={g.status} />
              </div>

              {/* Signal */}
              <div
                style={{
                  flex: 1, fontSize: 13, color: "#374151",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              >
                {g.signal}
              </div>

              {/* Chevron */}
              <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTeam;
