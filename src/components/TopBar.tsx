import React from "react";

export type ViewTab = "graduate" | "manager" | "peer";

interface TopBarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
}

const tabs: { id: ViewTab; label: string }[] = [
  { id: "graduate", label: "Graduate" },
  { id: "manager", label: "Manager" },
  { id: "peer", label: "Peer" },
];

const TopBar: React.FC<TopBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <header
      className="flex items-center justify-between shrink-0"
      style={{
        height: 48,
        background: "#FFFFFF",
        borderBottom: "1px solid #E8E8E8",
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <div className="flex items-center gap-0">
        <span
          className="font-heading"
          style={{ fontWeight: 700, fontSize: 17, color: "#0F0F0F" }}
        >
          Moeba
        </span>
        <div
          style={{
            width: 1,
            height: 20,
            background: "#E0E0E0",
            margin: "0 12px",
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>
          Swan Group
        </span>
      </div>

      <nav className="flex items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative transition-colors"
              style={{
                padding: "14px 16px",
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#0F0F0F" : "#9CA3AF",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = "#525252";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = "#9CA3AF";
              }}
            >
              {tab.label}
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 16,
                    right: 16,
                    height: 2,
                    background: "#22C55E",
                    borderRadius: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default TopBar;
