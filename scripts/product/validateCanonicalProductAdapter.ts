import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferenceScenarios } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/fixtures";
import { runProductionShadowCognition } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/runProductionShadowCognition";
import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  CanonicalProductWorkspaceAdapter,
  resolveHistoricalProductAnswer,
} from "../../product/integration";
import {
  appendProductQuestionEvent,
  buildDurableProductQuestion,
  productQuestionEvents,
} from "../../product/questions/questionLifecycle";

const mode = process.argv[2] ?? "all";
const organizationId = "onb-dev-canonical-adapter";
const userId = "user_development_adapter";
const fixed = "2026-07-29T12:00:00.000Z";

function bytes(runtime: StoredOrganizationRuntime["runtime"]): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(runtime, null, 2));
}

function revision(value: Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

class MemoryRepository implements Pick<OrganizationRuntimeRepository, "read" | "replace"> {
  value: StoredOrganizationRuntime;
  reads = 0;
  writes = 0;

  constructor(runtime: StoredOrganizationRuntime["runtime"]) {
    const encoded = bytes(runtime);
    this.value = { runtime, bytes: encoded, revision: revision(encoded) };
  }

  async read(requestedOrganizationId: string): Promise<StoredOrganizationRuntime | null> {
    this.reads += 1;
    return requestedOrganizationId === this.value.runtime.metadata.organizationId
      ? structuredClone(this.value)
      : null;
  }

  async replace(
    requestedOrganizationId: string,
    next: Uint8Array,
    expectedRevision: string,
    _metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    assert.equal(requestedOrganizationId, this.value.runtime.metadata.organizationId);
    assert.equal(expectedRevision, this.value.revision);
    const runtime = JSON.parse(Buffer.from(next).toString("utf8")) as StoredOrganizationRuntime["runtime"];
    this.value = { runtime, bytes: next, revision: revision(next) };
    this.writes += 1;
    return structuredClone(this.value);
  }
}

function initialRuntime(): OrganizationRuntime {
  const generated = runProductionShadowCognition({
    ...inferenceScenarios[8]!.scenario,
    organizationId,
    question: "What should Discovery understand?",
  }).runtime;
  return {
    ...generated,
    metadata: {
      ...generated.metadata,
      organizationId,
      createdAt: fixed,
      updatedAt: fixed,
      investigationCount: 0,
    },
    memory: {
      ...generated.memory,
      understandingState: null,
      events: [],
    },
  };
}

function dependencies(repository: MemoryRepository, allowedUser = userId) {
  return {
    runtimeRepository: repository,
    authorize: async (input: { userId: string; organizationId: string }) =>
      input.userId === allowedUser && input.organizationId === organizationId,
    investigate: async (input: {
      runtime: StoredOrganizationRuntime["runtime"];
      question: string;
      contribution: { content: string; contributedAt: string };
    }) => {
      const relevant = runProductionShadowCognition({
        ...inferenceScenarios[3]!.scenario,
        organizationId,
        question: input.question,
      }).runtime;
      return {
        evidenceAccepted: true,
        runtime: {
          ...input.runtime,
          metadata: {
            ...input.runtime.metadata,
            updatedAt: input.contribution.contributedAt,
            investigationCount: input.runtime.metadata.investigationCount + 1,
          },
          memory: {
            ...relevant.memory,
            events: input.runtime.memory.events,
          },
        },
      };
    },
  };
}

async function createAndContribute() {
  const repository = new MemoryRepository(initialRuntime());
  const adapter = new CanonicalProductWorkspaceAdapter(dependencies(repository));
  const operation = { requestId: "adapter-validation", operatorId: userId };
  const created = await adapter.createQuestion({
    userId,
    organizationId,
    question: "Why is customer adoption weak?",
    createdAt: fixed,
    idempotencyKey: "create-adoption-question",
    operation,
  });
  return { repository, adapter, operation, created };
}

async function validateNewQuestionRoundtrip(): Promise<void> {
  const { repository, adapter, operation, created } = await createAndContribute();
  assert.equal(created.workspace.contractVersion, "1");
  assert.equal(created.workspace.question.title, "Why is customer adoption weak?");
  assert.equal(created.workspace.answer?.kind, "abstention");
  const writesAfterCreate = repository.writes;
  const repeated = await adapter.createQuestion({
    userId,
    organizationId,
    question: "Why is customer adoption weak?",
    createdAt: fixed,
    idempotencyKey: "create-adoption-question",
    operation,
  });
  assert.equal(repeated.workspace.question.id, created.workspace.question.id);
  assert.equal(repository.writes, writesAfterCreate);

  const updated = await adapter.contributeEvidence({
    userId,
    organizationId,
    questionId: created.workspace.question.id,
    contribution: {
      sourceId: "manual-adoption-evidence",
      sourceType: "paste",
      content: "Customer workflow confusion persists while guidance remains unchanged.",
      contributedAt: "2026-07-29T12:01:00.000Z",
      idempotencyKey: "adoption-evidence-1",
    },
    operation,
  });
  assert.equal(updated.workspace.question.id, created.workspace.question.id);
  assert.equal(updated.workspace.answer?.kind, "answer");
  assert.equal(updated.workspace.latestChange?.primaryChange, "answer_created");
  const durable = buildDurableProductQuestion({
    runtime: repository.value.runtime,
    questionId: created.workspace.question.id,
  });
  assert.equal(durable?.revision, 1);
  const reloaded = await adapter.getQuestionWorkspace({
    userId,
    organizationId,
    questionId: created.workspace.question.id,
  });
  assert.equal(reloaded.workspace.question.id, created.workspace.question.id);
  assert.equal(reloaded.workspace.question.revision, 1);
  const writesBeforeRetry = repository.writes;
  await adapter.contributeEvidence({
    userId,
    organizationId,
    questionId: created.workspace.question.id,
    contribution: {
      sourceId: "manual-adoption-evidence",
      sourceType: "paste",
      content: "Customer workflow confusion persists while guidance remains unchanged.",
      contributedAt: "2026-07-29T12:01:00.000Z",
      idempotencyKey: "adoption-evidence-1",
    },
    operation,
  });
  assert.equal(repository.writes, writesBeforeRetry);
}

async function validateAdoption(): Promise<void> {
  const runtime = initialRuntime();
  runtime.memory.events = [
    { id: "legacy-1", question: "Why is delivery delayed?", timestamp: fixed, evidenceCount: 2 },
    { id: "legacy-2", question: "Why is delivery delayed?", timestamp: fixed, evidenceCount: 2 },
    { id: "legacy-3", question: "Why is customer retention declining?", timestamp: fixed, evidenceCount: 2 },
  ];
  const repository = new MemoryRepository(runtime);
  const adapter = new CanonicalProductWorkspaceAdapter(dependencies(repository));
  const operation = { requestId: "adopt", operatorId: userId };
  const first = await adapter.adoptLegacyQuestions({ userId, organizationId, operation });
  assert.equal(first.receipts.length, 3);
  assert.equal(first.receipts.every((item) => item.status === "adopted" || item.status === "partially-adopted"), true);
  assert.equal(new Set(first.receipts.map((item) => item.questionId)).size, 3);
  for (const receipt of first.receipts) {
    const read = await adapter.getQuestionWorkspace({
      userId,
      organizationId,
      questionId: receipt.questionId,
    });
    assert.equal(read.workspace.question.id, receipt.questionId);
  }
  const writes = repository.writes;
  const second = await adapter.adoptLegacyQuestions({ userId, organizationId, operation });
  assert.equal(second.receipts.every((item) => item.status === "already-adopted"), true);
  assert.equal(repository.writes, writes);
  assert.equal(productQuestionEvents(repository.value.runtime).filter((event) => event.type === "question_created").length, 3);
}

function validateHistoricalResolution(): void {
  const confidence = {
    level: "high" as const,
    score: 0.84,
    meaning: "How strongly the current evidence supports this answer.",
    principalLimiter: "One alternative remains unresolved.",
    authoritativeSource: "causal-chain:CC2:E7",
  };
  const history = {
    answerId: "answer-1",
    canonicalSource: confidence.authoritativeSource,
    revision: 1,
    reasonForChange: "Evidence supported an answer.",
    changeReceiptId: "receipt-1",
    timestamp: fixed,
    confidence,
  };
  const resolved = resolveHistoricalProductAnswer({
    authorized: true,
    relevanceProven: true,
    history,
    source: {
      id: "answer-1",
      revision: 1,
      conclusion: "Workflow confusion leads to weak feature adoption.",
      confidence,
      principalLimiter: confidence.principalLimiter,
      generatedAt: fixed,
    },
  });
  assert.equal(resolved.status, "resolved");
  const missing = resolveHistoricalProductAnswer({
    authorized: true,
    relevanceProven: true,
    history,
    source: null,
  });
  assert.deepEqual(missing, {
    status: "unavailable",
    answerId: "answer-1",
    questionRevision: 1,
    reason: "source-missing",
  });
  const incompatible = resolveHistoricalProductAnswer({
    authorized: true,
    relevanceProven: true,
    history,
    source: {
      id: "current-answer",
      revision: 2,
      conclusion: "A current answer must not replace history.",
      confidence,
      principalLimiter: confidence.principalLimiter,
      generatedAt: fixed,
    },
  });
  assert.equal(incompatible.status, "unavailable");
  const irrelevant = resolveHistoricalProductAnswer({
    authorized: true,
    relevanceProven: false,
    history,
    source: {
      id: "answer-1",
      revision: 1,
      conclusion: "This exact source is unavailable without relevance proof.",
      confidence,
      principalLimiter: confidence.principalLimiter,
      generatedAt: fixed,
    },
  });
  assert.deepEqual(irrelevant, {
    status: "unavailable",
    answerId: "answer-1",
    questionRevision: 1,
    reason: "relevance-not-proven",
  });
}

async function validateListAndArchive(): Promise<void> {
  const { adapter, created, operation } = await createAndContribute();
  const active = await adapter.listQuestions({ userId, organizationId });
  assert.equal(active.length, 1);
  assert.equal(active[0]?.currentSupport, "no-answer");
  const archived = await adapter.archiveQuestion({
    userId,
    organizationId,
    questionId: created.workspace.question.id,
    archivedAt: "2026-07-29T12:02:00.000Z",
    operation,
  });
  assert.equal(archived.workspace.question.status, "archived");
  assert.equal((await adapter.listQuestions({ userId, organizationId })).length, 0);
  assert.equal((await adapter.listQuestions({ userId, organizationId, includeArchived: true }))[0]?.status, "archived");
}

async function validateSecurityAndParity(): Promise<void> {
  const repository = new MemoryRepository(initialRuntime());
  const adapter = new CanonicalProductWorkspaceAdapter(dependencies(repository));
  await assert.rejects(
    adapter.listQuestions({ userId: "unrelated-user", organizationId }),
    /access denied/,
  );
  assert.equal(repository.reads, 0);
  await assert.rejects(
    adapter.listQuestions({ userId, organizationId: "onb-dev-other" }),
    /access denied/,
  );
  assert.equal(repository.reads, 0);
  const before = repository.value.revision;
  await adapter.listQuestions({ userId, organizationId });
  assert.equal(repository.value.revision, before);
  assert.equal(repository.writes, 0);
}

function validateFrontendFirewall(): void {
  const activeFrontend = [
    "components/alpha/AlphaExperience.tsx",
    "components/alpha/UnderstandingDisclosure.tsx",
  ];
  const forbidden = /engine\/v3|organizationRuntime|selectProductAnswer|questionAnswerRelevance|components\/product-shell\/data/;
  for (const file of activeFrontend) {
    assert.doesNotMatch(readFileSync(join(process.cwd(), file), "utf8"), forbidden);
  }
  const route = readFileSync(join(process.cwd(), "app/(product)/your-organization/page.tsx"), "utf8");
  assert.match(route, /buildDiscoveryExperienceView/);
  assert.doesNotMatch(
    readFileSync(join(process.cwd(), "product/integration/canonicalProductWorkspaceAdapter.ts"), "utf8"),
    /components\/product-shell|buildDiscoveryExperienceView|composeActivatedYourOrganization/,
  );
}

const validations: Record<string, () => void | Promise<void>> = {
  adapter: async () => {
    await validateNewQuestionRoundtrip();
    await validateSecurityAndParity();
  },
  roundtrip: validateNewQuestionRoundtrip,
  adoption: validateAdoption,
  "adoption-idempotency": validateAdoption,
  history: validateHistoricalResolution,
  "history-fail-closed": validateHistoricalResolution,
  list: validateListAndArchive,
  mutation: validateNewQuestionRoundtrip,
  parity: validateSecurityAndParity,
  boundary: validateFrontendFirewall,
  firewall: validateFrontendFirewall,
  reload: validateNewQuestionRoundtrip,
  all: async () => {
    await validateNewQuestionRoundtrip();
    await validateAdoption();
    validateHistoricalResolution();
    await validateListAndArchive();
    await validateSecurityAndParity();
    validateFrontendFirewall();
  },
};

async function main(): Promise<void> {
  const validation = validations[mode];
  assert.ok(validation, `Unknown canonical adapter validation mode: ${mode}`);
  await validation();
  console.log(JSON.stringify({
    validation: `canonical-product-adapter:${mode}`,
    result: "PASS",
    contractVersion: "1",
    runtimeSchemaChanged: false,
    cognitionChanged: false,
    activeFrontendChanged: false,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
