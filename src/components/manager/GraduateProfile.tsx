import React, { useState } from "react";
import { ArrowLeft, Copy, TrendingUp, CheckCircle, Sparkles, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import SkillsGraph from "@/components/skills/SkillsGraph";
import { DivergenceDot } from "@/components/shared/DivergenceDot";
import { getSnapshot } from "@/data/skillsData";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Line, ComposedChart,
} from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { statusLabels } from "@/data/teamData";
import { useGraduate } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { type Status } from "@/data/sampleData";

function deriveStatus(fullName: string): Status {
  switch (fullName) {
    case "Sarah Chen": return "attention";
    case "Emily Zhang": return "attention";
    case "Tyler Morrison": return "stalling";
    case "Marcus Johnson": return "accelerating";
    case "James Park": return "accelerating";
    case "Priya Patel": return "steady";
    default: return "steady";
  }
}

/* ── Data ── */
const weeks = Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}` }));
const confidenceArr = [8, 8, 7, 5, 6, 7, 7, 6, 5, 5, 5, 5];
const selfRatingArr = [7, 7, 6, 5, 6, 6, 6, 5, 5, 5, 5, 5];
const managerRatingArr = [7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8];
const questionsArr = [6, 7, 5, 4, 6, 5, 5, 4, 3, 2, 2, 1];
const workloadArr = [6, 6, 7, 7, 7, 7, 6, 7, 9, 7, 7, 6];

const confData = weeks.map((w, i) => ({ ...w, value: confidenceArr[i] }));
const perfData = weeks.map((w, i) => ({ ...w, self: selfRatingArr[i], manager: managerRatingArr[i] }));
const qData = weeks.map((w, i) => ({ ...w, value: questionsArr[i] }));
const wlData = weeks.map((w, i) => ({ ...w, value: workloadArr[i] }));

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#111", borderRadius: 8, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.stroke || p.fill || p.color }} />
          <span className="font-mono-data" style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Perception Gap Shared ── */
const getGapColor = (gap: number) => {
  if (gap > 2.5) return "#EF4444";
  if (gap >= 1.5) return "#F59E0B";
  return "#22C55E";
};


/* ── Behavioural Perception Gap Data (with peer) ── */
const allBehaviouralGaps = [
  { dim: "Ownership & Follow-Through", self: 5.2, manager: 8.0, peer: 7.2 as number | undefined, maxGap: 2.8 },
  { dim: "Confidence", self: 5.5, manager: 7.8, peer: 6.8 as number | undefined, maxGap: 2.3 },
  { dim: "Curiosity", self: 4.8, manager: 5.5, peer: 5.8 as number | undefined, maxGap: 1.0 },
  { dim: "Manager Relationship", self: 7.1, manager: 7.5, peer: undefined as number | undefined, maxGap: 0.4 },
  { dim: "Team Connection", self: 7.4, manager: 7.8, peer: 8.1 as number | undefined, maxGap: 0.7 },
  { dim: "Feedback Application", self: 8.1, manager: 8.0, peer: 7.5 as number | undefined, maxGap: 0.6 },
  { dim: "Workload Management", self: 6.0, manager: 6.8, peer: 6.5 as number | undefined, maxGap: 0.8 },
  { dim: "Initiative", self: 5.3, manager: 6.5, peer: 7.0 as number | undefined, maxGap: 1.7 },
  { dim: "Resilience", self: 6.8, manager: 7.2, peer: 7.0 as number | undefined, maxGap: 0.4 },
];

/* ── Skills Perception Gap Data (with peer) ── */
const allSkillsGaps = [
  { dim: "Financial Statement Review", self: 5.0, manager: 7.5, peer: 6.8 as number | undefined, maxGap: 2.5 },
  { dim: "Audit Planning", self: 4.5, manager: 6.0, peer: 5.5 as number | undefined, maxGap: 1.5 },
  { dim: "Tax Compliance Basics", self: 3.2, manager: 5.0, peer: 4.8 as number | undefined, maxGap: 1.8 },
  { dim: "Documentation Standards", self: 7.0, manager: 6.5, peer: 7.2 as number | undefined, maxGap: 0.7 },
  { dim: "Data Extraction (Xero/MYOB)", self: 7.5, manager: 8.0, peer: 7.8 as number | undefined, maxGap: 0.5 },
  { dim: "Client Communication", self: 3.0, manager: 5.5, peer: 4.5 as number | undefined, maxGap: 2.5 },
  { dim: "Risk Assessment", self: 3.5, manager: 4.8, peer: 4.2 as number | undefined, maxGap: 1.3 },
  { dim: "AML/CTF Procedures", self: 5.0, manager: 5.5, peer: 5.2 as number | undefined, maxGap: 0.5 },
  { dim: "Ethics & Prof. Standards", self: 6.5, manager: 7.0, peer: 6.8 as number | undefined, maxGap: 0.5 },
  { dim: "Tax Return Preparation", self: 2.8, manager: 4.2, peer: 3.8 as number | undefined, maxGap: 1.4 },
  { dim: "Journal Entries & Depreciation", self: 4.0, manager: 5.5, peer: 5.0 as number | undefined, maxGap: 1.5 },
  { dim: "Presentation Skills", self: 4.0, manager: 5.0, peer: 5.5 as number | undefined, maxGap: 1.5 },
];

/* ── Perception Gap Section Component ── */
interface GapSectionProps {
  title: string;
  subtitle: string;
  gaps: typeof allBehaviouralGaps;
  defaultCount: number;
  avgGap: number;
  avgColor: string;
  trend: string;
  trendColor: string;
  insight: string;
}

const GapSection: React.FC<GapSectionProps> = ({
  title, subtitle, gaps, defaultCount, avgGap, avgColor, trend, trendColor, insight,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [animated, setAnimated] = React.useState(false);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const start = performance.now();
    const target = avgGap;
    const duration = 600;
    const tick = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((target * eased).toFixed(1)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    requestAnimationFrame(() => setAnimated(true));
  }, [avgGap]);

  const sorted = [...gaps].sort((a, b) => Math.abs(b.maxGap) - Math.abs(a.maxGap));
  const visible = expanded ? sorted : sorted.slice(0, defaultCount);
  const remaining = sorted.length - defaultCount;

  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>{subtitle}</div>

      <div className="flex items-baseline gap-3" style={{ marginBottom: 4 }}>
        <span className="font-mono-data" style={{ fontSize: 40, fontWeight: 500, color: avgColor }}>
          {count.toFixed(1)}
        </span>
        <span style={{ fontSize: 14, color: "#9CA3AF" }}>avg perception gap</span>
      </div>
      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>
        {insight}
      </p>
      <div className="flex items-center gap-1.5">
        <TrendingUp size={14} color={trendColor} strokeWidth={2} />
        <span style={{ fontSize: 12, fontWeight: 500, color: trendColor }}>{trend}</span>
      </div>

      <div style={{ height: 1, background: "#F3F4F6", margin: "16px 0" }} />

      <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 12 }}>
        {expanded ? "All Gaps" : "Biggest Gaps"}
      </div>
      <div className="flex flex-col" style={{ gap: 10, marginBottom: 12 }}>
        {visible.map((g, i) => (
          <div key={g.dim} style={{ display: "grid", gridTemplateColumns: "160px 1fr 56px", alignItems: "center", height: 40 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{g.dim}</span>
            <DivergenceDot selfScore={g.self} managerScore={g.manager} peerScore={g.peer} maxGap={Math.abs(g.maxGap)} delay={i * 60} animated={animated} />
            <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: getGapColor(Math.abs(g.maxGap)), textAlign: "right" }}>
              {Math.abs(g.maxGap).toFixed(1)} pts
            </span>
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 500, color: "#22C55E", padding: 0,
          }}
        >
          {expanded ? (
            <><ChevronUp size={14} /> Show top {defaultCount}</>
          ) : (
            <><ChevronDown size={14} /> See all {gaps.length} {title.toLowerCase().includes("skill") ? "skills" : "behaviours"}</>
          )}
        </button>
      )}

      <div style={{ height: 1, background: "#F3F4F6", margin: "16px 0" }} />

      <div className="flex items-center flex-wrap" style={{ gap: 16 }}>
        <div className="flex items-center" style={{ gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>Self-rating</span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>Manager rating</span>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>Peer rating</span>
        </div>
      </div>
    </div>
  );
};

/* ── Trend Chart ── */
type TrendTab = "performance" | "confidence" | "questions" | "workload";

const TrendChart: React.FC<{ tab: TrendTab }> = ({ tab }) => {
  const common = {
    xAxis: <XAxis dataKey="week" axisLine={{ stroke: "#E8E8E8" }} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />,
    grid: <CartesianGrid horizontal vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />,
    tooltip: <Tooltip content={<DarkTooltip />} cursor={false} />,
  };

  if (tab === "confidence") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={confData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          {common.grid}{common.xAxis}{common.tooltip}
          <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} fill="url(#confGrad)" dot={false}
            activeDot={{ r: 4, fill: "#fff", stroke: "#EF4444", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "performance") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={perfData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          {common.grid}{common.xAxis}{common.tooltip}
          <Area type="monotone" dataKey="manager" stroke="transparent" fill="url(#gapFill)" />
          <Line type="monotone" dataKey="self" stroke="#6366F1" strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: "#fff", stroke: "#6366F1", strokeWidth: 2 }} />
          <Line type="monotone" dataKey="manager" stroke="#22C55E" strokeWidth={2} dot={false}
            activeDot={{ r: 3, fill: "#fff", stroke: "#22C55E", strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if (tab === "questions") {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={qData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          {common.grid}{common.xAxis}{common.tooltip}
          <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={18}>
            {qData.map((d, i) => (
              <Cell key={i} fill={d.value >= 3 ? "#22C55E" : d.value === 2 ? "#F59E0B" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={wlData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="wlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        {common.grid}{common.xAxis}{common.tooltip}
        <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#wlGrad)" dot={false}
          activeDot={{ r: 4, fill: "#fff", stroke: "#F59E0B", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/* ── Competency Framework Checklist ── */
interface CompetencyItem {
  label: string;
  status: "met" | "developing" | "not-started";
}
interface CompetencyCategory {
  title: string;
  items: CompetencyItem[];
}

const frameworkData: CompetencyCategory[] = [
  {
    title: "Technical Knowledge",
    items: [
      { label: "Business & investment structures (individuals, companies, trusts)", status: "developing" },
      { label: "Assessable income, deductions & tax offsets", status: "developing" },
      { label: "Basic GST concepts & BAS preparation", status: "not-started" },
      { label: "Depreciation rules (Div 40, Div 43)", status: "not-started" },
      { label: "Basic CGT & main residence exemption", status: "not-started" },
      { label: "Superannuation basics (SG, concessional/non-concessional)", status: "met" },
      { label: "Company & trust losses (conceptual)", status: "not-started" },
      { label: "Basic Division 7A loans", status: "not-started" },
      { label: "Deceased estate administration", status: "not-started" },
      { label: "PAYG withholding & instalment frameworks", status: "developing" },
    ],
  },
  {
    title: "Technical Skills",
    items: [
      { label: "Prepare financial statements (individuals, basic companies & trusts)", status: "developing" },
      { label: "Extract & code data from Xero, MYOB, QuickBooks", status: "met" },
      { label: "Year-end journal entries & depreciation schedules", status: "developing" },
      { label: "Income tax returns (individuals, sole traders, basic trusts)", status: "developing" },
      { label: "Prepare & lodge BAS/IAS; apply PAYG variation", status: "not-started" },
      { label: "PAYG payment summaries & Single Touch Payroll", status: "not-started" },
      { label: "Liaise with ATO on routine matters", status: "not-started" },
      { label: "Create job budgets & draft invoices", status: "met" },
      { label: "Proficient in MS Office, XPM, Active Workpapers, FYI Docs", status: "developing" },
      { label: "Complete Xero certification within 6 months", status: "met" },
    ],
  },
  {
    title: "Behavioural Competencies",
    items: [
      { label: "Takes ownership & seeks clarification proactively", status: "developing" },
      { label: "Actively seeks feedback; demonstrates improvement over review cycles", status: "developing" },
      { label: "Maintains attention to detail; self-checks before submission", status: "met" },
    ],
  },
];

const statusIcon = (s: CompetencyItem["status"]) => {
  if (s === "met") return (
    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#22C55E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
  if (s === "developing") return (
    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #F59E0B", background: "#FEF3C7", flexShrink: 0 }} />
  );
  return (
    <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1.5px dashed #D1D5DB", background: "#F9FAFB", flexShrink: 0 }} />
  );
};

const CompetencyChecklist: React.FC = () => {
  const allItems = frameworkData.flatMap((c) => c.items);
  const met = allItems.filter((i) => i.status === "met").length;
  const total = allItems.length;

  return (
    <div style={{
      background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      padding: "20px 18px", height: 520, overflowY: "auto",
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 4 }}>
        Competency Framework
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#0F0F0F", marginBottom: 4 }}>
        Graduate Associate → Associate
      </div>
      <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
        <div style={{ flex: 1, height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(met / total) * 100}%`, height: "100%", background: "#22C55E", borderRadius: 2, transition: "width 600ms ease" }} />
        </div>
        <span className="font-mono-data" style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>
          {met}/{total}
        </span>
      </div>

      <div className="flex items-center gap-3" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: 10, color: "#6B7280" }}>Met</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1.5px solid #F59E0B", background: "#FEF3C7" }} />
          <span style={{ fontSize: 10, color: "#6B7280" }}>Developing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: "50%", border: "1px dashed #D1D5DB", background: "#F9FAFB" }} />
          <span style={{ fontSize: 10, color: "#6B7280" }}>Not started</span>
        </div>
      </div>

      {frameworkData.map((cat) => (
        <div key={cat.title} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
            {cat.title}
          </div>
          <div className="flex flex-col" style={{ gap: 6 }}>
            {cat.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div style={{ marginTop: 1 }}>{statusIcon(item.status)}</div>
                <span style={{
                  fontSize: 12, lineHeight: 1.4,
                  color: item.status === "met" ? "#9CA3AF" : "#374151",
                  textDecoration: item.status === "met" ? "line-through" : "none",
                  textDecorationColor: "#D1D5DB",
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ── Perception Gap Analysis View ── */
const PerceptionGapAnalysis: React.FC = () => {
  const behaviouralAvg = allBehaviouralGaps.reduce((s, g) => s + Math.abs(g.maxGap), 0) / allBehaviouralGaps.length;
  const skillsAvg = allSkillsGaps.reduce((s, g) => s + Math.abs(g.maxGap), 0) / allSkillsGaps.length;

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      {/* Summary */}
      <div style={{
        background: "#F0FDF4", borderRadius: 8, padding: 14,
      }}>
        <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
          <span style={{ fontWeight: 500 }}>Triangulated perception gap analysis</span> compares three perspectives — Sarah's self-assessment, your manager observations, and her peer's day-to-day ratings. Triangulating across all three gives you a robust picture, especially in the first 8 weeks when baseline data is being established.
        </p>
      </div>

      {/* Combined avg */}
      <div className="flex items-center gap-6" style={{ marginBottom: -8 }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 3, height: 20, background: "#6366F1", borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Behavioural avg gap</div>
            <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 600, color: getGapColor(behaviouralAvg) }}>{behaviouralAvg.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ width: 3, height: 20, background: "#8B5CF6", borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>Skills avg gap</div>
            <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 600, color: getGapColor(skillsAvg) }}>{skillsAvg.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <GapSection
          title="Behavioural Indicators"
          subtitle="9 dimensions from weekly check-ins"
          gaps={allBehaviouralGaps}
          defaultCount={3}
          avgGap={behaviouralAvg}
          avgColor={getGapColor(behaviouralAvg)}
          trend="Widening over 4 weeks"
          trendColor="#DC2626"
          insight="Sarah consistently rates herself lower than both you and her peer across behavioural indicators — her peer rates her closer to your assessment, confirming this isn't just your perspective"
        />
        <GapSection
          title="Role-Specific Skills"
          subtitle="SWN competency framework skills"
          gaps={allSkillsGaps}
          defaultCount={3}
          avgGap={skillsAvg}
          avgColor={getGapColor(skillsAvg)}
          trend="Steady over 3 weeks"
          trendColor="#F59E0B"
          insight="All three perspectives agree Sarah underestimates her technical progress — peer ratings align closely with yours, particularly in financial statement review"
        />
      </div>

      {/* Actionable insight */}
      <div style={{
        background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20,
        borderLeft: "3px solid #22C55E",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#15803D", marginBottom: 8 }}>
          Recommended Action
        </div>
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: 0 }}>
          The largest gaps are in <span style={{ fontWeight: 500 }}>Ownership & Follow-Through</span> (behavioural) and <span style={{ fontWeight: 500 }}>Financial Statement Review</span> (skills). Critically, her peer independently rates her similarly to you — meaning this perception gap is validated across all three perspectives. In your next 1-on-1, share that her peer also sees strong performance, then walk through a recent piece of work and have her assess it before you share ratings.
        </p>
      </div>
    </div>
  );
};

/* ── Main Component ── */
interface Props {
  graduateId: string;
  onBack: () => void;
}

type ProfileView = "overview" | "skills" | "perception-gap";

const GraduateProfile: React.FC<Props> = ({ graduateId, onBack }) => {
  const [trendTab, setTrendTab] = useState<TrendTab>("performance");
  const [profileView, setProfileView] = useState<ProfileView>("overview");

  const { data: graduate, isLoading, error } = useGraduate(graduateId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" style={{ padding: "20px 0" }}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-[200px] w-full rounded-lg" style={{ marginTop: 16 }} />
      </div>
    );
  }

  if (error || !graduate) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 transition-colors"
          style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}
        >
          <ArrowLeft size={14} /> Team Brief
        </button>
        <div style={{ padding: "24px 0", color: "#DC2626", fontSize: 14 }}>
          {error ? "Failed to load graduate profile." : "Graduate not found."}
        </div>
      </div>
    );
  }

  const status = deriveStatus(graduate.full_name);

  const snapshot = getSnapshot(3);
  const developed = snapshot.nodes.filter((n) => n.proficiency > 6).length;
  const developing = snapshot.nodes.filter((n) => n.proficiency > 0 && n.proficiency <= 6).length;
  const notStarted = snapshot.nodes.filter((n) => n.proficiency === 0 && !n.promotionRequired).length;
  const promoRequired = snapshot.nodes.filter((n) => n.promotionRequired).length;

  const trendTabs: { id: TrendTab; label: string }[] = [
    { id: "performance", label: "Performance" },
    { id: "confidence", label: "Confidence" },
    { id: "questions", label: "Questions" },
    { id: "workload", label: "Workload" },
  ];

  return (
    <div>
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 transition-colors"
        style={{ fontSize: 13, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, padding: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
      >
        <ArrowLeft size={14} /> Team Brief
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
          <h1 className="font-heading" style={{ fontSize: 22, fontWeight: 500, color: "#0F0F0F", letterSpacing: "-0.02em" }}>
            {graduate.name}
          </h1>
          <StatusBadge status={graduate.status} />
        </div>
        <p style={{ fontSize: 13, color: "#9CA3AF" }}>{graduate.role} · Week {graduate.week} · Manager: {graduate.managerName}</p>

        {/* View Tabs */}
        <div className="flex items-center gap-0" style={{ marginTop: 16, borderBottom: "1px solid #F3F4F6" }}>
          {([
            { id: "overview" as ProfileView, label: "Overview" },
            { id: "perception-gap" as ProfileView, label: "Perception Gap Analysis", icon: <BarChart3 size={13} style={{ marginRight: 5 }} /> },
            { id: "skills" as ProfileView, label: "Skills Constellation", icon: <Sparkles size={13} style={{ marginRight: 5 }} /> },
          ]).map((t) => {
            const active = profileView === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setProfileView(t.id)}
                className="flex items-center"
                style={{
                  padding: "8px 16px", fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? "#22C55E" : "#9CA3AF", background: "none", border: "none",
                  borderBottom: active ? "2px solid #22C55E" : "2px solid transparent",
                  cursor: "pointer", marginBottom: -1, transition: "color 100ms ease",
                }}
              >
                {t.icon}{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {profileView === "overview" ? (
      /* Two columns: 55% / 45% */
      <div style={{ display: "grid", gridTemplateColumns: "55% 45%", gap: 20 }}>
        {/* Left Column */}
        <div className="flex flex-col" style={{ gap: 20 }}>
          {/* Trend Charts */}
          <div style={{
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          }}>
            <div className="flex items-center gap-0" style={{ marginBottom: 16, borderBottom: "1px solid #F3F4F6" }}>
              {trendTabs.map((t) => {
                const active = trendTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTrendTab(t.id)}
                    style={{
                      padding: "8px 14px", fontSize: 13, fontWeight: active ? 600 : 400,
                      color: active ? "#22C55E" : "#9CA3AF", background: "none", border: "none",
                      borderBottom: active ? "2px solid #22C55E" : "2px solid transparent",
                      cursor: "pointer", marginBottom: -1,
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <TrendChart tab={trendTab} />
            {trendTab === "performance" && (
              <div className="flex items-center gap-4 justify-center" style={{ marginTop: 8 }}>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 2, background: "#6366F1", borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>Self-rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 10, height: 2, background: "#22C55E", borderRadius: 1 }} />
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>Manager rating</span>
                </div>
              </div>
            )}
          </div>

          {/* Development Focus Areas */}
          <div>
            <h3 className="font-heading" style={{ fontSize: 15, fontWeight: 600, color: "#0F0F0F", marginBottom: 12 }}>
              Development Focus Areas
            </h3>
            <div className="flex flex-col" style={{ gap: 12 }}>
              <div style={{
                background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: "20px 20px 20px 24px",
                position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}>
                <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "#F59E0B", borderRadius: 2 }} />
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D97706", marginBottom: 8 }}>
                  Curiosity & Learning
                </div>
                <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
                  <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>4.8</span>
                  <span style={{ fontSize: 12, color: "#EF4444" }}>↓ declining 3 weeks</span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 12 }}>
                  Her question frequency dropped from 5/week to 2. She may not feel safe asking questions right now.
                </p>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#15803D", marginBottom: 6 }}>
                  How You Can Help
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                  Proactively ask "What questions do you have?" at the start of your 1-on-1 rather than waiting for Sarah to raise them.
                </p>
              </div>

              <div style={{
                background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: "20px 20px 20px 24px",
                position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              }}>
                <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "#F59E0B", borderRadius: 2 }} />
                <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#D97706", marginBottom: 8 }}>
                  Ownership & Follow-Through
                </div>
                <div className="flex items-baseline gap-2" style={{ marginBottom: 8 }}>
                  <span className="font-mono-data" style={{ fontSize: 20, fontWeight: 600, color: "#0F0F0F" }}>5.2</span>
                  <span style={{ fontSize: 12, color: "#EF4444" }}>↓ gap widening</span>
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 12 }}>
                  There's a growing gap between how she rates herself and how you rate her — you're rating her significantly higher.
                </p>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#15803D", marginBottom: 6 }}>
                  How You Can Help
                </div>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                  When giving positive feedback, be specific about exactly what she did well. Generic praise ("great job") doesn't close a perception gap. Specific evidence ("the way you structured the risk section was excellent") does.
                </p>
              </div>
            </div>
          </div>

          {/* Intervention History */}
          <div style={{
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 12 }}>
              Intervention History
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 13, color: "#374151" }}>Mar 15 — Calibration conversation</span>
              </div>
              <span
                className="inline-flex items-center gap-1"
                style={{
                  background: "#F0FDF4", color: "#15803D", borderRadius: 100,
                  padding: "4px 10px", fontSize: 12, fontWeight: 500,
                }}
              >
                <CheckCircle size={12} /> Confidence +1.5 pts
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col" style={{ gap: 20 }}>
          {/* Check-In Brief */}
          <div
            style={{
              background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10, padding: 20, paddingLeft: 24,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
              borderLeft: "3px solid #22C55E",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", marginBottom: 2 }}>
              Check-in brief — week 12
            </div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
              Prepared for your 1-on-1 with Sarah
            </div>

            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              What Changed
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
              {[
                <>Confidence dropped <span className="font-mono-data" style={{ fontWeight: 500 }}>7</span> → <span className="font-mono-data" style={{ fontWeight: 500 }}>5</span> (second consecutive decline)</>,
                <>Questions dropped <span className="font-mono-data" style={{ fontWeight: 500 }}>4</span> → <span className="font-mono-data" style={{ fontWeight: 500 }}>1</span> (lowest in 8 weeks)</>,
                <>You rated her <span className="font-mono-data" style={{ fontWeight: 500 }}>8</span>, she rated herself <span className="font-mono-data" style={{ fontWeight: 500 }}>5</span> — 3-point gap</>,
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2" style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#D1D5DB", marginTop: 7, flexShrink: 0 }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              What This Suggests
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
              Sarah may be experiencing imposter syndrome. She's performing well by your assessment but doesn't see it. Declining confidence + reduced questions = someone withdrawing because they believe they're failing.
            </p>

            <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              What To Say
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
              Open with specific recognition — reference the client deliverable you rated 8/10. Then ask how she thinks it went. Listen for the gap. If she rates herself lower, name it gently: "That's interesting — from my side, I thought it was excellent."
            </p>

            <div style={{ height: 1, background: "#F3F4F6", marginBottom: 16 }} />

            <div style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF", marginBottom: 8 }}>
              One Question To Ask
            </div>
            <div style={{ background: "#F0FDF4", borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#166534", margin: 0 }}>
                "What's one thing you're unsure about right now that you haven't asked anyone about yet?"
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>Estimated conversation: ~10 min</span>
              <button
                className="flex items-center gap-1"
                style={{
                  background: "#fff", color: "#374151", border: "1px solid #E8E8E8", borderRadius: 6,
                  padding: "6px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}
              >
                <Copy size={12} /> Copy Brief
              </button>
            </div>
          </div>

        </div>
      </div>
      ) : profileView === "perception-gap" ? (
      <PerceptionGapAnalysis />
      ) : (
      /* Skills Constellation View */
      <div className="flex flex-col" style={{ gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Graph */}
          <div style={{
            background: "#fff", border: "1px solid #E8E8E8", borderRadius: 10,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
            position: "relative", overflow: "hidden", height: 520,
          }}>
            <SkillsGraph month={3} />

            {/* Legend */}
            <div style={{
              position: "absolute", bottom: 16, left: 16,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
              border: "1px solid #E8E8E8", borderRadius: 10, padding: "14px 18px",
              display: "flex", flexDirection: "column", gap: 7, zIndex: 10,
            }}>
              <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>Developed skill</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E", opacity: 0.5 }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>Developing</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEF3C7", border: "2px dashed #F59E0B" }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>Required for promotion</span>
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#F3F4F6", border: "1.5px dashed #9CA3AF" }} />
                <span style={{ fontSize: 11, color: "#6B7280" }}>Not yet started</span>
              </div>
            </div>
          </div>

          {/* Competency Framework Checklist */}
          <CompetencyChecklist />
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#0F0F0F" }}>{snapshot.nodes.length}</span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>skills tracked</span>
          <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>
          <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#22C55E" }}>{developed}</span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>developed</span>
          <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>
          <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#22C55E" }}>{developing}</span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>developing</span>
          <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>
          <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF" }}>{notStarted}</span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>not started</span>
          <span style={{ color: "#E8E8E8", margin: "0 6px" }}>·</span>
          <span className="font-mono-data" style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>{promoRequired}</span>
          <span style={{ fontSize: 13, color: "#9CA3AF" }}>required for promotion</span>
        </div>

        {/* Manager context note */}
        <div style={{
          background: "#F0FDF4", borderRadius: 8, padding: 14,
        }}>
          <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
            <span style={{ fontWeight: 500 }}>Manager insight:</span> Sarah has <span className="font-mono-data" style={{ fontWeight: 600 }}>{promoRequired}</span> skills flagged as required for promotion that haven't been started yet. Consider discussing a learning plan for <em>Stakeholder Management</em> and <em>Client Relationship Building</em> in your next 1-on-1.
          </p>
        </div>
      </div>
      )}
    </div>
  );
};

export default GraduateProfile;
