import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";

export type ExecutiveConstraintUrgency =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface ExecutivePrimaryConstraint {
  id: string;

  conditionId: string;

  title: string;

  executiveSummary: string;

  whyNow: string;

  confidence: number;

  leverageScore: number;

  urgency: ExecutiveConstraintUrgency;

  supportingConditionIds: string[];

  downstreamConditionIds: string[];

  expectedExecutiveImpact: string;

  supportingMechanismIds: string[];

  supportingBeliefIds: string[];

  supportingConceptIds: string[];

  supportingTheoryIds: string[];

  generatedAt: string;
}

export interface BuildPrimaryExecutiveConstraintInput {
  organizationalConditions: OrganizationalCondition[];

  now?: string;
}

type RankedConstraintCandidate = {
  condition: OrganizationalCondition;

  leverageScore: number;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 1,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function round(
  value: number,
  precision = 4,
): number {
  const multiplier =
    10 ** precision;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}

function unique(
  values: string[],
): string[] {
  return [...new Set(values)];
}

function compareStrings(
  left: string,
  right: string,
): number {
  return left.localeCompare(right);
}

function normalizeConfidence(
  confidence: number,
): number {
  if (!Number.isFinite(confidence)) {
    return 0;
  }

  if (confidence > 1) {
    return clamp(
      confidence / 100,
    );
  }

  return clamp(confidence);
}

function normalizeStrength(
  strength: number,
): number {
  if (!Number.isFinite(strength)) {
    return 0;
  }

  if (strength > 1) {
    return clamp(
      strength / 100,
    );
  }

  return clamp(strength);
}

function priorityScore(
  priority: OrganizationalCondition["priority"],
): number {
  switch (priority) {
    case "critical":
      return 1;

    case "high":
      return 0.8;

    case "medium":
      return 0.5;

    case "low":
      return 0.2;

    default:
      return 0;
  }
}

function trendScore(
  trend: OrganizationalCondition["trend"],
): number {
  switch (trend) {
    case "weakening":
      return 1;

    case "new":
      return 0.7;

    case "stable":
      return 0.45;

    case "strengthening":
      return 0.2;

    default:
      return 0;
  }
}

/**
 * Status values are owned by the existing OrganizationalCondition contract.
 *
 * This synthesizer intentionally avoids introducing a second status taxonomy.
 * It treats status as a supporting signal and derives a stable score from its
 * semantic value without requiring a new union definition.
 */
function statusScore(
  status: OrganizationalCondition["status"],
): number {
  const normalizedStatus = String(status)
    .trim()
    .toLowerCase();

  if (
    normalizedStatus.includes("critical") ||
    normalizedStatus.includes("severe") ||
    normalizedStatus.includes("blocked")
  ) {
    return 1;
  }

  if (
    normalizedStatus.includes("strained") ||
    normalizedStatus.includes("constrained") ||
    normalizedStatus.includes("at-risk") ||
    normalizedStatus.includes("risk")
  ) {
    return 0.8;
  }

  if (
    normalizedStatus.includes("watch") ||
    normalizedStatus.includes("emerging") ||
    normalizedStatus.includes("mixed")
  ) {
    return 0.55;
  }

  if (
    normalizedStatus.includes("uncertain") ||
    normalizedStatus.includes("unknown")
  ) {
    return 0.35;
  }

  if (
    normalizedStatus.includes("healthy") ||
    normalizedStatus.includes("resolved") ||
    normalizedStatus.includes("strong")
  ) {
    return 0.1;
  }

  return 0.4;
}

function calculateLeverageScore(
  condition: OrganizationalCondition,
  maximumDownstreamCount: number,
  maximumSupportCount: number,
): number {
  const confidence =
    normalizeConfidence(
      condition.confidence,
    );

  const strength =
    normalizeStrength(
      condition.strength,
    );

  const downstreamCount =
    condition.downstreamConditionIds.length;

  const downstreamScore =
    maximumDownstreamCount > 0
      ? clamp(
          downstreamCount /
            maximumDownstreamCount,
        )
      : 0;

  const supportCount =
    condition.supportingMechanismIds.length +
    condition.supportingBeliefIds.length +
    condition.supportingConceptIds.length +
    condition.supportingTheoryIds.length;

  const supportScore =
    maximumSupportCount > 0
      ? clamp(
          supportCount /
            maximumSupportCount,
        )
      : 0;

  const score =
    priorityScore(
      condition.priority,
    ) *
      0.28 +
    statusScore(
      condition.status,
    ) *
      0.14 +
    trendScore(
      condition.trend,
    ) *
      0.14 +
    confidence * 0.14 +
    strength * 0.14 +
    downstreamScore * 0.12 +
    supportScore * 0.04;

  return round(clamp(score));
}

function determineUrgency(
  condition: OrganizationalCondition,
): ExecutiveConstraintUrgency {
  if (
    condition.priority === "critical"
  ) {
    return "critical";
  }

  if (
    condition.priority === "high" ||
    condition.trend === "weakening"
  ) {
    return "high";
  }

  if (
    condition.priority === "medium" ||
    condition.trend === "new"
  ) {
    return "medium";
  }

  return "low";
}

function buildExecutiveSummary(
  condition: OrganizationalCondition,
): string {
  const conditionName =
    condition.name.trim();

  if (
    condition.priority === "critical"
  ) {
    return `${conditionName} is the most critical current constraint on organizational performance.`;
  }

  if (
    condition.priority === "high" &&
    condition.trend === "weakening"
  ) {
    return `${conditionName} is the highest-priority constraint and is weakening, making it the most urgent point for executive intervention.`;
  }

  if (
    condition.priority === "high"
  ) {
    return `${conditionName} is the strongest current constraint on organizational execution.`;
  }

  if (
    condition.trend === "weakening"
  ) {
    return `${conditionName} is the highest-leverage deteriorating condition requiring executive attention.`;
  }

  if (
    condition.trend === "new"
  ) {
    return `${conditionName} is the most consequential emerging constraint in the current Operating Model.`;
  }

  return `${conditionName} is the highest-leverage constraint among the organization's currently identified conditions.`;
}

function buildWhyNow(
  condition: OrganizationalCondition,
): string {
  const downstreamCount =
    condition.downstreamConditionIds.length;

  if (
    condition.trend === "weakening" &&
    downstreamCount > 0
  ) {
    return `${condition.name} is weakening and influences ${downstreamCount} downstream organizational ${
      downstreamCount === 1
        ? "condition"
        : "conditions"
    }, making it the highest-leverage point for executive intervention now.`;
  }

  if (
    condition.trend === "weakening"
  ) {
    return `${condition.name} is weakening, increasing the organizational cost and risk of delayed executive action.`;
  }

  if (downstreamCount > 0) {
    return `${condition.name} influences ${downstreamCount} downstream organizational ${
      downstreamCount === 1
        ? "condition"
        : "conditions"
    }, giving it greater organizational leverage than the other identified constraints.`;
  }

  if (
    condition.priority === "critical"
  ) {
    return `${condition.name} carries critical executive priority and should be addressed before lower-leverage organizational issues.`;
  }

  if (
    condition.priority === "high"
  ) {
    return `${condition.name} is materially limiting organizational performance and requires focused executive attention.`;
  }

  const whyItMatters =
    condition.whyItMatters.trim();

  if (whyItMatters) {
    return whyItMatters;
  }

  return `${condition.name} currently represents the strongest available opportunity to improve organizational performance.`;
}

function buildExpectedExecutiveImpact(
  condition: OrganizationalCondition,
): string {
  const downstreamCount =
    condition.downstreamConditionIds.length;

  const normalizedName =
    condition.name
      .trim()
      .toLowerCase();

  if (downstreamCount > 1) {
    return `Addressing ${normalizedName} is expected to improve multiple connected organizational conditions and create greater overall improvement than treating those downstream symptoms independently.`;
  }

  if (downstreamCount === 1) {
    return `Addressing ${normalizedName} is expected to improve both the constraint itself and its connected downstream condition.`;
  }

  return `Addressing ${normalizedName} is expected to produce the greatest improvement among the organization's currently identified intervention points.`;
}

function compareCandidates(
  left: RankedConstraintCandidate,
  right: RankedConstraintCandidate,
): number {
  if (
    right.leverageScore !==
    left.leverageScore
  ) {
    return (
      right.leverageScore -
      left.leverageScore
    );
  }

  const priorityComparison =
    priorityScore(
      right.condition.priority,
    ) -
    priorityScore(
      left.condition.priority,
    );

  if (priorityComparison !== 0) {
    return priorityComparison;
  }

  const confidenceComparison =
    normalizeConfidence(
      right.condition.confidence,
    ) -
    normalizeConfidence(
      left.condition.confidence,
    );

  if (confidenceComparison !== 0) {
    return confidenceComparison;
  }

  const strengthComparison =
    normalizeStrength(
      right.condition.strength,
    ) -
    normalizeStrength(
      left.condition.strength,
    );

  if (strengthComparison !== 0) {
    return strengthComparison;
  }

  const downstreamComparison =
    right.condition
      .downstreamConditionIds
      .length -
    left.condition
      .downstreamConditionIds
      .length;

  if (downstreamComparison !== 0) {
    return downstreamComparison;
  }

  return compareStrings(
    left.condition.id,
    right.condition.id,
  );
}

function buildSupportingConditionIds(
  primaryCondition: OrganizationalCondition,
  allConditions: OrganizationalCondition[],
): string[] {
  const upstreamIds = unique(
    primaryCondition.upstreamConditionIds,
  );

  const directlyRelatedConditionIds =
    allConditions
      .filter((condition) => {
        if (
          condition.id ===
          primaryCondition.id
        ) {
          return false;
        }

        return (
          condition.downstreamConditionIds.includes(
            primaryCondition.id,
          ) ||
          condition.upstreamConditionIds.includes(
            primaryCondition.id,
          ) ||
          primaryCondition.downstreamConditionIds.includes(
            condition.id,
          ) ||
          primaryCondition.upstreamConditionIds.includes(
            condition.id,
          )
        );
      })
      .map(
        (condition) =>
          condition.id,
      );

  return unique([
    ...upstreamIds,
    ...directlyRelatedConditionIds,
  ]).sort(compareStrings);
}

export function buildPrimaryExecutiveConstraint({
  organizationalConditions,
  now = new Date().toISOString(),
}: BuildPrimaryExecutiveConstraintInput):
  | ExecutivePrimaryConstraint
  | null {
  if (
    organizationalConditions.length ===
    0
  ) {
    return null;
  }

  const maximumDownstreamCount =
    Math.max(
      ...organizationalConditions.map(
        (condition) =>
          condition
            .downstreamConditionIds
            .length,
      ),
      0,
    );

  const maximumSupportCount =
    Math.max(
      ...organizationalConditions.map(
        (condition) =>
          condition
            .supportingMechanismIds
            .length +
          condition
            .supportingBeliefIds
            .length +
          condition
            .supportingConceptIds
            .length +
          condition
            .supportingTheoryIds
            .length,
      ),
      0,
    );

  const rankedCandidates =
    organizationalConditions
      .map(
        (
          condition,
        ): RankedConstraintCandidate => ({
          condition,

          leverageScore:
            calculateLeverageScore(
              condition,
              maximumDownstreamCount,
              maximumSupportCount,
            ),
        }),
      )
      .sort(compareCandidates);

  const primaryCandidate =
    rankedCandidates[0];

  if (!primaryCandidate) {
    return null;
  }

  const primaryCondition =
    primaryCandidate.condition;

  return {
    id: `executive-primary-constraint:${primaryCondition.id}`,

    conditionId:
      primaryCondition.id,

    title:
      primaryCondition.name,

    executiveSummary:
      buildExecutiveSummary(
        primaryCondition,
      ),

    whyNow:
      buildWhyNow(
        primaryCondition,
      ),

    confidence:
      normalizeConfidence(
        primaryCondition.confidence,
      ),

    leverageScore:
      primaryCandidate.leverageScore,

    urgency:
      determineUrgency(
        primaryCondition,
      ),

    supportingConditionIds:
      buildSupportingConditionIds(
        primaryCondition,
        organizationalConditions,
      ),

    downstreamConditionIds:
      unique(
        primaryCondition.downstreamConditionIds,
      ).sort(compareStrings),

    expectedExecutiveImpact:
      buildExpectedExecutiveImpact(
        primaryCondition,
      ),

    supportingMechanismIds:
      unique(
        primaryCondition.supportingMechanismIds,
      ).sort(compareStrings),

    supportingBeliefIds:
      unique(
        primaryCondition.supportingBeliefIds,
      ).sort(compareStrings),

    supportingConceptIds:
      unique(
        primaryCondition.supportingConceptIds,
      ).sort(compareStrings),

    supportingTheoryIds:
      unique(
        primaryCondition.supportingTheoryIds,
      ).sort(compareStrings),

    generatedAt: now,
  };
}