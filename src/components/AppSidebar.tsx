import React from "react";
import { LucideIcon } from "lucide-react";
import {
  Activity,
  Sparkles,
  ClipboardCheck,
  Users,
  ClipboardList,
  MessageSquare,
  Zap,
} from "lucide-react";
import type { ViewTab } from "./TopBar";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const navConfig: Record<ViewTab, NavItem[]> = {
  graduate: [
    { id: "my-vitals", label: "My Vitals", icon: Activity },
    { id: "my-skills", label: "My Skills", icon: Sparkles },
    { id: "weekly-checkin", label: "Weekly Check-In", icon: ClipboardCheck },
    { id: "my-coach", label: "My Coach", icon: MessageSquare },
  ],
  manager: [
    { id: "my-team", label: "My Team", icon: Users },
    { id: "assess-team", label: "Assess Team", icon: ClipboardList },
    { id: "team-brief", label: "Team Brief", icon: Zap },
  ],
};

interface SidebarProps {
  activeTab: ViewTab;
  activeNav: string;
  onNavChange: (id: string) => void;
}

const AppSidebar: React.FC<SidebarProps> = ({ activeTab, activeNav, onNavChange }) => {
  const items = navConfig[activeTab];

  return (
    <aside
      className="shrink-0 flex flex-col"
      style={{
        width: 220,
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        minHeight: "100%",
        paddingTop: 16,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(0,0,0,0.3)",
          marginTop: 8,
          marginBottom: 8,
          paddingLeft: 14,
        }}
      >
        {activeTab === "graduate" ? "INSIGHTS" : "TEAM"}
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {items.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="flex items-center text-left"
              style={{
                padding: "9px 14px",
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#0F0F0F" : "rgba(0,0,0,0.45)",
                background: isActive ? "rgba(0,0,0,0.05)" : "transparent",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                borderLeft: isActive ? "2px solid #22C55E" : "2px solid transparent",
                gap: 10,
                width: "100%",
                transition: "color 120ms ease, background 120ms ease",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(0,0,0,0.7)";
                  e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(0,0,0,0.45)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <item.icon size={17} strokeWidth={1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default AppSidebar;
