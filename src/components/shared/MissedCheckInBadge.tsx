import React from "react";

export function MissedCheckInBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-data uppercase tracking-wider rounded-md border-l-[3px]"
      style={{
        backgroundColor: "#F3F4F6",
        color: "#6B7280",
        borderLeftColor: "#9CA3AF",
        letterSpacing: "0.05em",
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: "#9CA3AF" }}
      />
      No check-in this week
    </span>
  );
}