import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  buildDecisionIntelligenceStressExperiment001,
} from "./experiments/decisionIntelligenceStressExperiment001";

import type {
  StressRunResult,
} from "./stressTypes";

type StressCase =
  ReturnType<
    typeof buildDecisionIntelligenceStressExperiment001
  >[number];

type InvestigationOpportunitySummary = {
  topic?: string;
  expectedConfidenceGain?: number;
  executiveLeverage?: string;
  reason?: string;
};

type StressRuntimeMemory =
  StressCase["runtime"]["memory"] & {
    understandingState?: {
      evidence?: unknown[];
      contradictions?: {
        confidence?: number;
      }[];
    };

    investigationOpportunities?:
      InvestigationOpportunitySummary[];
  };

type RuntimeMetrics = {
  evidenceCount: number;
  contradictionCount: number;
  averageContradictionConfidence: number;
  investigationOpportunityCount: number;
  topInvestigationOpportunityNotes: string[];
};

function extractRuntimeMetrics(
  testCase: StressCase,
): RuntimeMetrics {
  const memory =
    testCase.runtime.memory as
      StressRuntimeMemory;

  const evidence =
    Array.isArray(
      memory
        .understandingState
        ?.evidence,
    )
      ? memory
          .understandingState
          .evidence
      : [];

  const contradictions =
    Array.isArray(
      memory
        .understandingState
        ?.contradictions,
    )
      ? memory
          .understandingState
          .contradictions
      : [];

  const contradictionConfidenceValues =
    contradictions
      .map(
        (contradiction) =>
          contradiction.confidence,
      )
      .filter(
        (
          confidence,
        ): confidence is number =>
          typeof confidence ===
            "number" &&
          Number.isFinite(
            confidence,
          ),
      );

  const averageContradictionConfidence =
    contradictionConfidenceValues
      .length === 0
      ? 0
      : contradictionConfidenceValues
          .reduce(
            (
              sum,
              confidence,
            ) =>
              sum +
              confidence,
            0,
          ) /
        contradictionConfidenceValues
          .length;

  const investigationOpportunities =
    Array.isArray(
      memory
        .investigationOpportunities,
    )
      ? memory
          .investigationOpportunities
      : [];

  const topInvestigationOpportunityNotes =
    investigationOpportunities
      .slice(0, 5)
      .flatMap(
        (
          opportunity,
          index,
        ) => [
          `Investigation priority ${index + 1}: ${
            opportunity.topic ??
            "Untitled opportunity"
          }`,
          `  Expected confidence gain: ${
            opportunity
              .expectedConfidenceGain ??
            "n/a"
          }`,
          `  Executive leverage: ${
            opportunity
              .executiveLeverage ??
            "n/a"
          }`,
          `  Reason: ${
            opportunity.reason ??
            "No reason supplied."
          }`,
        ],
      );

  return {
    evidenceCount:
      evidence.length,

    contradictionCount:
      contradictions.length,

    averageContradictionConfidence,

    investigationOpportunityCount:
      investigationOpportunities.length,

    topInvestigationOpportunityNotes,
  };
}

function runStressCase(
  testCase: StressCase,
): StressRunResult {
  const startedAt =
    performance.now();

  const runtimeMetrics =
    extractRuntimeMetrics(
      testCase,
    );

  try {
    const cycle =
      runExecutiveDecisionCycle({
        executiveDecision:
          testCase.executiveDecision,

        runtime:
          testCase.runtime,

        completedAt:
          testCase.executiveDecision.updatedAt,
      });

    const durationMs =
      performance.now() -
      startedAt;

    const selectedScenario =
      cycle.rankedScenarios[0];

    return {
      variant:
        testCase.variant,

      succeeded: true,

      durationMs,

      recommendation:
        cycle.recommendation.summary,

      selectedScenarioId:
        selectedScenario?.scenarioId,

      rankedScenarioIds:
        cycle.rankedScenarios.map(
          (scenario) =>
            scenario.scenarioId,
        ),

      confidence:
        cycle.recommendation.confidence,

      evidenceCount:
        runtimeMetrics.evidenceCount,

      contradictionCount:
        runtimeMetrics.contradictionCount,

      averageContradictionConfidence:
        runtimeMetrics
          .averageContradictionConfidence,

      evidenceConfidenceScore:
        cycle.confidenceCalibration
          .evidenceConfidenceScore,

      learningConfidenceScore:
        cycle.confidenceCalibration
          .learningConfidenceScore,

      constraintConfidenceScore:
        cycle.confidenceCalibration
          .constraintConfidenceScore,

      investigationOpportunityCount:
        runtimeMetrics
          .investigationOpportunityCount,

      failureCodes: [],

      notes: [
        testCase.description,
        `Generated ${cycle.generatedOptions.length} intervention option(s).`,
        `Completed ${cycle.scenarios.length} scenario simulation(s).`,
        ...runtimeMetrics
          .topInvestigationOpportunityNotes,
      ],
    };
  } catch (error) {
    const durationMs =
      performance.now() -
      startedAt;

    return {
      variant:
        testCase.variant,

      succeeded: false,

      durationMs,

      rankedScenarioIds: [],

      evidenceCount:
        runtimeMetrics.evidenceCount,

      contradictionCount:
        runtimeMetrics.contradictionCount,

      averageContradictionConfidence:
        runtimeMetrics
          .averageContradictionConfidence,

      investigationOpportunityCount:
        runtimeMetrics
          .investigationOpportunityCount,

      failureCodes: [
        "runtime_failure",
      ],

      notes: [
        testCase.description,
        error instanceof Error
          ? error.message
          : String(error),
        ...runtimeMetrics
          .topInvestigationOpportunityNotes,
      ],
    };
  }
}

function main(): void {
  const experiment =
    buildDecisionIntelligenceStressExperiment001();

  const results =
    experiment.map(
      runStressCase,
    );

  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    "DECISION INTELLIGENCE STRESS TEST 001",
  );
  console.log(
    "=========================================",
  );

  for (const result of results) {
    console.log("");
    console.log(
      `${result.variant}: ${
        result.succeeded
          ? "✅ PASSED"
          : "❌ FAILED"
      }`,
    );

    console.log(
      `Duration: ${result.durationMs.toFixed(2)}ms`,
    );

    console.log(
      `Selected scenario: ${
        result.selectedScenarioId ??
        "none"
      }`,
    );

    console.log(
      `Recommendation confidence: ${
        result.confidence ??
        "n/a"
      }`,
    );

    console.log(
      `Evidence count: ${result.evidenceCount}`,
    );

    console.log(
      `Contradiction count: ${result.contradictionCount}`,
    );

    console.log(
      `Average contradiction confidence: ${result.averageContradictionConfidence.toFixed(3)}`,
    );

    console.log(
      `Evidence confidence: ${
        result.evidenceConfidenceScore ??
        "n/a"
      }`,
    );

    console.log(
      `Learning confidence: ${
        result.learningConfidenceScore ??
        "n/a"
      }`,
    );

    console.log(
      `Constraint confidence: ${
        result.constraintConfidenceScore ??
        "n/a"
      }`,
    );

    console.log(
      `Investigation opportunities: ${result.investigationOpportunityCount}`,
    );

    for (
      const note of
        result.notes
    ) {
      console.log(
        `- ${note}`,
      );
    }
  }

  const failed =
    results.filter(
      (result) =>
        !result.succeeded,
    );

  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    `Completed: ${results.length}`,
  );
  console.log(
    `Passed: ${results.length - failed.length}`,
  );
  console.log(
    `Failed: ${failed.length}`,
  );
  console.log(
    "=========================================",
  );

  if (
    failed.length >
    0
  ) {
    process.exitCode =
      1;
  }
}

main();
