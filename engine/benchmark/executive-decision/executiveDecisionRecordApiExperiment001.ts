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
  ExecutiveDecisionProjection,
} from "../../../components/executive-v3/projection/buildExecutiveDecisionProjection";

import type {
  ExecutiveDecisionRecord,
} from "../../v3/decisions/executiveDecisionRecord";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const REVIEW_AT =
  "2026-10-16T20:00:00.000Z";

const SUBMISSION_ID =
  "executive-decision-record-api-experiment-001-submission";

const BENCHMARK_NOW =
  "2026-07-16T20:00:00.000Z";

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
      BENCHMARK_NOW,
  };

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

type EvaluationResponse = {
  executiveDecisionProjection?:
    ExecutiveDecisionProjection;

  error?: string;
};

type RecordingResponse = {
  executiveDecisionRecord?:
    ExecutiveDecisionRecord;

  recommendation?: {
    recommendedInterventionId?:
      string;

    status:
      | "proceed"
      | "do-not-proceed"
      | "investigate-further";
  };

  confidence?: {
    calibratedConfidence:
      number;
  };

  persisted?: boolean;

  idempotentReplay?: boolean;

  error?: string;
};

const decisionPayload = {
  id:
    "executive-decision-record-api-experiment-001",

  type:
    "execution" as const,

  title:
    "Improve Organizational Execution",

  objective:
    "Increase execution throughput without increasing organizational risk.",

  rationale:
    "Leadership wants to improve execution quality using structural rather than staffing interventions.",

  status:
    "ready" as const,

  timeHorizon:
    "near-term" as const,

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
    "governance" as const,
    "policy" as const,
    "strategy" as const,
  ],

  assumptions: [
    "The current organizational understanding is sufficiently accurate.",
  ],

  openQuestions: [],

  confidence:
    0.8,
};

async function readJson<T>(
  response: Response,
): Promise<T> {
  return await response.json() as T;
}

async function run(): Promise<void> {
  console.log("");
  console.log("==========================================");
  console.log("DISCOVERY EXECUTIVE DECISION RECORD API");
  console.log("Experiment 001");
  console.log("==========================================");
  console.log("");

  /**
   * The API persists to the canonical Atlas runtime.
   *
   * Preserve the complete original runtime and restore it in finally so
   * this integration benchmark leaves no durable decision record behind.
   */
  const originalRuntime =
    loadOrganizationRuntimeState(
      ORGANIZATION_ID,
    );

  const originalSnapshot =
    JSON.stringify(
      originalRuntime,
    );

  const originalInvestigationCount =
    originalRuntime.metadata
      .investigationCount;

  const originalRecordCount =
    originalRuntime.memory
      .executiveDecisionRecords
      .length;

  const benchmarkRuntime = {
    ...originalRuntime,

    memory: {
      ...originalRuntime.memory,

      organizationalUncertainty,

      executiveDecisionRecords:
        originalRuntime.memory
          .executiveDecisionRecords ??
        [],
    },
  };

  /**
   * Both API routes load runtime from disk, so the benchmark prerequisite
   * must be persisted before either route is invoked.
   */
  persistOrganizationRuntimeState(
    benchmarkRuntime,
  );

  const checks: Check[] = [];

  try {
    const evaluationRequest =
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

              decision:
                decisionPayload,
            }),
        },
      );

    const evaluationResponse =
      await evaluateExecutiveDecision(
        evaluationRequest,
      );

    const evaluationBody =
      await readJson<EvaluationResponse>(
        evaluationResponse,
      );

    const projection =
      evaluationBody
        .executiveDecisionProjection;

    checks.push({
      name:
        "Decision analysis route succeeded",

      passed:
        evaluationResponse.status ===
          200 &&
        Boolean(
          projection,
        ),

      detail:
        projection
          ? `HTTP ${evaluationResponse.status}`
          : evaluationBody.error ??
            `HTTP ${evaluationResponse.status}`,
    });

    if (!projection) {
      throw new Error(
        evaluationBody.error ??
        "Decision analysis did not return a projection.",
      );
    }

    const leadingStrategy =
      projection.rankedStrategies[0];

    if (!leadingStrategy) {
      throw new Error(
        "Decision analysis did not return a leading strategy.",
      );
    }

    checks.push({
      name:
        "Analysis returned a stable decision ID",

      passed:
        projection.objective.id ===
        decisionPayload.id,

      detail:
        projection.objective.id,
    });

    checks.push({
      name:
        "Analysis returned a leading option ID",

      passed:
        leadingStrategy.optionId
          .startsWith(
            "intervention-option-",
          ),

      detail:
        leadingStrategy.optionId,
    });

    const recordingRequest =
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

              submissionId:
                SUBMISSION_ID,

              decisionCycleCompletedAt:
                projection.completedAt,

              decisionCycleIntegrityKey:
                projection.integrityKey,

              decision:
                decisionPayload,

              selection: {
                selectedOptionId:
                  leadingStrategy.optionId,

                disposition:
                  "accepted-recommendation",

                decision:
                  `Authorize ${leadingStrategy.title}.`,

                rationale:
                  "The recommended strategy ranked first after viability evaluation, organizational simulation, scenario comparison, and confidence calibration.",

                executiveConfidenceAtDecision:
                  0.86,

                owner:
                  "Chief Operating Officer",

                decisionMaker:
                  "Executive Leadership Team",

                reviewAt:
                  REVIEW_AT,
              },
            }),
        },
      );

    const recordingResponse =
      await recordExecutiveDecision(
        recordingRequest,
      );

    const recordingBody =
      await readJson<RecordingResponse>(
        recordingResponse,
      );

    const record =
      recordingBody
        .executiveDecisionRecord;

    checks.push({
      name:
        "Decision recording route succeeded",

      passed:
        recordingResponse.status ===
          201 &&
        Boolean(
          record,
        ),

      detail:
        record
          ? `HTTP ${recordingResponse.status}`
          : recordingBody.error ??
            `HTTP ${recordingResponse.status}`,
    });

    if (!record) {
      throw new Error(
        recordingBody.error ??
        "Decision recording did not return a record.",
      );
    }

    const replayRequest =
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

              submissionId:
                SUBMISSION_ID,

              decisionCycleCompletedAt:
                projection.completedAt,

              decisionCycleIntegrityKey:
                projection.integrityKey,

              decision:
                decisionPayload,

              selection: {
                selectedOptionId:
                  leadingStrategy.optionId,

                disposition:
                  "accepted-recommendation",

                decision:
                  `Authorize ${leadingStrategy.title}.`,

                rationale:
                  "The recommended strategy ranked first after viability evaluation, organizational simulation, scenario comparison, ranking, and confidence calibration.",

                executiveConfidenceAtDecision:
                  0.86,

                owner:
                  "Chief Operating Officer",

                decisionMaker:
                  "Executive Leadership Team",

                reviewAt:
                  REVIEW_AT,
              },
            }),
        },
      );

    const replayResponse =
      await recordExecutiveDecision(
        replayRequest,
      );

    const replayBody =
      await readJson<RecordingResponse>(
        replayResponse,
      );

    const replayRecord =
      replayBody
        .executiveDecisionRecord;

    const persistedRuntime =
      loadOrganizationRuntimeState(
        ORGANIZATION_ID,
      );

    const persistedRecord =
      persistedRuntime.memory
        .executiveDecisionRecords
        .find(
          (candidate) =>
            candidate.id ===
            record.id,
        );

    checks.push(
      {
        name:
          "Idempotent replay returned existing record",

        passed:
          replayResponse.status ===
            200 &&
          replayBody.idempotentReplay ===
            true &&
          replayRecord?.id ===
            record.id,

        detail:
          replayRecord
            ? `HTTP ${replayResponse.status}, record=${replayRecord.id}`
            : replayBody.error ??
              `HTTP ${replayResponse.status}`,
      },

      {
        name:
          "Submission ID was preserved",

        passed:
          record.submissionId ===
            SUBMISSION_ID &&
          replayRecord?.submissionId ===
            SUBMISSION_ID,

        detail:
          record.submissionId,
      },

      {
        name:
          "API confirmed persistence",

        passed:
          recordingBody.persisted ===
          true,

        detail:
          String(
            recordingBody.persisted,
          ),
      },

      {
        name:
          "Decision record exists on disk",

        passed:
          Boolean(
            persistedRecord,
          ),

        detail:
          persistedRecord?.id ??
          "Record not found.",
      },

      {
        name:
          "Selected option matches analyzed leader",

        passed:
          record.selectedOptionId ===
          leadingStrategy.optionId,

        detail:
          record.selectedOptionId ??
          "none",
      },

      {
        name:
          "Recommendation relationship preserved",

        passed:
          record.recommendedOptionId ===
          leadingStrategy.optionId,

        detail:
          record.recommendedOptionId ??
          "none",
      },

      {
        name:
          "Executive disposition preserved",

        passed:
          record.disposition ===
          "accepted-recommendation",

        detail:
          record.disposition,
      },

      {
        name:
          "Expected outcomes populated",

        passed:
          record.expectedOutcomes.length >
          0,

        detail:
          `${record.expectedOutcomes.length} expected outcome(s)`,
      },

      {
        name:
          "Success criteria populated",

        passed:
          record.successCriteria.length >
          0,

        detail:
          `${record.successCriteria.length} success criterion or criteria`,
      },

      {
        name:
          "Review date preserved",

        passed:
          record.reviewAt ===
          REVIEW_AT,

        detail:
          record.reviewAt ??
          "none",
      },

      {
        name:
          "Confidence returned by API",

        passed:
          typeof recordingBody
            .confidence
            ?.calibratedConfidence ===
            "number",

        detail:
          `${Math.round(
            (
              recordingBody
                .confidence
                ?.calibratedConfidence ??
              0
            ) *
            100,
          )}%`,
      },

      {
        name:
          "Replay did not create a second record",

        passed:
          persistedRuntime.memory
            .executiveDecisionRecords
            .length ===
          originalRecordCount +
            1,

        detail:
          `${originalRecordCount} → ${persistedRuntime.memory.executiveDecisionRecords.length}`,
      },

      {
        name:
          "Investigation count did not increase",

        passed:
          persistedRuntime.metadata
            .investigationCount ===
          originalInvestigationCount,

        detail:
          `${originalInvestigationCount} → ${persistedRuntime.metadata.investigationCount}`,
      },

      {
        name:
          "Organization identity remained stable",

        passed:
          persistedRuntime.metadata
            .organizationId ===
          ORGANIZATION_ID,

        detail:
          persistedRuntime.metadata
            .organizationId,
      },
    );
  } finally {
    /**
     * Restore the exact pre-benchmark runtime.
     *
     * persistOrganizationRuntimeState() does not increment the
     * investigation count.
     */
    persistOrganizationRuntimeState(
      JSON.parse(
        originalSnapshot,
      ),
    );
  }

  const restoredRuntime =
    loadOrganizationRuntimeState(
      ORGANIZATION_ID,
    );

  checks.push({
    name:
      "Benchmark restored the original runtime",

    passed:
      JSON.stringify(
        restoredRuntime,
      ) ===
      originalSnapshot,

    detail:
      JSON.stringify(
        restoredRuntime,
      ) ===
      originalSnapshot
        ? "Original runtime restored."
        : "Runtime differs from the original snapshot.",
  });

  const passed =
    checks.filter(
      (check) =>
        check.passed,
    ).length;

  const failed =
    checks.length -
    passed;

  console.log("Assertions");
  console.log("------------------------------");

  for (const check of checks) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
    );

    console.log(
      `      ${check.detail}`,
    );
  }

  console.log("");
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

  console.log("Experiment Complete");
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
