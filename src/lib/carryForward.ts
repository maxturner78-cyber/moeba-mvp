import { supabase } from "@/integrations/supabase/client";
import { ALL_DIMENSION_KEYS } from "@/lib/adaptive";

type Role = "self" | "manager" | "peer";

const TABLE_BY_ROLE: Record<Role, "weekly_check_ins_self" | "weekly_check_ins_manager" | "weekly_check_ins_peer"> = {
  self: "weekly_check_ins_self",
  manager: "weekly_check_ins_manager",
  peer: "weekly_check_ins_peer",
};

const ACTOR_COLUMN: Record<Role, "graduate_id" | "manager_id" | "peer_id"> = {
  self: "graduate_id",
  manager: "manager_id",
  peer: "peer_id",
};

export interface CarryForwardResult {
  /** Combined dimension_scores: asked values + carried values (or null when no prior) */
  dimensionScores: Record<string, number | null>;
  /** Dimension keys that were carried (not asked this week) */
  carriedForward: string[];
}

/**
 * Fetch the most recent prior check-in for this graduate/role and merge
 * carried-forward dimension values into askedDimensionScores.
 *
 * - Keys in askedDimensionScores: kept as-is.
 * - Other keys in ALL_DIMENSION_KEYS: copied from previous week if present, else null.
 * - All carried keys (whether copied or null) are added to `carriedForward`.
 */
export async function buildCarriedDimensionScores(params: {
  role: Role;
  graduateId: string;
  weekNumber: number;
  /** For manager/peer: the actor's id (manager_id or peer_id). Optional. */
  actorId?: string;
  askedDimensionScores: Record<string, number>;
}): Promise<CarryForwardResult> {
  const { role, graduateId, weekNumber, actorId, askedDimensionScores } = params;

  let query = supabase
    .from(TABLE_BY_ROLE[role])
    .select("dimension_scores, week_number")
    .eq("graduate_id", graduateId)
    .lt("week_number", weekNumber)
    .order("week_number", { ascending: false })
    .limit(1);

  if ((role === "manager" || role === "peer") && actorId) {
    query = query.eq(ACTOR_COLUMN[role], actorId);
  }

  const { data, error } = await query;
  if (error) {
    // Fail open — carry nothing, mark all unasked as null
    console.warn("[carryForward] failed to fetch prior check-in:", error.message);
  }

  const prior = (data?.[0]?.dimension_scores ?? {}) as Record<string, number | null>;

  const dimensionScores: Record<string, number | null> = { ...askedDimensionScores };
  const carriedForward: string[] = [];

  for (const key of ALL_DIMENSION_KEYS) {
    if (key in askedDimensionScores) continue;
    const priorVal = prior[key];
    dimensionScores[key] = typeof priorVal === "number" ? priorVal : null;
    carriedForward.push(key);
  }

  return { dimensionScores, carriedForward };
}
