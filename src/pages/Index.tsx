import React, { useState, useCallback } from "react";
import TopBar, { type ViewTab } from "@/components/TopBar";
import AppSidebar from "@/components/AppSidebar";
import PagePlaceholder from "@/components/PagePlaceholder";

const defaultNav: Record<ViewTab, string> = {
  graduate: "my-vitals",
  manager: "my-team",
  peer: "peer-feedback",
  hr: "program-overview",
};

const navTitles: Record<string, string> = {
  "my-vitals": "My Vitals",
  "my-skills": "My Skills",
  "weekly-checkin": "Weekly Check-In",
  "need-support": "Need Support?",
  "my-team": "My Team",
  "assess-team": "Assess Team",
  "checkin-briefs": "Check-In Briefs",
  "peer-feedback": "Peer Feedback",
  "program-overview": "Program Overview",
  "cohort-map": "Cohort Map",
  "manager-effectiveness": "Manager Effectiveness",
  "reports": "Reports",
};

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>("graduate");
  const [activeNav, setActiveNav] = useState<string>("my-vitals");

  const handleTabChange = useCallback((tab: ViewTab) => {
    setActiveTab(tab);
    setActiveNav(defaultNav[tab]);
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FAFAFA" }}>
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          activeNav={activeNav}
          onNavChange={setActiveNav}
        />
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: 32, background: "#FAFAFA" }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <PagePlaceholder title={navTitles[activeNav] || "Page"} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
