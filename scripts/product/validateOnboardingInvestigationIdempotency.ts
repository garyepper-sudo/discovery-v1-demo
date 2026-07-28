import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

async function main(): Promise<void> {
  const runtimeDirectory = mkdtempSync(
    path.join(os.tmpdir(), "discovery-onboarding-idempotency-"),
  );
  process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY = runtimeDirectory;

  const {
    canonicalInvestigationFingerprint,
    InvestigationIdempotencyConflictError,
  } = await import(
    "../../engine/v3/investigation/investigationIdempotency"
  );
  const { runOrganizationInvestigation } = await import(
    "../../engine/v3/investigation/runOrganizationInvestigation"
  );
  const {
    loadOrganizationRuntimeState,
    persistOrganizationInvestigationResponse,
    persistOrganizationRuntimeState,
  } = await import("../../engine/v3/runtime/organizationStateStore");

  const organizationId = "onb-dev-idempotency-validation";
  const requestId = `onboarding-investigation-${"a".repeat(64)}`;
  const changedRequestId = `onboarding-investigation-${"b".repeat(64)}`;
  const baseInput = {
    organizationId,
    company: "Example Organization",
    website: "https://example.test",
    industry: "Services",
    question: "Where are decisions getting stuck?",
    context:
      "Leaders report that approvals often wait across two weekly operating meetings.",
    evidenceSources: [
      {
        sourceId: "context",
        sourceType: "onboarding-paste",
        sourceName: "Leadership notes",
        sourceRole: "decision-latency",
        organizationScope: "current-onboarding-organization",
        ingestionMethod: "paste" as const,
        extractionStatus: "extracted" as const,
        content:
          "Three recent launch decisions waited for approval.\nOwners escalated after the second meeting.",
      },
      {
        sourceId: "metric",
        sourceType: "onboarding-paste",
        sourceName: "Operating review",
        sourceRole: "operating-measure",
        organizationScope: "current-onboarding-organization",
        ingestionMethod: "paste" as const,
        extractionStatus: "extracted" as const,
        content: "Median approval time increased from two days to nine days.",
      },
    ],
  };

  const originalLog = console.log;
  console.log = () => undefined;

  try {
    const first = runOrganizationInvestigation({
      ...baseInput,
      investigationRequestId: requestId,
    });
    const firstRuntime = first.runtime;
    const firstResponse = {
      body: {
        status: "complete",
        organizationId,
        disclosedFinding: "canonical-first-understanding",
      },
      status: 200,
    };
    persistOrganizationInvestigationResponse({
      organizationId,
      requestId,
      canonicalResponse: firstResponse,
    });

    const exactReplay = runOrganizationInvestigation({
      ...baseInput,
      investigationRequestId: requestId,
    });
    assert.equal(exactReplay.idempotentReplay, true);
    assert.deepEqual(exactReplay.canonicalResponse, firstResponse);
    assert.equal(
      exactReplay.runtime.metadata.investigationCount,
      firstRuntime.metadata.investigationCount,
    );
    assert.equal(
      exactReplay.runtime.memory.events.length,
      firstRuntime.memory.events.length,
    );
    assert.equal(
      exactReplay.result.evidence.length,
      first.result.evidence.length,
    );
    assert.equal(
      exactReplay.runtime.memory.organizationalExplanations.length,
      firstRuntime.memory.organizationalExplanations.length,
    );
    assert.equal(
      exactReplay.runtime.memory.organizationalUnderstandingState
        .canonicalCompositions?.length ?? 0,
      firstRuntime.memory.organizationalUnderstandingState
        .canonicalCompositions?.length ?? 0,
    );

    const equivalentInput = {
      ...baseInput,
      company: "  Example   Organization ",
      context:
        " Leaders report that approvals often wait across two weekly operating meetings. ",
      evidenceSources: [...baseInput.evidenceSources]
        .reverse()
        .map((source) => ({
          ...source,
          content: `  ${source.content.replace(/\n/g, "\r\n")}  `,
        })),
    };
    assert.equal(
      canonicalInvestigationFingerprint({
        organizationId,
        input: baseInput,
      }),
      canonicalInvestigationFingerprint({
        organizationId,
        input: equivalentInput,
      }),
    );
    const equivalentReplay = runOrganizationInvestigation({
      ...equivalentInput,
      investigationRequestId: `onboarding-investigation-${"c".repeat(64)}`,
    });
    assert.equal(equivalentReplay.idempotentReplay, true);
    assert.equal(
      equivalentReplay.runtime.metadata.investigationCount,
      firstRuntime.metadata.investigationCount,
    );

    assert.throws(
      () =>
        runOrganizationInvestigation({
          ...baseInput,
          context: `${baseInput.context} Materially different claim.`,
          investigationRequestId: requestId,
        }),
      InvestigationIdempotencyConflictError,
    );
    assert.equal(
      loadOrganizationRuntimeState(organizationId).metadata.investigationCount,
      firstRuntime.metadata.investigationCount,
    );

    const changed = runOrganizationInvestigation({
      ...baseInput,
      evidenceSources: [
        ...baseInput.evidenceSources,
        {
          sourceId: "new-evidence",
          sourceType: "onboarding-paste",
          sourceName: "Decision log",
          sourceRole: "decision-example",
          organizationScope: "current-onboarding-organization",
          ingestionMethod: "paste" as const,
          extractionStatus: "extracted" as const,
          content:
            "The product launch approval was delayed while three leaders disputed the accountable owner.",
        },
      ],
      investigationRequestId: changedRequestId,
    });
    assert.equal(changed.idempotentReplay, false);
    assert.equal(
      changed.runtime.metadata.investigationCount,
      firstRuntime.metadata.investigationCount + 1,
    );
    assert.equal(
      changed.runtime.metadata.investigationReceipts?.length,
      2,
    );

    const changedReplay = runOrganizationInvestigation({
      ...baseInput,
      evidenceSources: [
        ...baseInput.evidenceSources,
        {
          sourceId: "new-evidence",
          sourceType: "onboarding-paste",
          sourceName: "Decision log",
          sourceRole: "decision-example",
          organizationScope: "current-onboarding-organization",
          ingestionMethod: "paste" as const,
          extractionStatus: "extracted" as const,
          content:
            "The product launch approval was delayed while three leaders disputed the accountable owner.",
        },
      ],
      investigationRequestId: changedRequestId,
    });
    assert.equal(changedReplay.idempotentReplay, true);
    assert.equal(
      changedReplay.runtime.metadata.investigationCount,
      firstRuntime.metadata.investigationCount + 1,
    );

    const originalAfterChange = runOrganizationInvestigation({
      ...baseInput,
      investigationRequestId: requestId,
    });
    assert.equal(originalAfterChange.idempotentReplay, true);
    assert.deepEqual(originalAfterChange.canonicalResponse, firstResponse);
    assert.equal(
      originalAfterChange.runtime.metadata.investigationCount,
      firstRuntime.metadata.investigationCount + 1,
    );

    const inProgressOrganizationId = "onb-dev-in-progress-validation";
    const inProgressRuntime =
      loadOrganizationRuntimeState(inProgressOrganizationId);
    persistOrganizationRuntimeState({
      ...inProgressRuntime,
      metadata: {
        ...inProgressRuntime.metadata,
        investigationReceipts: [
          {
            requestId,
            fingerprint: canonicalInvestigationFingerprint({
              organizationId: inProgressOrganizationId,
              input: baseInput,
            }),
            status: "in-progress",
            investigationCount: 0,
            startedAt: "2026-07-28T00:00:00.000Z",
          },
        ],
      },
    });
    const { InvestigationInProgressError } = await import(
      "../../engine/v3/investigation/investigationIdempotency"
    );
    assert.throws(
      () =>
        runOrganizationInvestigation({
          ...baseInput,
          organizationId: inProgressOrganizationId,
          investigationRequestId: requestId,
        }),
      InvestigationInProgressError,
    );
    assert.equal(
      loadOrganizationRuntimeState(inProgressOrganizationId).metadata
        .investigationCount,
      0,
    );

    const recoveryOrganizationId = "onb-dev-insufficient-recovery-validation";
    const sparseRequestId = `onboarding-investigation-${"d".repeat(64)}`;
    const sparse = runOrganizationInvestigation({
      organizationId: recoveryOrganizationId,
      company: "Recovery Organization",
      website: "",
      industry: "",
      question: "Why are decisions delayed?",
      context: "Decisions are delayed.",
      investigationRequestId: sparseRequestId,
    });
    persistOrganizationInvestigationResponse({
      organizationId: recoveryOrganizationId,
      requestId: sparseRequestId,
      canonicalResponse: {
        body: { status: "insufficient-evidence", organizationId: recoveryOrganizationId },
        status: 422,
      },
    });
    const sparseReplay = runOrganizationInvestigation({
      organizationId: recoveryOrganizationId,
      company: "Recovery Organization",
      website: "",
      industry: "",
      question: "Why are decisions delayed?",
      context: "Decisions are delayed.",
      investigationRequestId: sparseRequestId,
    });
    assert.equal(sparseReplay.idempotentReplay, true);
    assert.equal(
      sparseReplay.runtime.metadata.investigationCount,
      sparse.runtime.metadata.investigationCount,
    );
    const recovered = runOrganizationInvestigation({
      organizationId: recoveryOrganizationId,
      company: "Recovery Organization",
      website: "",
      industry: "",
      question: "Why are decisions delayed?",
      context: "Decisions are delayed.",
      evidenceSources: baseInput.evidenceSources,
      investigationRequestId:
        `onboarding-investigation-${"e".repeat(64)}`,
    });
    assert.equal(
      recovered.runtime.metadata.investigationCount,
      sparse.runtime.metadata.investigationCount + 1,
    );
    assert.doesNotMatch(
      JSON.stringify(recovered.runtime.memory.organizationalConditions),
      /getting worse/i,
    );

    const duplicatedReplayText = JSON.stringify(exactReplay.canonicalResponse);
    assert.doesNotMatch(duplicatedReplayText, /getting worse|worsen(?:ing|ed)?/i);
  } finally {
    console.log = originalLog;
    rmSync(runtimeDirectory, { recursive: true, force: true });
  }

  console.log("Onboarding investigation idempotency validation: PASS");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
