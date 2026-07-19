import { NextResponse } from "next/server";

import {
  loadOrganizationRuntimeState,
} from "../../../engine/v3/runtime";

import type {
  ExecutiveDecision,
} from "../../../engine/v3/model/simulate/executiveDecision";

import {
  runExecutiveDecisionCycle,
} from "../../../engine/v3/decisions/runExecutiveDecisionCycle";

import {
  buildExecutiveDecisionProjection,
} from "../../../components/executive-v3/projection/buildExecutiveDecisionProjection";

type ExecutiveDecisionRequest = {
  organizationId?: string;

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

function optionalStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}

function buildDecisionId(
  organizationId: string,
  title: string,
  createdAt: string,
): string {
  const normalizedTitle =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return [
    "executive-decision",
    organizationId,
    normalizedTitle || "untitled",
    createdAt,
  ].join("-");
}

function validateConfidence(
  value: unknown,
): number {
  if (value === undefined) {
    return 0.75;
  }

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      "decision.confidence must be a finite number between 0 and 1.",
    );
  }

  return value;
}

export async function POST(
  req: Request,
) {
  try {
    const body =
      (await req.json()) as ExecutiveDecisionRequest;

    const organizationId =
      body.organizationId ||
      "atlas-manufacturing-simulation";

    const requestDecision =
      body.decision;

    if (!requestDecision) {
      throw new Error(
        "decision is required.",
      );
    }

    const runtime =
      loadOrganizationRuntimeState(
        organizationId,
      );

    const now =
      new Date().toISOString();

    const title =
      requireText(
        requestDecision.title,
        "decision.title",
      );

    const requestedTargetConditionIds =
      optionalStringArray(
        requestDecision
          .targetConditionIds,
      );

    const primaryConstraintId =
      runtime.memory
        .organizationalState
        ?.dominantConditions
        ?.[0];

    const targetConditionIds =
      requestedTargetConditionIds.length > 0
        ? requestedTargetConditionIds
        : primaryConstraintId
          ? [primaryConstraintId]
          : [];

    if (
      targetConditionIds.length === 0
    ) {
      throw new Error(
        "decision.targetConditionIds must include at least one organizational condition, or Runtime must contain a primary executive constraint.",
      );
    }

    const allowedInterventionTypes =
      requestDecision
        .allowedInterventionTypes ??
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

    const executiveDecision:
      ExecutiveDecision = {
        id:
          requestDecision.id ||
          buildDecisionId(
            organizationId,
            title,
            now,
          ),

        organizationId,

        type:
          requestDecision.type ??
          "execution",

        title,

        objective:
          requireText(
            requestDecision.objective,
            "decision.objective",
          ),

        rationale:
          requireText(
            requestDecision.rationale,
            "decision.rationale",
          ),

        status:
          requestDecision.status ??
          "ready",

        timeHorizon:
          requestDecision
            .timeHorizon ??
          "near-term",

        targetConditionIds,

        successMetrics:
          requestDecision
            .successMetrics ??
          [],

        constraints:
          requestDecision
            .constraints ??
          [],

        allowedInterventionTypes,

        assumptions:
          optionalStringArray(
            requestDecision.assumptions,
          ),

        openQuestions:
          optionalStringArray(
            requestDecision.openQuestions,
          ),

        confidence:
          validateConfidence(
            requestDecision.confidence,
          ),

        createdAt:
          now,

        updatedAt:
          now,
      };

    const decisionCycle =
      runExecutiveDecisionCycle({
        executiveDecision,
        runtime,
        completedAt:
          now,
      });

    const executiveDecisionProjection =
      buildExecutiveDecisionProjection(
        decisionCycle,
      );

    return NextResponse.json({
      executiveDecisionProjection,
    });
  } catch (error) {
    console.error(
      "Executive decision evaluation failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Executive decision evaluation failed.";

    const status =
      message.includes("required") ||
      message.includes("must include") ||
      message.includes("must be")
        ? 400
        : 500;

    return NextResponse.json(
      {
        error: message,
      },
      {
        status,
      },
    );
  }
}