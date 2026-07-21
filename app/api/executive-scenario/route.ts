import { NextResponse } from "next/server";

import {
  loadOrganizationRuntimeState,
  resolveOrganizationId,
} from "../../../engine/v3/runtime";

import {
  buildOrganizationalIntervention,
} from "../../../engine/v3/model/simulate/buildOrganizationalIntervention";

import {
  buildExecutiveDecisionContext,
} from "../../../engine/v3/scenarios/buildExecutiveDecisionContext";

import {
  runExecutiveScenario,
} from "../../../engine/v3/scenarios/runExecutiveScenario";

import {
  buildExecutiveScenarioProjection,
} from "../../../components/executive-v2/projection/buildExecutiveScenarioProjection";

type BuildOrganizationalInterventionInput =
  Parameters<
    typeof buildOrganizationalIntervention
  >[0];

type ExecutiveScenarioRequest = {
  organizationId?: string;

  changedEntityId?: string;

  interventionDelta?: number;

  intervention?: {
    type?: BuildOrganizationalInterventionInput["type"];

    title?: string;

    description?: string;

    rationale?: string;

    scope?: BuildOrganizationalInterventionInput["scope"];

    timeHorizon?:
      BuildOrganizationalInterventionInput["timeHorizon"];

    affectedConditionIds?: string[];

    expectedMechanismIds?: string[];

    assumptions?: string[];

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

export async function POST(
  req: Request,
) {
  try {
    const body =
      (await req.json()) as ExecutiveScenarioRequest;

    const organizationId =
      resolveOrganizationId(
        body.organizationId,
      );

    const requestIntervention =
      body.intervention;

    if (!requestIntervention) {
      throw new Error(
        "intervention is required.",
      );
    }

    const affectedConditionIds =
      optionalStringArray(
        requestIntervention
          .affectedConditionIds,
      );

    const changedEntityId =
      body.changedEntityId ||
      affectedConditionIds[0];

    if (!changedEntityId) {
      throw new Error(
        "changedEntityId or at least one intervention.affectedConditionId is required.",
      );
    }

    const interventionDelta =
      body.interventionDelta ??
      0.25;

    if (
      typeof interventionDelta !==
        "number" ||
      !Number.isFinite(
        interventionDelta,
      ) ||
      interventionDelta < -1 ||
      interventionDelta > 1
    ) {
      throw new Error(
        "interventionDelta must be a finite number between -1 and 1.",
      );
    }

    const runtime =
      loadOrganizationRuntimeState(
        organizationId,
      );

    const now =
      new Date().toISOString();

    const intervention =
      buildOrganizationalIntervention({
        organizationId,

        type:
          requestIntervention.type ??
          "governance",

        title:
          requireText(
            requestIntervention.title,
            "intervention.title",
          ),

        description:
          requireText(
            requestIntervention.description,
            "intervention.description",
          ),

        rationale:
          requireText(
            requestIntervention.rationale,
            "intervention.rationale",
          ),

        scope:
          requestIntervention.scope ??
          "organization",

        timeHorizon:
          requestIntervention
            .timeHorizon ??
          "near-term",

        status:
          "hypothetical",

        affectedConditionIds,

        expectedMechanismIds:
          optionalStringArray(
            requestIntervention
              .expectedMechanismIds,
          ),

        assumptions:
          optionalStringArray(
            requestIntervention
              .assumptions,
          ),

        confidence:
          requestIntervention
            .confidence ??
          0.7,

        createdAt:
          now,
      });

    const decisionContext =
      buildExecutiveDecisionContext(
        runtime,
        {
          changedEntityId,
          interventionDelta,
          timeHorizon:
            intervention.timeHorizon,
          simulatedAt:
            now,
        },
      );

    const executiveScenario =
      runExecutiveScenario({
        ...decisionContext,
        intervention,
      });

    const executiveScenarioProjection =
      buildExecutiveScenarioProjection(
        organizationId,
        executiveScenario,
      );

    return NextResponse.json({
      executiveScenarioProjection,
    });
  } catch (error) {
    console.error(
      "Executive scenario evaluation failed:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Executive scenario evaluation failed.";

    const status =
      message.includes("required") ||
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
