import type {
  ExecutiveDecisionCycle,
} from "../../../engine/v3/decisions/runExecutiveDecisionCycle";

import type {
  ExecutiveDecisionOptionProjection,
  ExecutiveDecisionProjection,
  ExecutiveDecisionRecommendationProjection,
} from "./ExecutiveDecisionProjection";

function toPercentage(
  value: number,
): number {
  const normalized =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        normalized,
      ),
    ),
  );
}

function findOptionTitle(
  cycle: ExecutiveDecisionCycle,
  interventionId:
    | string
    | undefined,
): string | undefined {
  if (!interventionId) {
    return undefined;
  }

  return cycle.evaluatedOptions.find(
    (evaluatedOption) =>
      evaluatedOption
        .intervention
        .id ===
      interventionId,
  )?.intervention.title;
}

function buildConditionOutcomes(
  cycle:
    ExecutiveDecisionCycle,

  interventionId:
    string,
): ExecutiveDecisionOptionProjection["conditionOutcomes"] {
  const comparison =
    cycle.comparisonSet
      .scenarioComparisons
      .find(
        (entry) =>
          entry.interventionId ===
          interventionId,
      );

  if (!comparison) {
    return [];
  }

  return comparison
    .targetConditionChanges
    .map((change) => ({
      conditionId:
        change.conditionId,

      conditionName:
        change.name,

      outcome:
        change.change,

      strengthDelta:
        change.strengthDelta,
    }));
}

function buildOptionProjection(
  cycle:
    ExecutiveDecisionCycle,

  interventionId:
    string,
): ExecutiveDecisionOptionProjection {
  const rankedScenario =
    cycle.rankedScenarios.find(
      (scenario) =>
        scenario.interventionId ===
        interventionId,
    );

  const evaluatedOption =
    cycle.evaluatedOptions.find(
      (option) =>
        option.intervention.id ===
        interventionId,
    );

  const comparison =
    cycle.comparisonSet
      .scenarioComparisons
      .find(
        (entry) =>
          entry.interventionId ===
          interventionId,
      );

  if (
    !rankedScenario ||
    !evaluatedOption ||
    !comparison
  ) {
    throw new Error(
      `Executive Decision Projection could not resolve intervention ${interventionId}.`,
    );
  }

  return {
    optionId:
      evaluatedOption.option.id,

    interventionId:
      evaluatedOption
        .intervention
        .id,

    title:
      evaluatedOption
        .intervention
        .title,

    description:
      evaluatedOption
        .intervention
        .description,

    rationale:
      evaluatedOption
        .intervention
        .rationale,

    rank:
      rankedScenario.rank,

    score:
      toPercentage(
        rankedScenario.score,
      ),

    organizationalBenefitScore:
      toPercentage(
        rankedScenario
          .organizationalBenefitScore,
      ),

    organizationalRiskScore:
      toPercentage(
        rankedScenario
          .organizationalRiskScore,
      ),

    confidence:
      toPercentage(
        rankedScenario
          .confidenceScore,
      ),

    scenarioRecommendation:
      comparison
        .executiveRecommendation,

    conditionOutcomes:
      buildConditionOutcomes(
        cycle,
        interventionId,
      ),

    reasonsForRank:
      rankedScenario
        .reasonsForRank,

    assumptions:
      evaluatedOption
        .option
        .assumptions,

    risks:
      evaluatedOption
        .option
        .risks,

    missingEvidence:
      evaluatedOption
        .option
        .missingEvidence,
  };
}

function buildRecommendationProjection(
  cycle:
    ExecutiveDecisionCycle,
): ExecutiveDecisionRecommendationProjection {
  const recommendation =
    cycle.recommendation;

  return {
    status:
      recommendation.status,

    confidence:
      toPercentage(
        recommendation.confidence,
      ),

    summary:
      recommendation.summary,

    recommendedInterventionId:
      recommendation
        .recommendedInterventionId,

    recommendedInterventionTitle:
      findOptionTitle(
        cycle,
        recommendation
          .recommendedInterventionId,
      ),

    nextBestInterventionId:
      recommendation
        .nextBestInterventionId,

    nextBestInterventionTitle:
      findOptionTitle(
        cycle,
        recommendation
          .nextBestInterventionId,
      ),

    whyRecommended:
      recommendation
        .whyRecommended,

    expectedBenefits:
      recommendation
        .expectedBenefits,

    tradeOffs:
      recommendation
        .tradeOffs,

    risks:
      recommendation.risks,

    assumptions:
      recommendation.assumptions,

    evidenceThatCouldChangeRecommendation:
      recommendation
        .evidenceThatCouldChangeRecommendation,
  };
}

/**
 * Projects one complete Executive Decision Cycle into a stable
 * executive-facing contract.
 *
 * This producer performs no new decision reasoning. It preserves:
 *
 * - the Executive Decision,
 * - every generated and evaluated option,
 * - scenario comparison,
 * - deterministic ranking,
 * - and the final recommendation.
 */
export function buildExecutiveDecisionProjection(
  cycle:
    ExecutiveDecisionCycle,
): ExecutiveDecisionProjection {
  const options =
    cycle.rankedScenarios.map(
      (rankedScenario) =>
        buildOptionProjection(
          cycle,
          rankedScenario.interventionId,
        ),
    );

  return {
    executiveDecisionId:
      cycle.executiveDecision.id,

    organizationId:
      cycle.executiveDecision
        .organizationId,

    title:
      cycle.executiveDecision.title,

    objective:
      cycle.executiveDecision
        .objective,

    rationale:
      cycle.executiveDecision
        .rationale,

    timeHorizon:
      cycle.executiveDecision
        .timeHorizon,

    constraints:
      cycle.executiveDecision
        .constraints
        .map((constraint) => ({
          type:
            constraint.type,

          description:
            constraint.description,

          required:
            constraint.required,
        })),

    successMetrics:
      cycle.executiveDecision
        .successMetrics
        .map((metric) => ({
          name:
            metric.name,

          baseline:
            metric.baseline,

          target:
            metric.target,

          unit:
            metric.unit,

          rationale:
            metric.rationale,
        })),

    options,

    recommendation:
      buildRecommendationProjection(
        cycle,
      ),

    differentiatingConditionIds:
      cycle.comparisonSet
        .differentiatingConditionIds,

    differentiatingRecommendations:
      cycle.comparisonSet
        .differentiatingRecommendations,

    completedAt:
      cycle.completedAt,
  };
}