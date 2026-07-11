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
  return Math.max(0, Math.min(1, value));
}

/**
 * Canonical condition ranking used anywhere Discovery must decide
 * which organizational condition deserves the greatest attention.
 */
export function rankOrganizationalCondition(
  condition: RankableOrganizationalCondition,
): number {
  const priorityWeight =
    condition.priority === "critical"
      ? 0.35
      : condition.priority === "high"
        ? 0.25
        : condition.priority === "medium"
          ? 0.14
          : 0.05;

  const statusWeight =
    condition.status === "deteriorating"
      ? 0.3
      : condition.status === "constrained"
        ? 0.22
        : condition.status === "weak" ||
            condition.status === "unresolved"
          ? 0.15
          : condition.status === "emerging"
            ? 0.1
            : condition.status === "improving"
              ? 0.04
              : 0.02;

  const trendWeight =
    condition.trend === "strengthening"
      ? 0.12
      : condition.trend === "new"
        ? 0.08
        : condition.trend === "weakening"
          ? -0.04
          : 0.02;

  const supportCount =
    (condition.supportingConceptIds?.length ?? 0) +
    (condition.supportingBeliefIds?.length ?? 0) +
    (condition.supportingMechanismIds?.length ?? 0) +
    (condition.supportingTheoryIds?.length ?? 0);

  const breadthWeight = clamp01(supportCount / 18) * 0.16;

  return clamp01(
    (condition.strength ?? 0) * 0.35 +
      (condition.confidence ?? 0) * 0.22 +
      priorityWeight +
      statusWeight +
      trendWeight +
      breadthWeight,
  );
}
