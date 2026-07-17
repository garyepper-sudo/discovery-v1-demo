import {
  buildExecutiveSimulation,
} from "../../v3/simulation/buildExecutiveSimulation";

import type {
  ExecutiveDecisionRecommendation,
} from "../../v3/decisions/buildExecutiveDecisionRecommendation";

import type {
  ExecutiveScenarioComparisonSet,
} from "../../v3/decisions/compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "../../v3/decisions/rankExecutiveScenarios";

import type {
  ExecutiveOptimizationObjective,
} from "../../v3/optimization/executiveOptimizationObjective";

import type {
  ExecutiveScenarioResult,
} from "../../v3/scenarios/runExecutiveScenario";

import type {
  OrganizationalIntervention,
} from "../../v3/model/simulate/organizationalIntervention";

import type {
  SimulatedOrganizationState,
} from "../../v3/model/simulate/simulateOrganization";

const ORGANIZATION_ID =
  "atlas-executive-simulation";

const GENERATED_AT =
  "2026-07-17T20:00:00.000Z";

type BenchmarkAssertion = {
  name: string;
  passed: boolean;
  detail?: string;
};

type ExecutiveSimulationSynthesisBenchmarkResult = {
  benchmarkId: string;
  status:
    | "PASSED"
    | "FAILED";
  generatedAt: string;
  assertions:
    BenchmarkAssertion[];
};

function assert(
  condition: boolean,
  name: string,
  detail?: string,
): BenchmarkAssertion {
  return {
    name,
    passed:
      condition,
    detail:
      condition
        ? undefined
        : detail,
  };
}

function requireThrows(
  operation: () => unknown,
  expectedMessageFragment: string,
): boolean {
  try {
    operation();
    return false;
  } catch (error) {
    return (
      error instanceof Error &&
      error.message.includes(
        expectedMessageFragment,
      )
    );
  }
}

function buildIntervention(params: {
  id: string;
  title: string;
  confidence: number;
}): OrganizationalIntervention {
  return {
    id:
      params.id,

    organizationId:
      ORGANIZATION_ID,

    title:
      params.title,

    description:
      `${params.title} intervention.`,

    type:
      "decision-rights",

    rationale:
      `Test the projected organizational effects of ${params.title}.`,

    affectedConditionIds: [
      "condition-decision-latency",
      "condition-execution-clarity",
    ],

    assumptions: [
      "Leadership sponsorship remains active.",
      "Implementation begins within the modeled time horizon.",
    ],

    risks: [
      "Temporary implementation disruption.",
    ],

    confidence:
      params.confidence,

    timeHorizon:
      "near-term",

    createdAt:
      GENERATED_AT,
  } as unknown as OrganizationalIntervention;
}

function buildSimulationState(params: {
  intervention:
    OrganizationalIntervention;

  suffix: string;

  confidence: number;
}): SimulatedOrganizationState {
  return {
    id:
      `simulation-${params.suffix}`,

    organizationId:
      ORGANIZATION_ID,

    intervention:
      params.intervention,

    simulatedAt:
      GENERATED_AT,

    timeHorizon:
      "near-term",

    projectedConditions: [],

    projectedBeliefs: [],

    projectedPredictions: [],

    confidence:
      params.confidence,

    explanation:
      `Projected organizational state for ${params.intervention.title}.`,
  };
}

function buildScenario(params: {
  optionId: string;

  intervention:
    OrganizationalIntervention;

  simulation:
    SimulatedOrganizationState;

  recommendation:
    "proceed"
    | "investigate-further"
    | "do-not-proceed";

  confidence: number;

  improvedConditionIds: string[];

  worsenedConditionIds: string[];
}): ExecutiveScenarioResult {
  const conditionIds = [
    ...params.improvedConditionIds,
    ...params.worsenedConditionIds,
  ];

  const conditionChanges =
    conditionIds.map(
      (conditionId) => ({
        conditionId,

        previousStatus:
          "concerning",

        projectedStatus:
          params.improvedConditionIds.includes(
            conditionId,
          )
            ? "healthy"
            : "critical",

        previousTrend:
          "stable",

        projectedTrend:
          params.improvedConditionIds.includes(
            conditionId,
          )
            ? "improving"
            : "deteriorating",

        change:
          params.improvedConditionIds.includes(
            conditionId,
          )
            ? "improved"
            : "worsened",

        explanation:
          `Projected change for ${conditionId}.`,
      }),
    );

  return {
    optionId:
      params.optionId,

    intervention:
      params.intervention,

    simulatedOrganizationState:
      params.simulation,

    scenario: {
      id:
        `scenario-cognition-${params.optionId}`,

      organizationId:
        ORGANIZATION_ID,

      intervention:
        params.intervention,

      simulatedOrganizationState:
        params.simulation,

      generatedAt:
        GENERATED_AT,
    } as unknown as ExecutiveScenarioResult["scenario"],

    comparison: {
      id:
        `comparison-${params.optionId}`,

      organizationId:
        ORGANIZATION_ID,

      scenarioId:
        params.simulation.id,

      recommendation:
        params.recommendation,

      confidence:
        params.confidence,

      conditionChanges,

      predictionChanges: [],

      executiveSummary:
        `${params.intervention.title} produces the modeled organizational outcome.`,

      generatedAt:
        GENERATED_AT,
    } as unknown as ExecutiveScenarioResult["comparison"],
  };
}

function buildOptimizationObjective():
  ExecutiveOptimizationObjective {
  return {
    id:
      "executive-optimization-objective-test",

    executiveDecisionId:
      "executive-decision-test",

    organizationId:
      ORGANIZATION_ID,

    objective:
      "Reduce decision latency while protecting execution clarity.",

    timeHorizon:
      "near-term",

    variables: [],

    successTargets: [
      {
        name:
          "Reduce decision latency",

        conditionId:
          "condition-decision-latency",

        baseline:
          0.4,

        target:
          0.8,

        unit:
          "normalized-strength",

        rationale:
          "Faster decision execution improves organizational throughput.",
      },
    ],

    constraints: [
      {
        sourceConstraintIndex:
          0,

        type:
          "time",

        description:
          "The intervention must produce results in the near term.",

        required:
          true,

        translationStatus:
          "structured",
      },
    ],

    preferences: [
      {
        type:
          "confidence",

        direction:
          "maximize",

        weight:
          0.5,

        rationale:
          "Prefer scenarios supported by stronger simulation confidence.",
      },

      {
        type:
          "risk",

        direction:
          "minimize",

        weight:
          0.5,

        rationale:
          "Prefer scenarios with fewer deteriorating organizational conditions.",
      },
    ],

    tradeoffStrategy:
      "balanced",

    confidence:
      0.84,

    confidenceLimiters: [],

    explanation:
      "Discovery translated the executive decision into a near-term optimization objective.",

    generatedAt:
      GENERATED_AT,
  };
}

function buildFixture() {
  const recommendedIntervention =
    buildIntervention({
      id:
        "intervention-clarify-decision-ownership",

      title:
        "Clarify decision ownership",

      confidence:
        0.91,
    });

  const alternativeIntervention =
    buildIntervention({
      id:
        "intervention-add-approval-layer",

      title:
        "Add an approval layer",

      confidence:
        0.74,
    });

  const recommendedSimulation =
    buildSimulationState({
      intervention:
        recommendedIntervention,

      suffix:
        "recommended",

      confidence:
        0.89,
    });

  const alternativeSimulation =
    buildSimulationState({
      intervention:
        alternativeIntervention,

      suffix:
        "alternative",

      confidence:
        0.71,
    });

  const recommendedScenario =
    buildScenario({
      optionId:
        "option-clarify-decision-ownership",

      intervention:
        recommendedIntervention,

      simulation:
        recommendedSimulation,

      recommendation:
        "proceed",

      confidence:
        0.9,

      improvedConditionIds: [
        "condition-decision-latency",
        "condition-execution-clarity",
      ],

      worsenedConditionIds: [],
    });

  const alternativeScenario =
    buildScenario({
      optionId:
        "option-add-approval-layer",

      intervention:
        alternativeIntervention,

      simulation:
        alternativeSimulation,

      recommendation:
        "do-not-proceed",

      confidence:
        0.72,

      improvedConditionIds: [],

      worsenedConditionIds: [
        "condition-decision-latency",
      ],
    });

  const comparisonSet:
    ExecutiveScenarioComparisonSet = {
      baselineOrganizationId:
        ORGANIZATION_ID,

      scenarioComparisons: [
        {
          optionId:
            recommendedScenario.optionId,

          interventionId:
            recommendedIntervention.id,

          interventionTitle:
            recommendedIntervention.title,

          scenarioId:
            recommendedSimulation.id,

          conditionChanges:
            recommendedScenario
              .comparison
              .conditionChanges,

          targetConditionChanges:
            recommendedScenario
              .comparison
              .conditionChanges,

          improvedConditionIds: [
            "condition-decision-latency",
            "condition-execution-clarity",
          ],

          worsenedConditionIds: [],

          unchangedConditionIds: [],

          addedPredictionIds: [],

          removedPredictionIds: [],

          unchangedPredictionIds: [],

          executiveRecommendation:
            "proceed",

          scenarioConfidence:
            0.9,

          interventionConfidence:
            recommendedIntervention
              .confidence,

          assumptions:
            recommendedIntervention
              .assumptions,

          executiveSummary:
            "Clarifying decision ownership improves decision latency and execution clarity.",
        },

        {
          optionId:
            alternativeScenario.optionId,

          interventionId:
            alternativeIntervention.id,

          interventionTitle:
            alternativeIntervention.title,

          scenarioId:
            alternativeSimulation.id,

          conditionChanges:
            alternativeScenario
              .comparison
              .conditionChanges,

          targetConditionChanges:
            alternativeScenario
              .comparison
              .conditionChanges,

          improvedConditionIds: [],

          worsenedConditionIds: [
            "condition-decision-latency",
          ],

          unchangedConditionIds: [
            "condition-execution-clarity",
          ],

          addedPredictionIds: [],

          removedPredictionIds: [],

          unchangedPredictionIds: [],

          executiveRecommendation:
            "do-not-proceed",

          scenarioConfidence:
            0.72,

          interventionConfidence:
            alternativeIntervention
              .confidence,

          assumptions:
            alternativeIntervention
              .assumptions,

          executiveSummary:
            "Adding an approval layer increases projected decision latency.",
        },
      ],

      sharedImprovedConditionIds: [],

      sharedWorsenedConditionIds: [],

      sharedAssumptions: [
        "Leadership sponsorship remains active.",
        "Implementation begins within the modeled time horizon.",
      ],

      differentiatingConditionIds: [
        "condition-decision-latency",
        "condition-execution-clarity",
      ],

      differentiatingRecommendations:
        true,

      generatedAt:
        GENERATED_AT,
    };

  const rankedScenarios:
    RankedExecutiveScenario[] = [
      {
        rank:
          1,

        optionId:
          recommendedScenario.optionId,

        interventionId:
          recommendedIntervention.id,

        scenarioId:
          recommendedSimulation.id,

        score:
          0.93,

        objectiveAlignmentScore:
          1,

        organizationalBenefitScore:
          1,

        organizationalRiskScore:
          0,

        confidenceScore:
          0.905,

        recommendationScore:
          1,

        reasonsForRank: [
          "2 executive target condition(s) improve.",
          "Objective alignment is 100%.",
          "No organizational conditions worsen.",
        ],
      },

      {
        rank:
          2,

        optionId:
          alternativeScenario.optionId,

        interventionId:
          alternativeIntervention.id,

        scenarioId:
          alternativeSimulation.id,

        score:
          0.26,

        objectiveAlignmentScore:
          0,

        organizationalBenefitScore:
          0,

        organizationalRiskScore:
          1,

        confidenceScore:
          0.73,

        recommendationScore:
          0,

        reasonsForRank: [
          "1 executive target condition(s) worsen.",
          "Objective alignment is 0%.",
        ],
      },
    ];

  const recommendation:
    ExecutiveDecisionRecommendation = {
      recommendedInterventionId:
        recommendedIntervention.id,

      nextBestInterventionId:
        alternativeIntervention.id,

      status:
        "proceed",

      confidence:
        0.88,

      summary:
        "Discovery recommends clarifying decision ownership because it produces the strongest objective alignment with the lowest projected organizational risk.",

      whyRecommended: [
        "Objective alignment is 100%.",
        "Decision latency improves.",
        "Execution clarity improves.",
      ],

      expectedBenefits: [
        "Expected improvement: condition-decision-latency",
        "Expected improvement: condition-execution-clarity",
      ],

      tradeOffs: [
        "Implementation requires explicit reassignment of decision authority.",
      ],

      risks: [
        "Temporary implementation disruption.",
      ],

      assumptions: [
        "Leadership sponsorship remains active.",
      ],

      evidenceThatCouldChangeRecommendation: [
        "New evidence showing that decision-right reassignment creates regulatory risk.",
      ],

      generatedAt:
        GENERATED_AT,
    };

  return {
    optimizationObjective:
      buildOptimizationObjective(),

    recommendation,

    comparisonSet,

    rankedScenarios,

    scenarios: [
      recommendedScenario,
      alternativeScenario,
    ],
  };
}

export function runExecutiveSimulationSynthesis001():
  ExecutiveSimulationSynthesisBenchmarkResult {
  const fixture =
    buildFixture();

  const first =
    buildExecutiveSimulation({
      ...fixture,
      generatedAt:
        GENERATED_AT,
    });

  const second =
    buildExecutiveSimulation({
      ...fixture,
      generatedAt:
        GENERATED_AT,
    });

  const assertions:
    BenchmarkAssertion[] = [
      assert(
        first.organizationId ===
          ORGANIZATION_ID,
        "Executive Simulation preserves organization identity.",
      ),

      assert(
        first
          .recommendedScenario
          .interventionId ===
          fixture.recommendation
            .recommendedInterventionId,
        "Recommended intervention resolves to the recommended scenario.",
      ),

      assert(
        first
          .recommendedScenario
          .ranking.rank === 1,
        "Recommended scenario is the highest-ranked scenario.",
      ),

      assert(
        first.alternativeScenarios.length ===
          1,
        "Executive Simulation preserves all alternative scenarios.",
      ),

      assert(
        first
          .alternativeScenarios[0]
          .ranking.rank === 2,
        "Alternative scenarios remain canonically rank-ordered.",
      ),

      assert(
        first.executiveConfidence ===
          fixture.recommendation
            .confidence,
        "Recommendation confidence is preserved.",
      ),

      assert(
        first.executiveSummary ===
          fixture.recommendation
            .summary,
        "Recommendation summary is preserved.",
      ),

      assert(
        JSON.stringify(
          first.keyDrivers,
        ) ===
          JSON.stringify(
            fixture.recommendation
              .whyRecommended,
          ),
        "Recommendation rationale is preserved.",
      ),

      assert(
        first.optimizationObjective.id ===
          fixture.optimizationObjective.id,
        "Optimization objective is preserved.",
      ),

      assert(
        first
          .comparisonSet
          .scenarioComparisons
          .length ===
          fixture.scenarios.length,
        "Every scenario has comparison coverage.",
      ),

      assert(
        JSON.stringify(first) ===
          JSON.stringify(second),
        "Executive Simulation is deterministic with a fixed timestamp.",
      ),

      assert(
        requireThrows(
          () =>
            buildExecutiveSimulation({
              ...fixture,

              optimizationObjective: {
                ...fixture
                  .optimizationObjective,

                organizationId:
                  "different-organization",
              },

              generatedAt:
                GENERATED_AT,
            }),

          "same organization",
        ),
        "Mismatched organization identities fail.",
      ),

      assert(
        requireThrows(
          () =>
            buildExecutiveSimulation({
              ...fixture,

              recommendation: {
                ...fixture
                  .recommendation,

                recommendedInterventionId:
                  "missing-intervention",
              },

              generatedAt:
                GENERATED_AT,
            }),

          "does not have a completed executive simulation scenario",
        ),
        "Missing recommended scenarios fail.",
      ),

      assert(
        requireThrows(
          () =>
            buildExecutiveSimulation({
              ...fixture,

              comparisonSet: {
                ...fixture.comparisonSet,

                scenarioComparisons:
                  fixture
                    .comparisonSet
                    .scenarioComparisons
                    .slice(0, 1),
              },

              generatedAt:
                GENERATED_AT,
            }),

          "complete comparison coverage",
        ),
        "Incomplete comparison coverage fails.",
      ),

      assert(
        requireThrows(
          () =>
            buildExecutiveSimulation({
              ...fixture,

              rankedScenarios:
                fixture
                  .rankedScenarios
                  .slice(0, 1),

              generatedAt:
                GENERATED_AT,
            }),

          "complete ranking coverage",
        ),
        "Incomplete ranking coverage fails.",
      ),
    ];

  const status =
    assertions.every(
      (assertion) =>
        assertion.passed,
    )
      ? "PASSED"
      : "FAILED";

  return {
    benchmarkId:
      "executive-simulation-synthesis-001",

    status,

    generatedAt:
      GENERATED_AT,

    assertions,
  };
}

const result =
  runExecutiveSimulationSynthesis001();

console.log(
  "\n=========================================",
);

console.log(
  "EXECUTIVE SIMULATION SYNTHESIS 001",
);

console.log(
  "=========================================\n",
);

for (
  const assertion
  of result.assertions
) {
  console.log(
    `${assertion.passed ? "✅" : "❌"} ${assertion.name}`,
  );

  if (
    !assertion.passed &&
    assertion.detail
  ) {
    console.log(
      `   ${assertion.detail}`,
    );
  }
}

console.log(
  `\nStatus: ${result.status}`,
);

console.log(
  "=========================================\n",
);

if (
  result.status ===
  "FAILED"
) {
  process.exitCode = 1;
}