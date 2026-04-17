import React, { useState, useCallback } from "react";
import TopBar, { type ViewTab } from "@/components/TopBar";
import AppSidebar from "@/components/AppSidebar";
import PagePlaceholder from "@/components/PagePlaceholder";
import MyVitals from "@/components/vitals/MyVitals";
import MySkills from "@/components/skills/MySkills";
import WeeklyCheckIn from "@/components/graduate/WeeklyCheckIn";
import TeamBrief from "@/components/manager/TeamBrief";
import AssessTeam from "@/components/manager/AssessTeam";
import GraduateProfile from "@/components/manager/GraduateProfile";
import PeerCheckIn from "@/components/peer/PeerCheckIn";

const defaultNav: Record<ViewTab, string> = {
  graduate: "my-development",
  manager: "team-brief",
  peer: "peer-checkin",
};

const Index: React.FC = () => {

  const [activeTab, setActiveTab] = useState<ViewTab>("graduate");
  const [activeNav, setActiveNav] = useState<string>("my-development");
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
    if (activeNav === "my-development") return <MyVitals onStartCheckIn={() => handleNavChange("weekly-checkin")} />;
    if (activeNav === "my-skills") return <MySkills />;
    if (activeNav === "weekly-checkin") return <WeeklyCheckIn />;
    if (activeNav === "team-brief") {
      if (selectedGraduateId) {
        return <GraduateProfile graduateId={selectedGraduateId!} onBack={() => { setSelectedGraduateId(null); setPageKey((k) => k + 1); }} />;
      }
      return <TeamBrief onSelectGraduate={(id) => { setSelectedGraduateId(id); setPageKey((k) => k + 1); }} />;
    }
    
    if (activeNav === "assess-team") return <AssessTeam />;
    if (activeNav === "peer-checkin") return <PeerCheckIn />;
    return <PagePlaceholder title="Page" />;
  };

  const handleTestComputeWeeklyGaps = useCallback(async () => {
    const result = await supabase.functions.invoke("compute-weekly-gaps", {
      body: {
        graduate_id: "cccc0001-0000-0000-0000-000000000001",
        week_number: 12,
      },
    });
    console.log("compute-weekly-gaps response:", result);
    if (result.error) {
      toast.error(`Failed: ${result.error.message ?? String(result.error)}`);
    } else {
      const gaps = (result.data as any)?.gaps_computed ?? 0;
      toast.success(`Success: ${gaps} gaps computed`);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FAFAFA" }}>
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
      <button
        onClick={handleTestComputeWeeklyGaps}
        style={{
          position: "fixed",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 999999,
          background: "#FF00AA",
          color: "white",
          padding: "14px 24px",
          border: "3px solid black",
          borderRadius: 8,
          fontWeight: 800,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        }}
      >
        ▶ Test compute-weekly-gaps
      </button>
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
