import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import DevelopmentBarStack, { type DimensionRow } from "@/components/vitals/DevelopmentBarStack";
import { useSelfCheckIns, useGraduate, useWeeklyInsight, useFocusAreas } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";
import FocusAreaCard, { type FocusAreaPayloadItem } from "@/components/shared/FocusAreaCard";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const DIMENSION_KEYS = [
  { key: "ownershipFollowThrough", label: "Ownership & Follow-Through" },
  { key: "confidence", label: "Confidence Stability" },
  { key: "curiosity", label: "Curiosity & Learning" },
  { key: "managerRelationship", label: "Manager Relationship" },
  { key: "teamConnection", label: "Team Connection" },
  { key: "feedbackApplication", label: "Feedback Application" },
  { key: "workloadMgmt", label: "Workload Management" },
  { key: "initiative", label: "Initiative & Voice" },
  { key: "resilience", label: "Resilience" },
] as const;

function computeDimensions(checkIns: any[]): DimensionRow[] {
  if (!checkIns.length) return [];

  // checkIns are ordered desc by week_number, so [0] is most recent
  const latest = checkIns[0];
  const prior = checkIns.length > 1 ? checkIns[1] : null;

  const latestScores = typeof latest.dimension_scores === "string"
    ? JSON.parse(latest.dimension_scores)
    : latest.dimension_scores;

  const priorScores = prior
    ? typeof prior.dimension_scores === "string"
      ? JSON.parse(prior.dimension_scores)
      : prior.dimension_scores
    : null;

  return DIMENSION_KEYS.map(({ key, label }) => {
    const currentScore = latestScores?.[key] ?? 0;
    const priorScore = priorScores?.[key] ?? currentScore;
    const delta = currentScore - priorScore;
    const status: DimensionRow["status"] =
      delta >= 0.5 ? "improving" : delta <= -0.5 ? "declining" : "steady";

    return { key, label, currentScore, priorScore, delta, status };
  });
}

/* ─── Weekly Insight Card ─── */
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

interface WeeklyInsightCardProps {
  onStartCheckIn: () => void;
  weekNumber: number;
  isLoading: boolean;
  paragraphs: string[] | null;
  ctaLabel: string;
  generatedAt: string | null;
  isFallback: boolean;
}

const WeeklyInsightCard: React.FC<WeeklyInsightCardProps> = ({
  onStartCheckIn,
  weekNumber,
  isLoading,
  paragraphs,
  ctaLabel,
  generatedAt,
  isFallback,
}) => (
  <div
    style={{
      background: "#F0FDF4",
      border: "1px solid #DCFCE7",
      borderRadius: 10,
      padding: "24px 28px",
      position: "relative",
      marginBottom: 40,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0, top: 12, bottom: 12,
        width: 3, background: "#22C55E", borderRadius: 2,
      }}
    />

    {/* Header */}
    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
      <div
        style={{
          width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
          animation: "pulse-scale 2s ease-in-out infinite",
        }}
      />
      <span className="font-heading" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#15803D" }}>
        Weekly Insight
      </span>
      <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: "auto" }}>
        {`Week ${weekNumber}`}
        {generatedAt ? ` · Generated ${formatRelativeTime(generatedAt)}` : ""}
      </span>
    </div>

    {/* Insight body */}
    <div className="font-body" style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, marginTop: 14 }}>
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full bg-emerald-100" />
          <Skeleton className="h-4 w-[92%] bg-emerald-100" />
          <Skeleton className="h-4 w-[78%] bg-emerald-100" />
        </div>
      ) : isFallback ? (
        <p>Your weekly insight is being prepared. Check back soon.</p>
      ) : (
        paragraphs?.map((p, i) => (
          <p key={i} style={{ marginBottom: i === paragraphs.length - 1 ? 0 : 12 }}>
            {p}
          </p>
        ))
      )}
    </div>

    {/* Divider */}
    <div style={{ borderTop: "1px solid #DCFCE7", margin: "20px 0 16px" }} />

    {/* Check-in CTA */}
    <div className="flex items-center justify-between">
      <div style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F" }}>
        Ready for this week's check-in?
      </div>
      <button
        onClick={onStartCheckIn}
        className="flex items-center gap-1 gs-btn-primary"
        style={{
          padding: "9px 22px",
          background: "#22C55E",
          color: "#FFFFFF",
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          borderRadius: 100,
          cursor: "pointer",
          transition: "background 150ms ease",
          flexShrink: 0,
        }}
      >
        {ctaLabel} <ChevronRight size={16} />
      </button>
    </div>
  </div>
);

/* ─── Main Page ─── */
interface MyVitalsProps {
  onStartCheckIn: () => void;
}

const MyVitals: React.FC<MyVitalsProps> = ({ onStartCheckIn }) => {
  const { user, loading: userLoading } = useCurrentUser();
  const graduateId = user?.id ?? "";
  const { data: checkIns, isLoading } = useSelfCheckIns(graduateId, 5);
  const { data: graduate } = useGraduate(graduateId);
  const currentWeek = graduate?.week_number ?? 0;
  const { data: insight, isLoading: insightLoading } = useWeeklyInsight(
    graduateId,
    currentWeek,
  );
  const { data: focusAreasInsight, isLoading: focusAreasLoading } = useFocusAreas(
    graduateId,
    currentWeek,
  );
  const focusAreasPayload = (focusAreasInsight?.payload ?? null) as
    | { week_number?: number; focus_areas?: FocusAreaPayloadItem[] }
    | null;

  const dimensions = useMemo(() => computeDimensions(checkIns ?? []), [checkIns]);

  if (userLoading) return null;
  if (!user) return null;


  const payload = (insight?.payload ?? null) as
    | { paragraphs?: string[]; call_to_action?: string }
    | null;
  const status = insight?.generation_status ?? null;
  const hasUsableInsight =
    !!payload &&
    Array.isArray(payload.paragraphs) &&
    payload.paragraphs.length > 0 &&
    (status === "success" || status === "fallback");

  const cardLoading = insightLoading || currentWeek === 0;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* SECTION 1: Weekly Insight + Check-In */}
      <WeeklyInsightCard
        onStartCheckIn={onStartCheckIn}
        weekNumber={currentWeek}
        isLoading={cardLoading}
        paragraphs={hasUsableInsight ? payload!.paragraphs! : null}
        ctaLabel={
          hasUsableInsight && payload?.call_to_action
            ? payload.call_to_action
            : "Start this week's check-in"
        }
        generatedAt={hasUsableInsight ? insight?.generated_at ?? null : null}
        isFallback={!cardLoading && !hasUsableInsight}
      />

      {/* SECTION 2: Development Profile */}
      <div style={{ marginBottom: 40 }}>
        <DevelopmentBarStack dimensions={dimensions.length > 0 ? dimensions : undefined} isLoading={isLoading} />
      </div>

      {/* SECTION 3: Focus Areas */}
      <div style={{ marginBottom: 40 }}>
        <h3
          className="font-heading"
          style={{ fontSize: 17, fontWeight: 500, color: "#0F0F0F", marginBottom: 16 }}
        >
          This week's focus
        </h3>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {focusAreasLoading || currentWeek === 0 ? (
            <>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E8E8E8",
                    borderRadius: 10,
                    padding: "20px 20px 20px 24px",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "#F59E0B", borderRadius: 2 }} />
                  <Skeleton className="h-3 w-2/5 mb-3" />
                  <Skeleton className="h-5 w-1/3 mb-3" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-11/12" />
                </div>
              ))}
            </>
          ) : !focusAreasPayload ? (
            <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              Focus areas not yet generated.
            </p>
          ) : (focusAreasPayload.focus_areas ?? []).length === 0 ? (
            <div
              style={{
                background: "#F0FDF4",
                border: "1px solid #DCFCE7",
                borderRadius: 10,
                padding: "16px 18px",
              }}
            >
              <p style={{ fontSize: 13, color: "#166534", lineHeight: 1.6, margin: 0 }}>
                No areas of concern this week — all dimensions within healthy range.
              </p>
            </div>
          ) : (
            (focusAreasPayload.focus_areas ?? []).map((area) => (
              <FocusAreaCard
                key={area.dimension_key}
                area={area}
                showManagerHelp={false}
              />
            ))
          )}
        </div>
      </div>

      {/* SECTION 4: Value Prop */}
      <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", paddingBottom: 24 }}>
        This insight was generated from 12 weeks of continuous data — something a quarterly PDP review can't provide.
      </p>
    </div>
  );
};

export default MyVitals;
