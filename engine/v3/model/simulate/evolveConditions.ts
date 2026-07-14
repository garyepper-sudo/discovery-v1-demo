import type {
  OrganizationalInfluencePropagationResult,
} from "../causal/propagateOrganizationalInfluence";
import type {
  OrganizationalCondition,
} from "../state/inferOrganizationalConditions";

const TREND_THRESHOLD = 0.15;
const STATUS_THRESHOLD = 0.25;
const STRENGTH_EFFECT_WEIGHT = 0.25;
const CONFIDENCE_EFFECT_WEIGHT = 0.1;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function trendFromDelta(
  delta: number,
): OrganizationalCondition["trend"] {
  if (delta >= TREND_THRESHOLD) {
    return "weakening";
  }

  if (delta <= -TREND_THRESHOLD) {
    return "strengthening";
  }

  return "stable";
}

function statusFromDelta(
  condition: OrganizationalCondition,
  delta: number,
): OrganizationalCondition["status"] {
  if (delta >= STATUS_THRESHOLD) {
    return "improving";
  }

  if (delta <= -STATUS_THRESHOLD) {
    return "deteriorating";
  }

  return condition.status;
}

function buildInfluenceMap(
  influence: OrganizationalInfluencePropagationResult,
): Map<string, number> {
  const influenceByEntityId = new Map<string, number>();

  for (const change of influence.changes) {
    const existingDelta =
      influenceByEntityId.get(change.entityId);

    if (
      existingDelta === undefined ||
      Math.abs(change.delta) > Math.abs(existingDelta)
    ) {
      influenceByEntityId.set(
        change.entityId,
        change.delta,
      );
    }
  }

  return influenceByEntityId;
}

/**
 * Evolves canonical organizational conditions using the direct and indirect
 * effects produced by organizational causal propagation.
 *
 * Positive deltas represent improvement in the organizational condition:
 * the active constraint weakens, confidence in the projected assessment
 * increases, and sufficiently strong effects move the status to improving.
 *
 * Negative deltas represent deterioration:
 * the active constraint strengthens and sufficiently strong effects move
 * the status to deteriorating.
 *
 * This function is deterministic when `evolvedAt` is supplied. It does not
 * add simulation-only fields to OrganizationalCondition and does not mutate
 * the input collection.
 */
export function evolveConditions(
  conditions: OrganizationalCondition[],
  influence?: OrganizationalInfluencePropagationResult,
  evolvedAt: string = new Date().toISOString(),
): OrganizationalCondition[] {
  if (!influence || influence.changes.length === 0) {
    return conditions;
  }

  const influenceByEntityId =
    buildInfluenceMap(influence);

  return conditions.map((condition) => {
    const delta =
      influenceByEntityId.get(condition.id);

    if (delta === undefined || delta === 0) {
      return condition;
    }

    return {
      ...condition,

      status:
        statusFromDelta(
          condition,
          delta,
        ),

      strength: clamp01(
        condition.strength -
          delta * STRENGTH_EFFECT_WEIGHT,
      ),

      confidence: clamp01(
        condition.confidence +
          Math.abs(delta) *
            CONFIDENCE_EFFECT_WEIGHT,
      ),

      trend:
        trendFromDelta(delta),

      lastUpdatedAt:
        evolvedAt,
    };
  });
}
