import type {
  AggregatedOrganizationalInfluence,
} from "../causal/aggregateOrganizationalInfluence";

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

type OrganizationalInfluence =
  | OrganizationalInfluencePropagationResult
  | AggregatedOrganizationalInfluence[];

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

function hasInfluence(
  influence: OrganizationalInfluence | undefined,
): influence is OrganizationalInfluence {
  if (!influence) {
    return false;
  }

  if (Array.isArray(influence)) {
    return influence.length > 0;
  }

  return influence.changes.length > 0;
}

function buildInfluenceMap(
  influence: OrganizationalInfluence,
): Map<string, number> {
  const influenceByEntityId =
    new Map<string, number>();

  /**
   * Aggregated influence has already combined every direct and indirect
   * pathway through the canonical aggregation producer.
   */
  if (Array.isArray(influence)) {
    for (const aggregated of influence) {
      influenceByEntityId.set(
        aggregated.entityId,
        aggregated.delta,
      );
    }

    return influenceByEntityId;
  }

  /**
   * Preserve backward compatibility for single-source propagation results.
   *
   * When the same entity appears more than once, retain the strongest
   * absolute effect. Multi-source simulations should pass aggregated
   * influence instead.
   */
  for (const change of influence.changes) {
    const existingDelta =
      influenceByEntityId.get(
        change.entityId,
      );

    if (
      existingDelta === undefined ||
      Math.abs(change.delta) >
        Math.abs(existingDelta)
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
 * The function accepts either:
 *
 * - one raw propagation result for backward-compatible single-source
 *   simulation, or
 * - canonical aggregated influence for multi-source intervention simulation.
 *
 * This function is deterministic when `evolvedAt` is supplied. It does not
 * add simulation-only fields to OrganizationalCondition and does not mutate
 * the input collection.
 */
export function evolveConditions(
  conditions: OrganizationalCondition[],
  influence?: OrganizationalInfluence,
  evolvedAt: string = new Date().toISOString(),
): OrganizationalCondition[] {
  if (!hasInfluence(influence)) {
    return conditions;
  }

  const influenceByEntityId =
    buildInfluenceMap(influence);

  return conditions.map((condition) => {
    const delta =
      influenceByEntityId.get(
        condition.id,
      );

    if (
      delta === undefined ||
      delta === 0
    ) {
      return condition;
    }

    return {
      ...condition,

      status:
        statusFromDelta(
          condition,
          delta,
        ),

      strength:
        clamp01(
          condition.strength -
            delta *
              STRENGTH_EFFECT_WEIGHT,
        ),

      confidence:
        clamp01(
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