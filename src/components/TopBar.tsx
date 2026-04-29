import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Kept exported for compatibility with any importers; no longer used to switch tabs.
export type ViewTab = "graduate" | "manager" | "peer";

const TopBar: React.FC = () => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initials = (user?.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        {user?.company_name && (
          <>
            <div
              style={{
                width: 1,
                height: 20,
                background: "#E0E0E0",
                margin: "0 12px",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF" }}>
              {user.company_name}
            </span>
          </>
        )}
      </div>

      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 transition-colors"
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: menuOpen ? "#F3F4F6" : "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            if (!menuOpen) e.currentTarget.style.background = "#FAFAFA";
          }}
          onMouseLeave={(e) => {
            if (!menuOpen) e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#DCFCE7",
              color: "#15803D",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
          <div className="flex flex-col items-start" style={{ lineHeight: 1.1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0F0F0F" }}>
              {user?.full_name ?? "Loading…"}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#9CA3AF",
                textTransform: "capitalize",
              }}
            >
              {user?.role ?? ""}
            </span>
          </div>
          <ChevronDown size={14} color="#9CA3AF" />
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "100%",
              marginTop: 6,
              background: "#FFFFFF",
              border: "1px solid #E8E8E8",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              minWidth: 180,
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ fontSize: 12, color: "#6B7280" }}>{user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full"
              style={{
                padding: "10px 14px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "#0F0F0F",
                textAlign: "left",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#FAFAFA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
