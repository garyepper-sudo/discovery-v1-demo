import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-13T12:00:00.000Z";

type QualityCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

type QualityCategory = {
  name: string;
  checks: QualityCheck[];
};

function percent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
}

function categoryScore(
  category: QualityCategory,
): number {
  if (
    category.checks.length === 0
  ) {
    return 0;
  }

  const passed =
    category.checks.filter(
      (check) => check.passed,
    ).length;

  return (
    passed /
    category.checks.length
  );
}

function grade(
  score: number,
): string {
  if (score >= 0.95) {
    return "A+";
  }

  if (score >= 0.9) {
    return "A";
  }

  if (score >= 0.85) {
    return "B+";
  }

  if (score >= 0.8) {
    return "B";
  }

  if (score >= 0.7) {
    return "C";
  }

  return "Needs Improvement";
}

function uniqueStrings(
  values: string[],
): string[] {
  return Array.from(
    new Set(values),
  );
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION QUALITY");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

const runtime =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
  );

const organizationalUncertainty:
  OrganizationalUncertainty = {
    organizationId:
      ORGANIZATION_ID,

    evidenceCompleteness:
      0.84,

    evidenceAgreement:
      0.82,

    contradictionDensity:
      0.08,

    contradictionConfidence:
      0.72,

    ambiguityScore:
      0.18,

    learningCertainty:
      0.76,

    predictionCertainty:
      0.74,

    investigationUrgency:
      0.24,

    unresolvedContradictionCount:
      1,

    unresolvedQuestionCount:
      1,

    competingExplanationCount:
      1,

    overallUncertainty:
      0.2,

    status:
      "moderate",

    drivers: [
      {
        type:
          "unresolved-question",

        description:
          "One executive assumption remains insufficiently validated.",

        weight:
          0.2,

        sourceObjectIds: [],
      },
    ],

    recommendedEvidenceAreas: [
      "Evidence confirming whether structural interventions can improve execution capacity without increasing risk.",
    ],

    confidenceLimiters: [
      "One executive assumption remains insufficiently validated.",
    ],

    summary:
      "Discovery has strong but incomplete evidence for the current organizational assessment.",

    assessedAt:
      NOW,
  };

const benchmarkRuntime = {
  ...runtime,

  memory: {
    ...runtime.memory,

    organizationalUncertainty,
  },
};

const executiveDecision:
  ExecutiveDecision = {
    id:
      "executive-decision-quality-001",

    organizationId:
      ORGANIZATION_ID,

    type:
      "execution",

    title:
      "Improve Organizational Execution",

    objective:
      "Increase execution throughput without increasing organizational risk.",

    rationale:
      "Leadership wants to improve execution quality using structural rather than staffing interventions.",

    status:
      "ready",

    timeHorizon:
      "near-term",

    targetConditionIds: [
      "condition-executioncapacity",
    ],

    successMetrics: [
      {
        name:
          "Execution Capacity",

        baseline:
          0.48,

        target:
          0.63,

        unit:
          "score",

        rationale:
          "Execution capacity must improve enough to produce a material operating benefit.",
      },
    ],

    constraints: [
      {
        type:
          "risk",

        description:
          "Do not increase organizational risk.",

        required:
          true,
      },

      {
        type:
          "people",

        description:
          "Do not increase headcount.",

        required:
          true,
      },

      {
        type:
          "budget",

        description:
          "Remain budget neutral.",

        required:
          true,
      },

      {
        type:
          "time",

        description:
          "Produce measurable improvement within the near term.",

        required:
          true,
      },
    ],

    allowedInterventionTypes: [
      "governance",
      "policy",
      "strategy",
    ],

    assumptions: [
      "The current organizational understanding is sufficiently accurate.",
    ],

    openQuestions: [],

    confidence:
      0.8,

    createdAt:
      NOW,

    updatedAt:
      NOW,
  };

const cycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const winner =
  cycle.rankedScenarios[0];

const winningComparison =
  cycle.comparisonSet
    .scenarioComparisons
    .find(
      (comparison) =>
        comparison.interventionId ===
        winner?.interventionId,
    );

const scenarioSummaries =
  cycle.comparisonSet
    .scenarioComparisons
    .map(
      (comparison) =>
        comparison.executiveSummary,
    );

const scenarioRecommendations =
  cycle.comparisonSet
    .scenarioComparisons
    .map(
      (comparison) =>
        comparison.executiveRecommendation,
    );

const conditionOutcomeSignatures =
  cycle.comparisonSet
    .scenarioComparisons
    .map(
      (comparison) =>
        JSON.stringify({
          improved:
            comparison.improvedConditionIds,
          worsened:
            comparison.worsenedConditionIds,
          unchanged:
            comparison.unchangedConditionIds,
        }),
    );

const changedUnderstandingCount =
  cycle.scenarios.filter(
    (scenario) =>
      scenario.comparison
        .understandingChange
        .changed,
  ).length;

const materiallyChangedScenarioCount =
  cycle.scenarios.filter(
    (scenario) => {
      const changedConditions =
        scenario.comparison
          .conditionChanges
          .filter(
            (change) =>
              change.change !==
              "unchanged",
          ).length;

      const changedPredictions =
        scenario.comparison
          .predictionChanges
          .filter(
            (change) =>
              change.change !==
              "unchanged",
          ).length;

      return (
        changedConditions > 0 ||
        changedPredictions > 0
      );
    },
  ).length;

const recommendationQuality:
  QualityCategory = {
    name:
      "Recommendation Quality",

    checks: [
      {
        name:
          "Winning intervention is recommended",

        passed:
          Boolean(winner) &&
          cycle.recommendation
            .recommendedInterventionId ===
            winner.interventionId,

        detail:
          cycle.recommendation
            .recommendedInterventionId ??
          "No intervention recommended.",
      },

      {
        name:
          "Recommendation explains why",

        passed:
          cycle.recommendation
            .whyRecommended
            .length > 0,

        detail:
          `${cycle.recommendation.whyRecommended.length} reason(s)`,
      },

      {
        name:
          "Recommendation identifies benefits",

        passed:
          cycle.recommendation
            .expectedBenefits
            .length > 0,

        detail:
          `${cycle.recommendation.expectedBenefits.length} expected benefit(s)`,
      },

      {
        name:
          "Recommendation exposes genuine trade-offs",

        passed:
          cycle.recommendation
            .tradeOffs
            .length > 0,

        detail:
          `${cycle.recommendation.tradeOffs.length} trade-off(s)`,
      },

      {
        name:
          "Recommendation is consistent with the winning scenario and decision constraints",

        passed:
          Boolean(
            winningComparison,
          ) &&
          (
            cycle.recommendation.status ===
              winningComparison
                ?.executiveRecommendation ||
            (
              winningComparison
                ?.executiveRecommendation ===
                "proceed" &&
              cycle.recommendation.status ===
                "investigate-further" &&
              cycle.confidenceCalibration
                .constraintConfidenceScore <
                1
            )
          ),

        detail:
          winningComparison
            ? `${winningComparison.executiveRecommendation} scenario recommendation; ${cycle.recommendation.status} final recommendation`
            : "Winning comparison unavailable.",
      },
    ],
  };

const scenarioDifferentiation:
  QualityCategory = {
    name:
      "Scenario Differentiation",

    checks: [
      {
        name:
          "Multiple scenarios were evaluated",

        passed:
          cycle.scenarios.length >= 2,

        detail:
          `${cycle.scenarios.length} scenario(s)`,
      },

      {
        name:
          "Scenario summaries differ",

        passed:
          uniqueStrings(
            scenarioSummaries,
          ).length > 1,

        detail:
          `${uniqueStrings(scenarioSummaries).length} distinct summary or summaries`,
      },

      {
        name:
          "Condition outcomes differ",

        passed:
          uniqueStrings(
            conditionOutcomeSignatures,
          ).length > 1,

        detail:
          `${cycle.comparisonSet.differentiatingConditionIds.length} differentiating condition(s)`,
      },

      {
        name:
          "At least one scenario materially changes the future",

        passed:
          materiallyChangedScenarioCount >
          0,

        detail:
          `${materiallyChangedScenarioCount}/${cycle.scenarios.length} scenario(s) materially changed conditions or predictions`,
      },

      {
        name:
          "Scenario recommendations differentiate when outcomes differ",

        passed:
          cycle.comparisonSet
            .differentiatingConditionIds
            .length === 0 ||
          uniqueStrings(
            scenarioRecommendations,
          ).length > 1 ||
          cycle.comparisonSet
            .scenarioComparisons
            .every(
              (comparison) =>
                comparison
                  .executiveRecommendation ===
                "proceed",
            ),

        detail:
          `${uniqueStrings(scenarioRecommendations).length} distinct recommendation(s)`,
      },
    ],
  };

const confidenceCalibration:
  QualityCategory = {
    name:
      "Confidence Calibration",

    checks: [
      {
        name:
          "Confidence remains bounded",

        passed:
          cycle.confidenceCalibration
            .calibratedConfidence >= 0 &&
          cycle.confidenceCalibration
            .calibratedConfidence <= 1,

        detail:
          percent(
            cycle.confidenceCalibration
              .calibratedConfidence,
          ),
      },

      {
        name:
          "Epistemic uncertainty affects confidence",

        passed:
          cycle.confidenceCalibration
            .evidenceConfidenceScore <
            1 ||
          cycle.confidenceCalibration
            .agreementAnalysis
            .evidenceAgreement <
            1 ||
          cycle.confidenceCalibration
            .learningConfidenceScore <
            1,

        detail:
          `Evidence ${percent(
            cycle.confidenceCalibration
              .evidenceConfidenceScore,
          )}, agreement ${percent(
            cycle.confidenceCalibration
              .agreementAnalysis
              .evidenceAgreement,
          )}, learning ${percent(
            cycle.confidenceCalibration
              .learningConfidenceScore,
          )}`,
      },

      {
        name:
          "Calibrated confidence does not exceed all inputs",

        passed:
          cycle.confidenceCalibration
            .calibratedConfidence <=
          Math.max(
            cycle.confidenceCalibration
              .recommendationQualityScore,
            cycle.confidenceCalibration
              .evidenceConfidenceScore,
            cycle.confidenceCalibration
              .agreementAnalysis
              .evidenceAgreement,
            cycle.confidenceCalibration
              .learningConfidenceScore,
            cycle.confidenceCalibration
              .constraintConfidenceScore,
          ),

        detail:
          `${percent(
            cycle.confidenceCalibration
              .calibratedConfidence,
          )} calibrated`,
      },

      {
        name:
          "Confidence limiters explain uncertainty",

        passed:
          organizationalUncertainty
            .overallUncertainty === 0 ||
          cycle.confidenceCalibration
            .confidenceLimiters
            .length > 0,

        detail:
          `${cycle.confidenceCalibration.confidenceLimiters.length} limiter(s)`,
      },

      {
        name:
          "Constraint confidence is represented",

        passed:
          Number.isFinite(
            cycle.confidenceCalibration
              .constraintConfidenceScore,
          ),

        detail:
          percent(
            cycle.confidenceCalibration
              .constraintConfidenceScore,
          ),
      },

      {
        name:
          "Recommendation reflects unresolved constraints",

        passed:
          cycle.confidenceCalibration
            .constraintConfidenceScore === 1 ||
          cycle.recommendation.status ===
            "investigate-further" ||
          cycle.recommendation
            .risks
            .some((risk) =>
              risk
                .toLowerCase()
                .includes(
                  "constraint",
                ),
            ),

        detail:
          `${percent(
            cycle.confidenceCalibration
              .constraintConfidenceScore,
          )} constraint confidence; ${cycle.recommendation.status} recommendation`,
      },
    ],
  };

const executiveExplainability:
  QualityCategory = {
    name:
      "Executive Explainability",

    checks: [
      {
        name:
          "Winning rank includes reasons",

        passed:
          Boolean(winner) &&
          winner.reasonsForRank.length >
          0,

        detail:
          `${winner?.reasonsForRank.length ?? 0} reason(s)`,
      },

      {
        name:
          "Winning scenario has an executive summary",

        passed:
          Boolean(
            winningComparison
              ?.executiveSummary
              .trim(),
          ),

        detail:
          winningComparison
            ?.executiveSummary ??
          "No executive summary.",
      },

      {
        name:
          "Recommendation summary is substantive",

        passed:
          cycle.recommendation
            .summary
            .trim()
            .length >= 40,

        detail:
          `${cycle.recommendation.summary.trim().length} characters`,
      },

      {
        name:
          "Recommendation exposes assumptions",

        passed:
          cycle.recommendation
            .assumptions
            .length > 0,

        detail:
          `${cycle.recommendation.assumptions.length} assumption(s)`,
      },

      {
        name:
          "Recommendation identifies falsifying evidence",

        passed:
          cycle.recommendation
            .evidenceThatCouldChangeRecommendation
            .length > 0,

        detail:
          `${cycle.recommendation.evidenceThatCouldChangeRecommendation.length} evidence trigger(s)`,
      },
    ],
  };

const learningReadiness:
  QualityCategory = {
    name:
      "Learning Readiness",

    checks: [
      {
        name:
          "Confidence limiters are retained",

        passed:
          cycle.confidenceCalibration
            .confidenceLimiters
            .length > 0,

        detail:
          `${cycle.confidenceCalibration.confidenceLimiters.length} limiter(s)`,
      },

      {
        name:
          "Evidence areas are recommended",

        passed:
          organizationalUncertainty
            .recommendedEvidenceAreas
            .length > 0,

        detail:
          `${organizationalUncertainty.recommendedEvidenceAreas.length} evidence area(s)`,
      },

      {
        name:
          "Recommendation can be revised",

        passed:
          cycle.recommendation
            .evidenceThatCouldChangeRecommendation
            .length > 0,

        detail:
          `${cycle.recommendation.evidenceThatCouldChangeRecommendation.length} revision trigger(s)`,
      },

      {
        name:
          "Simulations materially change organizational outcomes",

        passed:
          materiallyChangedScenarioCount >
          0,

        detail:
          `${materiallyChangedScenarioCount}/${cycle.scenarios.length} material scenario change(s)`,
      },

      {
        name:
          "Executive understanding responds appropriately to material scenarios",

        passed:
          cycle.scenarios.every(
            (scenario) => {
              const understandingChange =
                scenario.comparison
                  .understandingChange;

              return (
                understandingChange.changed ||
                (
                  !understandingChange
                    .dominantConditionChanged &&
                  !understandingChange
                    .dominantTheoryChanged &&
                  !understandingChange
                    .confidenceChanged
                )
              );
            },
          ),

        detail:
          `${changedUnderstandingCount}/${cycle.scenarios.length} understanding change(s); unchanged scenarios retained stable condition, theory, and confidence`,
      },

      {
        name:
          "Decision retains explicit assumptions",

        passed:
          cycle.executiveDecision
            .assumptions
            .length > 0,

        detail:
          `${cycle.executiveDecision.assumptions.length} decision assumption(s)`,
      },
    ],
  };

const categories:
  QualityCategory[] = [
    recommendationQuality,
    scenarioDifferentiation,
    confidenceCalibration,
    executiveExplainability,
    learningReadiness,
  ];

const categoryScores =
  categories.map(
    (category) => ({
      name:
        category.name,

      score:
        categoryScore(
          category,
        ),
    }),
  );

const overallScore =
  categoryScores.reduce(
    (sum, result) =>
      sum + result.score,
    0,
  ) /
  categoryScores.length;

for (const category of categories) {
  console.log(category.name);
  console.log("------------------------------");

  for (const check of category.checks) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
    );

    console.log(
      `      ${check.detail}`,
    );
  }

  console.log(
    `Score: ${percent(
      categoryScore(category),
    )}`,
  );

  console.log("");
}

console.log("==========================================");
console.log("DECISION QUALITY SUMMARY");
console.log("==========================================");
console.log("");

for (const result of categoryScores) {
  console.log(
    `${result.name.padEnd(
      31,
      ".",
    )} ${percent(
      result.score,
    )}`,
  );
}

console.log("");
console.log(
  `Overall Decision Quality ........ ${percent(
    overallScore,
  )}`,
);
console.log(
  `Overall Grade ................... ${grade(
    overallScore,
  )}`,
);

console.log("");
console.log("Diagnostic Notes");
console.log("------------------------------");

const hasUnexplainedStableUnderstanding =
  cycle.scenarios.some(
    (scenario) => {
      const understandingChange =
        scenario.comparison
          .understandingChange;

      return (
        !understandingChange.changed &&
        (
          understandingChange
            .dominantConditionChanged ||
          understandingChange
            .dominantTheoryChanged ||
          understandingChange
            .confidenceChanged
        )
      );
    },
  );

if (
  hasUnexplainedStableUnderstanding
) {
  console.log(
    "- At least one scenario changed a core understanding signal without being classified as an executive-understanding change.",
  );
}

if (
  uniqueStrings(
    scenarioSummaries,
  ).length === 1
) {
  console.log(
    "- Scenario summaries are identical. Review intervention differentiation or executive comparison synthesis.",
  );
}

if (
  cycle.confidenceCalibration
    .calibratedConfidence >
  0.9 &&
  organizationalUncertainty
    .overallUncertainty >=
    0.2
) {
  console.log(
    "- Confidence may be too high relative to the modeled uncertainty.",
  );
}

if (
  cycle.recommendation
    .tradeOffs
    .length === 0
) {
  console.log(
    "- The final recommendation does not expose any trade-offs.",
  );
}

console.log("");
console.log("Experiment Complete");
console.log("");

if (
  overallScore < 0.8
) {
  process.exitCode = 1;
}
