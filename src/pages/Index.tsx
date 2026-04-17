import React, { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

  const handleRecomputeAll = useCallback(async () => {
    const graduateIds = [
      "cccc0001-0000-0000-0000-000000000001",
      "cccc0002-0000-0000-0000-000000000002",
      "cccc0003-0000-0000-0000-000000000003",
      "cccc0004-0000-0000-0000-000000000004",
      "cccc0005-0000-0000-0000-000000000005",
      "cccc0006-0000-0000-0000-000000000006",
    ];
    let total = 0;
    const errors: string[] = [];
    for (const id of graduateIds) {
      const result = await supabase.functions.invoke("compute-weekly-gaps", {
        body: { graduate_id: id },
      });
      console.log(`compute-weekly-gaps response for ${id}:`, result);
      if (result.error) {
        errors.push(`${id.slice(0, 8)}: ${result.error.message}`);
      } else {
        total += result.data?.gaps_computed ?? 0;
      }
    }
    if (errors.length > 0) {
      toast.error(`Completed with ${errors.length} error(s). ${total} gaps computed.`);
    } else {
      toast.success(`All done: ${total} gaps computed across ${graduateIds.length} graduates.`);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FAFAFA" }}>
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />
      <button
        onClick={handleRecomputeAll}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          background: "#22C55E",
          color: "white",
          padding: "10px 16px",
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        Recompute all gaps
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
