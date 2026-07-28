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

type InitialUnderstandingResponse = {
  finding: string;
  uncertainty: string;
  nextEvidence: string[];
  confidence: {
    state: "unavailable";
    label: string;
  };
};

type EvidenceRecoveryResponse = {
  uncertainty: string;
  nextEvidence: string[];
};

function initialUnderstanding(
  runtime: ReturnType<typeof runOrganizationInvestigation>["runtime"],
): InitialUnderstandingResponse | null {
  const completedExplanationIds = new Set(
    runtime.memory.organizationalExplanations.map((explanation) => explanation.id),
  );
  const disclosedConditions = runtime.memory.organizationalConditions.filter(
    (condition) =>
      (condition.supportingExplanationIds?.length ?? 0) > 0 &&
      condition.supportingExplanationIds?.every((id) =>
        completedExplanationIds.has(id)
      ),
  );
  const memory = runtime.memory as typeof runtime.memory & {
    executiveAssessment?: {
      primaryJudgment?: {
        dominantConditionId?: string;
        supportingConditionIds?: string[];
      };
    };
  };
  const judgment = memory.executiveAssessment?.primaryJudgment;
  const prioritizedIds = [
    ...(judgment?.dominantConditionId ? [judgment.dominantConditionId] : []),
    ...(judgment?.supportingConditionIds ?? []),
  ];
  const condition =
    prioritizedIds.flatMap((id) => {
      const match = disclosedConditions.find((candidate) => candidate.id === id);
      return match ? [match] : [];
    })[0] ??
    disclosedConditions[0];
  if (!condition?.summary.trim()) return null;
  const summarySentences =
    condition.summary.match(/[^.!?]+[.!?]+/g)?.map((sentence) =>
      sentence.trim()
    ) ?? [];
  const boundedFinding =
    summarySentences.slice(0, 2).join(" ") || condition.summary.trim();

  return {
    finding: boundedFinding,
    uncertainty:
      condition.confidenceLimiters?.filter((item) => item.trim()).join(" ") ||
      "Discovery does not yet have enough evidence to estimate how persistent or widespread this pattern is.",
    nextEvidence:
      condition.missingEvidence?.filter((item) => item.trim()).slice(0, 3) ?? [],
    confidence: {
      state: "unavailable",
      label: "Confidence cannot yet be estimated from the disclosed initial understanding.",
    },
  };
}

function evidenceRecovery(
  runtime: ReturnType<typeof runOrganizationInvestigation>["runtime"],
): EvidenceRecoveryResponse {
  const condition = runtime.memory.organizationalConditions.find(
    (candidate) =>
      (candidate.confidenceLimiters?.length ?? 0) > 0 ||
      (candidate.missingEvidence?.length ?? 0) > 0,
  );
  return {
    uncertainty:
      condition?.confidenceLimiters?.filter((item) => item.trim()).join(" ") ||
      "The current observations do not yet support a stable organizational pattern.",
    nextEvidence:
      condition?.missingEvidence?.filter((item) => item.trim()).slice(0, 3) ??
      [
        "A recent concrete example with people, timing, and outcome.",
        "An operating note or measure connected to the question.",
      ],
  };
}

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

    if (
      onboardingEnvironment &&
      (
        investigation.runtime.memory.organizationalExplanations.length === 0 ||
        (
          investigation.runtime.memory.organizationalUnderstandingState
            .canonicalCompositions ?? []
        ).length === 0
      )
    ) {
      return respond(
        {
          status: "insufficient-evidence",
          message:
            "Discovery needs more specific organizational evidence before it can form an initial understanding.",
          organizationId,
          recovery: evidenceRecovery(investigation.runtime),
        },
        422,
      );
    }

    const understanding = initialUnderstanding(investigation.runtime);
    if (onboardingEnvironment && !understanding) {
      return respond(
        {
          status: "insufficient-evidence",
          message:
            "Discovery needs evidence that supports a presentable initial understanding.",
          organizationId,
          recovery: evidenceRecovery(investigation.runtime),
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
      initialUnderstandingAvailable: Boolean(understanding),
    }));

    return respond({
      status: "complete",
      organizationId,
      executiveProjection: investigation.executiveProjection,
      ...(understanding ? { initialUnderstanding: understanding } : {}),
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
