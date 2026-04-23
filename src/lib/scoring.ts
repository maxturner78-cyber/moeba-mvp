/**
 * Moeba scoring formulas — pure functions.
 * No Supabase calls. Inputs in, computed values out.
 */

const round1 = (n: number): number => Math.round(n * 10) / 10;

// Dimensions with an average score below this floor are never muted,
// regardless of stability — flat + low still needs attention.
export const MUTE_FLOOR = 6.0;

export function computeCombinedDimensionScore(
  selfScore: number | null,
  managerScore: number | null,
  peerScore: number | null,
): { score: number; confidence: "high" | "medium" | "low" } {
  const hasSelf = selfScore !== null && selfScore !== undefined;
  const hasManager = managerScore !== null && managerScore !== undefined;
  const hasPeer = peerScore !== null && peerScore !== undefined;

  if (hasSelf && hasManager && hasPeer) {
    return {
      score: round1(0.4 * (selfScore as number) + 0.4 * (managerScore as number) + 0.2 * (peerScore as number)),
      confidence: "high",
    };
  }
  if (hasSelf && hasManager) {
    return {
      score: round1(0.5 * (selfScore as number) + 0.5 * (managerScore as number)),
      confidence: "medium",
    };
  }
  const present = [selfScore, managerScore, peerScore].filter(
    (v): v is number => v !== null && v !== undefined,
  );
  if (present.length === 1) {
    return { score: round1(present[0]), confidence: "low" };
  }
  throw new Error("computeCombinedDimensionScore: at least one score required");
}

export function computePerceptionGap(
  selfScore: number,
  managerScore: number,
  peerScore?: number | null,
): {
  gap_value: number;
  gap_direction: "self_higher" | "manager_higher" | "aligned";
  peer_corroborates: "self" | "manager" | "neither" | "no_peer";
} {
  const gap_value = round1(Math.abs(selfScore - managerScore));

  let gap_direction: "self_higher" | "manager_higher" | "aligned";
  if (selfScore > managerScore + 0.5) gap_direction = "self_higher";
  else if (managerScore > selfScore + 0.5) gap_direction = "manager_higher";
  else gap_direction = "aligned";

  let peer_corroborates: "self" | "manager" | "neither" | "no_peer";
  if (peerScore === null || peerScore === undefined) {
    peer_corroborates = "no_peer";
  } else {
    const dManager = Math.abs(peerScore - managerScore);
    const dSelf = Math.abs(peerScore - selfScore);
    if (dManager < dSelf) peer_corroborates = "manager";
    else if (dSelf < dManager) peer_corroborates = "self";
    else peer_corroborates = "neither";
  }

  return { gap_value, gap_direction, peer_corroborates };
}

export function computeTrendDelta(
  current: number,
  prior: number | null,
): { delta: number; label: "improving" | "steady" | "declining" } {
  if (prior === null || prior === undefined) {
    return { delta: 0, label: "steady" };
  }
  const delta = round1(current - prior);
  let label: "improving" | "steady" | "declining";
  if (delta >= 0.5) label = "improving";
  else if (delta <= -0.5) label = "declining";
  else label = "steady";
  return { delta, label };
}

export function computeStatus(params: {
  avgDimensionScore: number;
  maxGap: number;
  decliningCount: number;
}): "accelerating" | "steady" | "stalling" | "attention" {
  const { avgDimensionScore, maxGap, decliningCount } = params;
  if (maxGap >= 2.5 || decliningCount >= 4 || avgDimensionScore < 5) return "attention";
  if (maxGap >= 1.5 || decliningCount >= 2) return "stalling";
  if (avgDimensionScore >= 7.5 && decliningCount === 0) return "accelerating";
  return "steady";
}

export function updateSkillProficiency(previous: number, newRating: number): number {
  if (previous === 0) return round1(newRating);
  return round1(0.3 * previous + 0.7 * newRating);
}

/* ------------------------------------------------------------------ */
/*  Inline unit tests                                                  */
/* ------------------------------------------------------------------ */

export function runScoringTests(): void {
  let pass = 0;
  let fail = 0;

  const check = (name: string, actual: unknown, expected: unknown) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (ok) {
      pass++;
      console.log(`✓ ${name}`);
    } else {
      fail++;
      console.error(`✗ ${name}\n   expected: ${JSON.stringify(expected)}\n   actual:   ${JSON.stringify(actual)}`);
    }
  };

  check(
    "computePerceptionGap(5, 8, 7)",
    computePerceptionGap(5, 8, 7),
    { gap_value: 3, gap_direction: "manager_higher", peer_corroborates: "manager" },
  );

  check(
    "computePerceptionGap(5, 5, null)",
    computePerceptionGap(5, 5, null),
    { gap_value: 0, gap_direction: "aligned", peer_corroborates: "no_peer" },
  );

  check(
    "computeStatus attention",
    computeStatus({ avgDimensionScore: 4.8, maxGap: 3.0, decliningCount: 5 }),
    "attention",
  );

  check(
    "computeStatus accelerating",
    computeStatus({ avgDimensionScore: 8.0, maxGap: 0.5, decliningCount: 0 }),
    "accelerating",
  );

  check(
    "computeTrendDelta(7.5, 7.0) improving",
    computeTrendDelta(7.5, 7.0),
    { delta: 0.5, label: "improving" },
  );

  check(
    "computeTrendDelta(6.0, 7.0) declining",
    computeTrendDelta(6.0, 7.0),
    { delta: -1, label: "declining" },
  );

  // Note: spec example listed 6.2, but 0.4*5 + 0.4*8 + 0.2*7 = 6.6.
  // Formula is the source of truth.
  check(
    "computeCombinedDimensionScore(5, 8, 7)",
    computeCombinedDimensionScore(5, 8, 7),
    { score: 6.6, confidence: "high" },
  );

  check(
    "updateSkillProficiency(0, 5) first rating",
    updateSkillProficiency(0, 5),
    5,
  );

  check(
    "updateSkillProficiency(6, 8)",
    updateSkillProficiency(6, 8),
    7.4,
  );

  console.log(`\nScoring tests: ${pass} passed, ${fail} failed`);
}
