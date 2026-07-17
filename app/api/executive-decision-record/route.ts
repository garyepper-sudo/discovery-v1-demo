import { NextResponse } from "next/server";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
} from "../../../engine/v3/runtime";

import type {
  ExecutiveDecision,
} from "../../../engine/v3/model/simulate/executiveDecision";

import type {
  ExecutiveDecisionDisposition,
} from "../../../engine/v3/decisions/executiveDecisionRecord";

import {
  runExecutiveDecisionCycle,
} from "../../../engine/v3/decisions/runExecutiveDecisionCycle";

import {
  buildExecutiveDecisionCycleIntegrityKey,
} from "../../../engine/v3/decisions/buildExecutiveDecisionCycleIntegrityKey";

import {
  recordExecutiveDecision,
} from "../../../engine/v3/decisions/recordExecutiveDecision";

import {
  saveExecutiveDecisionRecord,
} from "../../../engine/v3/decisions/saveExecutiveDecisionRecord";

type ExecutiveDecisionRecordRequest = {
  organizationId?: string;

  submissionId?: string;

  /**
   * Timestamp used when the original decision analysis was completed.
   *
   * Reusing it keeps the reconstructed decision cycle deterministic.
   */
  decisionCycleCompletedAt?: string;

  decisionCycleIntegrityKey?: string;

  decision?: {
    id?: string;

    type?:
      ExecutiveDecision["type"];

    title?: string;

    objective?: string;

    rationale?: string;

    status?:
      ExecutiveDecision["status"];

    timeHorizon?:
      ExecutiveDecision["timeHorizon"];

    targetConditionIds?: string[];

    successMetrics?:
      ExecutiveDecision["successMetrics"];

    constraints?:
      ExecutiveDecision["constraints"];

    allowedInterventionTypes?:
      ExecutiveDecision["allowedInterventionTypes"];

    assumptions?: string[];

    openQuestions?: string[];

    confidence?: number;

    createdAt?: string;

    updatedAt?: string;
  };

  selection?: {
    selectedOptionId?: string;

    disposition?:
      ExecutiveDecisionDisposition;

    decision?: string;

    rationale?: string;

    acceptedAssumptions?: string[];

    acceptedRisks?: string[];

    executiveConfidenceAtDecision?: number;

    owner?: string;

    decisionMaker?: string;

    reviewAt?: string;
  };
};

function requireText(
  value: unknown,
  label: string,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return value.trim();
}

function optionalText(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return undefined;
  }

  return value.trim();
}

function optionalStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map(
      (item) =>
        item.trim(),
    );
}

function validateConfidence(
  value: unknown,
  label: string,
  fallback?: number,
): number | undefined {
  if (value === undefined) {
    return fallback;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${label} must be a finite number between 0 and 1.`,
    );
  }

  return value;
}

function requireIsoTimestamp(
  value: unknown,
  label: string,
): string {
  const text =
    requireText(
      value,
      label,
    );

  if (
    Number.isNaN(
      Date.parse(text),
    )
  ) {
    throw new Error(
      `${label} must be a valid ISO timestamp.`,
    );
  }

  return text;
}

function optionalIsoTimestamp(
  value: unknown,
  label: string,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return requireIsoTimestamp(
    value,
    label,
  );
}

function validateDisposition(
  value: unknown,
): ExecutiveDecisionDisposition {
  const allowed:
    ExecutiveDecisionDisposition[] = [
      "accepted-recommendation",
      "modified-recommendation",
      "selected-alternative",
      "deferred",
      "rejected",
    ];

  if (
    typeof value !== "string" ||
    !allowed.includes(
      value as
        ExecutiveDecisionDisposition,
    )
  ) {
    throw new Error(
      "selection.disposition must be accepted-recommendation, modified-recommendation, selected-alternative, deferred, or rejected.",
    );
  }

  return value as
    ExecutiveDecisionDisposition;
}

function buildExecutiveDecision(
  request:
    NonNullable<
      ExecutiveDecisionRecordRequest["decision"]
    >,

  organizationId: string,

  defaultTimestamp: string,
): ExecutiveDecision {
  const id =
    requireText(
      request.id,
      "decision.id",
    );

  const title =
    requireText(
      request.title,
      "decision.title",
    );

  const targetConditionIds =
    optionalStringArray(
      request.targetConditionIds,
    );

  if (
    targetConditionIds.length === 0
  ) {
    throw new Error(
      "decision.targetConditionIds must include at least one organizational condition.",
    );
  }

  const allowedInterventionTypes =
    request.allowedInterventionTypes ??
    [
      "governance",
      "policy",
      "strategy",
    ];

  if (
    allowedInterventionTypes.length ===
    0
  ) {
    throw new Error(
      "decision.allowedInterventionTypes must include at least one intervention type.",
    );
  }

  return {
    id,

    organizationId,

    type:
      request.type ??
      "execution",

    title,

    objective:
      requireText(
        request.objective,
        "decision.objective",
      ),

    rationale:
      requireText(
        request.rationale,
        "decision.rationale",
      ),

    status:
      request.status ??
      "ready",

    timeHorizon:
      request.timeHorizon ??
      "near-term",

    targetConditionIds,

    successMetrics:
      request.successMetrics ??
      [],

    constraints:
      request.constraints ??
      [],

    allowedInterventionTypes,

    assumptions:
      optionalStringArray(
        request.assumptions,
      ),

    openQuestions:
      optionalStringArray(
        request.openQuestions,
      ),

    confidence:
      validateConfidence(
        request.confidence,
        "decision.confidence",
        0.75,
      ) ?? 0.75,

    createdAt:
      optionalIsoTimestamp(
        request.createdAt,
        "decision.createdAt",
      ) ??
      defaultTimestamp,

    updatedAt:
      optionalIsoTimestamp(
        request.updatedAt,
        "decision.updatedAt",
      ) ??
      defaultTimestamp,
  };
}

function isClientError(
  message: string,
): boolean {
  return [
    "required",
    "requires",
    "must include",
    "must be",
    "does not exist",
    "must select",
    "must not select",
    "could not be mapped",
    "integrity validation failed",
  ].some(
    (fragment) =>
      message.includes(fragment),
  );
}

export async function POST(
  req: Request,
) {
  try {
    const body =
      (await req.json()) as
        ExecutiveDecisionRecordRequest;

    const organizationId =
      optionalText(
        body.organizationId,
      ) ??
      "atlas-manufacturing-simulation";

    const submissionId =
      requireText(
        body.submissionId,
        "submissionId",
      );

    if (!body.decision) {
      throw new Error(
        "decision is required.",
      );
    }

    if (!body.selection) {
      throw new Error(
        "selection is required.",
      );
    }

    const decidedAt =
      new Date().toISOString();

    const decisionCycleCompletedAt =
      body.decisionCycleCompletedAt
        ? requireIsoTimestamp(
            body.decisionCycleCompletedAt,
            "decisionCycleCompletedAt",
          )
        : decidedAt;

    const executiveDecision =
      buildExecutiveDecision(
        body.decision,
        organizationId,
        decisionCycleCompletedAt,
      );

    const selection =
      body.selection;

    const suppliedIntegrityKey =
      requireText(
        body.decisionCycleIntegrityKey,
        "decisionCycleIntegrityKey",
      );

    const disposition =
      validateDisposition(
        selection.disposition,
      );

    const runtime =
      loadOrganizationRuntimeState(
        organizationId,
      );

    const existingRecord =
      runtime.memory
        .executiveDecisionRecords
        .find(
          (candidate) =>
            candidate.organizationId ===
              organizationId &&
            candidate.executiveDecisionId ===
              executiveDecision.id &&
            candidate.submissionId ===
              submissionId,
        );

    if (existingRecord) {
      return NextResponse.json(
        {
          executiveDecisionRecord:
            existingRecord,

          persisted:
            true,

          idempotentReplay:
            true,
        },
        {
          status:
            200,
        },
      );
    }

    const decisionCycle =
      runExecutiveDecisionCycle({
        executiveDecision,
        runtime,
        completedAt:
          decisionCycleCompletedAt,
      });

    const reconstructedIntegrityKey =
      buildExecutiveDecisionCycleIntegrityKey(
        decisionCycle,
      );

    if (
      reconstructedIntegrityKey !==
      suppliedIntegrityKey
    ) {
      throw new Error(
        "Executive Decision Cycle integrity validation failed.",
      );
    }

    const record =
      recordExecutiveDecision({
        decisionCycle,

        submissionId,

        selectedOptionId:
          optionalText(
            selection.selectedOptionId,
          ),

        disposition,

        decision:
          requireText(
            selection.decision,
            "selection.decision",
          ),

        rationale:
          requireText(
            selection.rationale,
            "selection.rationale",
          ),

        acceptedAssumptions:
          optionalStringArray(
            selection.acceptedAssumptions,
          ),

        acceptedRisks:
          optionalStringArray(
            selection.acceptedRisks,
          ),

        executiveConfidenceAtDecision:
          validateConfidence(
            selection
              .executiveConfidenceAtDecision,
            "selection.executiveConfidenceAtDecision",
          ),

        owner:
          optionalText(
            selection.owner,
          ),

        decisionMaker:
          optionalText(
            selection.decisionMaker,
          ),

        reviewAt:
          optionalIsoTimestamp(
            selection.reviewAt,
            "selection.reviewAt",
          ),

        decidedAt,
      });

    const updatedRuntime =
      saveExecutiveDecisionRecord({
        runtime,
        record,
      });

    const persistedRuntime =
      persistOrganizationRuntimeState(
        updatedRuntime,
      );

    const persisted =
      persistedRuntime.memory
        .executiveDecisionRecords
        .some(
          (candidate) =>
            candidate.id ===
            record.id,
        );

    if (!persisted) {
      throw new Error(
        "Executive Decision Record was not persisted.",
      );
    }

    return NextResponse.json(
      {
        executiveDecisionRecord:
          record,

        recommendation:
          decisionCycle.recommendation,

        confidence:
          decisionCycle
            .confidenceCalibration,

        persisted,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Executive decision recording failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Executive decision recording failed.";

    return NextResponse.json(
      {
        error:
          message,
      },
      {
        status:
          isClientError(
            message,
          )
            ? 400
            : 500,
      },
    );
  }
}
