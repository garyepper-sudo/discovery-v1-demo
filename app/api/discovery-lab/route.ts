import { NextResponse } from "next/server";

import { runDiscoveryV3 } from "../../../engine/v3";

import {
  evolveOrganizationRuntime,
  loadOrganizationRuntimeState,
  saveOrganizationRuntimeState,
} from "../../../engine/v3/runtime";

import { buildExecutiveProjection } from "../../../components/executive-v2/projection/buildExecutiveProjection";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const organizationId =
      body.organizationId || body.company || "default-organization";

    const organizationRuntime =
      loadOrganizationRuntimeState(organizationId);

    const input = {
      company: body.company || "",
      website: body.website || "",
      industry: body.industry || "",
      question: body.question || "",
      context: body.messyInput || body.context || "",
      priorUnderstandingState:
        organizationRuntime.memory.understandingState,
    };

    const result = runDiscoveryV3(input);

    const evolvedRuntime = evolveOrganizationRuntime({
      runtime: organizationRuntime,
      result,
      input,
    });

    const nextOrganizationRuntime =
      saveOrganizationRuntimeState(evolvedRuntime);

    const executiveProjection = buildExecutiveProjection({
      result,
      runtime: nextOrganizationRuntime,
    });

    return NextResponse.json({
      executiveProjection,
    });
  } catch (error) {
    console.error("Discovery investigation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Discovery investigation failed.",
      },
      {
        status: 500,
      },
    );
  }
}