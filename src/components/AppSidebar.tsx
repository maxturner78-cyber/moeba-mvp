import React from "react";
import {
  Activity,
  Sparkles,
  ClipboardCheck,
  Shield,
  Users,
  ClipboardList,
  FileText,
  MessageCircle,
  LayoutGrid,
  Grid3X3,
  UserCog,
  Download,
} from "lucide-react";
import type { ViewTab } from "./TopBar";

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; strokeWidth?: number }>;
  section?: string;
}

const navConfig: Record<ViewTab, NavItem[]> = {
  graduate: [
    { id: "my-vitals", label: "My Vitals", icon: Activity },
    { id: "my-skills", label: "My Skills", icon: Sparkles },
    { id: "weekly-checkin", label: "Weekly Check-In", icon: ClipboardCheck },
    { id: "need-support", label: "Need Support?", icon: Shield },
  ],
  manager: [
    { id: "my-team", label: "My Team", icon: Users },
    { id: "assess-team", label: "Assess Team", icon: ClipboardList },
    { id: "checkin-briefs", label: "Check-In Briefs", icon: FileText },
  ],
  peer: [
    { id: "peer-feedback", label: "Peer Feedback", icon: MessageCircle },
  ],
  hr: [
    { id: "program-overview", label: "Program Overview", icon: LayoutGrid },
    { id: "cohort-map", label: "Cohort Map", icon: Grid3X3 },
    { id: "manager-effectiveness", label: "Manager Effectiveness", icon: UserCog },
    { id: "reports", label: "Reports", icon: Download },
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
        background: "#111111",
        minHeight: "100%",
        paddingTop: 16,
      }}
    >
      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(255,255,255,0.25)",
          marginTop: 8,
          marginBottom: 8,
          paddingLeft: 14,
        }}
      >
        {activeTab === "graduate" ? "INSIGHTS" : activeTab === "manager" ? "TEAM" : activeTab === "peer" ? "FEEDBACK" : "ADMIN"}
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {items.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className="flex items-center text-left transition-colors"
              style={{
                padding: "9px 14px",
                fontSize: 14,
                fontWeight: 400,
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                borderLeft: isActive ? "2px solid #22C55E" : "2px solid transparent",
                gap: 10,
                width: "100%",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
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
