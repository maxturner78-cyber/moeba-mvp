import React, { useState, useCallback } from "react";
import TopBar, { type ViewTab } from "@/components/TopBar";
import AppSidebar from "@/components/AppSidebar";
import PagePlaceholder from "@/components/PagePlaceholder";
import MyVitals from "@/components/vitals/MyVitals";
import MySkills from "@/components/skills/MySkills";
import MyTeam from "@/components/manager/MyTeam";
import GraduateProfile from "@/components/manager/GraduateProfile";
import WeeklyCheckIn from "@/components/graduate/WeeklyCheckIn";
import AssessTeam from "@/components/manager/AssessTeam";
import MyCoach from "@/components/graduate/MyCoach";
import TeamBrief from "@/components/manager/TeamBrief";

const defaultNav: Record<ViewTab, string> = {
  graduate: "my-vitals",
  manager: "my-team",
};

const navTitles: Record<string, string> = {
  "my-vitals": "My Vitals",
  "my-skills": "My Skills",
  "weekly-checkin": "Weekly Check-In",
  "my-team": "My Team",
  "assess-team": "Assess Team",
};

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewTab>("graduate");
  const [activeNav, setActiveNav] = useState<string>("my-vitals");
  const [selectedGraduateId, setSelectedGraduateId] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState(0);

  const handleTabChange = useCallback((tab: ViewTab) => {
    setActiveTab(tab);
    setActiveNav(defaultNav[tab]);
    setSelectedGraduateId(null);
    setPageKey((k) => k + 1);
  }, []);

  const handleNavChange = useCallback((id: string) => {
    setActiveNav(id);
    setSelectedGraduateId(null);
    setPageKey((k) => k + 1);
  }, []);

  const renderPage = () => {
    if (activeNav === "my-vitals") return <MyVitals />;
    if (activeNav === "my-skills") return <MySkills />;
    if (activeNav === "weekly-checkin") return <WeeklyCheckIn />;
    if (activeNav === "my-team") {
      if (selectedGraduateId) {
        return <GraduateProfile onBack={() => { setSelectedGraduateId(null); setPageKey((k) => k + 1); }} />;
      }
      return <MyTeam onSelectGraduate={(id) => { setSelectedGraduateId(id); setPageKey((k) => k + 1); }} />;
    }
    if (activeNav === "assess-team") return <AssessTeam />;
    return <PagePlaceholder title={navTitles[activeNav] || "Page"} />;
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FAFAFA" }}>
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          activeNav={activeNav}
          onNavChange={handleNavChange}
        />
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: 32, background: "#FAFAFA" }}
        >
          <div key={pageKey} className="gs-page-enter" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
