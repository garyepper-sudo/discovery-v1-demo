import type {
  OrganizationalCondition,
} from "../state/inferOrganizationalConditions";
import {
  rankOrganizationalCondition,
} from "../state/rankOrganizationalCondition";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function isActiveConstraint(
  condition: OrganizationalCondition,
): boolean {
  return (
    condition.priority === "critical" ||
    condition.priority === "high" ||
    condition.status === "deteriorating" ||
    condition.status === "constrained" ||
    condition.status === "weak" ||
    condition.status === "unresolved"
  );
}

function downstreamLeverageScore(params: {
  condition: OrganizationalCondition;
  conditionsById: Map<string, OrganizationalCondition>;
}): number {
  const downstreamConditions =
    params.condition.downstreamConditionIds
      .map((id) => params.conditionsById.get(id))
      .filter(
        (
          condition,
        ): condition is OrganizationalCondition =>
          Boolean(condition),
      );

  if (downstreamConditions.length === 0) {
    return 0;
  }

  const downstreamSignificance =
    downstreamConditions.reduce(
      (total, condition) =>
        total +
        rankOrganizationalCondition(condition),
      0,
    ) / downstreamConditions.length;

  const activeDownstreamRatio =
    downstreamConditions.filter(isActiveConstraint)
      .length / downstreamConditions.length;

  const breadth =
    clamp01(downstreamConditions.length / 4);

  return clamp01(
    downstreamSignificance * 0.45 +
      activeDownstreamRatio * 0.35 +
      breadth * 0.2,
  );
}

function rootConstraintScore(params: {
  condition: OrganizationalCondition;
  conditionsById: Map<string, OrganizationalCondition>;
}): number {
  const upstreamConditions =
    params.condition.upstreamConditionIds
      .map((id) => params.conditionsById.get(id))
      .filter(
        (
          condition,
        ): condition is OrganizationalCondition =>
          Boolean(condition),
      );

  if (upstreamConditions.length === 0) {
    return 1;
  }

  const activeUpstreamRatio =
    upstreamConditions.filter(isActiveConstraint)
      .length / upstreamConditions.length;

  return clamp01(1 - activeUpstreamRatio);
}

/**
 * Ranks an organizational condition according to its value as the
 * organization's primary executive constraint.
 *
 * Unlike rankOrganizationalCondition(), which measures condition
 * significance, this function also considers whether the condition:
 *
 * - influences important downstream conditions,
 * - contributes to multiple active organizational constraints,
 * - and appears to be a root constraint rather than a downstream symptom.
 */
export function rankExecutiveConstraint(params: {
  condition: OrganizationalCondition;
  allConditions: OrganizationalCondition[];
}): number {
  const conditionsById = new Map(
    params.allConditions.map((condition) => [
      condition.id,
      condition,
    ]),
  );

  const conditionSignificance =
    rankOrganizationalCondition(params.condition);

  const downstreamLeverage =
    downstreamLeverageScore({
      condition: params.condition,
      conditionsById,
    });

  const rootConstraint =
    rootConstraintScore({
      condition: params.condition,
      conditionsById,
    });

  const score =
    conditionSignificance * 0.6 +
    downstreamLeverage * 0.3 +
    rootConstraint * 0.1;

  return Number(
    clamp01(score).toFixed(6),
  );
}