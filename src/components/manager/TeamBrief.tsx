import React from "react";
import { ChevronRight } from "lucide-react";
import { statusColors } from "@/data/teamData";
import StatusBadge from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGraduates, useGraduateStatusBatch } from "@/lib/queries";
import { type Status } from "@/data/sampleData";

interface TeamBriefProps {
  onSelectGraduate: (id: string) => void;
}

const CURRENT_MANAGER_ID = "dddd0001-0000-0000-0000-000000000001"; // David Liu

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const TeamBrief: React.FC<TeamBriefProps> = ({ onSelectGraduate }) => {
  const { data: graduates, isLoading, error } = useGraduates(CURRENT_MANAGER_ID);
  const graduateIds = React.useMemo(() => (graduates ?? []).map((g) => g.id), [graduates]);
  const { data: statusMap } = useGraduateStatusBatch(graduateIds);

  return (
    <div>
      {/* SECTION 1: Team Summary (hardcoded narrative — replaced in Phase 7) */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #DCFCE7",
          borderRadius: 10,
          padding: "24px 28px",
          position: "relative",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0, top: 12, bottom: 12,
            width: 3, background: "#22C55E", borderRadius: 2,
          }}
        />

        <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
          <div
            className="pulse-dot"
            style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
              animation: "pulse-scale 2s ease-in-out infinite",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#15803D" }}>
            Team Brief
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
          Monday w14 · 2 items need attention
        </div>

        <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.7 }}>
          <p style={{ marginBottom: 12 }}>Two people need your attention this week.</p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>Sarah Chen</span> — her perception gap hit{" "}
            <span className="font-mono-data" style={{ fontWeight: 500 }}>3.0</span> points. She rated herself 5, you rated her 8 on the Meridian audit workpapers. This gap has been widening for 3 consecutive weeks. A calibration conversation is recommended — her check-in brief has a conversation guide ready.
          </p>
          <p style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 500 }}>Emily Zhang</span> — workload perception spiked to{" "}
            <span className="font-mono-data" style={{ fontWeight: 500 }}>9/10</span> and her manager support score dropped from 7 to 4. She may feel unsupported during the current client deliverable cycle.
          </p>
          <p>The other 4 graduates are stable. Assessment forms are pre-populated and ready.</p>
        </div>

        <div className="flex items-center gap-2" style={{ marginTop: 20 }}>
          {[
            { label: "Open Sarah's brief →", id: "g1" },
            { label: "Open Emily's brief →", id: "g6" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => onSelectGraduate(btn.id)}
              style={{
                padding: "8px 18px",
                background: "#22C55E",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
                transition: "background 150ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#16A34A"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#22C55E"; }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 2: Graduate List (live from DB) */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E8E8E8",
          borderRadius: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {isLoading && (
          <div className="flex flex-col gap-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4" style={{ padding: "16px 20px", borderBottom: i < 3 ? "1px solid #F3F4F6" : "none" }}>
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex flex-col gap-1" style={{ width: 200 }}>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: "24px 20px", color: "#DC2626", fontSize: 14 }}>
            Failed to load team data. Please try again.
          </div>
        )}

        {!isLoading && !error && graduates?.map((g, i) => {
          const computed = statusMap?.[g.id];
          const status: Status = computed ?? "steady";
          const awaiting = !computed;
          const sc = statusColors[status];
          return (
            <div
              key={g.id}
              onClick={() => onSelectGraduate(g.id)}
              className="flex items-center transition-colors"
              style={{
                padding: "16px 20px",
                borderBottom: i < (graduates.length - 1) ? "1px solid #F3F4F6" : "none",
                cursor: "pointer",
                gap: 16,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: sc.bg, color: sc.text,
                  fontSize: 12, fontWeight: 600,
                }}
              >
                {getInitials(g.full_name)}
              </div>

              <div style={{ width: 200, flexShrink: 0 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}>{g.full_name}</span>
                  {awaiting && (
                    <span style={{ fontSize: 11, color: "#9CA3AF", fontStyle: "italic" }}>(awaiting data)</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>{g.job_title} · W{g.week_number}</div>
              </div>

              <div style={{ width: 130, flexShrink: 0 }}>
                <StatusBadge status={status} />
              </div>

              <div
                style={{
                  flex: 1, fontSize: 13, color: "#374151",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}
              />

              <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center" }}>
        Time saved this quarter: ~10 hours of review preparation auto-generated from continuous data
      </p>

      <style>{`
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default TeamBrief;
