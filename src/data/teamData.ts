import { type Status } from "@/data/sampleData";

export interface TeamGraduate {
  id: string;
  name: string;
  initials: string;
  role: string;
  week: number;
  status: Status;
  signal: string;
  confidenceTrend: number[];
  perceptionGap: number;
}

export const teamGraduates: TeamGraduate[] = [
  {
    id: "g1", name: "Sarah Chen", initials: "SC", role: "Graduate Associate", week: 12,
    status: "attention", signal: "Perception gap 3.0 pts — calibration recommended",
    confidenceTrend: [8, 8, 7, 5, 6, 7, 7, 6, 5, 5, 5, 5], perceptionGap: 3.0,
  },
  {
    id: "g6", name: "Emily Zhang", initials: "EZ", role: "Graduate Associate", week: 13,
    status: "attention", signal: "Workload 9/10, manager support dropping",
    confidenceTrend: [7, 7, 6, 6, 5, 5, 5, 5, 4, 4, 5, 5], perceptionGap: 2.5,
  },
  {
    id: "g4", name: "Tyler Morrison", initials: "TM", role: "Graduate Consultant", week: 14,
    status: "stalling", signal: "Initiative declining 3 weeks, peer connection low",
    confidenceTrend: [7, 7, 7, 6, 6, 6, 6, 6, 6, 5, 5, 5], perceptionGap: 1.5,
  },
  {
    id: "g3", name: "Priya Patel", initials: "PP", role: "Graduate Analyst", week: 10,
    status: "steady", signal: "Stable across all dimensions",
    confidenceTrend: [6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7], perceptionGap: 0.8,
  },
  {
    id: "g2", name: "Marcus Johnson", initials: "MJ", role: "Senior Associate", week: 16,
    status: "accelerating", signal: "Strong alignment, confidence up 4 weeks",
    confidenceTrend: [6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9], perceptionGap: 0.3,
  },
  {
    id: "g5", name: "James Park", initials: "JP", role: "Graduate Analyst", week: 11,
    status: "accelerating", signal: "Peer scores above average, ownership & follow-through improving",
    confidenceTrend: [5, 5, 6, 6, 6, 7, 7, 7, 7, 7, 8, 8], perceptionGap: 0.5,
  },
];

export const statusColors: Record<Status, { bg: string; text: string; line: string }> = {
  accelerating: { bg: "#DCFCE7", text: "#15803D", line: "#22C55E" },
  steady: { bg: "#F3F4F6", text: "#4B5563", line: "#6B7280" },
  stalling: { bg: "#FEF3C7", text: "#D97706", line: "#F59E0B" },
  attention: { bg: "#FEE2E2", text: "#DC2626", line: "#EF4444" },
};

export const statusLabels: Record<Status, string> = {
  accelerating: "Accelerating",
  steady: "Steady",
  stalling: "Stalling",
  attention: "Needs Attention",
};

export const statusBadgeStyles: Record<Status, { bg: string; color: string; dot: string }> = {
  accelerating: { bg: "#F0FDF4", color: "#15803D", dot: "#15803D" },
  steady: { bg: "#F3F4F6", color: "#4B5563", dot: "#4B5563" },
  stalling: { bg: "#FFFBEB", color: "#D97706", dot: "#D97706" },
  attention: { bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
};
