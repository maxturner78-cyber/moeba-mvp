export type DimensionKey =
  | "confidence" | "workloadMgmt" | "managerRelationship" | "teamConnection"
  | "curiosity" | "initiative" | "resilience" | "feedbackApplication"
  | "ownershipFollowThrough";

export const ALL_DIMENSION_KEYS: DimensionKey[] = [
  "confidence", "workloadMgmt", "managerRelationship", "teamConnection",
  "curiosity", "initiative", "resilience", "feedbackApplication",
  "ownershipFollowThrough"
];

// Baseline window: weeks 1-6 inclusive. Week 7 is the first adaptive week.
export const BASELINE_WEEKS = 6;

export const DIMENSION_QUESTIONS: Record<DimensionKey, {
  label: string;
  selfPrompt: string;
  managerPrompt: string;
  peerPrompt?: string;
  leftLabel: string;
  rightLabel: string;
}> = {
  confidence: {
    label: "Confidence Stability",
    selfPrompt: "How are you feeling in your role this week?",
    managerPrompt: "How confident did [name] seem this week?",
    peerPrompt: "How confident did [name] seem in team interactions?",
    leftLabel: "Really struggling",
    rightLabel: "Fully in my stride"
  },
  workloadMgmt: {
    label: "Workload Management",
    selfPrompt: "How is your workload right now?",
    managerPrompt: "How well is [name] managing their workload?",
    leftLabel: "Overwhelmed",
    rightLabel: "Comfortable"
  },
  managerRelationship: {
    label: "Manager Relationship",
    selfPrompt: "How would you describe your working relationship with your manager?",
    managerPrompt: "How is your working relationship with [name]?",
    leftLabel: "Distant / strained",
    rightLabel: "Strong and open"
  },
  teamConnection: {
    label: "Team Connection",
    selfPrompt: "How connected do you feel to your team?",
    managerPrompt: "How well is [name] integrating with the team?",
    peerPrompt: "How well is [name] integrating with the team?",
    leftLabel: "Keeps to themselves",
    rightLabel: "Fully integrated"
  },
  curiosity: {
    label: "Curiosity & Learning",
    selfPrompt: "How much are you actively exploring and learning this week?",
    managerPrompt: "How much curiosity is [name] showing?",
    leftLabel: "Coasting",
    rightLabel: "Actively exploring"
  },
  initiative: {
    label: "Initiative & Voice",
    selfPrompt: "How often are you taking action without being asked?",
    managerPrompt: "How proactive is [name]?",
    peerPrompt: "Is [name] taking initiative?",
    leftLabel: "Waits for direction",
    rightLabel: "Proactively contributes"
  },
  resilience: {
    label: "Resilience",
    selfPrompt: "When things got hard this week, how did you hold up?",
    managerPrompt: "How well does [name] recover from setbacks?",
    leftLabel: "Easily knocked",
    rightLabel: "Bounces back quickly"
  },
  feedbackApplication: {
    label: "Feedback Application",
    selfPrompt: "How well did you apply feedback from previous weeks?",
    managerPrompt: "How well does [name] apply feedback?",
    leftLabel: "Doesn't act on it",
    rightLabel: "Applies immediately"
  },
  ownershipFollowThrough: {
    label: "Ownership & Follow-Through",
    selfPrompt: "How consistently did you follow through on commitments this week?",
    managerPrompt: "How consistently does [name] follow through?",
    peerPrompt: "Does [name] deliver on what they commit to?",
    leftLabel: "Drops the ball",
    rightLabel: "Always delivers"
  }
};

// Type definitions:
export interface SelfCheckInRow {
  week_number: number;
  dimension_scores: Record<string, number>;
}

export interface ManagerCheckInRow {
  week_number: number;
  dimension_scores: Record<string, number>;
  skill_scores?: Record<string, number>;
  questions_observed?: number;
}

export interface WorkLogEntry {
  week_number: number;
  project_name: string;
  skill_slugs: string[];
  is_first_exposure: boolean;
}

export interface AdaptiveStateRow {
  dimension_key: string;
  stability_weeks: number;
  last_score: number | null;
  is_muted: boolean;
  last_asked_week: number | null;
  next_rotation_week: number | null;
}

export interface SkillProficiencyRow {
  skill_slug: string;
  current_level: number;
  last_assessed_week: number | null;
}

export interface AdaptiveQuestion {
  type: 'dimension' | 'skill' | 'work_log' | 'free_text';
  dimensionKey?: DimensionKey;
  skillSlug?: string;
  label: string;
  prompt: string;
  leftLabel?: string;
  rightLabel?: string;
  reason: 'baseline' | 'always' | 'rotation' | 'pattern_break' | 'first_exposure' | 'declining';
}

export interface AdaptiveStateUpdate {
  dimension_key: string;
  stability_weeks?: number;
  is_muted?: boolean;
  last_score?: number;
  last_asked_week?: number;
  next_rotation_week?: number;
}

export interface AdaptiveInput {
  graduateId: string;
  weekNumber: number;
  selfHistory: SelfCheckInRow[];
  managerHistory: ManagerCheckInRow[];
  workLogHistory: WorkLogEntry[];
  adaptiveState: AdaptiveStateRow[];
  skillProficiency: SkillProficiencyRow[];
}

export interface QuestionPlan {
  selfQuestions: AdaptiveQuestion[];
  managerQuestions: AdaptiveQuestion[];
  peerQuestions: AdaptiveQuestion[];
  stateUpdates: AdaptiveStateUpdate[];
}

// Helper functions:
function detectStability(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  window: number = 3
): { isStable: boolean; avgScore: number | null } {
  const recent = selfHistory
    .filter(h => h.week_number >= currentWeek - window && h.week_number < currentWeek)
    .map(h => h.dimension_scores[dimensionKey])
    .filter(v => typeof v === "number");

  if (recent.length < window) return { isStable: false, avgScore: null };

  const max = Math.max(...recent);
  const min = Math.min(...recent);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  return { isStable: (max - min) <= 1.0, avgScore: avg };
}

function detectPatternBreak(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  stableScore: number
): boolean {
  const thisWeek = selfHistory.find(h => h.week_number === currentWeek);
  if (!thisWeek) return false;
  const score = thisWeek.dimension_scores[dimensionKey];
  if (typeof score !== "number") return false;
  return Math.abs(score - stableScore) >= 1.0;
}

function detectDecline(
  selfHistory: SelfCheckInRow[],
  dimensionKey: DimensionKey,
  currentWeek: number,
  stableScore: number,
  threshold: number = 2.0
): boolean {
  const thisWeek = selfHistory.find(h => h.week_number === currentWeek);
  if (!thisWeek) return false;
  const score = thisWeek.dimension_scores[dimensionKey];
  if (typeof score !== "number") return false;
  return (stableScore - score) >= threshold;
}

function firstExposureSkills(
  workLogHistory: WorkLogEntry[],
  targetWeek: number
): string[] {
  const skills = new Set<string>();
  for (const entry of workLogHistory) {
    if (entry.week_number === targetWeek && entry.is_first_exposure) {
      for (const slug of entry.skill_slugs) skills.add(slug);
    }
  }
  return Array.from(skills);
}

function rotationSkill(
  skillProficiency: SkillProficiencyRow[],
  currentWeek: number
): string | null {
  const eligible = skillProficiency
    .filter(s => s.current_level > 0 &&
                 (s.last_assessed_week === null || s.last_assessed_week <= currentWeek - 3))
    .sort((a, b) => (a.last_assessed_week ?? 0) - (b.last_assessed_week ?? 0));
  return eligible[0]?.skill_slug ?? null;
}

function addDimensionQuestion(
  list: AdaptiveQuestion[],
  dim: DimensionKey,
  role: 'self' | 'manager',
  reason: AdaptiveQuestion['reason']
) {
  const q = DIMENSION_QUESTIONS[dim];
  list.push({
    type: 'dimension',
    dimensionKey: dim,
    label: q.label,
    prompt: role === 'self' ? q.selfPrompt : q.managerPrompt,
    leftLabel: q.leftLabel,
    rightLabel: q.rightLabel,
    reason,
  });
}

function addSkillQuestion(
  list: AdaptiveQuestion[],
  skillSlug: string,
  role: 'self' | 'manager',
  reason: AdaptiveQuestion['reason']
) {
  const prompt = role === 'self'
    ? `How confident do you feel about ${skillSlug.replace(/-/g, ' ')}?`
    : `How would you rate [name]'s competency on ${skillSlug.replace(/-/g, ' ')}?`;
  list.push({
    type: 'skill',
    skillSlug,
    label: skillSlug.replace(/-/g, ' '),
    prompt,
    leftLabel: 'Not yet confident',
    rightLabel: 'Fully confident',
    reason,
  });
}

function buildPeerQuestions(_input: AdaptiveInput): AdaptiveQuestion[] {
  const list: AdaptiveQuestion[] = [];

  const peerDimensions: DimensionKey[] = ['confidence', 'teamConnection', 'initiative', 'ownershipFollowThrough'];
  for (const dim of peerDimensions) {
    const q = DIMENSION_QUESTIONS[dim];
    if (!q.peerPrompt) continue;
    list.push({
      type: 'dimension',
      dimensionKey: dim,
      label: q.label,
      prompt: q.peerPrompt,
      leftLabel: q.leftLabel,
      rightLabel: q.rightLabel,
      reason: 'baseline',
    });
  }

  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Collaboration", prompt: "How well does [name] work with others?",
    leftLabel: "Keeps to themselves", rightLabel: "Fully integrated", reason: 'baseline',
  });
  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Reliability", prompt: "How reliably does [name] deliver?",
    leftLabel: "Needs chasing", rightLabel: "Always delivers", reason: 'baseline',
  });
  list.push({
    type: 'dimension', dimensionKey: undefined as any,
    label: "Communication", prompt: "How clearly does [name] communicate?",
    leftLabel: "Unclear / hesitant", rightLabel: "Clear & confident", reason: 'baseline',
  });

  return list;
}

function buildBaselinePlan(input: AdaptiveInput): QuestionPlan {
  const selfQuestions: AdaptiveQuestion[] = [];
  const managerQuestions: AdaptiveQuestion[] = [];

  for (const dim of ALL_DIMENSION_KEYS) {
    addDimensionQuestion(selfQuestions, dim, 'self', 'baseline');
  }
  for (const dim of ALL_DIMENSION_KEYS) {
    addDimensionQuestion(managerQuestions, dim, 'manager', 'baseline');
  }

  selfQuestions.push({
    type: 'work_log', label: "This week's work",
    prompt: "What projects and skills did you touch this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What stretched you most this week?",
    prompt: "What stretched you most this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What do you want to do more of?",
    prompt: "What do you want to do more of?", reason: 'always',
  });

  managerQuestions.push({
    type: 'free_text', label: "One thing they did well",
    prompt: "One specific thing [name] did well this week", reason: 'always',
  });
  managerQuestions.push({
    type: 'free_text', label: "Area to improve or support",
    prompt: "One area to improve or support", reason: 'always',
  });

  const peerQuestions = buildPeerQuestions(input);
  return { selfQuestions, managerQuestions, peerQuestions, stateUpdates: [] };
}

// Main function:
export function planCheckIn(input: AdaptiveInput): QuestionPlan {
  const { weekNumber } = input;

  if (weekNumber <= BASELINE_WEEKS) {
    return buildBaselinePlan(input);
  }

  const selfQuestions: AdaptiveQuestion[] = [];
  const managerQuestions: AdaptiveQuestion[] = [];
  const stateUpdates: AdaptiveStateUpdate[] = [];

  for (const dim of ALL_DIMENSION_KEYS) {
    const state = input.adaptiveState.find(s => s.dimension_key === dim);
    const { isStable, avgScore } = detectStability(input.selfHistory, dim, weekNumber);

    // Decline re-promotion (highest priority)
    if (state && avgScore !== null &&
        detectDecline(input.selfHistory, dim, weekNumber, avgScore)) {
      addDimensionQuestion(selfQuestions, dim, 'self', 'declining');
      addDimensionQuestion(managerQuestions, dim, 'manager', 'declining');
      stateUpdates.push({
        dimension_key: dim,
        is_muted: false,
        stability_weeks: 0,
        last_asked_week: weekNumber,
      });
      continue;
    }

    // Pattern break on muted dimension
    if (state?.is_muted && state.last_score !== null &&
        detectPatternBreak(input.selfHistory, dim, weekNumber, state.last_score)) {
      addDimensionQuestion(selfQuestions, dim, 'self', 'pattern_break');
      addDimensionQuestion(managerQuestions, dim, 'manager', 'pattern_break');
      stateUpdates.push({
        dimension_key: dim,
        last_asked_week: weekNumber,
      });
      continue;
    }

    // Stable → mute
    if (isStable && avgScore !== null) {
      stateUpdates.push({
        dimension_key: dim,
        is_muted: true,
        stability_weeks: (state?.stability_weeks ?? 0) + 1,
        last_score: avgScore,
      });
      continue;
    }

    // Default: unstable, ask
    addDimensionQuestion(selfQuestions, dim, 'self', 'baseline');
    addDimensionQuestion(managerQuestions, dim, 'manager', 'baseline');
    stateUpdates.push({
      dimension_key: dim,
      last_asked_week: weekNumber,
    });
  }

  // First-exposure skill triggers (week 7+)
  const firstExposure = firstExposureSkills(input.workLogHistory, weekNumber - 1);
  for (const skillSlug of firstExposure) {
    addSkillQuestion(selfQuestions, skillSlug, 'self', 'first_exposure');
    addSkillQuestion(managerQuestions, skillSlug, 'manager', 'first_exposure');
  }

  // Skill rotation (week 13+)
  if (weekNumber >= 13) {
    const rotSkill = rotationSkill(input.skillProficiency, weekNumber);
    if (rotSkill) {
      addSkillQuestion(selfQuestions, rotSkill, 'self', 'rotation');
      addSkillQuestion(managerQuestions, rotSkill, 'manager', 'rotation');
    }
  }

  // Always-on for self
  selfQuestions.push({
    type: 'work_log', label: "This week's work",
    prompt: "What projects and skills did you touch this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What stretched you most this week?",
    prompt: "What stretched you most this week?", reason: 'always',
  });
  selfQuestions.push({
    type: 'free_text', label: "What do you want to do more of?",
    prompt: "What do you want to do more of?", reason: 'always',
  });

  // Always-on for manager
  managerQuestions.push({
    type: 'free_text', label: "One thing they did well",
    prompt: "One specific thing [name] did well this week", reason: 'always',
  });
  managerQuestions.push({
    type: 'free_text', label: "Area to improve or support",
    prompt: "One area to improve or support", reason: 'always',
  });

  const peerQuestions: AdaptiveQuestion[] = buildPeerQuestions(input);

  return { selfQuestions, managerQuestions, peerQuestions, stateUpdates };
}

// Test runner:
export function runAdaptiveTests() {
  const results: string[] = [];

  const makeInput = (overrides: Partial<AdaptiveInput>): AdaptiveInput => ({
    graduateId: 'test',
    weekNumber: 1,
    selfHistory: [],
    managerHistory: [],
    workLogHistory: [],
    adaptiveState: [],
    skillProficiency: [],
    ...overrides,
  });

  // Test 1: Baseline week 5 → all 9 dimensions for both self and manager
  const t1 = planCheckIn(makeInput({ weekNumber: 5 }));
  const t1_self_dims = t1.selfQuestions.filter(q => q.type === 'dimension').length;
  const t1_mgr_dims = t1.managerQuestions.filter(q => q.type === 'dimension').length;
  if (t1_self_dims === 9 && t1_mgr_dims === 9) {
    results.push(`PASS: Week 5 baseline → 9 self, 9 manager dimensions`);
  } else {
    results.push(`FAIL: Week 5 baseline → expected 9+9, got ${t1_self_dims}+${t1_mgr_dims}`);
  }

  // Test 2: Week 6 (last baseline) → still 9+9
  const t2 = planCheckIn(makeInput({ weekNumber: 6 }));
  const t2_self_dims = t2.selfQuestions.filter(q => q.type === 'dimension').length;
  const t2_mgr_dims = t2.managerQuestions.filter(q => q.type === 'dimension').length;
  if (t2_self_dims === 9 && t2_mgr_dims === 9) {
    results.push(`PASS: Week 6 still baseline → 9+9 dimensions`);
  } else {
    results.push(`FAIL: Week 6 expected 9+9, got ${t2_self_dims}+${t2_mgr_dims}`);
  }

  // Test 3: Week 7 with flat confidence history → confidence muted
  const flatHistory: SelfCheckInRow[] = [
    { week_number: 4, dimension_scores: { confidence: 7 } },
    { week_number: 5, dimension_scores: { confidence: 7 } },
    { week_number: 6, dimension_scores: { confidence: 7 } },
  ];
  const t3 = planCheckIn(makeInput({ weekNumber: 7, selfHistory: flatHistory }));
  const t3_asks_confidence = t3.selfQuestions.some(q =>
    q.type === 'dimension' && q.dimensionKey === 'confidence'
  );
  if (!t3_asks_confidence) {
    results.push(`PASS: Week 7 with flat confidence → confidence muted, not asked`);
  } else {
    results.push(`FAIL: Week 7 flat confidence should be muted but was asked`);
  }

  // Test 4: Week 7 with declining confidence → confidence re-promoted
  const decliningHistory: SelfCheckInRow[] = [
    { week_number: 4, dimension_scores: { confidence: 7 } },
    { week_number: 5, dimension_scores: { confidence: 7 } },
    { week_number: 6, dimension_scores: { confidence: 7 } },
    { week_number: 7, dimension_scores: { confidence: 5 } },
  ];
  const t4 = planCheckIn(makeInput({
    weekNumber: 7,
    selfHistory: decliningHistory,
    adaptiveState: [{
      dimension_key: 'confidence', stability_weeks: 3, last_score: 7,
      is_muted: true, last_asked_week: 6, next_rotation_week: null,
    }],
  }));
  const t4_asks_confidence = t4.selfQuestions.some(q =>
    q.type === 'dimension' && q.dimensionKey === 'confidence'
  );
  if (t4_asks_confidence) {
    results.push(`PASS: Week 7 confidence dropped 7→5 → re-promoted to asked`);
  } else {
    results.push(`FAIL: Week 7 declining confidence should be re-promoted`);
  }

  // Test 5: Peer questions never include skill type
  const t5 = planCheckIn(makeInput({
    weekNumber: 10,
    workLogHistory: [{
      week_number: 9, project_name: 'Meridian audit', skill_slugs: ['audit-planning'],
      is_first_exposure: true,
    }],
  }));
  const t5_peer_has_skill = t5.peerQuestions.some(q => q.type === 'skill');
  if (!t5_peer_has_skill) {
    results.push(`PASS: Peer questions never include skill type`);
  } else {
    results.push(`FAIL: Peer questions incorrectly included a skill question`);
  }

  // Test 6: First-exposure triggers skill question for self and manager
  const t6_has_skill_self = t5.selfQuestions.some(q =>
    q.type === 'skill' && q.skillSlug === 'audit-planning'
  );
  const t6_has_skill_mgr = t5.managerQuestions.some(q =>
    q.type === 'skill' && q.skillSlug === 'audit-planning'
  );
  if (t6_has_skill_self && t6_has_skill_mgr) {
    results.push(`PASS: First-exposure audit-planning → asked in self and manager`);
  } else {
    results.push(`FAIL: First-exposure skill not in self=${t6_has_skill_self}, manager=${t6_has_skill_mgr}`);
  }

  console.log("=== Adaptive Engine Test Results ===");
  for (const r of results) console.log(r);
  return results;
}
