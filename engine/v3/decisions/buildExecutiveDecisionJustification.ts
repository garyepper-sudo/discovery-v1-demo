import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import type {
  ExecutiveScenarioComparisonEntry,
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

import type {
  InterventionViabilityEvaluation,
} from "./evaluateInterventionViability";

import type {
  RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

export type ExecutiveAlternativeJustification = {
  optionId: string;

  interventionId: string;

  title: string;

  rank: number;

  score: number;

  scoreDifference: number;

  summary: string;

  reasonsRankedLower: string[];

  strengths: string[];

  weaknesses: string[];

  improvedConditionIds: string[];

  worsenedConditionIds: string[];

  viabilityStatus:
    InterventionViabilityEvaluation["status"];
};

export type ExecutiveDecisionJustification = {
  recommendedOptionId: string;

  recommendedInterventionId: string;

  recommendedTitle: string;

  summary: string;

  whyRecommended: string[];

  decisiveAdvantages: string[];

  objectiveAlignment: {
    score: number;

    explanation: string;
  };

  organizationalImpact: {
    benefitScore: number;

    riskScore: number;

    improvedConditionIds: string[];

    worsenedConditionIds: string[];

    explanation: string;
  };

  constraintPosition: {
    status:
      InterventionViabilityEvaluation["status"];

    explanation: string;

    unresolvedRequiredConstraints: string[];

    optionalIssues: string[];
  };

  confidence: {
    score: number;

    explanation: string;
  };

  alternatives: ExecutiveAlternativeJustification[];

  differentiatingConditionIds: string[];

  evidenceThatCouldChangePreference: string[];

  generatedAt: string;
};

export type BuildExecutiveDecisionJustificationInput = {
  generatedOptions:
    InterventionOption[];

  comparisonSet:
    ExecutiveScenarioComparisonSet;

  rankedScenarios:
    RankedExecutiveScenario[];

  viabilityEvaluations:
    InterventionViabilityEvaluation[];

  generatedAt?: string;
};

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

function formatPercent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
}

function findOption(
  generatedOptions:
    InterventionOption[],

  optionId: string,
): InterventionOption {
  const option =
    generatedOptions.find(
      (candidate) =>
        candidate.id ===
        optionId,
    );

  if (!option) {
    throw new Error(
      `Intervention option could not be found: ${optionId}`,
    );
  }

  return option;
}

function findComparison(
  comparisonSet:
    ExecutiveScenarioComparisonSet,

  rankedScenario:
    RankedExecutiveScenario,
): ExecutiveScenarioComparisonEntry {
  const comparison =
    comparisonSet.scenarioComparisons.find(
      (candidate) =>
        candidate.scenarioId ===
          rankedScenario.scenarioId &&
        candidate.optionId ===
          rankedScenario.optionId,
    );

  if (!comparison) {
    throw new Error(
      `Scenario comparison could not be found: ${rankedScenario.scenarioId}`,
    );
  }

  return comparison;
}

function findViability(
  viabilityEvaluations:
    InterventionViabilityEvaluation[],

  optionId: string,
): InterventionViabilityEvaluation {
  const viability =
    viabilityEvaluations.find(
      (candidate) =>
        candidate.optionId ===
        optionId,
    );

  if (!viability) {
    throw new Error(
      `Intervention viability evaluation could not be found: ${optionId}`,
    );
  }

  return viability;
}

function buildWinnerReasons(params: {
  winner:
    RankedExecutiveScenario;

  comparison:
    ExecutiveScenarioComparisonEntry;

  viability:
    InterventionViabilityEvaluation;
}): string[] {
  const {
    winner,
    comparison,
    viability,
  } = params;

  const reasons = [
    `It achieved the highest composite decision score at ${formatPercent(
      winner.score,
    )}.`,

    `Its objective alignment score is ${formatPercent(
      winner.objectiveAlignmentScore,
    )}.`,

    `Its projected organizational benefit score is ${formatPercent(
      winner.organizationalBenefitScore,
    )}.`,

    `Its projected organizational risk score is ${formatPercent(
      winner.organizationalRiskScore,
    )}.`,

    `Scenario confidence is ${formatPercent(
      winner.confidenceScore,
    )}.`,
  ];

  if (
    comparison.improvedConditionIds.length >
    0
  ) {
    reasons.push(
      `${comparison.improvedConditionIds.length} organizational condition(s) are projected to improve.`,
    );
  }

  if (
    comparison.worsenedConditionIds.length ===
    0
  ) {
    reasons.push(
      "No organizational conditions are currently projected to worsen.",
    );
  } else {
    reasons.push(
      `${comparison.worsenedConditionIds.length} organizational condition(s) are projected to worsen and require monitoring.`,
    );
  }

  if (
    viability.status ===
    "viable"
  ) {
    reasons.push(
      "The strategy satisfies all currently evaluable executive constraints.",
    );
  }

  if (
    viability.status ===
    "conditionally-viable"
  ) {
    reasons.push(
      "The strategy remains viable, although one or more constraints require additional evidence or monitoring.",
    );
  }

  return unique([
    ...winner.reasonsForRank,
    ...reasons,
  ]);
}

function buildDecisiveAdvantages(params: {
  winner:
    RankedExecutiveScenario;

  runnerUp?:
    RankedExecutiveScenario;

  winnerComparison:
    ExecutiveScenarioComparisonEntry;

  runnerUpComparison?:
    ExecutiveScenarioComparisonEntry;

  winnerViability:
    InterventionViabilityEvaluation;

  runnerUpViability?:
    InterventionViabilityEvaluation;
}): string[] {
  const {
    winner,
    runnerUp,
    winnerComparison,
    runnerUpComparison,
    winnerViability,
    runnerUpViability,
  } = params;

  if (
    !runnerUp ||
    !runnerUpComparison
  ) {
    return [
      "This is the only strategy with a completed, rankable scenario.",
    ];
  }

  const advantages: string[] = [];

  const scoreDifference =
    winner.score -
    runnerUp.score;

  if (scoreDifference > 0) {
    advantages.push(
      `It exceeds the next-best strategy by ${formatPercent(
        scoreDifference,
      )} on the composite decision score.`,
    );
  }

  if (
    winner.objectiveAlignmentScore >
    runnerUp.objectiveAlignmentScore
  ) {
    advantages.push(
      `It provides stronger objective alignment by ${formatPercent(
        winner.objectiveAlignmentScore -
          runnerUp.objectiveAlignmentScore,
      )}.`,
    );
  }

  if (
    winner.organizationalBenefitScore >
    runnerUp.organizationalBenefitScore
  ) {
    advantages.push(
      `It produces a higher projected organizational benefit score by ${formatPercent(
        winner.organizationalBenefitScore -
          runnerUp.organizationalBenefitScore,
      )}.`,
    );
  }

  if (
    winner.organizationalRiskScore <
    runnerUp.organizationalRiskScore
  ) {
    advantages.push(
      `It carries a lower projected organizational risk score by ${formatPercent(
        runnerUp.organizationalRiskScore -
          winner.organizationalRiskScore,
      )}.`,
    );
  }

  if (
    winner.confidenceScore >
    runnerUp.confidenceScore
  ) {
    advantages.push(
      `It has stronger scenario confidence by ${formatPercent(
        winner.confidenceScore -
          runnerUp.confidenceScore,
      )}.`,
    );
  }

  const uniquelyImprovedConditions =
    winnerComparison
      .improvedConditionIds
      .filter(
        (conditionId) =>
          !runnerUpComparison
            .improvedConditionIds
            .includes(
              conditionId,
            ),
      );

  if (
    uniquelyImprovedConditions.length > 0
  ) {
    advantages.push(
      `It uniquely improves ${uniquelyImprovedConditions.length} organizational condition(s): ${uniquelyImprovedConditions.join(
        ", ",
      )}.`,
    );
  }

  const avoidedDeterioration =
    runnerUpComparison
      .worsenedConditionIds
      .filter(
        (conditionId) =>
          !winnerComparison
            .worsenedConditionIds
            .includes(
              conditionId,
            ),
      );

  if (
    avoidedDeterioration.length > 0
  ) {
    advantages.push(
      `It avoids deterioration projected under the next-best strategy in: ${avoidedDeterioration.join(
        ", ",
      )}.`,
    );
  }

  if (
    winnerViability.status ===
      "viable" &&
    runnerUpViability &&
    runnerUpViability.status ===
      "conditionally-viable"
  ) {
    advantages.push(
      "It has a stronger constraint position because it is fully viable while the next-best strategy remains conditionally viable.",
    );
  }

  return advantages.length > 0
    ? unique(advantages)
    : [
        "It ranks first because its combined objective alignment, organizational impact, risk, confidence, and recommendation strength exceed the alternatives.",
      ];
}

function buildAlternativeJustification(params: {
  alternative:
    RankedExecutiveScenario;

  winner:
    RankedExecutiveScenario;

  option:
    InterventionOption;

  comparison:
    ExecutiveScenarioComparisonEntry;

  winnerComparison:
    ExecutiveScenarioComparisonEntry;

  viability:
    InterventionViabilityEvaluation;
}): ExecutiveAlternativeJustification {
  const {
    alternative,
    winner,
    option,
    comparison,
    winnerComparison,
    viability,
  } = params;

  const reasonsRankedLower: string[] = [];

  if (
    alternative.objectiveAlignmentScore <
    winner.objectiveAlignmentScore
  ) {
    reasonsRankedLower.push(
      `Objective alignment is ${formatPercent(
        alternative.objectiveAlignmentScore,
      )}, below the recommended strategy's ${formatPercent(
        winner.objectiveAlignmentScore,
      )}.`,
    );
  }

  if (
    alternative.organizationalBenefitScore <
    winner.organizationalBenefitScore
  ) {
    reasonsRankedLower.push(
      `Projected organizational benefit is lower at ${formatPercent(
        alternative.organizationalBenefitScore,
      )}.`,
    );
  }

  if (
    alternative.organizationalRiskScore >
    winner.organizationalRiskScore
  ) {
    reasonsRankedLower.push(
      `Projected organizational risk is higher at ${formatPercent(
        alternative.organizationalRiskScore,
      )}.`,
    );
  }

  if (
    alternative.confidenceScore <
    winner.confidenceScore
  ) {
    reasonsRankedLower.push(
      `Scenario confidence is lower at ${formatPercent(
        alternative.confidenceScore,
      )}.`,
    );
  }

  if (
    viability.status ===
    "conditionally-viable"
  ) {
    reasonsRankedLower.push(
      "One or more executive constraints remain unresolved or require additional evidence.",
    );
  }

  if (
    viability.status ===
    "disqualified"
  ) {
    reasonsRankedLower.push(
      "The strategy violates at least one required executive constraint.",
    );
  }

  const missedImprovements =
    winnerComparison
      .improvedConditionIds
      .filter(
        (conditionId) =>
          !comparison
            .improvedConditionIds
            .includes(
              conditionId,
            ),
      );

  if (
    missedImprovements.length > 0
  ) {
    reasonsRankedLower.push(
      `It does not produce the same projected improvement in: ${missedImprovements.join(
        ", ",
      )}.`,
    );
  }

  const strengths: string[] = [];

  if (
    comparison.improvedConditionIds.length >
    0
  ) {
    strengths.push(
      `Improves ${comparison.improvedConditionIds.length} organizational condition(s).`,
    );
  }

  if (
    comparison.worsenedConditionIds.length ===
    0
  ) {
    strengths.push(
      "Produces no currently projected organizational deterioration.",
    );
  }

  if (
    alternative.objectiveAlignmentScore >=
    0.75
  ) {
    strengths.push(
      "Maintains strong alignment with the executive objective.",
    );
  }

  const weaknesses: string[] = [];

  if (
    comparison.worsenedConditionIds.length >
    0
  ) {
    weaknesses.push(
      `Worsens ${comparison.worsenedConditionIds.length} organizational condition(s).`,
    );
  }

  if (
    viability
      .unresolvedRequiredConstraints
      .length > 0
  ) {
    weaknesses.push(
      `${viability.unresolvedRequiredConstraints.length} required constraint(s) remain unresolved.`,
    );
  }

  if (
    viability.optionalIssues.length > 0
  ) {
    weaknesses.push(
      `${viability.optionalIssues.length} optional constraint issue(s) require attention.`,
    );
  }

  return {
    optionId:
      alternative.optionId,

    interventionId:
      alternative.interventionId,

    title:
      option.title,

    rank:
      alternative.rank,

    score:
      alternative.score,

    scoreDifference:
      Math.max(
        0,
        winner.score -
          alternative.score,
      ),

    summary:
      comparison.executiveSummary,

    reasonsRankedLower:
      reasonsRankedLower.length > 0
        ? unique(
            reasonsRankedLower,
          )
        : [
            "The strategy remains viable but produces a weaker overall decision score than the recommended strategy.",
          ],

    strengths:
      strengths.length > 0
        ? unique(strengths)
        : [
            "The strategy remains a considered alternative within the current decision set.",
          ],

    weaknesses:
      unique(weaknesses),

    improvedConditionIds:
      comparison.improvedConditionIds,

    worsenedConditionIds:
      comparison.worsenedConditionIds,

    viabilityStatus:
      viability.status,
  };
}

export function buildExecutiveDecisionJustification({
  generatedOptions,
  comparisonSet,
  rankedScenarios,
  viabilityEvaluations,
  generatedAt =
    new Date().toISOString(),
}: BuildExecutiveDecisionJustificationInput): ExecutiveDecisionJustification {
  const winner =
    rankedScenarios[0];

  if (!winner) {
    throw new Error(
      "At least one ranked executive scenario is required.",
    );
  }

  const winningOption =
    findOption(
      generatedOptions,
      winner.optionId,
    );

  const winnerComparison =
    findComparison(
      comparisonSet,
      winner,
    );

  const winnerViability =
    findViability(
      viabilityEvaluations,
      winner.optionId,
    );

  if (
    winnerViability.status ===
    "disqualified"
  ) {
    throw new Error(
      "A disqualified intervention cannot receive an executive decision justification.",
    );
  }

  const runnerUp =
    rankedScenarios[1];

  const runnerUpComparison =
    runnerUp
      ? findComparison(
          comparisonSet,
          runnerUp,
        )
      : undefined;

  const runnerUpViability =
    runnerUp
      ? findViability(
          viabilityEvaluations,
          runnerUp.optionId,
        )
      : undefined;

  const alternatives =
    rankedScenarios
      .slice(1)
      .map(
        (alternative) => {
          const option =
            findOption(
              generatedOptions,
              alternative.optionId,
            );

          const comparison =
            findComparison(
              comparisonSet,
              alternative,
            );

          const viability =
            findViability(
              viabilityEvaluations,
              alternative.optionId,
            );

          return buildAlternativeJustification({
            alternative,
            winner,
            option,
            comparison,
            winnerComparison,
            viability,
          });
        },
      );

  const whyRecommended =
    buildWinnerReasons({
      winner,
      comparison:
        winnerComparison,
      viability:
        winnerViability,
    });

  const decisiveAdvantages =
    buildDecisiveAdvantages({
      winner,
      runnerUp,
      winnerComparison,
      runnerUpComparison,
      winnerViability,
      runnerUpViability,
    });

  const unresolvedRequiredConstraints =
    winnerViability
      .unresolvedRequiredConstraints
      .map(
        (issue) =>
          `${issue.constraintType}: ${issue.description}`,
      );

  const optionalIssues =
    winnerViability
      .optionalIssues
      .map(
        (issue) =>
          `${issue.constraintType}: ${issue.description}`,
      );

  const evidenceThatCouldChangePreference =
    unique([
      ...winningOption.missingEvidence,

      ...winnerViability
        .unresolvedRequiredConstraints
        .map(
          (issue) =>
            `Evidence resolving the ${issue.constraintType} constraint: ${issue.description}`,
        ),

      ...alternatives.flatMap(
        (alternative) =>
          alternative.reasonsRankedLower.map(
            (reason) =>
              `New evidence that materially changes this conclusion: ${reason}`,
          ),
      ),

      "Observed organizational outcomes that contradict the current scenario projections.",

      "A material change in executive priorities, constraints, or time horizon.",

      "New evidence that increases the expected benefit or reduces the expected risk of a lower-ranked strategy.",
    ]);

  const constraintExplanation =
    winnerViability.status ===
    "viable"
      ? "The recommended strategy satisfies all currently evaluable executive constraints."
      : "The recommended strategy remains conditionally viable because one or more constraints require further evidence, simulation, or monitoring.";

  const summary =
    alternatives.length === 0
      ? `${winningOption.title} is recommended because it is the only completed strategy available for executive evaluation.`
      : `${winningOption.title} is recommended because it achieved the strongest combined objective alignment, organizational benefit, risk position, confidence, and constraint viability across the evaluated alternatives.`;

  return {
    recommendedOptionId:
      winner.optionId,

    recommendedInterventionId:
      winner.interventionId,

    recommendedTitle:
      winningOption.title,

    summary,

    whyRecommended,

    decisiveAdvantages,

    objectiveAlignment: {
      score:
        winner.objectiveAlignmentScore,

      explanation:
        `The recommended strategy achieved ${formatPercent(
          winner.objectiveAlignmentScore,
        )} alignment with the executive decision objective.`,
    },

    organizationalImpact: {
      benefitScore:
        winner.organizationalBenefitScore,

      riskScore:
        winner.organizationalRiskScore,

      improvedConditionIds:
        winnerComparison
          .improvedConditionIds,

      worsenedConditionIds:
        winnerComparison
          .worsenedConditionIds,

      explanation:
        `${winnerComparison.improvedConditionIds.length} organizational condition(s) improve and ${winnerComparison.worsenedConditionIds.length} worsen under the recommended strategy.`,
    },

    constraintPosition: {
      status:
        winnerViability.status,

      explanation:
        constraintExplanation,

      unresolvedRequiredConstraints,

      optionalIssues,
    },

    confidence: {
      score:
        winner.confidenceScore,

      explanation:
        `Combined scenario and intervention confidence is ${formatPercent(
          winner.confidenceScore,
        )}.`,
    },

    alternatives,

    differentiatingConditionIds:
      comparisonSet
        .differentiatingConditionIds,

    evidenceThatCouldChangePreference,

    generatedAt,
  };
}