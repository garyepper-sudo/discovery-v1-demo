export type RankableOrganizationalCondition = {
  priority?: string;
  status?: string;
  trend?: string;
  confidence?: number;
  strength?: number;
  supportingConceptIds?: string[];
  supportingBeliefIds?: string[];
  supportingMechanismIds?: string[];
  supportingTheoryIds?: string[];
};

function clamp01(value: number): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function priorityScore(
  priority?: string,
): number {
  if (priority === "critical") {
    return 1;
  }

  if (priority === "high") {
    return 0.8;
  }

  if (priority === "medium") {
    return 0.55;
  }

  if (priority === "low") {
    return 0.3;
  }

  return 0.15;
}

function statusScore(
  status?: string,
): number {
  if (
    status === "deteriorating"
  ) {
    return 1;
  }

  if (
    status === "constrained"
  ) {
    return 0.82;
  }

  if (
    status === "weak" ||
    status === "unresolved"
  ) {
    return 0.62;
  }

  if (
    status === "emerging"
  ) {
    return 0.48;
  }

  if (
    status === "improving"
  ) {
    return 0.2;
  }

  return 0.1;
}

function trendScore(
  trend?: string,
): number {
  if (
    trend === "strengthening"
  ) {
    return 1;
  }

  if (
    trend === "new"
  ) {
    return 0.7;
  }

  if (
    trend === "stable"
  ) {
    return 0.45;
  }

  if (
    trend === "weakening"
  ) {
    return 0.15;
  }

  return 0.35;
}

function supportBreadthScore(
  condition:
    RankableOrganizationalCondition,
): number {
  const supportCount =
    (
      condition
        .supportingConceptIds
        ?.length ??
      0
    ) +
    (
      condition
        .supportingBeliefIds
        ?.length ??
      0
    ) +
    (
      condition
        .supportingMechanismIds
        ?.length ??
      0
    ) +
    (
      condition
        .supportingTheoryIds
        ?.length ??
      0
    );

  return clamp01(
    supportCount /
      18,
  );
}

/**
 * Canonical condition ranking used anywhere Discovery must determine
 * which organizational condition currently carries the greatest
 * organizational significance.
 *
 * This score measures condition significance only.
 * Executive intervention leverage should be ranked separately.
 */
export function rankOrganizationalCondition(
  condition:
    RankableOrganizationalCondition,
): number {
  const strength =
    clamp01(
      condition.strength ??
        0,
    );

  const confidence =
    clamp01(
      condition.confidence ??
        0,
    );

  const score =
    strength *
      0.24 +
    confidence *
      0.18 +
    priorityScore(
      condition.priority,
    ) *
      0.2 +
    statusScore(
      condition.status,
    ) *
      0.16 +
    trendScore(
      condition.trend,
    ) *
      0.08 +
    supportBreadthScore(
      condition,
    ) *
      0.14;

  return Number(
    clamp01(
      score,
    ).toFixed(
      6,
    ),
  );
}