import assert from "node:assert/strict";

import {
  buildExecutiveDecisionRecommendation,
} from "../../v3/decisions/buildExecutiveDecisionRecommendation";

import type {
  BuildExecutiveDecisionRecommendationInput,
} from "../../v3/decisions/buildExecutiveDecisionRecommendation";

import type {
  InterventionOption,
} from "../../v3/model/simulate/interventionOption";

const generatedAt =
  "2026-07-22T20:00:00.000Z";

function option(params: {
  id: string;
  title: string;
  risks: string[];
}): InterventionOption {
  return {
    id: params.id,
    executiveDecisionId: "decision-risk-regression",
    organizationId: "organization-risk-regression",
    type: "policy",
    title: params.title,
    description: `${params.title} description.`,
    rationale: `${params.title} rationale.`,
    scope: "organization",
    timeHorizon: "near-term",
    targetConditionIds: ["condition-decision-flow"],
    expectedMechanismIds: ["mechanism-decision-latency"],
    risks: params.risks,
    assumptions: [],
    constraintEvaluations: [],
  } as unknown as InterventionOption;
}

const winningRisks = [
  "Delegated decisions may diverge while boundaries stabilize.",
  "Escalation ownership may be unclear during transition.",
];

const winningOption = option({
  id: "option-delegate-decision-rights",
  title: "Delegate routine decision rights",
  risks: [
    winningRisks[0],
    winningRisks[1],
    winningRisks[0],
  ],
});

const runnerUpOption = option({
  id: "option-add-approval-review",
  title: "Add approval review",
  risks: [
    "Additional review may increase decision latency.",
  ],
});

const rankedScenarios = [
  {
    rank: 1,
    optionId: winningOption.id,
    interventionId: winningOption.id,
    scenarioId: "scenario-winning",
    score: 0.9,
    objectiveAlignmentScore: 0.9,
    organizationalBenefitScore: 0.9,
    organizationalRiskScore: 0.8,
    confidenceScore: 0.8,
    recommendationScore: 1,
    reasonsForRank: ["Strongest projected improvement."],
  },
  {
    rank: 2,
    optionId: runnerUpOption.id,
    interventionId: runnerUpOption.id,
    scenarioId: "scenario-runner-up",
    score: 0.6,
    objectiveAlignmentScore: 0.6,
    organizationalBenefitScore: 0.6,
    organizationalRiskScore: 0.5,
    confidenceScore: 0.7,
    recommendationScore: 0.5,
    reasonsForRank: ["Lower projected improvement."],
  },
];

const input = {
  comparisonSet: {
    baselineOrganizationId: "organization-risk-regression",
    scenarioComparisons: [
      {
        optionId: winningOption.id,
        interventionId: winningOption.id,
        interventionTitle: winningOption.title,
        scenarioId: "scenario-winning",
        conditionChanges: [],
        targetConditionChanges: [],
        improvedConditionIds: [],
        worsenedConditionIds: [],
        unchangedConditionIds: [],
        addedPredictionIds: [],
        removedPredictionIds: [],
        unchangedPredictionIds: [],
        executiveRecommendation: "proceed",
        scenarioConfidence: 0.8,
        interventionConfidence: 0.8,
        assumptions: [],
        executiveSummary: "Winning scenario.",
      },
    ],
    sharedImprovedConditionIds: [],
    sharedWorsenedConditionIds: [],
    sharedAssumptions: [],
    differentiatingConditionIds: [],
    differentiatingRecommendations: true,
    generatedAt,
  },
  rankedScenarios,
  confidenceCalibration: {
    calibratedConfidence: 0.8,
    confidenceLimiters: [],
  },
  viabilityEvaluations: [
    {
      optionId: winningOption.id,
      status: "viable",
      requiredViolations: [],
      unresolvedRequiredConstraints: [],
      optionalIssues: [],
      summary: "Viable.",
    },
  ],
  generatedOptions: [runnerUpOption, winningOption],
  generatedAt,
} as unknown as BuildExecutiveDecisionRecommendationInput;

const recommendation =
  buildExecutiveDecisionRecommendation(input);

const repeated =
  buildExecutiveDecisionRecommendation(input);

const withoutInterventionRisks =
  buildExecutiveDecisionRecommendation({
    ...input,
    generatedOptions: [
      runnerUpOption,
      {
        ...winningOption,
        risks: [],
      },
    ],
  });

assert.deepEqual(
  recommendation.risks,
  winningRisks,
  "The recommendation must preserve only the selected intervention's risks in their original order.",
);

assert.equal(
  recommendation.risks.includes(
    runnerUpOption.risks[0],
  ),
  false,
  "Risks from an unselected intervention must not enter the recommendation.",
);

assert.deepEqual(
  repeated,
  recommendation,
  "Repeated recommendation synthesis must be deterministic.",
);

assert.equal(
  recommendation.recommendedInterventionId,
  withoutInterventionRisks.recommendedInterventionId,
  "Risk projection must not change recommendation identity.",
);

assert.equal(
  recommendation.confidence,
  withoutInterventionRisks.confidence,
  "Risk projection must not change recommendation confidence.",
);

assert.deepEqual(
  input.rankedScenarios,
  rankedScenarios,
  "Risk projection must not mutate scenario ranking.",
);

console.log("Focused recommendation-risk regression — PASS");
console.log(`Recommendation: ${recommendation.recommendedInterventionId}`);
console.log(`Confidence: ${recommendation.confidence}`);
console.log(`Risks: ${recommendation.risks.join(" | ")}`);
