import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import AppSidebar from "@/components/AppSidebar";
import PagePlaceholder from "@/components/PagePlaceholder";
import MyVitals from "@/components/vitals/MyVitals";
import MySkills from "@/components/skills/MySkills";
import WeeklyCheckIn from "@/components/graduate/WeeklyCheckIn";
import TeamBrief from "@/components/manager/TeamBrief";
import AssessTeam from "@/components/manager/AssessTeam";
import GraduateProfile from "@/components/manager/GraduateProfile";
import PeerCheckIn from "@/components/peer/PeerCheckIn";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const defaultNavByRole: Record<string, string> = {
  graduate: "my-development",
  manager: "team-brief",
  peer: "peer-checkin",
  admin: "admin",
};

const Index: React.FC = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const role = user?.role;

  const [activeNav, setActiveNav] = useState<string>("my-development");
  const [selectedGraduateId, setSelectedGraduateId] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState(0);

  // Reset default nav when role becomes available / changes
  useEffect(() => {
    if (role) {
      setActiveNav(defaultNavByRole[role] ?? "my-development");
      setSelectedGraduateId(null);
      setPageKey((k) => k + 1);
    }
  }, [role]);

  // Admins should be redirected to /admin
  useEffect(() => {
    if (role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [role, navigate]);

  const handleNavChange = useCallback((id: string) => {
    setActiveNav(id);
    setSelectedGraduateId(null);
    setPageKey((k) => k + 1);
  }, []);

  const renderPage = () => {
    if (role === "graduate") {
      if (activeNav === "my-development")
        return <MyVitals onStartCheckIn={() => handleNavChange("weekly-checkin")} />;
      if (activeNav === "my-skills") return <MySkills />;
      if (activeNav === "weekly-checkin") return <WeeklyCheckIn />;
    }
    if (role === "manager") {
      if (activeNav === "team-brief") {
        if (selectedGraduateId) {
          return (
            <GraduateProfile
              graduateId={selectedGraduateId!}
              onBack={() => {
                setSelectedGraduateId(null);
                setPageKey((k) => k + 1);
              }}
            />
          );
        }
        return (
          <TeamBrief
            onSelectGraduate={(id) => {
              setSelectedGraduateId(id);
              setPageKey((k) => k + 1);
            }}
          />
        );
      }
      if (activeNav === "assess-team") return <AssessTeam />;
    }
    if (role === "peer") {
      if (activeNav === "peer-checkin") return <PeerCheckIn />;
    }
    if (role === "admin") {
      return <PagePlaceholder title="Welcome admin — redirecting…" />;
    }
    return <PagePlaceholder title="Page" />;
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#FAFAFA" }}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {role && role !== "admin" && (
          <AppSidebar
            activeTab={role as "graduate" | "manager" | "peer"}
            activeNav={activeNav}
            onNavChange={handleNavChange}
          />
        )}
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
