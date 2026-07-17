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

const OTHER_ORGANIZATION_ID =
  "default-organization";

const FIXED_ASSESSED_AT =
  "2026-07-17T16:00:00.000Z";

type Check = {
  caseName: string;
  assertion: string;
  passed: boolean;
  detail: string;
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

type Projection = {
  completedAt: string;

  integrityKey: string;

  objective: {
    id: string;
  };

  rankedStrategies: Array<{
    optionId: string;
    rank: number;
    title: string;
  }>;

  recommendation: {
    status:
      | "proceed"
      | "do-not-proceed"
      | "investigate-further";

    headline: string;
    rationale: string;
    nextStep: string;
  };
};

type EvaluationResponse = {
  executiveDecisionProjection?: Projection;
  error?: string;
};

type DecisionRecord = {
  id: string;
  executiveDecisionId: string;
  recommendedOptionId?: string;
  selectedOptionId?: string;
  disposition: string;
  decision: string;
  rationale: string;
  expectedOutcomes: unknown[];
  successCriteria: unknown[];
};

type RecordingResponse = {
  executiveDecisionRecord?: DecisionRecord;
  persisted?: boolean;
  idempotentReplay?: boolean;
  error?: string;
};

function buildUncertainty():
  OrganizationalUncertainty {
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
      FIXED_ASSESSED_AT,
  };
}

function buildDecision(
  suffix: string,
  overrides: Partial<DecisionPayload> = {},
): DecisionPayload {
  return {
    id:
      `executive-decision-semantics-${suffix}`,

    type:
      "execution",

    title:
      `Executive Decision Semantics ${suffix}`,

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

function prepareRuntime(
  runtime:
    ReturnType<
      typeof loadOrganizationRuntimeState
    >,
): void {
  persistOrganizationRuntimeState({
    ...runtime,

    memory: {
      ...runtime.memory,

      organizationalUncertainty:
        buildUncertainty(),

      executiveDecisionRecords:
        runtime.memory
          .executiveDecisionRecords ??
        [],
    },
  });
}

async function readJson<T>(
  response: Response,
): Promise<T> {
  return await response.json() as T;
}

async function analyze(
  organizationId: string,
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
              organizationId,
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
  organizationId: string,
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
              organizationId,

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

function recordCount(
  organizationId: string,
): number {
  return loadOrganizationRuntimeState(
    organizationId,
  ).memory
    .executiveDecisionRecords
    .length;
}

async function run(): Promise<void> {
  console.log("");
  console.log("==========================================");
  console.log("DISCOVERY EXECUTIVE DECISION SEMANTICS");
  console.log("Stress Suite 002");
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

  try {
    /**
     * CASE 1 — Modified recommendation.
     */
    {
      const caseName =
        "Modified recommendation";

      prepareRuntime(
        originalRuntime,
      );

      const decision =
        buildDecision(
          "modified",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        const modifiedDecisionText =
          `Authorize ${leader.title} through a phased two-quarter rollout.`;

        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-01",
            {
              selectedOptionId:
                leader.optionId,

              disposition:
                "modified-recommendation",

              decision:
                modifiedDecisionText,

              rationale:
                "Discovery's recommended strategy is accepted, but implementation timing is modified to reduce transition risk.",

              acceptedRisks: [
                "Benefits will emerge more slowly under a phased rollout.",
              ],

              executiveConfidenceAtDecision:
                0.82,
            },
          );

        const result =
          recording.body
            .executiveDecisionRecord;

        pushCheck(
          checks,
          caseName,
          "Modified recommendation persists",
          recording.response.status ===
            201 &&
            recording.body.persisted ===
            true &&
            Boolean(
              result,
            ),
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        if (result) {
          pushCheck(
            checks,
            caseName,
            "Recommended and selected option remain aligned",
            result.recommendedOptionId ===
              leader.optionId &&
            result.selectedOptionId ===
              leader.optionId,
            `recommended=${result.recommendedOptionId ?? "none"}, selected=${result.selectedOptionId ?? "none"}`,
          );

          pushCheck(
            checks,
            caseName,
            "Executive modification is preserved",
            result.disposition ===
              "modified-recommendation" &&
            result.decision ===
              modifiedDecisionText,
            `${result.disposition}: ${result.decision}`,
          );
        }
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 2 — Selected alternative.
     */
    {
      const caseName =
        "Selected alternative";

      prepareRuntime(
        originalRuntime,
      );

      const decision =
        buildDecision(
          "alternative",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      const alternative =
        projection
          ?.rankedStrategies.find(
            (strategy) =>
              strategy.optionId !==
              leader?.optionId,
          );

      if (
        !projection ||
        !leader ||
        !alternative
      ) {
        pushCheck(
          checks,
          caseName,
          "At least two strategies exist",
          false,
          "The decision cycle did not produce a valid alternative.",
        );
      } else {
        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-02",
            {
              selectedOptionId:
                alternative.optionId,

              disposition:
                "selected-alternative",

              decision:
                `Select ${alternative.title} instead of the leading strategy.`,

              rationale:
                "The executive team prefers the alternative because it better matches current implementation capacity.",

              executiveConfidenceAtDecision:
                0.72,
            },
          );

        const result =
          recording.body
            .executiveDecisionRecord;

        pushCheck(
          checks,
          caseName,
          "Alternative selection persists",
          recording.response.status ===
            201 &&
            recording.body.persisted ===
            true &&
            Boolean(
              result,
            ),
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        if (result) {
          pushCheck(
            checks,
            caseName,
            "Recommendation remains the leading option",
            result.recommendedOptionId ===
              leader.optionId,
            `expected=${leader.optionId}, actual=${result.recommendedOptionId ?? "none"}`,
          );

          pushCheck(
            checks,
            caseName,
            "Executive selection remains the alternative",
            result.selectedOptionId ===
              alternative.optionId &&
            result.selectedOptionId !==
              result.recommendedOptionId,
            `selected=${result.selectedOptionId ?? "none"}`,
          );

          pushCheck(
            checks,
            caseName,
            "Alternative outcomes are populated",
            result.expectedOutcomes.length >
              0 &&
            result.successCriteria.length >
              0,
            `${result.expectedOutcomes.length} outcomes, ${result.successCriteria.length} criteria`,
          );
        }
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 3 — Rejected recommendation.
     */
    {
      const caseName =
        "Rejected recommendation";

      prepareRuntime(
        originalRuntime,
      );

      const decision =
        buildDecision(
          "rejected",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      if (!projection) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No projection.",
        );
      } else {
        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-03",
            {
              disposition:
                "rejected",

              decision:
                "Reject all evaluated strategies.",

              rationale:
                "The executive team does not believe the available interventions sufficiently address execution risk.",

              executiveConfidenceAtDecision:
                0.65,
            },
          );

        const result =
          recording.body
            .executiveDecisionRecord;

        pushCheck(
          checks,
          caseName,
          "Rejected decision persists",
          recording.response.status ===
            201 &&
            recording.body.persisted ===
            true &&
            Boolean(
              result,
            ),
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        if (result) {
          pushCheck(
            checks,
            caseName,
            "Rejected decision has no selected option",
            result.disposition ===
              "rejected" &&
            result.selectedOptionId ===
              undefined,
            `disposition=${result.disposition}, selected=${result.selectedOptionId ?? "none"}`,
          );

          pushCheck(
            checks,
            caseName,
            "Discovery recommendation remains preserved",
            typeof result
              .recommendedOptionId ===
              "string",
            result.recommendedOptionId ??
              "No recommendation preserved.",
          );
        }
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 4 — Accepted recommendation without selected option.
     */
    {
      const caseName =
        "Accepted recommendation missing option";

      prepareRuntime(
        originalRuntime,
      );

      const before =
        recordCount(
          ORGANIZATION_ID,
        );

      const decision =
        buildDecision(
          "accepted-missing-option",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      if (!projection) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No projection.",
        );
      } else {
        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-04",
            {
              disposition:
                "accepted-recommendation",

              decision:
                "Accept Discovery's recommendation.",

              rationale:
                "This request intentionally omits the selected option.",
            },
          );

        const after =
          recordCount(
            ORGANIZATION_ID,
          );

        pushCheck(
          checks,
          caseName,
          "Missing option is rejected",
          recording.response.status ===
            400,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Invalid acceptance is not persisted",
          before ===
            after,
          `${before} → ${after}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 5 — Deferred decision with selected option.
     */
    {
      const caseName =
        "Deferred decision with selected option";

      prepareRuntime(
        originalRuntime,
      );

      const before =
        recordCount(
          ORGANIZATION_ID,
        );

      const decision =
        buildDecision(
          "deferred-with-option",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-05",
            {
              selectedOptionId:
                leader.optionId,

              disposition:
                "deferred",

              decision:
                "Defer the decision while selecting an option.",

              rationale:
                "This request intentionally combines contradictory executive semantics.",
            },
          );

        const after =
          recordCount(
            ORGANIZATION_ID,
          );

        pushCheck(
          checks,
          caseName,
          "Contradictory deferred selection is rejected",
          recording.response.status ===
            400,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Contradictory deferred decision is not persisted",
          before ===
            after,
          `${before} → ${after}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 6 — Rejected decision with selected option.
     */
    {
      const caseName =
        "Rejected decision with selected option";

      prepareRuntime(
        originalRuntime,
      );

      const before =
        recordCount(
          ORGANIZATION_ID,
        );

      const decision =
        buildDecision(
          "rejected-with-option",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        const recording =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-06",
            {
              selectedOptionId:
                leader.optionId,

              disposition:
                "rejected",

              decision:
                "Reject the recommendation while selecting it.",

              rationale:
                "This request intentionally combines contradictory executive semantics.",
            },
          );

        const after =
          recordCount(
            ORGANIZATION_ID,
          );

        pushCheck(
          checks,
          caseName,
          "Contradictory rejected selection is rejected",
          recording.response.status ===
            400,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Contradictory rejected decision is not persisted",
          before ===
            after,
          `${before} → ${after}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 7 — Duplicate submission measurement.
     *
     * This case does not impose an idempotency policy. It records the
     * system's current behavior so we can decide the canonical policy.
     */
    {
      const caseName =
        "Duplicate submission behavior";

      prepareRuntime(
        originalRuntime,
      );

      const before =
        recordCount(
          ORGANIZATION_ID,
        );

      const decision =
        buildDecision(
          "duplicate",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        const selection = {
          selectedOptionId:
            leader.optionId,

          disposition:
            "accepted-recommendation",

          decision:
            `Authorize ${leader.title}.`,

          rationale:
            "Identical duplicate-submission stress payload.",
        };

        const first =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-07",
            selection,
          );

        const second =
          await record(
            ORGANIZATION_ID,
            decision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-07",
            selection,
          );

        const after =
          recordCount(
            ORGANIZATION_ID,
          );

        const firstRecord =
          first.body
            .executiveDecisionRecord;

        const secondRecord =
          second.body
            .executiveDecisionRecord;

        const delta =
          after -
          before;

        pushCheck(
          checks,
          caseName,
          "First submission creates the record",
          first.response.status ===
            201 &&
          Boolean(
            firstRecord,
          ),
          first.body.error ??
            `HTTP ${first.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Duplicate submission is idempotent",
          second.response.status ===
            200 &&
          second.body.idempotentReplay ===
            true &&
          Boolean(
            secondRecord,
          ),
          second.body.error ??
            `HTTP ${second.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Replay returns the same record",
          Boolean(
            firstRecord &&
            secondRecord &&
            firstRecord.id ===
              secondRecord.id,
          ),
          `first=${firstRecord?.id ?? "none"}, second=${secondRecord?.id ?? "none"}`,
        );

        pushCheck(
          checks,
          caseName,
          "Replay does not create a duplicate",
          delta ===
            1,
          `${before} → ${after}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 8 — Reconstruction drift.
     */
    {
      const caseName =
        "Decision reconstruction drift";

      prepareRuntime(
        originalRuntime,
      );

      const before =
        recordCount(
          ORGANIZATION_ID,
        );

      const analyzedDecision =
        buildDecision(
          "drift",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          analyzedDecision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        const changedDecision =
          buildDecision(
            "drift",
            {
              constraints: [
                ...analyzedDecision.constraints,

                {
                  type:
                    "time",

                  description:
                    "The intervention must be completed immediately.",

                  required:
                    true,
                },
              ],

              assumptions: [
                "The original evidence is no longer considered reliable.",
              ],
            },
          );

        const recording =
          await record(
            ORGANIZATION_ID,
            changedDecision,
            projection.completedAt,
            projection.integrityKey,
            "stress-suite-002-submission-09",
            {
              selectedOptionId:
                leader.optionId,

              disposition:
                "accepted-recommendation",

              decision:
                "Accept the option generated under the earlier decision definition.",

              rationale:
                "This request intentionally changes the decision before recording.",
            },
          );

        const after =
          recordCount(
            ORGANIZATION_ID,
          );

        pushCheck(
          checks,
          caseName,
          "Drifted reconstruction is rejected",
          recording.response.status ===
            400,
          recording.body.error ??
            `HTTP ${recording.response.status}`,
        );

        pushCheck(
          checks,
          caseName,
          "Drifted reconstruction is not persisted",
          before ===
            after,
          `${before} → ${after}`,
        );
      }
    }

    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );

    /**
     * CASE 9 — Cross-organization recording attempt.
     */
    {
      const caseName =
        "Cross-organization safety";

      prepareRuntime(
        originalRuntime,
      );

      const decision =
        buildDecision(
          "cross-organization",
        );

      const analysis =
        await analyze(
          ORGANIZATION_ID,
          decision,
        );

      const projection =
        analysis.body
          .executiveDecisionProjection;

      const leader =
        projection
          ?.rankedStrategies[0];

      if (
        !projection ||
        !leader
      ) {
        pushCheck(
          checks,
          caseName,
          "Analysis prerequisite succeeds",
          false,
          analysis.body.error ??
            "No leading strategy.",
        );
      } else {
        let otherRuntimeAvailable =
          true;

        let otherBefore = 0;

        try {
          otherBefore =
            recordCount(
              OTHER_ORGANIZATION_ID,
            );
        } catch {
          otherRuntimeAvailable =
            false;
        }

        if (!otherRuntimeAvailable) {
          pushCheck(
            checks,
            caseName,
            "Cross-organization case is executable",
            true,
            `Skipped: runtime "${OTHER_ORGANIZATION_ID}" is not available.`,
          );
        } else {
          const recording =
            await record(
              OTHER_ORGANIZATION_ID,
              decision,
              projection.completedAt,
              projection.integrityKey,
              "stress-suite-002-submission-10",
              {
                selectedOptionId:
                  leader.optionId,

                disposition:
                  "accepted-recommendation",

                decision:
                  "Attempt to record Atlas analysis into another organization.",

                rationale:
                  "This request intentionally crosses organizational boundaries.",
              },
            );

          const otherAfter =
            recordCount(
              OTHER_ORGANIZATION_ID,
            );

          pushCheck(
            checks,
            caseName,
            "Cross-organization request fails",
            recording.response.status >=
              400,
            recording.body.error ??
              `HTTP ${recording.response.status}`,
          );

          pushCheck(
            checks,
            caseName,
            "Other organization is not mutated",
            otherBefore ===
              otherAfter,
            `${otherBefore} → ${otherAfter}`,
          );
        }
      }
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
    "Original Atlas runtime restored",
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
