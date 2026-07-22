import type {
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

import type {
  DecisionConfidenceCalibration,
} from "./calibrateDecisionConfidence";

import type {
  InterventionViabilityEvaluation,
} from "./evaluateInterventionViability";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import type {
  ExecutivePrimaryConstraint,
} from "../model/judgment/buildPrimaryExecutiveConstraint";

import type {
  ExecutiveOptimizationObjective,
} from "../optimization/executiveOptimizationObjective";

export type ExecutiveDecisionRecommendation = {
  recommendedInterventionId?: string;

  nextBestInterventionId?: string;

  /**
   * Canonical organizational condition that anchors the recommendation.
   */
  primaryConstraintId?: string;

  /**
   * Executive-facing name of the primary constraint.
   */
  primaryConstraintTitle?: string;

  /**
   * Canonical optimization objective used to compare strategies.
   */
  optimizationObjectiveId?: string;

  /**
   * Executive-facing description of what Discovery is optimizing.
   */
  optimizationObjective?: string;

  recommendedStrategy?: {
    optionId: string;

    interventionId: string;

    title: string;

    description: string;

    rationale: string;

    type: string;

    scope: string;

    timeHorizon: string;

    targetConditionIds: string[];

    expectedMechanismIds: string[];
  };

  status:
    | "proceed"
    | "do-not-proceed"
    | "investigate-further";

  confidence: number;

  summary: string;

  whyRecommended: string[];

  expectedBenefits: string[];

  tradeOffs: string[];

  risks: string[];

  assumptions: string[];

  evidenceThatCouldChangeRecommendation: string[];

  generatedAt: string;
};

export type BuildExecutiveDecisionRecommendationInput = {
  comparisonSet:
    ExecutiveScenarioComparisonSet;

  rankedScenarios:
    RankedExecutiveScenario[];

  confidenceCalibration:
    DecisionConfidenceCalibration;

  viabilityEvaluations:
    InterventionViabilityEvaluation[];

  generatedOptions:
    InterventionOption[];

  /**
   * Canonical synthesis of the organization's single
   * highest-leverage executive constraint.
   *
   * Optional for backward compatibility with existing
   * benchmarks and previously persisted runtimes.
   */
  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  /**
   * Canonical optimization objective used to select and rank
   * executive strategies.
   *
   * Optional for backward compatibility with existing callers.
   */
  optimizationObjective?:
    ExecutiveOptimizationObjective | null;

  generatedAt?: string;
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length > 0,
      ),
    ),
  );
}

function targetsPrimaryConstraint(params: {
  winningOption:
    InterventionOption;

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;
}): boolean {
  const primaryConstraint =
    params.primaryExecutiveConstraint;

  if (!primaryConstraint) {
    return false;
  }

  return params.winningOption
    .targetConditionIds
    .includes(
      primaryConstraint.conditionId,
    );
}

function optimizationVariableNames(
  optimizationObjective?:
    ExecutiveOptimizationObjective | null,
): string[] {
  return (
    optimizationObjective
      ?.variables
      .filter(
        (variable) =>
          variable.role ===
          "primary",
      )
      .map(
        (variable) =>
          variable.name,
      ) ?? []
  );
}

function buildExpectedBenefits(params: {
  improvedConditionIds: string[];

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  winningOption:
    InterventionOption;

  optimizationObjective?:
    ExecutiveOptimizationObjective | null;
}): string[] {
  const primaryConstraint =
    params.primaryExecutiveConstraint;

  const benefits =
    params.improvedConditionIds.map(
      (conditionId) =>
        `Expected improvement: ${conditionId}`,
    );

  if (
    primaryConstraint &&
    params.winningOption
      .targetConditionIds
      .includes(
        primaryConstraint.conditionId,
      )
  ) {
    benefits.unshift(
      `Directly addresses the primary executive constraint: ${primaryConstraint.title}.`,
    );
  }

  const primaryVariables =
    optimizationVariableNames(
      params.optimizationObjective,
    );

  if (primaryVariables.length > 0) {
    benefits.push(
      `Advances the primary optimization variables: ${primaryVariables.join(", ")}.`,
    );
  }

  if (
    primaryConstraint
      ?.expectedExecutiveImpact
  ) {
    benefits.push(
      primaryConstraint
        .expectedExecutiveImpact,
    );
  }

  return unique(benefits);
}

function buildWhyRecommended(params: {
  winner:
    RankedExecutiveScenario;

  winningOption:
    InterventionOption;

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  optimizationObjective?:
    ExecutiveOptimizationObjective | null;
}): string[] {
  const reasons = [
    ...params.winner.reasonsForRank,
  ];

  const primaryConstraint =
    params.primaryExecutiveConstraint;

  if (primaryConstraint) {
    if (
      targetsPrimaryConstraint({
        winningOption:
          params.winningOption,

        primaryExecutiveConstraint:
          primaryConstraint,
      })
    ) {
      reasons.unshift(
        `The strategy directly addresses the primary executive constraint: ${primaryConstraint.title}.`,
      );
    } else {
      reasons.push(
        `The strategy was highest-ranked even though it does not directly target the primary executive constraint "${primaryConstraint.title}".`,
      );
    }
  }

  const optimizationObjective =
    params.optimizationObjective;

  if (optimizationObjective) {
    reasons.push(
      `The strategy best supports the optimization objective: ${optimizationObjective.objective}.`,
    );

    const primaryVariables =
      optimizationVariableNames(
        optimizationObjective,
      );

    if (
      primaryVariables.length > 0
    ) {
      reasons.push(
        `The strategy performs best against the primary optimization variables: ${primaryVariables.join(", ")}.`,
      );
    }
  }

  return unique(reasons);
}

function buildSummary(params: {
  status:
    ExecutiveDecisionRecommendation["status"];

  hasUnresolvedRequiredConstraints:
    boolean;

  winningOption:
    InterventionOption;

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  optimizationObjective?:
    ExecutiveOptimizationObjective | null;
}): string {
  const primaryConstraint =
    params.primaryExecutiveConstraint;

  const constraintPhrase =
    primaryConstraint
      ? ` to address the primary executive constraint "${primaryConstraint.title}"`
      : "";

  const objectivePhrase =
    params.optimizationObjective
      ? ` while advancing the optimization objective "${params.optimizationObjective.objective}"`
      : "";

  if (
    params.status === "proceed"
  ) {
    return [
      `Discovery recommends proceeding with "${params.winningOption.title}"${constraintPhrase}${objectivePhrase}.`,
      "It is the highest-ranked viable strategy because projected organizational benefits outweigh identified risks and required constraints are sufficiently resolved.",
    ].join(" ");
  }

  if (
    params.status ===
    "do-not-proceed"
  ) {
    return [
      `Discovery recommends not proceeding with "${params.winningOption.title}".`,
      "Projected organizational deterioration outweighs expected benefits under the current constraints and optimization objective.",
    ].join(" ");
  }

  if (
    params
      .hasUnresolvedRequiredConstraints
  ) {
    return [
      `Discovery recommends resolving the remaining required executive constraints before committing to "${params.winningOption.title}"${constraintPhrase}.`,
      "The strategy remains highest-ranked, but commitment confidence is not yet sufficient.",
    ].join(" ");
  }

  return [
    `Discovery recommends further investigation before committing to "${params.winningOption.title}"${constraintPhrase}.`,
    "Additional evidence is required to confirm that it is the strongest strategy under the current optimization objective.",
  ].join(" ");
}

function buildRecommendationConfidence(params: {
  confidenceCalibration:
    DecisionConfidenceCalibration;

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  optimizationObjective?:
    ExecutiveOptimizationObjective | null;

  directlyTargetsPrimaryConstraint:
    boolean;

  confidenceLimiterCount:
    number;
}): number {
  const confidenceInputs = [
    params.confidenceCalibration
      .calibratedConfidence,
  ];

  if (
    params.primaryExecutiveConstraint
  ) {
    confidenceInputs.push(
      params.primaryExecutiveConstraint
        .confidence,
    );
  }

  if (
    params.optimizationObjective
  ) {
    confidenceInputs.push(
      params.optimizationObjective
        .confidence,
    );
  }

  const baseConfidence =
    confidenceInputs.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    confidenceInputs.length;

  const alignmentAdjustment =
    params.primaryExecutiveConstraint
      ? params.directlyTargetsPrimaryConstraint
        ? 0.03
        : -0.08
      : 0;

  const limiterPenalty =
    Math.min(
      0.2,
      params.confidenceLimiterCount *
        0.03,
    );

  return clamp01(
    baseConfidence +
      alignmentAdjustment -
      limiterPenalty,
  );
}

export function buildExecutiveDecisionRecommendation({
  comparisonSet,
  rankedScenarios,
  confidenceCalibration,
  viabilityEvaluations,
  generatedOptions,
  primaryExecutiveConstraint,
  optimizationObjective,
  generatedAt =
    new Date().toISOString(),
}: BuildExecutiveDecisionRecommendationInput): ExecutiveDecisionRecommendation {
  if (
    rankedScenarios.length === 0
  ) {
    throw new Error(
      "At least one ranked scenario is required.",
    );
  }

  const winner =
    rankedScenarios[0];

  const runnerUp =
    rankedScenarios[1];

  const winningOption =
    generatedOptions.find(
      (option) =>
        option.id ===
        winner.optionId,
    );

  if (!winningOption) {
    throw new Error(
      "Winning intervention option could not be found.",
    );
  }

  const comparison =
    comparisonSet
      .scenarioComparisons
      .find(
        (scenario) =>
          scenario.interventionId ===
          winner.interventionId,
      );

  if (!comparison) {
    throw new Error(
      "Winning scenario comparison could not be found.",
    );
  }

  const viability =
    viabilityEvaluations.find(
      (evaluation) =>
        evaluation.optionId ===
        winner.optionId,
    );

  if (!viability) {
    throw new Error(
      "Winning intervention viability evaluation could not be found.",
    );
  }

  if (
    viability.status ===
    "disqualified"
  ) {
    throw new Error(
      "A disqualified intervention cannot become the executive recommendation.",
    );
  }

  const hasUnresolvedRequiredConstraints =
    viability
      .unresolvedRequiredConstraints
      .length > 0;

  const directlyTargetsPrimaryConstraint =
    targetsPrimaryConstraint({
      winningOption,
      primaryExecutiveConstraint,
    });

  const expectedBenefits =
    buildExpectedBenefits({
      improvedConditionIds:
        comparison.improvedConditionIds,

      primaryExecutiveConstraint,

      winningOption,

      optimizationObjective,
    });

  const conditionTradeOffs =
    comparison
      .worsenedConditionIds
      .map(
        (conditionId) =>
          `Potential deterioration: ${conditionId}`,
      );

  const unresolvedConstraintTradeOffs =
    viability
      .unresolvedRequiredConstraints
      .map(
        (issue) =>
          `Required ${issue.constraintType} constraint remains unresolved: ${issue.description}`,
      );

  const optionalConstraintTradeOffs =
    viability.optionalIssues.map(
      (issue) =>
        `Optional ${issue.constraintType} constraint requires attention: ${issue.description}`,
    );

  const optimizationTradeOffs =
    optimizationObjective
      ?.variables
      .filter(
        (variable) =>
          variable.role ===
          "protected",
      )
      .map(
        (variable) =>
          `Protect ${variable.name} from deterioration while pursuing the recommendation.`,
      ) ?? [];

  const tradeOffs =
    unique([
      ...conditionTradeOffs,
      ...unresolvedConstraintTradeOffs,
      ...optionalConstraintTradeOffs,
      ...optimizationTradeOffs,
    ]);

  const confidenceRisks =
    confidenceCalibration
      .confidenceLimiters
      .map(
        (limiter) =>
          `Confidence limitation: ${limiter}`,
      );

  const optimizationConfidenceRisks =
    optimizationObjective
      ?.confidenceLimiters
      .map(
        (limiter) =>
          `Optimization limitation: ${limiter}`,
      ) ?? [];

  const conditionRisks =
    comparison
      .worsenedConditionIds
      .length > 0
      ? comparison
          .worsenedConditionIds
          .map(
            (conditionId) =>
              `Monitor ${conditionId} during implementation.`,
          )
      : [];

  const constraintRisks =
    viability
      .unresolvedRequiredConstraints
      .map(
        (issue) =>
          `Resolve the ${issue.constraintType} constraint before full commitment: ${issue.explanation}`,
      );

  const primaryConstraintAlignmentRisks =
    primaryExecutiveConstraint &&
    !directlyTargetsPrimaryConstraint
      ? [
          `The highest-ranked strategy does not directly target the primary executive constraint "${primaryExecutiveConstraint.title}". Confirm that indirect impact is sufficient before commitment.`,
        ]
      : [];

  const risks =
    unique([
      ...winningOption.risks,
      ...conditionRisks,
      ...constraintRisks,
      ...confidenceRisks,
      ...optimizationConfidenceRisks,
      ...primaryConstraintAlignmentRisks,
    ]);

  const status =
    comparison.executiveRecommendation ===
      "proceed" &&
    hasUnresolvedRequiredConstraints
      ? "investigate-further"
      : comparison
          .executiveRecommendation;

  const summary =
    buildSummary({
      status,

      hasUnresolvedRequiredConstraints,

      winningOption,

      primaryExecutiveConstraint,

      optimizationObjective,
    });

  const whyRecommended =
    buildWhyRecommended({
      winner,

      winningOption,

      primaryExecutiveConstraint,

      optimizationObjective,
    });

  const confidence =
    buildRecommendationConfidence({
      confidenceCalibration,

      primaryExecutiveConstraint,

      optimizationObjective,

      directlyTargetsPrimaryConstraint,

      confidenceLimiterCount:
        confidenceCalibration
          .confidenceLimiters
          .length +
        (
          optimizationObjective
            ?.confidenceLimiters
            .length ?? 0
        ),
    });

  const evidenceThatCouldChangeRecommendation =
    unique([
      "New organizational evidence that materially changes projected condition evolution.",
      "Observed outcomes inconsistent with the current causal model.",
      "New executive constraints or strategic priorities.",

      primaryExecutiveConstraint
        ? `Evidence showing that "${primaryExecutiveConstraint.title}" is no longer the organization's highest-leverage constraint.`
        : "",

      optimizationObjective
        ? `Evidence showing that the optimization objective "${optimizationObjective.objective}" no longer reflects the organization's executive priority.`
        : "",

      ...viability
        .unresolvedRequiredConstraints
        .map(
          (issue) =>
            `Evidence resolving the ${issue.constraintType} constraint: ${issue.description}`,
        ),

      ...confidenceCalibration
        .confidenceLimiters,

      ...(
        optimizationObjective
          ?.confidenceLimiters ??
        []
      ),
    ]);

  return {
    recommendedInterventionId:
      winner.interventionId,

    nextBestInterventionId:
      runnerUp?.interventionId,

    primaryConstraintId:
      primaryExecutiveConstraint
        ?.conditionId,

    primaryConstraintTitle:
      primaryExecutiveConstraint
        ?.title,

    optimizationObjectiveId:
      optimizationObjective?.id,

    optimizationObjective:
      optimizationObjective
        ?.objective,

    recommendedStrategy: {
      optionId:
        winningOption.id,

      interventionId:
        winner.interventionId,

      title:
        winningOption.title,

      description:
        winningOption.description,

      rationale:
        winningOption.rationale,

      type:
        winningOption.type,

      scope:
        winningOption.scope,

      timeHorizon:
        winningOption.timeHorizon,

      targetConditionIds:
        winningOption
          .targetConditionIds,

      expectedMechanismIds:
        winningOption
          .expectedMechanismIds,
    },

    status,

    confidence,

    summary,

    whyRecommended,

    expectedBenefits,

    tradeOffs,

    risks:
      risks.length > 0
        ? risks
        : [
            "No major organizational deterioration or unresolved constraint risk is currently projected.",
          ],

    assumptions:
      comparison.assumptions,

    evidenceThatCouldChangeRecommendation,

    generatedAt,
  };
}
