export type Status = "accelerating" | "steady" | "stalling" | "attention";

export interface Dimensions {
  selfAwareness: number;
  confidence: number;
  curiosity: number;
  managerRelationship: number;
  teamConnection: number;
  feedbackApplication: number;
  workloadMgmt: number;
  initiative: number;
  resilience: number;
}

export interface WeeklyCheckin {
  confidence: number[];
  workload: number[];
  questionsAsked: number[];
  selfRating: number[];
  managerSupport: number[];
}

export interface ManagerCheckin {
  workQuality: number[];
  proactivity: number[];
  feedbackResponse: number[];
  questionsObserved: number[];
  overallRating: number[];
}

export interface PeerFeedback {
  collaboration: number[];
  reliability: number[];
  communication: number[];
  overall: number[];
}

export interface Graduate {
  id: string;
  name: string;
  role: string;
  week: number;
  managerId: string;
  managerName: string;
  status: Status;
  dimensions: Dimensions;
  selfCheckin?: WeeklyCheckin;
  managerCheckin?: ManagerCheckin;
  peerFeedback?: PeerFeedback;
}

export interface Manager {
  id: string;
  name: string;
  graduateIds: string[];
}

export const graduates: Graduate[] = [
  {
    id: "g1",
    name: "Sarah Chen",
    role: "Graduate Associate",
    week: 12,
    managerId: "m1",
    managerName: "David Liu",
    status: "attention",
    dimensions: { selfAwareness: 5.2, confidence: 5.5, curiosity: 4.8, managerRelationship: 7.1, teamConnection: 7.4, feedbackApplication: 8.1, workloadMgmt: 6.0, initiative: 5.3, resilience: 6.8 },
    selfCheckin: {
      confidence: [8,8,7,5,6,7,7,6,5,5,5,5],
      workload: [6,6,7,7,7,7,6,7,9,7,7,6],
      questionsAsked: [6,7,5,4,6,5,5,4,3,2,2,1],
      selfRating: [7,7,6,5,6,6,6,5,5,5,5,5],
      managerSupport: [8,8,7,7,7,7,6,6,6,6,5,5],
    },
    managerCheckin: {
      workQuality: [7,7,7,8,8,8,8,8,8,8,8,8],
      proactivity: [7,7,6,6,7,7,6,6,5,5,5,5],
      feedbackResponse: [7,8,8,8,8,8,8,8,8,8,8,8],
      questionsObserved: [5,6,4,3,5,4,4,3,2,2,1,1],
      overallRating: [7,7,7,8,8,8,8,8,8,8,8,8],
    },
    peerFeedback: {
      collaboration: [7,7,8],
      reliability: [8,8,8],
      communication: [7,7,7],
      overall: [7,7,7.5],
    },
  },
  {
    id: "g2",
    name: "Marcus Johnson",
    role: "Senior Associate",
    week: 16,
    managerId: "m2",
    managerName: "Rebecca Torres",
    status: "accelerating",
    dimensions: { selfAwareness: 8.0, confidence: 8.2, curiosity: 7.5, managerRelationship: 8.4, teamConnection: 8.1, feedbackApplication: 7.8, workloadMgmt: 7.6, initiative: 8.0, resilience: 7.9 },
  },
  {
    id: "g3",
    name: "Priya Patel",
    role: "Graduate Analyst",
    week: 10,
    managerId: "m2",
    managerName: "Rebecca Torres",
    status: "steady",
    dimensions: { selfAwareness: 6.5, confidence: 6.8, curiosity: 6.2, managerRelationship: 6.9, teamConnection: 6.5, feedbackApplication: 7.0, workloadMgmt: 6.8, initiative: 6.4, resilience: 6.6 },
  },
  {
    id: "g4",
    name: "Tyler Morrison",
    role: "Graduate Consultant",
    week: 14,
    managerId: "m1",
    managerName: "David Liu",
    status: "stalling",
    dimensions: { selfAwareness: 6.0, confidence: 6.1, curiosity: 5.5, managerRelationship: 5.8, teamConnection: 5.5, feedbackApplication: 6.5, workloadMgmt: 6.2, initiative: 4.8, resilience: 5.9 },
  },
  {
    id: "g5",
    name: "James Park",
    role: "Graduate Analyst",
    week: 11,
    managerId: "m2",
    managerName: "Rebecca Torres",
    status: "accelerating",
    dimensions: { selfAwareness: 7.5, confidence: 7.2, curiosity: 7.8, managerRelationship: 7.6, teamConnection: 7.9, feedbackApplication: 7.4, workloadMgmt: 7.0, initiative: 7.3, resilience: 7.1 },
  },
  {
    id: "g6",
    name: "Emily Zhang",
    role: "Graduate Associate",
    week: 13,
    managerId: "m1",
    managerName: "David Liu",
    status: "attention",
    dimensions: { selfAwareness: 5.8, confidence: 5.5, curiosity: 6.0, managerRelationship: 4.8, teamConnection: 6.2, feedbackApplication: 6.8, workloadMgmt: 4.2, initiative: 5.5, resilience: 5.0 },
  },
];

export const managers: Manager[] = [
  { id: "m1", name: "David Liu", graduateIds: ["g1", "g4", "g6"] },
  { id: "m2", name: "Rebecca Torres", graduateIds: ["g2", "g3", "g5"] },
];
