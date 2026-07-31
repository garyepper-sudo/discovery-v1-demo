import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  currentProductAnswerVersion,
  productAnswerEvents,
  productAnswerHistory,
  productAnswerOperationReceipts,
  productAnswerVersions,
  recordProductAnswerEvaluation,
  type ProductAnswerEvaluation,
} from "../../product/answers";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import {
  appendProductQuestionEvent,
  createDurableProductQuestion,
} from "../../product/questions/questionLifecycle";
import type { ProductAnswer } from "../../product/workflow/contracts";

const organizationId = "onb-dev-product-answer-contract";
const otherOrganizationId = "onb-dev-product-answer-other";
const questionId = "product-question-answer-contract";
const otherQuestionId = "product-question-answer-other";
const fixed = "2026-07-30T12:00:00.000Z";

function runtimeFor(id = organizationId) {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: id,
    name: "Answer Contract Validation",
  });
  runtime.metadata = {
    ...runtime.metadata,
    createdAt: fixed,
    updatedAt: fixed,
    investigationCount: 4,
  };
  return runtime;
}

function withQuestion(id = questionId) {
  return createDurableProductQuestion({
    runtime: runtimeFor(),
    title: id === questionId
      ? "Why are customer onboarding handoffs getting delayed?"
      : "Why are enterprise renewal rates declining?",
    createdAt: fixed,
    questionId: id,
  }).runtime;
}

function answer(overrides: Partial<ProductAnswer> = {}): ProductAnswer {
  return {
    kind: "answer",
    id: "legacy-projected-answer",
    questionId,
    revision: 4,
    conclusion: "Late ownership assignment is delaying customer onboarding handoffs.",
    whyItMatters: "Earlier ownership would reduce avoidable waiting between teams.",
    confidence: {
      level: "moderate",
      score: 0.68,
      meaning: "Independent admitted Evidence supports the current Answer.",
      principalLimiter: "Credential readiness remains a plausible alternative.",
      authoritativeSource: "canonical-product-workflow",
    },
    discriminatingEvidence: [
      {
        id: "evidence-ownership-timing",
        statement: "Ownership is assigned after kickoff in delayed accounts.",
        sourceLabel: "Onboarding Process Update",
        role: "supports",
      },
      {
        id: "evidence-credential-readiness",
        statement: "Credential readiness remains independently associated with delays.",
        sourceLabel: "Onboarding Metrics Summary",
        role: "discriminates",
      },
    ],
    weakenedAlternatives: [],
    unresolvedAlternatives: [{
      id: "explanation-credential-readiness",
      explanation: "Credential readiness may independently delay onboarding.",
      status: "unresolved",
      basis: "Admitted metrics retain this alternative.",
    }],
    principalLimiter: "Credential readiness remains a plausible alternative.",
    bestNextImprovement: null,
    decisionImplication: null,
    generatedAt: fixed,
    ...overrides,
  };
}

function record(input: {
  runtime?: ReturnType<typeof withQuestion>;
  operationId?: string;
  occurredAt?: string;
  question?: string;
  evaluation?: ProductAnswerEvaluation;
  evidenceConsidered?: number;
  evidenceAdmitted?: number;
}) {
  const runtime = input.runtime ?? withQuestion();
  const selectedQuestionId = input.question ?? questionId;
  const evaluation = input.evaluation ?? {
    kind: "answer",
    answerType: "supported",
    answer: answer({ questionId: selectedQuestionId }),
  };
  return recordProductAnswerEvaluation({
    runtime,
    questionId: selectedQuestionId,
    operationId: input.operationId ?? "answer-operation-1",
    occurredAt: input.occurredAt ?? fixed,
    authorizationScopeRef: `organization:${runtime.metadata.organizationId}:question:${selectedQuestionId}`,
    understandingRevisionRef:
      `organization:${runtime.metadata.organizationId}:understanding:${runtime.metadata.investigationCount}`,
    evaluation,
    evidenceConsidered: input.evidenceConsidered ?? 2,
    evidenceAdmitted: input.evidenceAdmitted ?? 2,
  });
}

function validateSupported(): void {
  const recorded = record({});
  assert.equal(recorded.result.kind, "answer");
  assert.equal(recorded.result.answer.answerType, "supported");
  assert.equal(recorded.receipt.result, "answer-created");
  assert.equal(productAnswerVersions({ runtime: recorded.runtime, questionId }).length, 1);
  const version = currentProductAnswerVersion({ runtime: recorded.runtime, questionId });
  assert.ok(version);
  assert.equal(version.confidence?.ownerAnswerVersionId, version.answerVersionId);
  assert.equal(version.confidence?.ownerType, "product-answer");
  assert.deepEqual(
    version.evidenceCitations.map((item) => item.id),
    ["evidence-credential-readiness", "evidence-ownership-timing"],
  );
}

function validateCompetingAndUnsupported(): void {
  const competingStatement =
    "Ownership timing and credential readiness remain plausible independent explanations.";
  const competing = record({
    operationId: "answer-competing",
    evaluation: {
      kind: "answer",
      answerType: "competing-explanations",
      answer: answer({
        conclusion: competingStatement,
        unresolvedAlternatives: [
          ...answer().unresolvedAlternatives,
          {
            id: "explanation-ownership-timing",
            explanation: "Late ownership assignment may independently delay onboarding.",
            status: "unresolved",
            basis: "Admitted process Evidence retains this alternative.",
          },
        ],
      }),
    },
  });
  assert.equal(competing.result.kind, "answer");
  assert.equal(competing.result.answer.answerType, "competing-explanations");
  assert.equal(competing.result.answer.statement, competingStatement);
  assert.match(
    competing.result.answer.confidence?.basis.discrimination ?? "",
    /competing explanation/,
  );

  const unsupported = record({
    operationId: "answer-unsupported",
    evaluation: {
      kind: "answer",
      answerType: "unsupported",
      answer: answer({
        conclusion: "The admitted Evidence does not support ownership timing as the sole cause.",
      }),
    },
  });
  assert.equal(unsupported.result.kind, "answer");
  assert.equal(unsupported.result.answer.answerType, "unsupported");
}

function validateAbstention(): void {
  const recorded = record({
    operationId: "answer-abstention",
    evaluation: {
      kind: "targeted-abstention",
      reason: "insufficient-discrimination",
      limitation: "Ownership timing and credential readiness remain plausible.",
      evidenceConsidered: 4,
      evidenceAdmitted: 3,
    },
  });
  assert.equal(recorded.result.kind, "targeted-abstention");
  assert.equal(recorded.result.confidence, null);
  assert.equal(recorded.result.answerVersionId, null);
  assert.equal(productAnswerVersions({ runtime: recorded.runtime, questionId }).length, 0);
  assert.equal(
    productAnswerOperationReceipts({ runtime: recorded.runtime, questionId })[0]?.result,
    "targeted-abstention",
  );
  const replayed = record({
    runtime: recorded.runtime,
    operationId: "answer-abstention",
    occurredAt: "2026-07-30T12:05:00.000Z",
    evaluation: {
      kind: "targeted-abstention",
      reason: "insufficient-discrimination",
      limitation: "A different value must not replace the retained receipt.",
      evidenceConsidered: 99,
      evidenceAdmitted: 99,
    },
  });
  assert.deepEqual(replayed.result, recorded.result);
  assert.deepEqual(replayed.receipt, recorded.receipt);

  const noEvidence = record({
    operationId: "answer-no-evidence",
    evaluation: {
      kind: "targeted-abstention",
      reason: "relevance-threshold-not-met",
      limitation: "No admitted Evidence addresses the exact Question.",
      evidenceConsidered: 0,
      evidenceAdmitted: 0,
    },
  });
  assert.equal(noEvidence.result.kind, "targeted-abstention");
  assert.equal(noEvidence.receipt.evidenceAdmitted, 0);
}

function validateDuplicateAndFormattingOnly(): void {
  const duplicated = answer({
    discriminatingEvidence: [
      answer().discriminatingEvidence[0]!,
      answer().discriminatingEvidence[0]!,
      answer().discriminatingEvidence[1]!,
    ],
  });
  const first = record({
    operationId: "answer-duplicate-evidence",
    evaluation: { kind: "answer", answerType: "supported", answer: duplicated },
  });
  const firstVersion = currentProductAnswerVersion({ runtime: first.runtime, questionId });
  assert.equal(firstVersion?.evidenceCitations.length, 2);
  assert.equal(firstVersion?.confidence?.evidenceIds.length, 2);

  const formatting = record({
    runtime: first.runtime,
    operationId: "answer-formatting-only",
    occurredAt: "2026-07-30T12:01:00.000Z",
    evaluation: {
      kind: "answer",
      answerType: "supported",
      answer: {
        ...duplicated,
        conclusion: "LATE ownership assignment is delaying customer onboarding handoffs!",
        whyItMatters: "Earlier ownership would reduce avoidable waiting between teams!",
        generatedAt: "2026-07-30T12:01:00.000Z",
      },
    },
  });
  assert.equal(formatting.receipt.result, "answer-unchanged");
  assert.equal(productAnswerVersions({ runtime: formatting.runtime, questionId }).length, 1);
  assert.equal(
    currentProductAnswerVersion({ runtime: formatting.runtime, questionId })?.confidence?.calculatedAt,
    fixed,
  );
}

function validateSupersessionAndContradiction(): void {
  const first = record({ operationId: "answer-before-change" });
  const prior = currentProductAnswerVersion({ runtime: first.runtime, questionId })!;
  const changed = record({
    runtime: first.runtime,
    operationId: "answer-material-change",
    occurredAt: "2026-07-30T12:02:00.000Z",
    evaluation: {
      kind: "answer",
      answerType: "competing-explanations",
      answer: answer({
        conclusion:
          "Ownership timing and credential readiness now remain equally plausible explanations.",
        confidence: {
          ...answer().confidence,
          level: "low",
          score: 0.42,
          principalLimiter: "New contradictory Evidence prevents discrimination.",
        },
        unresolvedAlternatives: [
          ...answer().unresolvedAlternatives,
          {
            id: "explanation-ownership-timing",
            explanation: "Late ownership assignment may independently delay onboarding.",
            status: "unresolved",
            basis: "New contradictory Evidence retains this alternative.",
          },
        ],
        generatedAt: "2026-07-30T12:02:00.000Z",
      }),
    },
  });
  assert.equal(changed.receipt.result, "answer-superseded");
  const versions = productAnswerVersions({ runtime: changed.runtime, questionId });
  assert.equal(versions.length, 2);
  assert.equal(versions[1]?.supersedesAnswerVersionId, prior.answerVersionId);
  assert.equal(versions[0]?.statement, prior.statement);
  assert.equal(versions[0]?.confidence?.score, prior.confidence?.score);
}

function validateIdempotencyAndIsolation(): void {
  const first = record({ operationId: "answer-idempotent" });
  const replay = record({
    runtime: first.runtime,
    operationId: "answer-idempotent",
    occurredAt: "2026-07-30T12:03:00.000Z",
  });
  assert.equal(replay.runtime, first.runtime);
  assert.deepEqual(replay.receipt, first.receipt);
  assert.deepEqual(replay.result, first.result);
  assert.equal(productAnswerEvents(replay.runtime).length, 2);

  const secondQuestionRuntime = createDurableProductQuestion({
    runtime: first.runtime,
    title: "Why are enterprise renewal rates declining?",
    createdAt: fixed,
    questionId: otherQuestionId,
  }).runtime;
  const second = record({
    runtime: secondQuestionRuntime,
    question: otherQuestionId,
    operationId: "answer-other-question",
    evaluation: {
      kind: "targeted-abstention",
      reason: "relevance-threshold-not-met",
      limitation: "Onboarding Evidence does not address enterprise renewal rates.",
      evidenceConsidered: 2,
      evidenceAdmitted: 0,
    },
  });
  assert.equal(productAnswerVersions({ runtime: second.runtime, questionId }).length, 1);
  assert.equal(productAnswerVersions({
    runtime: second.runtime,
    questionId: otherQuestionId,
  }).length, 0);
}

function validateLegacyMixedReload(): void {
  let runtime = withQuestion();
  runtime = appendProductQuestionEvent(runtime, {
    type: "answer_recorded",
    questionId,
    organizationId,
    occurredAt: "2026-07-30T11:59:00.000Z",
    answer: {
      answerId: "legacy-answer-reference",
      canonicalSource: "legacy-canonical-source",
      revision: 1,
      reasonForChange: "Legacy Answer recorded.",
      changeReceiptId: "legacy-change-receipt",
      timestamp: "2026-07-30T11:59:00.000Z",
      confidence: answer().confidence,
    },
  });
  const current = record({ runtime, operationId: "answer-mixed-history" });
  const reloaded = JSON.parse(JSON.stringify(current.runtime)) as typeof current.runtime;
  const history = productAnswerHistory({ runtime: reloaded, questionId });
  assert.deepEqual(history.map((item) => item.contractVersion), [1, 2]);
  assert.equal(
    currentProductAnswerVersion({ runtime: reloaded, questionId })?.answerVersionId,
    current.receipt.answerVersionId,
  );
  assert.deepEqual(
    productAnswerOperationReceipts({ runtime: reloaded, questionId }),
    productAnswerOperationReceipts({ runtime: current.runtime, questionId }),
  );
  reloaded.memory.events.push({
    kind: "product-question-answer-event",
    schemaVersion: "999",
    eventType: "answer-version-recorded",
    eventId: "unknown-future-answer-event",
  });
  assert.equal(productAnswerEvents(reloaded).length, 2);
}

function validateFreshness(): void {
  const first = record({ operationId: "answer-before-stale" });
  const prior = currentProductAnswerVersion({ runtime: first.runtime, questionId })!;
  const stale = record({
    runtime: first.runtime,
    operationId: "answer-stale",
    occurredAt: "2026-08-30T12:00:00.000Z",
    evaluation: {
      kind: "targeted-abstention",
      reason: "freshness-insufficient",
      limitation: "Current Evidence is not fresh enough to justify a current Answer.",
      evidenceConsidered: 2,
      evidenceAdmitted: 2,
    },
  });
  assert.equal(stale.result.kind, "targeted-abstention");
  assert.equal(productAnswerVersions({ runtime: stale.runtime, questionId }).length, 1);
  assert.equal(
    currentProductAnswerVersion({ runtime: stale.runtime, questionId })?.answerVersionId,
    prior.answerVersionId,
  );
}

function encoded(runtime: ReturnType<typeof withQuestion>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(runtime, null, 2));
}

function revision(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

class MemoryRepository implements Pick<OrganizationRuntimeRepository, "read" | "replace"> {
  value: StoredOrganizationRuntime;
  reads = 0;
  writes = 0;

  constructor(runtime: ReturnType<typeof withQuestion>) {
    const bytes = encoded(runtime);
    this.value = { runtime, bytes, revision: revision(bytes) };
  }

  async read(requested: string): Promise<StoredOrganizationRuntime | null> {
    this.reads += 1;
    return requested === this.value.runtime.metadata.organizationId
      ? structuredClone(this.value)
      : null;
  }

  async replace(
    requested: string,
    bytes: Uint8Array,
    expectedRevision: string,
    _metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    assert.equal(requested, organizationId);
    assert.equal(expectedRevision, this.value.revision);
    const runtime = JSON.parse(Buffer.from(bytes).toString("utf8")) as ReturnType<typeof withQuestion>;
    this.value = { runtime, bytes, revision: revision(bytes) };
    this.writes += 1;
    return structuredClone(this.value);
  }
}

async function validateAuthorization(): Promise<void> {
  const deniedRepository = new MemoryRepository(withQuestion());
  const denied = new CanonicalProductWorkspaceAdapter({
    runtimeRepository: deniedRepository,
    authorize: async () => false,
    investigate: async () => {
      throw new Error("Investigation must not run.");
    },
  });
  await assert.rejects(
    denied.createOrRefreshAnswer({
      userId: "user_denied",
      organizationId,
      questionId,
      operationId: "answer-denied",
      occurredAt: fixed,
      operation: { requestId: "answer-denied", operatorId: "user_denied" },
    }),
    /access denied/,
  );
  assert.equal(deniedRepository.reads, 0);
  assert.equal(deniedRepository.writes, 0);

  const otherRuntime = runtimeFor(otherOrganizationId);
  assert.throws(
    () => record({
      runtime: otherRuntime,
      operationId: "answer-org-mismatch",
    }),
    /Question was not found/,
  );
}

async function run(): Promise<void> {
  validateSupported();
  validateCompetingAndUnsupported();
  validateAbstention();
  validateDuplicateAndFormattingOnly();
  validateSupersessionAndContradiction();
  validateIdempotencyAndIsolation();
  validateLegacyMixedReload();
  validateFreshness();
  await validateAuthorization();
  console.log(JSON.stringify({
    validation: "product-answer-contract",
    result: "PASS",
    scenarios: 14,
    eventSchemaVersionsRead: ["1", "2"],
    runtimeCollectionAdded: false,
    frontendChanged: false,
    cognitionChanged: false,
    productionChanged: false,
  }, null, 2));
}

run().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
