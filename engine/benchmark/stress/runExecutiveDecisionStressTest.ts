import {
  POST as evaluateExecutiveDecision,
} from "../../../app/api/executive-decision/route";

import {
  POST as recordExecutiveDecision,
} from "../../../app/api/executive-decision-record/route";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
} from "../../v3/runtime";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const FIXED_COMPLETED_AT =
  "2026-07-17T12:00:00.000Z";

type Check = {
  caseName: string;
  assertion: string;
  passed: boolean;
  detail: string;
};

type Projection = {
  completedAt: string;

  integrityKey: string;

  objective: {
    id: string;
  };

  rankedStrategies: Array<{
    optionId: string;
    title: string;
  }>;

  recommendation?: {
    status?:
      | "proceed"
      | "do-not-proceed"
      | "investigate-further";
  };
};

type EvaluationResponse = {
  executiveDecisionProjection?: Projection;
  error?: string;
};

type RecordingResponse = {
  executiveDecisionRecord?: {
    id: string;
    selectedOptionId?: string;
    disposition: string;
  };

  confidence?: {
    calibratedConfidence: number;
  };

  persisted?: boolean;
  error?: string;
};

type DecisionPayload = {
  id: string;
  type: "execution";
  title: string;
  objective: string;
  rationale: string;
  status: "ready";
  timeHorizon: "near-term";
  targetConditionIds: string[];
  successMetrics: Array<{
    name: string;
    baseline: number;
    target: number;
    unit: string;
    rationale: string;
  }>;
  constraints: Array<{
    type:
      | "risk"
      | "people"
      | "budget"
      | "time";

    description: string;
    required: boolean;
  }>;
  allowedInterventionTypes: Array<
    "governance" | "policy" | "strategy"
  >;
  assumptions: string[];
  openQuestions: string[];
  confidence: number;
};

function buildUncertainty(
  overrides: Partial<
    OrganizationalUncertainty
  > = {},
): OrganizationalUncertainty {
  return {
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
      "Validate whether structural interventions improve execution without increasing risk.",
    ],

    confidenceLimiters: [
      "One executive assumption remains insufficiently validated.",
    ],

    summary:
      "Discovery has strong but incomplete evidence for the current organizational assessment.",

    assessedAt:
      FIXED_COMPLETED_AT,

    ...overrides,
  };
}

function buildDecision(
  suffix: string,
  overrides: Partial<DecisionPayload> = {},
): DecisionPayload {
  return {
    id:
      `executive-decision-stress-${suffix}`,

    type:
      "execution",

    title:
      `Executive Decision Stress ${suffix}`,

    objective:
      "Increase execution throughput without increasing organizational risk.",

    rationale:
      "Leadership wants to improve execution through structural interventions.",

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
          "Execution capacity must improve materially.",
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

    ...overrides,
  };
}

async function readJson<T>(
  response: Response,
): Promise<T> {
  return await response.json() as T;
}

async function analyze(
  decision: DecisionPayload,
): Promise<{
  response: Response;
  body: EvaluationResponse;
}> {
  const response =
    await evaluateExecutiveDecision(
      new Request(
        "http://localhost/api/executive-decision",
        {
          method:
            "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body:
            JSON.stringify({
              organizationId:
                ORGANIZATION_ID,

              decision,
            }),
        },
      ),
    );

  return {
    response,
    body:
      await readJson<EvaluationResponse>(
        response,
      ),
  };
}

async function record(
  decision: DecisionPayload,
  completedAt: string,
  integrityKey: string,
  submissionId: string,
  selection: Record<string, unknown>,
): Promise<{
  response: Response;
  body: RecordingResponse;
}> {
  const response =
    await recordExecutiveDecision(
      new Request(
        "http://localhost/api/executive-decision-record",
        {
          method:
            "POST",

          headers: {
            "content-type":
              "application/json",
          },

          body:
            JSON.stringify({
              organizationId:
                ORGANIZATION_ID,

              submissionId,

              decisionCycleCompletedAt:
                completedAt,

              decisionCycleIntegrityKey:
                integrityKey,

              decision,

              selection,
            }),
        },
      ),
    );

  return {
    response,
    body:
      await readJson<RecordingResponse>(
        response,
      ),
  };
}

function persistPreparedRuntime(
  originalRuntime:
    ReturnType<
      typeof loadOrganizationRuntimeState
    >,

  uncertainty:
    OrganizationalUncertainty,
): void {
  persistOrganizationRuntimeState({
    ...originalRuntime,

    memory: {
      ...originalRuntime.memory,

      organizationalUncertainty:
        uncertainty,

      executiveDecisionRecords:
        originalRuntime.memory
          .executiveDecisionRecords ??
        [],
    },
  });
}

function pushCheck(
  checks: Check[],
  caseName: string,
  assertion: string,
  passed: boolean,
  detail: string,
): void {
  checks.push({
    caseName,
    assertion,
    passed,
    detail,
  });
}

async function run(): Promise<void> {
  console.log("");
  console.log("==========================================");
  console.log("DISCOVERY EXECUTIVE DECISION STRESS SUITE");
  console.log("Suite 001");
  console.log("==========================================");
  console.log("");

  const originalRuntime =
    loadOrganizationRuntimeState(
      ORGANIZATION_ID,
    );

  const originalSnapshot =
    JSON.stringify(
      originalRuntime,
    );

  const checks: Check[] = [];

  let clearConfidence:
    number | undefined;

  try {
    /**
     * CASE 1
     * Clear recommendation accepted and persisted.
     */
    {
      const caseName =
        "Clear viable recommendation";

      persistPreparedRuntime(
        originalRuntime,
        buildUncertainty(),
      );

      const decision =
        buildDecision(
          "clear",
        );

      const analysis =
        await analyze(
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      pushCheck(
        checks,
        caseName,
        "Analysis succeeds",
        analysis.response.status ===
          200 &&
          Boolean(
            projection,
          ),
        analysis.body.error ??
          `HTTP ${analysis.response.status}`,
      );

      if (projection) {
        const leader =
          projection
            .rankedStrategies[0];

        pushCheck(
          checks,
          caseName,
          "Leading strategy exists",
          Boolean(
            leader,
          ),
          leader?.optionId ??
            "No leading strategy.",
        );

        if (leader) {
          const recording =
            await record(
              decision,
              projection.completedAt,
              projection.integrityKey,
              "stress-suite-001-clear",
              {
                selectedOptionId:
                  leader.optionId,

                disposition:
                  "accepted-recommendation",

                decision:
                  `Authorize ${leader.title}.`,

                rationale:
                  "The leading strategy is viable and best supports the stated objective.",

                executiveConfidenceAtDecision:
                  0.86,

                owner:
                  "Chief Operating Officer",

                decisionMaker:
                  "Executive Leadership Team",
              },
            );

          clearConfidence =
            recording.body
              .confidence
              ?.calibratedConfidence;

          pushCheck(
            checks,
            caseName,
            "Accepted decision persists",
            recording.response.status ===
              201 &&
              recording.body.persisted ===
              true,
            recording.body.error ??
              `HTTP ${recording.response.status}`,
          );
        }
      }
    }

    /**
     * Reset between cases so results cannot contaminate each other.
     */
    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 2
     * Impossible constraints must not crash the analysis route.
     */
    {
      const caseName =
        "Impossible constraint set";

      persistPreparedRuntime(
        originalRuntime,
        buildUncertainty(),
      );

      const decision =
        buildDecision(
          "impossible-constraints",
          {
            constraints: [
              {
                type:
                  "risk",

                description:
                  "The intervention must have zero implementation risk.",

                required:
                  true,
              },

              {
                type:
                  "people",

                description:
                  "The intervention may not change any role, responsibility, behavior, or workflow.",

                required:
                  true,
              },

              {
                type:
                  "budget",

                description:
                  "The intervention may consume no budget or organizational capacity.",

                required:
                  true,
              },

              {
                type:
                  "time",

                description:
                  "The full outcome must occur immediately.",

                required:
                  true,
              },
            ],
          },
        );

      const analysis =
        await analyze(
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      pushCheck(
        checks,
        caseName,
        "Analysis handles impossible constraints",
        analysis.response.status ===
          200 &&
          Boolean(
            projection,
          ),
        analysis.body.error ??
          `HTTP ${analysis.response.status}`,
      );

      if (projection) {
        pushCheck(
          checks,
          caseName,
          "Projection returns a recommendation state",
          [
            "proceed",
            "do-not-proceed",
            "investigate-further",
          ].includes(
            projection
              .recommendation
              ?.status ??
            "",
          ),
          projection
            .recommendation
            ?.status ??
          "No recommendation status.",
        );

        const recording =
          await record(
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-001-impossible-constraints",
            {
              disposition:
                "deferred",

              decision:
                "Defer action pending a viable intervention.",

              rationale:
                "The current constraint set may prevent a responsible intervention.",

              executiveConfidenceAtDecision:
                0.45,
            },
          );

        pushCheck(
          checks,
          caseName,
          "Deferred decision can be recorded",
          recording.response.status ===
            201 &&
            recording.body.persisted ===
            true,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 3
     * Extreme uncertainty should lower calibrated confidence and still
     * permit a deferred decision to be recorded.
     */
    {
      const caseName =
        "Extreme organizational uncertainty";

      persistPreparedRuntime(
        originalRuntime,
        buildUncertainty({
          evidenceCompleteness:
            0.2,

          evidenceAgreement:
            0.18,

          contradictionDensity:
            0.82,

          contradictionConfidence:
            0.9,

          ambiguityScore:
            0.88,

          learningCertainty:
            0.16,

          predictionCertainty:
            0.14,

          investigationUrgency:
            0.95,

          unresolvedContradictionCount:
            12,

          unresolvedQuestionCount:
            18,

          competingExplanationCount:
            7,

          overallUncertainty:
            0.91,

          status:
            "critical",

          confidenceLimiters: [
            "Evidence is materially incomplete.",
            "Multiple explanations remain viable.",
            "Contradictions are unresolved.",
          ],

          summary:
            "Discovery has insufficient certainty to support an immediate executive commitment.",
        }),
      );

      const decision =
        buildDecision(
          "extreme-uncertainty",
        );

      const analysis =
        await analyze(
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      pushCheck(
        checks,
        caseName,
        "Analysis survives extreme uncertainty",
        analysis.response.status ===
          200 &&
          Boolean(
            projection,
          ),
        analysis.body.error ??
          `HTTP ${analysis.response.status}`,
      );

      if (projection) {
        const recording =
          await record(
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-001-extreme-uncertainty",
            {
              disposition:
                "deferred",

              decision:
                "Defer the executive commitment.",

              rationale:
                "Evidence quality and contradiction levels are insufficient for responsible execution.",

              executiveConfidenceAtDecision:
                0.25,
            },
          );

        const uncertaintyConfidence =
          recording.body
            .confidence
            ?.calibratedConfidence;

        pushCheck(
          checks,
          caseName,
          "Deferred decision persists",
          recording.response.status ===
            201 &&
            recording.body.persisted ===
            true,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Confidence is lower than clear case",
          typeof clearConfidence ===
            "number" &&
          typeof uncertaintyConfidence ===
            "number" &&
          uncertaintyConfidence <
            clearConfidence,
          `clear=${clearConfidence ?? "n/a"}, uncertain=${uncertaintyConfidence ?? "n/a"}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 4
     * A fabricated option ID must be rejected without persistence.
     */
    {
      const caseName =
        "Invalid selected option";

      persistPreparedRuntime(
        originalRuntime,
        buildUncertainty(),
      );

      const beforeCount =
        loadOrganizationRuntimeState(
          ORGANIZATION_ID,
        ).memory
          .executiveDecisionRecords
          .length;

      const decision =
        buildDecision(
          "invalid-option",
        );

      const analysis =
        await analyze(
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      if (projection) {
        const recording =
          await record(
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-001-invalid-option",
            {
              selectedOptionId:
                "intervention-option-does-not-exist",

              disposition:
                "accepted-recommendation",

              decision:
                "Authorize the fabricated option.",

              rationale:
                "This request intentionally contains an invalid selection.",
            },
          );

        const afterCount =
          loadOrganizationRuntimeState(
            ORGANIZATION_ID,
          ).memory
            .executiveDecisionRecords
            .length;

        pushCheck(
          checks,
          caseName,
          "Invalid option returns client error",
          recording.response.status ===
            400,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Invalid option is not persisted",
          afterCount ===
            beforeCount,
          `${beforeCount} → ${afterCount}`,
        );
      } else {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No projection.",
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 5
     * Malformed input must produce a client error and preserve runtime.
     */
    {
      const caseName =
        "Malformed decision request";

      persistPreparedRuntime(
        originalRuntime,
        buildUncertainty(),
      );

      const beforeSnapshot =
        JSON.stringify(
          loadOrganizationRuntimeState(
            ORGANIZATION_ID,
          ),
        );

      const response =
        await evaluateExecutiveDecision(
          new Request(
            "http://localhost/api/executive-decision",
            {
              method:
                "POST",

              headers: {
                "content-type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  organizationId:
                    ORGANIZATION_ID,

                  decision: {
                    title:
                      "",
                    targetConditionIds:
                      [],
                  },
                }),
            },
          ),
        );

      const body =
        await readJson<EvaluationResponse>(
          response,
        );

      const afterSnapshot =
        JSON.stringify(
          loadOrganizationRuntimeState(
            ORGANIZATION_ID,
          ),
        );

      pushCheck(
        checks,
        caseName,
        "Malformed request returns 400",
        response.status ===
          400,
        body.error ??
          `HTTP ${response.status}`,
      );

      pushCheck(
        checks,
        caseName,
        "Malformed request does not mutate runtime",
        beforeSnapshot ===
          afterSnapshot,
        beforeSnapshot ===
          afterSnapshot
          ? "Runtime unchanged."
          : "Runtime changed.",
      );
    }
  } finally {
    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );
  }

  const restoredSnapshot =
    JSON.stringify(
      loadOrganizationRuntimeState(
        ORGANIZATION_ID,
      ),
    );

  pushCheck(
    checks,
    "Suite integrity",
    "Original runtime restored",
    restoredSnapshot ===
      originalSnapshot,
    restoredSnapshot ===
      originalSnapshot
      ? "Original runtime restored."
      : "Runtime differs from original snapshot.",
  );

  console.log("Assertions");
  console.log("------------------------------------------");

  let currentCase = "";

  for (const check of checks) {
    if (
      check.caseName !==
      currentCase
    ) {
      currentCase =
        check.caseName;

      console.log("");
      console.log(
        currentCase,
      );
    }

    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.assertion}`,
    );

    console.log(
      `      ${check.detail}`,
    );
  }

  const passed =
    checks.filter(
      (check) =>
        check.passed,
    ).length;

  const failed =
    checks.length -
    passed;

  console.log("");
  console.log("------------------------------------------");
  console.log(
    `Passed: ${passed}`,
  );
  console.log(
    `Failed: ${failed}`,
  );
  console.log("");

  if (failed > 0) {
    process.exitCode = 1;
  }

  console.log("Stress Suite Complete");
  console.log("");
}

run().catch(
  (error: unknown) => {
    console.error(
      error,
    );

    process.exitCode = 1;
  },
);
