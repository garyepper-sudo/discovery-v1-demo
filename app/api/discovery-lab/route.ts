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
  InvestigationIdempotencyConflictError,
  InvestigationInProgressError,
} from "../../../engine/v3/investigation/investigationIdempotency";

import {
  createOrganizationRuntimeRepository,
  resolveOrganizationId,
} from "../../../engine/v3/runtime";
import {
  persistOrganizationInvestigationResponse,
} from "../../../engine/v3/runtime/organizationStateStore";
import { onboardingTestEnvironmentEnabled } from "../../../lib/environment/discoveryEnvironment";
import {
  isOnboardingTestOrganizationId,
  provisionOnboardingTestOrganization,
} from "../../../lib/onboarding/testing";
import { buildOnboardingInvestigationInput } from "../../../lib/onboarding/testing/buildOnboardingInvestigationInput";
import { translateProductUnderstanding } from "../../../components/product-shell/communication/productUnderstanding";
import { optimizeTruthfulUtility } from "../../../components/product-shell/communication/truthfulUtility";

export async function POST(
  req: Request,
) {
  try {
    const body =
      await req.json();
    const onboardingEnvironment = onboardingTestEnvironmentEnabled();
    if (
      typeof body !== "object" ||
      body === null ||
      typeof body.company !== "string" ||
      !body.company.trim() ||
      typeof body.question !== "string" ||
      !body.question.trim() ||
      typeof (body.messyInput ?? body.context) !== "string" ||
      !(body.messyInput ?? body.context).trim()
    ) {
      return NextResponse.json(
        {
          status: "validation-failed",
          message: "Organization name, question, and observations are required.",
        },
        { status: 400 },
      );
    }

    let investigationInput;
    if (!onboardingEnvironment && body.evidenceSources !== undefined) {
      return NextResponse.json(
        {
          status: "access-denied",
          message: "Onboarding evidence submission is development-only.",
        },
        { status: 403 },
      );
    }
    try {
      investigationInput = onboardingEnvironment
        ? buildOnboardingInvestigationInput(body)
        : {
            company: body.company || "",
            website: body.website || "",
            industry: body.industry || "",
            question: body.question || "",
            context: body.messyInput || body.context || "",
          };
    } catch {
      return NextResponse.json(
        {
          status: "validation-failed",
          message: "One or more evidence sources could not be validated.",
        },
        { status: 400 },
      );
    }

    let organizationId: string;
    if (onboardingEnvironment) {
      const authentication = await auth();
      if (!authentication.userId) {
        return NextResponse.json(
          {
            status: "access-denied",
            message: "Authentication required.",
          },
          { status: 401 },
        );
      }
      const sql = postgres(requireDiscoveryDatabaseUrl("administration"), {
        max: 1,
      });
      try {
        const accessRepository = new PostgresAlphaAccessRecordRepository(sql);
        if (typeof body.organizationId === "string" && body.organizationId) {
          organizationId = resolveOrganizationId(body.organizationId);
          if (!isOnboardingTestOrganizationId(organizationId)) {
            return NextResponse.json(
              {
                status: "validation-failed",
                message: "Invalid onboarding organization.",
              },
              { status: 400 },
            );
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
            return NextResponse.json(
              {
                status: "access-denied",
                message: "Organization access denied.",
              },
              { status: 403 },
            );
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

    const investigationRequestId =
      typeof body.investigationRequestId === "string"
        ? body.investigationRequestId
        : "";
    if (
      onboardingEnvironment &&
      !/^onboarding-investigation-[a-f0-9]{64}$/.test(investigationRequestId)
    ) {
      return NextResponse.json(
        {
          status: "validation-failed",
          message: "A valid investigation request identity is required.",
        },
        { status: 400 },
      );
    }

    const investigation = runOrganizationInvestigation({
      organizationId,
      ...(onboardingEnvironment ? { investigationRequestId } : {}),
      ...investigationInput,
    });
    if (onboardingEnvironment && investigation.canonicalResponse !== undefined) {
      const canonical = investigation.canonicalResponse as {
        body: unknown;
        status: number;
      };
      return NextResponse.json(canonical.body, { status: canonical.status });
    }

    const respond = (body: unknown, status: number) => {
      if (onboardingEnvironment) {
        persistOrganizationInvestigationResponse({
          organizationId,
          requestId:
            investigation.idempotencyReceiptRequestId ??
            investigationRequestId,
          canonicalResponse: { body, status },
        });
      }
      return NextResponse.json(body, { status });
    };

    const productUnderstanding = onboardingEnvironment
      ? translateProductUnderstanding({
          organizationId,
          result: investigation.result,
          runtime: investigation.runtime,
        })
      : null;
    const productUtility =
      onboardingEnvironment && productUnderstanding
        ? optimizeTruthfulUtility({
            organizationId,
            result: investigation.result,
            runtime: investigation.runtime,
            understanding: productUnderstanding,
          })
        : null;

    if (
      onboardingEnvironment &&
      productUtility?.status === "insufficient"
    ) {
      return respond(
        {
          status: "insufficient-evidence",
          message: productUtility.understanding.headline,
          organizationId,
          understanding: productUtility.understanding,
          utility: productUtility,
        },
        422,
      );
    }

    console.info(JSON.stringify({
      event: "onboarding.investigation.completed",
      organizationId,
      completedExplanationCount:
        investigation.runtime.memory.organizationalExplanations.length,
      compositionCount:
        investigation.runtime.memory.organizationalUnderstandingState
          .canonicalCompositions?.length ?? 0,
      productUnderstandingStatus: productUnderstanding?.status ?? null,
      productUtilityStatus: productUtility?.status ?? null,
    }));

    return respond({
      status:
        productUtility?.status === "provisional"
          ? "provisional"
          : "complete",
      organizationId,
      executiveProjection: investigation.executiveProjection,
      ...(productUtility
        ? {
            understanding: productUtility.understanding,
            utility: productUtility,
          }
        : {}),
    }, 200);
  } catch (
    error
  ) {
    if (error instanceof InvestigationIdempotencyConflictError) {
      return NextResponse.json(
        {
          status: "idempotency-conflict",
          message: "This investigation request identity was already used.",
        },
        { status: 409 },
      );
    }
    if (error instanceof InvestigationInProgressError) {
      return NextResponse.json(
        {
          status: "investigation-in-progress",
          message: "This investigation is already being processed.",
        },
        { status: 409 },
      );
    }
    console.error(
      "Discovery investigation failed:",
      error,
    );

    return NextResponse.json(
      {
        status: "failed",
        message: "Discovery could not complete this investigation.",
      },
      {
        status:
          500,
      },
    );
  }
}
