import React, { useState } from "react";
import SkillsGraph from "@/components/skills/SkillsGraph";
import { getSnapshot } from "@/data/skillsData";

const MySkills: React.FC = () => {
  const [month, setMonth] = useState(3);
  const snapshot = getSnapshot(month);

  const developed = snapshot.nodes.filter((n) => n.proficiency > 6).length;
  const developing = snapshot.nodes.filter((n) => n.proficiency > 0 && n.proficiency <= 6).length;
  const notStarted = snapshot.nodes.filter((n) => n.proficiency === 0 && !n.promotionRequired).length;
  const promoRequired = snapshot.nodes.filter((n) => n.promotionRequired).length;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 112px)" }}>
      {/* Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 20, flexShrink: 0 }}>
        <div>
          <h1
            className="font-heading"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#0F0F0F",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            My Skills
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            Your growing competency constellation — each node is a skill, sized by your proficiency
          </p>
        </div>

        {/* Time slider */}
        <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
          <span
            className="font-mono-data"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: month === 1 ? "#0F0F0F" : "#9CA3AF",
            }}
          >
            Month 1
          </span>
          <input
            type="range"
            min={1}
            max={3}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={{
              width: 120,
              accentColor: "#22C55E",
              cursor: "pointer",
            }}
          />
          <span
            className="font-mono-data"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: month === 3 ? "#0F0F0F" : "#9CA3AF",
            }}
          >
            Month 3
          </span>
        </div>
      </div>

      {/* Graph canvas */}
      <div
        style={{
          flex: 1,
          minHeight: 600,
          background: "#FFFFFF",
          borderRadius: 10,
          border: "1px solid #E8E8E8",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SkillsGraph month={month} />

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            right: 16,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid #E8E8E8",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
            zIndex: 10,
          }}
        >
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Developed skill</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", opacity: 0.5 }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Developing</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px dashed #F59E0B" }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Required for promotion</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 10, height: 10, borderRadius: "50%", border: "1.5px solid #D1D5DB" }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Not yet started</span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 20, height: 0, borderTop: "1px solid #E5E5E5" }} />
            <span style={{ fontSize: 11, color: "#6B7280" }}>Related skills</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div
        className="flex items-center gap-1 flex-wrap"
        style={{ marginTop: 16, flexShrink: 0 }}
      >
        <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>
          {snapshot.nodes.length}
        </span>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>skills tracked</span>
        <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>

        <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#22C55E" }}>
          {developing}
        </span>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>developing</span>
        <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>

        <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>
          {notStarted}
        </span>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>not yet started</span>
        <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>

        <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>
          {promoRequired}
        </span>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>required for promotion</span>
      </div>
    </div>
  );
};

export default MySkills;
