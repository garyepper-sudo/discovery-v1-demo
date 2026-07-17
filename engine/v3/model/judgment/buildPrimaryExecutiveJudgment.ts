import type {
  OrganizationalCondition,
} from "../state/inferOrganizationalConditions";

import type {
  BuildPrimaryExecutiveJudgmentInput,
  ExecutiveConfidenceLevel,
  ExecutivePrimaryJudgment,
} from "./executivePrimaryJudgmentTypes";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value): value is string =>
          typeof value === "string" &&
          value.length > 0,
      ),
    ),
  );
}

function joinHuman(values: string[]): string {
  const clean = unique(values);

  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) {
    return `${clean[0]} and ${clean[1]}`;
  }

  return `${clean
    .slice(0, -1)
    .join(", ")}, and ${clean[clean.length - 1]}`;
}

function confidenceLevel(
  confidence: number,
): ExecutiveConfidenceLevel {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "moderate";
  return "low";
}

function conditionRiskScore(
  condition: OrganizationalCondition,
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

  const evidenceBreadth =
    condition.supportingConceptIds.length +
    condition.supportingBeliefIds.length +
    condition.supportingMechanismIds.length +
    condition.supportingTheoryIds.length;

  const breadthWeight =
    clamp01(evidenceBreadth / 18) * 0.16;

  return clamp01(
    condition.strength * 0.35 +
      condition.confidence * 0.22 +
      priorityWeight +
      statusWeight +
      trendWeight +
      breadthWeight,
  );
}

function resolveDominantCondition(params: {
  dominantConditionIds: string[];
  conditions: OrganizationalCondition[];
}): OrganizationalCondition | undefined {
  const conditionById =
    new Map(
      params.conditions.map(
        (condition) => [
          condition.id,
          condition,
        ],
      ),
    );

  for (
    const conditionId
    of params.dominantConditionIds
  ) {
    const condition =
      conditionById.get(conditionId);

    if (condition) {
      return condition;
    }
  }

  return params.conditions
    .slice()
    .sort(
      (left, right) =>
        conditionRiskScore(right) -
        conditionRiskScore(left),
    )[0];
}

function resolveSupportingConditions(params: {
  dominantCondition: OrganizationalCondition;
  dominantConditionIds: string[];
  conditions: OrganizationalCondition[];
}): OrganizationalCondition[] {
  const candidates =
    params.conditions.filter(
      (condition) =>
        condition.id !==
        params.dominantCondition.id,
    );

  const preferredIds =
    new Set(
      params.dominantConditionIds.slice(1),
    );

  return candidates
    .slice()
    .sort((left, right) => {
      const leftPreferred =
        preferredIds.has(left.id)
          ? 1
          : 0;

      const rightPreferred =
        preferredIds.has(right.id)
          ? 1
          : 0;

      if (
        leftPreferred !==
        rightPreferred
      ) {
        return (
          rightPreferred -
          leftPreferred
        );
      }

      return (
        conditionRiskScore(right) -
        conditionRiskScore(left)
      );
    })
    .slice(0, 3);
}

function buildHeadline(
  condition: OrganizationalCondition,
): string {
  const conditionState =
    condition.status === "deteriorating"
      ? "is deteriorating and is the organization's primary constraint"
      : condition.status === "constrained"
        ? "is the organization's primary constraint"
        : condition.status === "weak"
          ? "is the organization's primary weakness"
          : condition.status === "unresolved"
            ? "is the organization's most important unresolved condition"
            : condition.status === "improving"
              ? "is improving but remains the organization's highest-leverage condition"
              : "is the organization's highest-leverage condition";

  return `${condition.name} ${conditionState}.`;
}

function buildExecutiveJudgment(params: {
  condition: OrganizationalCondition;
  supportingConditions: OrganizationalCondition[];
}): string {
  const supportingNames =
    params.supportingConditions.map(
      (condition) => condition.name,
    );

  const systemContext =
    supportingNames.length > 0
      ? ` It is reinforced by ${joinHuman(
          supportingNames,
        )}.`
      : "";

  const action =
    params.condition
      .recommendedExecutiveAction
      ?.trim();

  const actionSentence =
    action
      ? ` Leadership attention should focus on this system before treating downstream symptoms or adding capacity elsewhere.`
      : "";

  return [
    `${params.condition.name} currently carries the highest combined organizational risk based on its strength, confidence, priority, trend, and breadth of supporting cognition.`,
    params.condition.whyItMatters,
    systemContext,
    actionSentence,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildRationale(params: {
  condition: OrganizationalCondition;
  supportingConditions: OrganizationalCondition[];
}): string {
  const evidenceParts = [
    params.condition
      .supportingMechanismIds.length > 0
      ? `${params.condition.supportingMechanismIds.length} mechanism${
          params.condition.supportingMechanismIds.length === 1
            ? ""
            : "s"
        }`
      : "",
    params.condition
      .supportingBeliefIds.length > 0
      ? `${params.condition.supportingBeliefIds.length} belief${
          params.condition.supportingBeliefIds.length === 1
            ? ""
            : "s"
        }`
      : "",
    params.condition
      .supportingConceptIds.length > 0
      ? `${params.condition.supportingConceptIds.length} concept${
          params.condition.supportingConceptIds.length === 1
            ? ""
            : "s"
        }`
      : "",
    params.condition
      .supportingTheoryIds.length > 0
      ? `${params.condition.supportingTheoryIds.length} theor${
          params.condition.supportingTheoryIds.length === 1
            ? "y"
            : "ies"
        }`
      : "",
  ].filter(Boolean);

  const supportText =
    evidenceParts.length > 0
      ? `The judgment is supported by ${joinHuman(
          evidenceParts,
        )}.`
      : "The judgment is based primarily on the current organizational condition model.";

  const relatedText =
    params.supportingConditions.length > 0
      ? ` The most relevant supporting conditions are ${joinHuman(
          params.supportingConditions.map(
            (condition) => condition.name,
          ),
        )}.`
      : "";

  return `${supportText}${relatedText}`;
}

function buildUncertaintySummary(
  condition: OrganizationalCondition,
): string {
  const explicitUncertainty =
    condition.uncertaintySummary?.trim();

  if (explicitUncertainty) {
    return explicitUncertainty;
  }

  if (
    condition.confidenceLimiters.length > 0
  ) {
    return condition
      .confidenceLimiters[0];
  }

  if (
    condition.missingEvidence.length > 0
  ) {
    return `The primary missing evidence is: ${condition.missingEvidence[0]}`;
  }

  return "Discovery has not identified a material confidence limiter for the primary judgment.";
}

export function buildPrimaryExecutiveJudgment(
  input: BuildPrimaryExecutiveJudgmentInput,
): ExecutivePrimaryJudgment {
  const now =
    input.now ??
    input.organizationalState
      .lastUpdatedAt ??
    new Date().toISOString();

  const dominantCondition =
    resolveDominantCondition({
      dominantConditionIds:
        input.organizationalState
          .dominantConditions,
      conditions:
        input.organizationalConditions,
    });

  if (!dominantCondition) {
    throw new Error(
      "Cannot build an Executive Primary Judgment without at least one Organizational Condition.",
    );
  }

  const supportingConditions =
    resolveSupportingConditions({
      dominantCondition,
      dominantConditionIds:
        input.organizationalState
          .dominantConditions,
      conditions:
        input.organizationalConditions,
    });

  const confidence =
    clamp01(
      dominantCondition.confidence *
        0.65 +
        input.organizationalState
          .confidence *
          0.35,
    );

  return {
    id:
      `executive-primary-judgment-${dominantCondition.id}`,

    generatedAt:
      now,

    dominantConditionId:
      dominantCondition.id,

    supportingConditionIds:
      supportingConditions.map(
        (condition) => condition.id,
      ),

    confidence,

    confidenceLevel:
      confidenceLevel(confidence),

    headline:
      buildHeadline(
        dominantCondition,
      ),

    executiveJudgment:
      buildExecutiveJudgment({
        condition:
          dominantCondition,
        supportingConditions,
      }),

    rationale:
      buildRationale({
        condition:
          dominantCondition,
        supportingConditions,
      }),

    supportingMechanismIds:
      unique(
        dominantCondition
          .supportingMechanismIds,
      ),

    supportingBeliefIds:
      unique(
        dominantCondition
          .supportingBeliefIds,
      ),

    supportingConceptIds:
      unique(
        dominantCondition
          .supportingConceptIds,
      ),

    supportingTheoryIds:
      unique(
        dominantCondition
          .supportingTheoryIds,
      ),

    uncertaintySummary:
      buildUncertaintySummary(
        dominantCondition,
      ),
  };
}
