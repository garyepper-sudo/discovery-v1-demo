import {
  NextResponse,
} from "next/server";
import { auth } from "@clerk/nextjs/server";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import {
  runOrganizationInvestigation,
} from "../../../engine/v3/investigation/runOrganizationInvestigation";

import {
  createOrganizationRuntimeRepository,
  resolveOrganizationId,
} from "../../../engine/v3/runtime";
import { onboardingTestEnvironmentEnabled } from "../../../lib/environment/discoveryEnvironment";
import {
  isOnboardingTestOrganizationId,
  provisionOnboardingTestOrganization,
} from "../../../lib/onboarding/testing";
import { buildOnboardingInvestigationInput } from "../../../lib/onboarding/testing/buildOnboardingInvestigationInput";

export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();

    let organizationId: string;
    if (onboardingTestEnvironmentEnabled()) {
      const authentication = await auth();
      if (!authentication.userId) {
        return new NextResponse("Authentication required.", { status: 401 });
      }
      const sql = postgres(requireDiscoveryDatabaseUrl("administration"), {
        max: 1,
      });
      try {
        const accessRepository = new PostgresAlphaAccessRecordRepository(sql);
        if (typeof body.organizationId === "string" && body.organizationId) {
          organizationId = resolveOrganizationId(body.organizationId);
          if (!isOnboardingTestOrganizationId(organizationId)) {
            return new NextResponse("Invalid onboarding organization.", {
              status: 400,
            });
          }
          const access = await accessRepository.findAccessRecords({
            consumerId: authentication.userId,
            organizationId,
            experience: "organization",
            resolvedAt: new Date().toISOString(),
          });
          const resolvedAt = Date.now();
          if (!access.some((record) =>
            record.status === "active" &&
            (!record.validUntil || Date.parse(record.validUntil) > resolvedAt)
          )) {
            return new NextResponse("Organization access denied.", {
              status: 403,
            });
          }
        } else {
          const receipt = await provisionOnboardingTestOrganization({
            consumerId: authentication.userId,
            requestId: body.onboardingRequestId,
            organizationName: body.company,
            industry: body.industry,
            website: body.website,
            now: new Date().toISOString(),
            runtimeRepository: createOrganizationRuntimeRepository(),
            accessRepository,
          });
          organizationId = receipt.organizationId;
        }
      } finally {
        await sql.end();
      }
    } else {
      organizationId = resolveOrganizationId(body.organizationId);
    }

    const investigationInput = onboardingTestEnvironmentEnabled()
      ? buildOnboardingInvestigationInput(body)
      : {
          company: body.company || "",
          website: body.website || "",
          industry: body.industry || "",
          question: body.question || "",
          context: body.messyInput || body.context || "",
        };
    const investigation = runOrganizationInvestigation({
      organizationId,
      ...investigationInput,
    });

    if (
      onboardingTestEnvironmentEnabled() &&
      (
        investigation.runtime.memory.organizationalExplanations.length === 0 ||
        (
          investigation.runtime.memory.organizationalUnderstandingState
            .canonicalCompositions ?? []
        ).length === 0
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Discovery needs more specific organizational evidence before it can form an initial understanding.",
          organizationId,
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      organizationId,
      executiveProjection:
        investigation
          .executiveProjection,
    });
  } catch (
    error
  ) {
    console.error(
      "Discovery investigation failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof
            Error
            ? error.message
            : "Discovery investigation failed.",
      },
      {
        status:
          500,
      },
    );
  }
}
