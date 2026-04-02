import React from "react";
import { CheckCircle } from "lucide-react";
import DevelopmentBarStack from "@/components/vitals/DevelopmentBarStack";

const MyVitals: React.FC = () => {
  return (
    <div>
      {/* SECTION 1: Welcome Header */}
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <h1
            className="font-heading"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#0F0F0F",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Hey Sarah
          </h1>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
            Week 12 at Swan Group
          </p>
          <div className="flex items-center" style={{ gap: 16 }}>
            {[
              { value: "8", label: "week streak" },
              { value: "6.4", label: "overall" },
              { value: "2", label: "focus areas" },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && (
                  <span style={{ color: "#E8E8E8", fontSize: 14 }}>·</span>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-mono-data"
                    style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}
                  >
                    {stat.value}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {stat.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} color="#22C55E" strokeWidth={2} />
            <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 500 }}>
              Check-in complete
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
            Submitted Mar 28
          </span>
        </div>
      </div>

      {/* SECTION 2: Weekly Insight */}
      <div
        style={{
          background: "#F0FDF4",
          border: "1px solid #DCFCE7",
          borderRadius: 10,
          padding: 24,
          paddingLeft: 28,
          position: "relative",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 12,
            bottom: 12,
            width: 3,
            background: "#22C55E",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#22C55E",
            marginBottom: 10,
          }}
        >
          WEEKLY INSIGHT
        </div>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
          Your confidence held steady at 7 this week, and your manager rated your work quality at 8 — that's strong alignment. One thing to watch: your question frequency dropped to 2 this week, down from an average of 5. In weeks where you ask more questions, your output tends to be rated higher. Is there something you're stuck on that you haven't raised yet?
        </p>
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "55% 45%", gap: 24 }}>
        {/* LEFT: Development Bar Stack */}
        <div>
          <DevelopmentBarStack />
        </div>

        {/* RIGHT: Focus Areas */}
        <div>
          <h3
            className="font-heading"
            style={{ fontSize: 17, fontWeight: 600, color: "#0F0F0F", marginBottom: 16 }}
          >
            Focus Areas
          </h3>

          <div className="flex flex-col" style={{ gap: 12 }}>
            {/* Card 1 */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8E8E8",
                borderRadius: 10,
                padding: 20,
                paddingLeft: 24,
                position: "relative",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 12,
                  bottom: 12,
                  width: 3,
                  background: "#F59E0B",
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D97706", marginBottom: 8 }}>
                CURIOSITY & LEARNING
              </div>
              <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
                <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>4.8</span>
                <span style={{ fontSize: 12, color: "#EF4444" }}>↓ declining 3 weeks</span>
              </div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                Your question frequency dropped from 5/week to 2. Try this: before each team meeting, write down one question you'd like to ask. Even "How did you approach that?" counts.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid #E8E8E8",
                borderRadius: 10,
                padding: 20,
                paddingLeft: 24,
                position: "relative",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 12,
                  bottom: 12,
                  width: 3,
                  background: "#F59E0B",
                  borderRadius: 2,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D97706", marginBottom: 8 }}>
                SELF-AWARENESS ALIGNMENT
              </div>
              <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
                <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>5.2</span>
                <span style={{ fontSize: 12, color: "#EF4444" }}>↓ gap widening</span>
              </div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                There's a growing gap between how you rate yourself and how your manager rates you — and they're rating you higher. You may be underestimating your impact. Pay attention to positive feedback this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVitals;
