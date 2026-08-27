import assert from "node:assert/strict";
import { fork, spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createProductWorkflowArtifactRepository,
  type ProductWorkflowArtifactRepository,
  type ProductWorkflowStoreSnapshot,
} from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { LeadershipConversationProductOperations } from "../../product/workflow/leadershipConversation/operations";
import {
  assertCanonicalMutationProductMaterializationStageTransitionV1,
  assertCanonicalProductDecisionDraftMaterializationResultIntegrityV1,
  assertCanonicalProductMaterializationCandidatePreflightIntegrityV1,
  assertCanonicalProductMaterializationInstructionIntegrityV1,
  createCanonicalProductMaterializationCandidatePreflightDigestV1,
  createCanonicalProductDecisionDraftMaterializationResultDigestV1,
  createCanonicalProductMaterializationInstructionDigestV1,
  type CanonicalProductMaterializationInstructionV1,
} from "../../product/workflow/leadershipConversation/canonicalProductMaterializationContracts";
import {
  leadershipDigest,
  leadershipStableSerialize,
} from "../../product/workflow/leadershipConversation/determinism";
import type { LeadershipConversationArtifactStoreV1 } from "../../product/workflow/leadershipConversation/contracts";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntime";
import {
  FilesystemOrganizationRuntimeRepository,
  type StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  appendProductQuestionEvent,
  createDurableProductQuestion,
} from "../../product/questions/questionLifecycle";
import { ProductDecisionDraftService } from "../../product/integration/productDecisionDraftService";
import { CanonicalLeadershipConversationProductMaterializer } from "../../product/integration/canonicalLeadershipConversationProductMaterializer";
import type {
  ProductDecisionDraftAuthorityGrantV1,
  ProductDecisionDraftOperation,
} from "../../product/decisions";
import { productDecisionDraftDigest } from "../../product/decisions";
import { pathToFileURL } from "node:url";
import {
  createProductArtifactBodyRefV1,
  productArtifactBodyDigest,
  type ProductArtifactBodyRefV1,
  type ProductArtifactBodyStageRequestV1,
  type ProductArtifactBodyStageReceiptV1,
} from "../../product/persistence/productArtifactBodyContracts";
import type { ProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import {
  completeProductArtifactInspectionMetadataV1,
  validateProductArtifactInspectionMetadataV1,
  type ProductArtifactInspectionMetadataV1,
} from "../../product/workflow/productArtifactInspectionMetadataContracts";
import { stableId } from "../../product/workflow/text";

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
export const organizationId = "sandbox-northstar-implementation-services-001";
export let questionId = stableId(
  "product-question",
  organizationId,
  "northstar-implementation-duration",
);
const conversationId = "conversation-1";

const emptyStore = (): LeadershipConversationArtifactStoreV1 => ({
  contractVersion: "1",
  organizationId,
  contexts: [],
  preparedWorkProducts: [],
  frozenSnapshots: [],
  uploadReceipts: [],
  proposals: [],
  dispositions: [],
  canonicalRoutingReceipts: [],
  routingLinks: [],
  changeLinks: [],
  futurePreparationLinks: [],
  productMaterializations: [],
  productMaterializationReceipts: [],
  events: [],
  idempotency: [],
  storeDigest: "",
});

export class MemoryWorkflowRepository
  implements ProductWorkflowArtifactRepository
{
  replaceCount = 0;
  snapshot: ProductWorkflowStoreSnapshot = {
    store: emptyStore(),
    revision: null,
  };
  async read(): Promise<ProductWorkflowStoreSnapshot> {
    return structuredClone(this.snapshot);
  }
  async replace(
    _organizationId: string,
    store: LeadershipConversationArtifactStoreV1,
    expected: string | null,
  ): Promise<ProductWorkflowStoreSnapshot> {
    assert.equal(expected, this.snapshot.revision);
    this.replaceCount += 1;
    this.snapshot = {
      store: structuredClone(store),
      revision: sha(leadershipStableSerialize(store)),
    };
    return structuredClone(this.snapshot);
  }
  async resetDevelopmentFixture(): Promise<boolean> {
    return false;
  }
}

export class MemoryBodyRepository implements ProductArtifactBodyRepository {
  readonly backend = "filesystem" as const;
  private readonly bodies = new Map<string, Uint8Array>();
  async stage(
    input: ProductArtifactBodyStageRequestV1,
  ): Promise<ProductArtifactBodyStageReceiptV1> {
    const body = createProductArtifactBodyRefV1({
        organizationId: input.organizationId,
        semanticOwner: input.semanticOwner,
        artifactType: input.artifactType,
        artifactId: input.artifactId,
        artifactRevision: input.artifactRevision,
        exactBodyDigest: productArtifactBodyDigest(input.bytes),
        byteLength: input.bytes.byteLength,
        mediaType: "application/json",
        schemaRef: input.schemaRef,
      }),
      existing = this.bodies.get(body.bodyId),
      disposition = existing ? ("exact-replay" as const) : ("staged" as const);
    if (existing) assert.deepEqual(existing, input.bytes);
    else this.bodies.set(body.bodyId, input.bytes.slice());
    return {
      contractVersion: "1",
      body,
      disposition,
      receiptDigest: productArtifactBodyDigest({ body, disposition }),
    };
  }
  async readStagedExact(ref: ProductArtifactBodyRefV1): Promise<Uint8Array> {
    const bytes = this.bodies.get(ref.bodyId);
    if (!bytes || productArtifactBodyDigest(bytes) !== ref.exactBodyDigest)
      throw new Error("body unavailable");
    return bytes.slice();
  }
}

export async function createOwnerBackedDraftDependencies(
  fixtureRoot: string,
): Promise<{
  questionId: string;
  bodyRepository: ProductArtifactBodyRepository;
  completeInspectionMetadata(input: {
    organizationId: string;
    questionId: string;
    draftId: string;
    draftRevisionId: string;
    creationOperationId: string;
    requestFingerprint: string;
    body: ProductArtifactBodyRefV1;
    stageReceiptDigest: string;
  }): Promise<ProductArtifactInspectionMetadataV1>;
}> {
  await mkdir(fixtureRoot, { recursive: true, mode: 0o700 });
  const [
    { createProductArtifactBodyRepository },
    {
      provisionNorthstarPreparationLineageFixture,
      readNorthstarPreparationLineageSeed,
    },
  ] = await Promise.all([
    import("../../product/persistence/productArtifactBodyRepository"),
    import(
      "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner"
    ),
  ]);
  const provisioned = await provisionNorthstarPreparationLineageFixture({
    environment: "test",
    fixtureRoot,
  });
  const load = () =>
    readNorthstarPreparationLineageSeed({
      fixtureRoot,
      organizationId,
      fixtureId: "northstar-preparation-lineage-fixture-v1",
      provisioningKey: "northstar-preparation-lineage:v1",
      expectedSeedDigest: provisioned.seed.seedDigest,
    });
  const seed = await load();
  assert.ok(
    seed.sourceBindings.length &&
      seed.sourceContentVersions.length &&
      seed.canonicalMaterial.length,
  );
  return {
    questionId: seed.productQuestionId,
    bodyRepository: createProductArtifactBodyRepository({
      root: path.join(fixtureRoot, "product-artifact-bodies"),
    }),
    completeInspectionMetadata: async (input) => {
      const loaded = await load();
      assert.equal(input.organizationId, loaded.organizationId);
      assert.equal(input.questionId, loaded.productQuestionId);
      const metadata = completeProductArtifactInspectionMetadataV1({
        organizationId: input.organizationId,
        semanticOwner: "product-decision-draft",
        artifactType: "product-decision-draft",
        artifactId: input.draftId,
        artifactRevision: input.draftRevisionId,
        productQuestionId: input.questionId,
        productWorkflowId: null,
        creationEnvelopeDigest: productDecisionDraftDigest({
          creationOperationId: input.creationOperationId,
          requestFingerprint: input.requestFingerprint,
        }),
        materialReferencesDigest: productDecisionDraftDigest(
          loaded.canonicalMaterial,
        ),
        protectedBody: input.body,
        ownerStageReceiptDigest: input.stageReceiptDigest,
        materialLineage: {
          ...loaded,
          semanticOwner: "product-decision-draft",
          artifactType: "product-decision-draft",
          artifactId: input.draftId,
          artifactRevision: input.draftRevisionId,
          envelopeDigest: "",
        },
      });
      validateProductArtifactInspectionMetadataV1(metadata);
      return metadata;
    },
  };
}

export function instruction(
  draftRequired = false,
): CanonicalProductMaterializationInstructionV1 {
  const protectedBody = createProductArtifactBodyRefV1({
    organizationId,
    semanticOwner: "leadership-conversation",
    artifactType: "what-changed",
    artifactId: "what-changed-1",
    artifactRevision: "1",
    exactBodyDigest: sha("what-changed-body"),
    byteLength: 1,
    mediaType: "application/json",
    schemaRef: "discovery:product:what-changed-body:v1",
  });
  const whatChangedHeader = {
    integrationReceiptId: "integration-receipt-1",
    artifactRevision: "1",
    productWorkflowId: "workflow-1",
    creationEnvelopeDigest: sha("creation"),
    materialReferencesDigest: sha("materials"),
    protectedBody,
    ownerStageReceiptDigest: sha("stage"),
  };
  const whatChangedEnvelope = {
    ...whatChangedHeader,
    headerDigest: leadershipDigest(
      leadershipStableSerialize(whatChangedHeader),
    ),
  };
  const unsigned = JSON.parse(
    JSON.stringify({
      contractVersion: "1" as const,
      instructionId: "instruction-1",
      organizationId,
      questionId,
      conversationId,
      proposalId: "proposal-1",
      canonicalOperationId: "operation-1",
      requestFingerprint: sha("request"),
      idempotencyKeyDigest: sha("idempotency"),
      actorRef: "actor-1",
      evaluatedAt: "2026-08-09T12:00:00.000Z",
      authorityRevisionRefs: ["authority-1"],
      policyRevisionRefs: ["policy-1"],
      expectedRuntimeRevision: sha("runtime-before"),
      committedRuntimeStateDigest: sha("candidate-runtime"),
      canonicalUnderstandingBeforeRef: "understanding-before",
      canonicalUnderstandingAfterRef: "understanding-after",
      canonicalChangeResultId: "change-result-1",
      canonicalChangeResultDigest: sha("change"),
      governedProductInputDigest: sha("governed-input"),
      lineagePolicyVersion: "lineage-policy-1",
      materialReferences: ["material-1"],
      materialEnvelopeDigest: sha("materials"),
      whatChangedIntent: "materialize" as const,
      whatChangedArtifactId: "what-changed-1",
      whatChangedEnvelope,
      whatChangedEnvelopeDigest: leadershipDigest(
        leadershipStableSerialize(whatChangedEnvelope),
      ),
      draftMaterialization: draftRequired
        ? (() => {
            const payload = {
              sourceAnswerId: "answer-1",
              expectedQuestionRevision: 1,
              expectedCurrentRevision: null,
              predecessorRevisionId: null,
              originatingProposalRef: "proposal-1",
              title: "Draft intervention",
              intervention: "Assign an owner.",
              rationale: "Reduce delay.",
              assumptions: [],
              risks: [],
              expectedOutcomes: [],
              measures: [],
              intendedDecisionMakerRef: null,
              intendedDecisionMakerLabel: null,
              proposedReviewDate: null,
            };
            return {
              contractVersion: "1" as const,
              required: true as const,
              draftId: "draft-expected-1",
              draftEnvelopeDigest: leadershipDigest(
                leadershipStableSerialize(payload),
              ),
              requestFingerprint: sha("draft-request"),
              idempotencyKeyDigest: productDecisionDraftDigest(
                "canonical-materialization:operation-1:draft",
              ),
              payload,
            };
          })()
        : {
            contractVersion: "1" as const,
            required: false as const,
            draftId: null,
            draftEnvelopeDigest: null,
            requestFingerprint: null,
            idempotencyKeyDigest: null,
            payload: null,
          },
      targetProductWorkflowId: "workflow-1",
    }),
  ) as Omit<CanonicalProductMaterializationInstructionV1, "instructionDigest">;
  return {
    ...unsigned,
    instructionDigest:
      createCanonicalProductMaterializationInstructionDigestV1(unsigned),
  };
}

const runtimeBytes = (runtime: OrganizationRuntime) =>
  new TextEncoder().encode(JSON.stringify(runtime, null, 2));
export class MemoryRuntimeRepository {
  replaceCount = 0;
  current: StoredOrganizationRuntime;
  constructor(runtime: OrganizationRuntime) {
    const bytes = runtimeBytes(runtime);
    this.current = {
      runtime: structuredClone(runtime),
      bytes,
      revision: sha(Buffer.from(bytes).toString("utf8")),
    };
  }
  async read(id: string) {
    return id === organizationId ? structuredClone(this.current) : null;
  }
  async replace(id: string, bytes: Uint8Array, expected: string) {
    assert.equal(id, organizationId);
    assert.equal(expected, this.current.revision);
    this.replaceCount += 1;
    const runtime = JSON.parse(
      Buffer.from(bytes).toString("utf8"),
    ) as OrganizationRuntime;
    this.current = {
      runtime,
      bytes,
      revision: sha(Buffer.from(bytes).toString("utf8")),
    };
    return structuredClone(this.current);
  }
}
export function runtimeWithInstruction(
  value: CanonicalProductMaterializationInstructionV1,
): OrganizationRuntime {
  let runtime = createEmptyOrganizationRuntime({
    organizationId,
    name: "Atomicity Validation",
    now: value.evaluatedAt,
  });
  runtime = createDurableProductQuestion({
    runtime,
    title: "What should change?",
    questionId,
    createdAt: value.evaluatedAt,
  }).runtime;
  runtime = appendProductQuestionEvent(runtime, {
    type: "answer_recorded",
    organizationId,
    questionId,
    occurredAt: value.evaluatedAt,
    answer: {
      answerId: "answer-1",
      canonicalSource: "product-answer",
      revision: 1,
      reasonForChange: "Supported",
      changeReceiptId: "answer-change-1",
      timestamp: value.evaluatedAt,
      confidence: {
        level: "moderate",
        score: 0.7,
        meaning: "Supported",
        principalLimiter: "Time",
        authoritativeSource: "canonical-product-workflow",
      },
    },
  });
  runtime.memory.events.push({
    contributionOperationId: value.canonicalOperationId,
    productMaterializationInstruction: value,
  });
  return runtime;
}
export type DurableMaterializationStageMeasurement =
  | { stage: "seeded"; runtimeRevision: string }
  | {
      stage: "runtime-committed-workflow-absent";
      runtimeEvents: number;
      workflowMaterializations: number;
    }
  | {
      stage: "canonical-committed-product-materialized";
      runtimeEvents: number;
      workflowMaterializations: number;
      workflowReceipts: number;
      workflowPublications: number;
      duplicateFindings: number;
    };
export async function durableMaterializationStage(
  mode: "seed" | "runtime-only" | "recover",
  root: string,
) {
  const value = instruction(true),
    runtimeRepository = new FilesystemOrganizationRuntimeRepository(
      path.join(root, "runtime"),
    ),
    workflowRepository = createProductWorkflowArtifactRepository({
      root: path.join(root, "workflow"),
      environment: "test",
    }),
    fixtureRoot = path.join(
      root,
      "discovery-northstar-preparation-lineage-ar5-durable",
    ),
    ownerBacked = await createOwnerBackedDraftDependencies(fixtureRoot);
  questionId = ownerBacked.questionId;
  if (mode === "seed") {
    const runtime = runtimeWithInstruction(value),
      bytes = new TextEncoder().encode(JSON.stringify(runtime, null, 2)),
      created = await runtimeRepository.create(organizationId, bytes, {
        requestId: "durable-seed",
        operatorId: "ar5-validator",
      });
    return {
      status: "PASS",
      stage: "seeded",
      runtimeRevision: created.revision,
    } as const;
  }
  const operations = new LeadershipConversationProductOperations({
      repository: workflowRepository,
      clock: { now: () => value.evaluatedAt },
      authorize: async () => false,
      verifyCanonicalInstructionProvenance: async () => true,
      loadBase: async () => {
        throw new Error("frontend read prohibited");
      },
      source: {
        write: async () => {
          throw new Error("source write prohibited");
        },
        readForProposal: async () => {
          throw new Error("source read prohibited");
        },
        readForEvidenceAdmission: async () => {
          throw new Error("source read prohibited");
        },
      },
    }),
    service = new ProductDecisionDraftService({
      runtimeRepository: runtimeRepository as never,
      ...ownerBacked,
      authorize: async (input) => grant(input.operation, input.evaluatedAt),
      authorizeMaterialization: async ({ operation }) =>
        grant(operation, value.evaluatedAt),
    });
  if (mode === "runtime-only") {
    await service.materializeCommittedInstruction({
      instruction: value,
      storageOperation: {
        requestId: "durable-runtime-boundary",
        operatorId: "ar5-validator",
      },
    });
    const runtime = await runtimeRepository.read(organizationId),
      workflow = await workflowRepository.read(organizationId);
    return {
      status: "PASS",
      stage: "runtime-committed-workflow-absent",
      runtimeEvents: runtime?.runtime.memory.events.length ?? 0,
      workflowMaterializations: (workflow.store.productMaterializations ?? [])
        .length,
    } as const;
  }
  const materializer = new CanonicalLeadershipConversationProductMaterializer({
      productDecisionDraftService: service,
      productWorkflowOperations: operations,
      storageOperation: () => ({
        requestId: "durable-recovery",
        operatorId: "ar5-validator",
      }),
    }),
    result = await materializer.materialize({
      contractVersion: "1",
      instruction: value,
      draftResult: null,
    }),
    runtime = await runtimeRepository.read(organizationId),
    workflow = await workflowRepository.read(organizationId);
  return {
    status: "PASS",
    stage: result.stage,
    runtimeEvents: runtime?.runtime.memory.events.length ?? 0,
    workflowMaterializations: (workflow.store.productMaterializations ?? [])
      .length,
    workflowReceipts: (workflow.store.productMaterializationReceipts ?? [])
      .length,
    workflowPublications: (workflow.store.whatChangedPublications ?? []).length,
    duplicateFindings:
      (workflow.store.productMaterializations ?? []).length -
      new Set(
        (workflow.store.productMaterializations ?? []).map(
          (item) => item.materializationRecordId,
        ),
      ).size,
  } as const;
}
function grant(
  operation: ProductDecisionDraftOperation,
  at: string,
): ProductDecisionDraftAuthorityGrantV1 {
  return {
    contractVersion: "1",
    operation,
    organizationId,
    questionId,
    scope: { type: "product-question", id: questionId },
    purpose:
      operation === "product-decision-draft:create"
        ? "create-product-decision-draft"
        : operation === "product-decision-draft:revise"
          ? "revise-product-decision-draft"
          : "read-product-decision-draft",
    sensitivity: "standard",
    actorRef: "actor-1",
    authorityRef: "authority-1",
    policyRef: "policy-1",
    authorized: true,
    status: "active",
    validFrom: at,
    authorizedAt: at,
  };
}

export type CanonicalMaterializationAtomicityMeasurement = {
  status: "PASS";
  boundaries: {
    exactReplay: boolean;
    incompatibleReplay: boolean;
    runtimeBeforeWorkflow: boolean;
    workflowAfterRuntime: boolean;
  };
  inventory: {
    productMaterializations: number;
    productMaterializationReceipts: number;
    whatChangedPublications: number;
    changeLinks: number;
    runtimeWrites: number;
    workflowWrites: number;
    duplicateFindings: number;
  };
};
export async function runAtomicityValidation(): Promise<CanonicalMaterializationAtomicityMeasurement> {
  assert.throws(
    () => leadershipStableSerialize({ unsupported: undefined }),
    /Unsupported Leadership Conversation value/,
  );
  const fixtureRoot = await mkdtemp(
    path.join(tmpdir(), "discovery-northstar-preparation-lineage-atomicity-"),
  );
  try {
    const { provisionNorthstarPreparationLineageFixture } = await import(
      "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner"
    );
    const ownerIssuedQuestionId = (
      await provisionNorthstarPreparationLineageFixture({
        environment: "test",
        fixtureRoot,
      })
    ).seed.productQuestionId;
    assert.equal(ownerIssuedQuestionId, questionId);
    questionId = ownerIssuedQuestionId;
    const repository = new MemoryWorkflowRepository();
    const operations = new LeadershipConversationProductOperations({
      repository,
      clock: { now: () => "2026-08-09T12:00:00.000Z" },
      authorize: async () => false,
      verifyCanonicalInstructionProvenance: async () => true,
      loadBase: async () => {
        throw new Error("frontend read must not occur");
      },
      source: {
        write: async () => {
          throw new Error("source write must not occur");
        },
        readForProposal: async () => {
          throw new Error("source read must not occur");
        },
        readForEvidenceAdmission: async () => {
          throw new Error("source read must not occur");
        },
      },
    });
    const canonicalInstruction = instruction();
    const unsignedInstruction = (
      value: CanonicalProductMaterializationInstructionV1,
    ): Omit<
      CanonicalProductMaterializationInstructionV1,
      "instructionDigest"
    > => {
      const { instructionDigest: _digest, ...unsigned } = value;
      void _digest;
      return unsigned;
    };
    const originalInstruction = structuredClone(canonicalInstruction);
    assertCanonicalProductMaterializationInstructionIntegrityV1(
      canonicalInstruction,
    );
    assert.deepEqual(canonicalInstruction, originalInstruction);
    const reordered = {
      ...canonicalInstruction,
      authorityRevisionRefs: [
        ...canonicalInstruction.authorityRevisionRefs,
      ].reverse(),
      policyRevisionRefs: [
        ...canonicalInstruction.policyRevisionRefs,
      ].reverse(),
      materialReferences: [
        ...canonicalInstruction.materialReferences,
      ].reverse(),
    };
    assert.equal(
      createCanonicalProductMaterializationInstructionDigestV1(
        unsignedInstruction(reordered),
      ),
      canonicalInstruction.instructionDigest,
    );
    const changed = structuredClone(canonicalInstruction);
    changed.whatChangedEnvelope.creationEnvelopeDigest =
      sha("different-creation");
    const { headerDigest: _headerDigest, ...changedHeader } =
      changed.whatChangedEnvelope;
    changed.whatChangedEnvelope.headerDigest = leadershipDigest(
      leadershipStableSerialize(changedHeader),
    );
    changed.whatChangedEnvelopeDigest = leadershipDigest(
      leadershipStableSerialize(changed.whatChangedEnvelope),
    );
    changed.instructionDigest =
      createCanonicalProductMaterializationInstructionDigestV1(
        unsignedInstruction(changed),
      );
    assert.notEqual(
      changed.instructionDigest,
      canonicalInstruction.instructionDigest,
    );
    const openEnvelope = structuredClone(
      canonicalInstruction,
    ) as CanonicalProductMaterializationInstructionV1 & {
      whatChangedEnvelope: CanonicalProductMaterializationInstructionV1["whatChangedEnvelope"] & {
        fabricated?: boolean;
      };
    };
    openEnvelope.whatChangedEnvelope.fabricated = true;
    openEnvelope.instructionDigest =
      createCanonicalProductMaterializationInstructionDigestV1(
        unsignedInstruction(openEnvelope),
      );
    assert.throws(
      () =>
        assertCanonicalProductMaterializationInstructionIntegrityV1(
          openEnvelope,
        ),
      /missing or unknown fields/,
    );
    const invalidPreflightBase = {
      contractVersion: "1" as const,
      organizationId,
      questionId,
      expectedRuntimeRevision: "runtime-1",
      evaluatedAt: canonicalInstruction.evaluatedAt,
      authorityRevisionRefs: ["authority-1"],
      policyRevisionRefs: ["policy-1"],
      governedProductInputDigest: sha("input"),
      materialEnvelopeDigest: sha("material"),
      disposition: "fabricated" as "approved",
    };
    const invalidPreflight = {
      ...invalidPreflightBase,
      preflightDigest:
        createCanonicalProductMaterializationCandidatePreflightDigestV1(
          invalidPreflightBase,
        ),
    };
    assert.throws(
      () =>
        assertCanonicalProductMaterializationCandidatePreflightIntegrityV1(
          invalidPreflight,
        ),
      /disposition is invalid/,
    );
    const unsignedDraft = {
      contractVersion: "1" as const,
      status: "not-applicable" as const,
      canonicalOperationId: canonicalInstruction.canonicalOperationId,
      instructionDigest: canonicalInstruction.instructionDigest,
      receipt: null,
    };
    const draftResult = {
      ...unsignedDraft,
      resultDigest:
        createCanonicalProductDecisionDraftMaterializationResultDigestV1(
          unsignedDraft,
        ),
    };
    const invalidDraftBase = {
      ...unsignedDraft,
      status: "fabricated" as "not-applicable",
    };
    const invalidDraft = {
      ...invalidDraftBase,
      resultDigest:
        createCanonicalProductDecisionDraftMaterializationResultDigestV1(
          invalidDraftBase,
        ),
    };
    assert.throws(
      () =>
        assertCanonicalProductDecisionDraftMaterializationResultIntegrityV1(
          invalidDraft,
        ),
      /status is invalid/,
    );
    assert.throws(
      () =>
        assertCanonicalMutationProductMaterializationStageTransitionV1(
          "canonical-committed-terminal-integrity-failure",
          "canonical-committed-draft-pending",
        ),
      /illegal stage transition/,
    );
    const first = await operations.materializeCanonicalProductInstruction({
      instruction: canonicalInstruction,
      draftResult,
    });
    assert.equal(repository.replaceCount, 1);
    assert.equal(first.idempotent, false);
    assert.equal(repository.snapshot.store.productMaterializations?.length, 1);
    assert.equal(
      repository.snapshot.store.productMaterializationReceipts?.length,
      1,
    );
    assert.equal(repository.snapshot.store.whatChangedPublications?.length, 1);
    assert.equal(repository.snapshot.store.changeLinks.length, 0);
    const replay = await operations.materializeCanonicalProductInstruction({
      instruction: canonicalInstruction,
      draftResult,
    });
    assert.equal(replay.idempotent, true);
    assert.equal(repository.replaceCount, 1);
    assert.equal(replay.receipt.receiptDigest, first.receipt.receiptDigest);
    const collision = {
      ...canonicalInstruction,
      instructionDigest: sha("collision"),
    };
    await assert.rejects(
      () =>
        operations.materializeCanonicalProductInstruction({
          instruction: collision,
          draftResult,
        }),
      /integrity failed/,
    );
    assert.equal(repository.replaceCount, 1);
    const stagedInstruction = instruction(true);
    const runtimeRepository = new MemoryRuntimeRepository(
      runtimeWithInstruction(stagedInstruction),
    );
    const stagedWorkflowRepository = new MemoryWorkflowRepository();
    const stagedOperations = new LeadershipConversationProductOperations({
      repository: stagedWorkflowRepository,
      clock: { now: () => stagedInstruction.evaluatedAt },
      authorize: async () => false,
      verifyCanonicalInstructionProvenance: async (candidate) =>
        candidate.instructionDigest === stagedInstruction.instructionDigest,
      loadBase: async () => {
        throw new Error("frontend read must not occur");
      },
      source: {
        write: async () => {
          throw new Error("source write must not occur");
        },
        readForProposal: async () => {
          throw new Error("source read must not occur");
        },
        readForEvidenceAdmission: async () => {
          throw new Error("source read must not occur");
        },
      },
    });
    const ownerBacked = await createOwnerBackedDraftDependencies(fixtureRoot);
    const draftService = new ProductDecisionDraftService({
      runtimeRepository: runtimeRepository as never,
      ...ownerBacked,
      authorize: async (value) => grant(value.operation, value.evaluatedAt),
      authorizeMaterialization: async ({ operation }) =>
        grant(operation, stagedInstruction.evaluatedAt),
    });
    const coordinator = new CanonicalLeadershipConversationProductMaterializer({
      productDecisionDraftService: draftService,
      productWorkflowOperations: stagedOperations,
      storageOperation: () => ({
        requestId: "draft-stage",
        operatorId: "system",
      }),
    });
    const completed = await coordinator.materialize({
      contractVersion: "1",
      instruction: stagedInstruction,
      draftResult: null,
    });
    assert.equal(completed.stage, "canonical-committed-product-materialized");
    assert.equal(runtimeRepository.replaceCount, 1);
    assert.equal(stagedWorkflowRepository.replaceCount, 1);
    const completedReplay = await coordinator.materialize({
      contractVersion: "1",
      instruction: stagedInstruction,
      draftResult: null,
    });
    assert.equal(
      completedReplay.stage,
      "canonical-replayed-product-materialized",
    );
    assert.equal(runtimeRepository.replaceCount, 1);
    assert.equal(stagedWorkflowRepository.replaceCount, 1);
    const materializations =
        repository.snapshot.store.productMaterializations ?? [],
      receipts = repository.snapshot.store.productMaterializationReceipts ?? [],
      publications = repository.snapshot.store.whatChangedPublications ?? [];
    const duplicateFindings = [
      materializations.map((value) => value.materializationRecordId),
      receipts.map((value) => value.receiptId),
      publications.map((value) => value.artifactId),
    ].reduce((total, ids) => total + ids.length - new Set(ids).size, 0);
    return {
      status: "PASS",
      boundaries: {
        exactReplay: replay.idempotent,
        incompatibleReplay: repository.replaceCount === 1,
        runtimeBeforeWorkflow: runtimeRepository.replaceCount === 1,
        workflowAfterRuntime: stagedWorkflowRepository.replaceCount === 1,
      },
      inventory: {
        productMaterializations: materializations.length,
        productMaterializationReceipts: receipts.length,
        whatChangedPublications: publications.length,
        changeLinks: repository.snapshot.store.changeLinks.length,
        runtimeWrites: runtimeRepository.replaceCount,
        workflowWrites: stagedWorkflowRepository.replaceCount,
        duplicateFindings,
      },
    };
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

export type DurableMaterializationObservationInputV1 = Readonly<{
  schemaVersion: "1";
  sourceDigest: string;
  frameworkId: "authenticated-alpha-acceptance";
  frameworkVersion: "1";
  profileId: "ar5b-authenticated-recovery-conformance";
  profileVersion: "version-1";
  taskDigest: string;
  runDigest: string;
  parentSegmentDigest: string;
  freshSegmentDigest: string;
  recipe: "shared-durable-root-materialization-fresh-process-reconstruction-v1";
}>;
export type DurableMaterializationObservationV1 = Readonly<{
  schemaVersion: "1";
  owner: "canonical-mutation-product-materialization-atomicity";
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  parentSegmentDigest: string;
  freshSegmentDigest: string;
  recipe: "shared-durable-root-materialization-fresh-process-reconstruction-v1";
  processAttestationDigest: string;
  sharedRootAttestationDigest: string;
  instructionDigest: string;
  runtimeOnlyDigest: string;
  reconstructedDigest: string;
  runtimeEvents: number;
  workflowMaterializations: number;
  workflowReceipts: number;
  workflowPublications: number;
  duplicateFindings: number;
  rootAbsentAfterCleanup: boolean;
  measurementDigest: string;
}>;
const observationDigest = /^[a-f0-9]{64}$/;
const stageNames = {
  seed: "shared-root-seed",
  "runtime-only": "runtime-only-durable-stage",
  recover: "fresh-materialization-reconstruction",
} as const;
type DurableRootManifest = {
  schemaVersion: "1";
  sourceDigest: string;
  frameworkId: "authenticated-alpha-acceptance";
  frameworkVersion: "1";
  profileId: "ar5b-authenticated-recovery-conformance";
  profileVersion: "version-1";
  taskDigest: string;
  runDigest: string;
  recipe: "shared-durable-root-materialization-fresh-process-reconstruction-v1";
  rootNonce: string;
  stages: readonly [
    "shared-root-seed",
    "runtime-only-durable-stage",
    "fresh-materialization-reconstruction",
  ];
};
type DurableChildResult = {
  kind: "durable-stage-result";
  stage: (typeof stageNames)[keyof typeof stageNames];
  pid: number;
  ppid: number;
  challenge: string;
  executionNonce: string;
  rootAttestationDigest: string;
  instructionDigest: string;
  measurement: Awaited<ReturnType<typeof durableMaterializationStage>>;
  resultDigest: string;
};
function assertObservationInput(
  value: DurableMaterializationObservationInputV1,
) {
  assert.deepEqual(
    Object.keys(value).sort(),
    [
      "frameworkId",
      "frameworkVersion",
      "freshSegmentDigest",
      "parentSegmentDigest",
      "profileId",
      "profileVersion",
      "recipe",
      "runDigest",
      "schemaVersion",
      "sourceDigest",
      "taskDigest",
    ].sort(),
  );
  assert.equal(value.schemaVersion, "1");
  assert.equal(value.frameworkId, "authenticated-alpha-acceptance");
  assert.equal(value.frameworkVersion, "1");
  assert.equal(value.profileId, "ar5b-authenticated-recovery-conformance");
  assert.equal(value.profileVersion, "version-1");
  assert.equal(
    value.recipe,
    "shared-durable-root-materialization-fresh-process-reconstruction-v1",
  );
  for (const valueDigest of [
    value.sourceDigest,
    value.taskDigest,
    value.runDigest,
    value.parentSegmentDigest,
    value.freshSegmentDigest,
  ])
    assert.match(valueDigest, observationDigest);
  assert.notEqual(value.parentSegmentDigest, value.freshSegmentDigest);
}
async function rootAttestation(
  root: string,
  manifestPath: string,
  expected: DurableRootManifest,
) {
  const resolvedRoot = await realpath(root),
    resolvedManifest = await realpath(manifestPath);
  assert.equal(resolvedRoot, root);
  assert.equal(resolvedManifest, manifestPath);
  const rootStatus = await lstat(root),
    manifestStatus = await lstat(manifestPath);
  assert.ok(rootStatus.isDirectory() && !rootStatus.isSymbolicLink());
  assert.ok(manifestStatus.isFile() && !manifestStatus.isSymbolicLink());
  assert.equal(rootStatus.mode & 0o777, 0o700);
  assert.equal(manifestStatus.mode & 0o777, 0o600);
  const bytes = await readFile(manifestPath),
    parsed = JSON.parse(bytes.toString("utf8"));
  assert.deepEqual(parsed, expected);
  const manifestDigest = sha(bytes.toString("utf8"));
  return sha(
    JSON.stringify({
      rootDevice: rootStatus.dev,
      rootInode: rootStatus.ino,
      rootMode: rootStatus.mode & 0o777,
      manifestDevice: manifestStatus.dev,
      manifestInode: manifestStatus.ino,
      manifestMode: manifestStatus.mode & 0o777,
      manifestDigest,
    }),
  );
}
async function writeDurableRootManifest(
  root: string,
  input: DurableMaterializationObservationInputV1,
) {
  const manifest: DurableRootManifest = {
      schemaVersion: "1",
      sourceDigest: input.sourceDigest,
      frameworkId: input.frameworkId,
      frameworkVersion: input.frameworkVersion,
      profileId: input.profileId,
      profileVersion: input.profileVersion,
      taskDigest: input.taskDigest,
      runDigest: input.runDigest,
      recipe: input.recipe,
      rootNonce: randomBytes(32).toString("hex"),
      stages: [
        "shared-root-seed",
        "runtime-only-durable-stage",
        "fresh-materialization-reconstruction",
      ],
    },
    manifestPath = path.join(root, "durable-root-manifest.json"),
    handle = await open(manifestPath, "wx", 0o600);
  try {
    await handle.writeFile(JSON.stringify(manifest));
    await handle.sync();
  } finally {
    await handle.close();
  }
  const directory = await open(root, "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  return {
    manifest,
    manifestPath,
    attestationDigest: await rootAttestation(root, manifestPath, manifest),
  };
}
async function runDurableChild(
  mode: keyof typeof stageNames,
  root: string,
  manifestPath: string,
  manifest: DurableRootManifest,
): Promise<{
  handlePid: number;
  result: DurableChildResult;
  exitCode: number;
  signal: null | string;
}> {
  return await new Promise((resolve, reject) => {
    const challenge = randomBytes(32).toString("hex"),
      child = fork(import.meta.filename, ["--durable-observation-child"], {
        cwd: process.cwd(),
        execArgv: ["--conditions=react-server", "--import", "tsx"],
        env: {
          PATH: "/usr/local/bin:/usr/bin:/bin",
          TMPDIR: tmpdir(),
          TZ: "UTC",
          LANG: "C",
          NODE_ENV: "test",
        },
        stdio: ["ignore", "ignore", "ignore", "ipc"],
      }),
      handlePid = child.pid;
    assert.ok(handlePid);
    let messages: Array<
        | DurableChildResult
        | { kind: "durable-stage-failure"; failureCategory: string }
      > = [],
      result: DurableChildResult | undefined;
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Durable stage child timed out"));
    }, 120_000);
    child.on("message", (message) => {
      messages.push(message as DurableChildResult);
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      try {
        if (code !== 0) {
          const failure = messages[0] as
            | { failureCategory?: string }
            | undefined;
          throw new Error(
            `Durable stage child failed: ${failure?.failureCategory ?? "not-observed"}`,
          );
        }
        assert.equal(signal, null);
        assert.equal(messages.length, 1);
        result = messages[0] as DurableChildResult;
        const { resultDigest, ...unsigned } = result;
        assert.equal(result.kind, "durable-stage-result");
        assert.equal(result.stage, stageNames[mode]);
        assert.equal(result.pid, handlePid);
        assert.equal(result.ppid, process.pid);
        assert.notEqual(result.pid, process.pid);
        assert.equal(result.challenge, challenge);
        assert.match(result.executionNonce, observationDigest);
        assert.equal(result.resultDigest, sha(JSON.stringify(unsigned)));
        resolve({ handlePid, result, exitCode: code, signal });
      } catch (error) {
        reject(error);
      }
    });
    child.send({
      kind: "durable-stage-request",
      mode,
      root,
      manifestPath,
      manifest,
      challenge,
    });
  });
}
async function durableObservationChild() {
  process.once("message", async (raw) => {
    let failureCategory = "request-validation";
    try {
      const request = raw as {
        kind: string;
        mode: keyof typeof stageNames;
        root: string;
        manifestPath: string;
        manifest: DurableRootManifest;
        challenge: string;
      };
      assert.equal(request.kind, "durable-stage-request");
      assert.ok(Object.hasOwn(stageNames, request.mode));
      assert.match(request.challenge, /^[a-f0-9]{64}$/);
      failureCategory = "root-attestation";
      const attestation = await rootAttestation(
        request.root,
        request.manifestPath,
        request.manifest,
      );
      failureCategory = "owner-stage";
      const measurement = await durableMaterializationStage(
        request.mode,
        request.root,
      );
      failureCategory = "result-framing";
      const instructionDigest = instruction(true).instructionDigest,
        executionNonce = randomBytes(32).toString("hex"),
        unsigned = {
          kind: "durable-stage-result" as const,
          stage: stageNames[request.mode],
          pid: process.pid,
          ppid: process.ppid,
          challenge: request.challenge,
          executionNonce,
          rootAttestationDigest: attestation,
          instructionDigest,
          measurement,
        },
        result = { ...unsigned, resultDigest: sha(JSON.stringify(unsigned)) };
      process.send?.(result, () => process.exit(0));
    } catch {
      process.send?.({ kind: "durable-stage-failure", failureCategory }, () =>
        process.exit(1),
      );
    }
  });
}
export async function measureCanonicalMutationProductMaterializationDurableStage(
  input: DurableMaterializationObservationInputV1,
): Promise<DurableMaterializationObservationV1> {
  assertObservationInput(input);
  const createdRoot = await mkdtemp(
      path.join(tmpdir(), "discovery-ar5b-materialization-durable-"),
    ),
    root = await realpath(createdRoot);
  let base:
    | Omit<
        DurableMaterializationObservationV1,
        "rootAbsentAfterCleanup" | "measurementDigest"
      >
    | undefined;
  try {
    const rootStatus = await lstat(root);
    assert.ok(rootStatus.isDirectory() && !rootStatus.isSymbolicLink());
    assert.equal(rootStatus.mode & 0o777, 0o700);
    await mkdir(path.join(root, "lineage"), { recursive: true, mode: 0o700 });
    const ownership = await writeDurableRootManifest(root, input),
      seed = await runDurableChild(
        "seed",
        root,
        ownership.manifestPath,
        ownership.manifest,
      ),
      runtimeOnly = await runDurableChild(
        "runtime-only",
        root,
        ownership.manifestPath,
        ownership.manifest,
      ),
      reconstructed = await runDurableChild(
        "recover",
        root,
        ownership.manifestPath,
        ownership.manifest,
      ),
      results = [seed.result, runtimeOnly.result, reconstructed.result],
      pids = [seed.handlePid, runtimeOnly.handlePid, reconstructed.handlePid],
      nonces = results.map((value) => value.executionNonce);
    assert.equal(new Set(pids).size, 3);
    assert.equal(new Set(nonces).size, 3);
    assert.ok(
      results.every(
        (value) => value.rootAttestationDigest === ownership.attestationDigest,
      ),
    );
    assert.equal(
      new Set(results.map((value) => value.instructionDigest)).size,
      1,
    );
    assert.equal(seed.result.measurement.stage, "seeded");
    assert.equal(
      runtimeOnly.result.measurement.stage,
      "runtime-committed-workflow-absent",
    );
    assert.equal(
      reconstructed.result.measurement.stage,
      "canonical-committed-product-materialized",
    );
    base = {
      schemaVersion: "1",
      owner: "canonical-mutation-product-materialization-atomicity",
      sourceDigest: input.sourceDigest,
      taskDigest: input.taskDigest,
      runDigest: input.runDigest,
      parentSegmentDigest: input.parentSegmentDigest,
      freshSegmentDigest: input.freshSegmentDigest,
      recipe: input.recipe,
      processAttestationDigest: sha(
        JSON.stringify({
          pids,
          ppids: results.map((value) => value.ppid),
          nonces,
          challenges: results.map((value) => value.challenge),
          exitCodes: [
            seed.exitCode,
            runtimeOnly.exitCode,
            reconstructed.exitCode,
          ],
          signals: [seed.signal, runtimeOnly.signal, reconstructed.signal],
        }),
      ),
      sharedRootAttestationDigest: ownership.attestationDigest,
      instructionDigest: reconstructed.result.instructionDigest,
      runtimeOnlyDigest: sha(JSON.stringify(runtimeOnly.result.measurement)),
      reconstructedDigest: sha(
        JSON.stringify(reconstructed.result.measurement),
      ),
      runtimeEvents: reconstructed.result.measurement.runtimeEvents,
      workflowMaterializations:
        reconstructed.result.measurement.workflowMaterializations,
      workflowReceipts: reconstructed.result.measurement.workflowReceipts,
      workflowPublications:
        reconstructed.result.measurement.workflowPublications,
      duplicateFindings: reconstructed.result.measurement.duplicateFindings,
    };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  const rootAbsentAfterCleanup = await lstat(root).then(
    () => false,
    (error) => (error as NodeJS.ErrnoException).code === "ENOENT",
  );
  assert.ok(base);
  const unsigned = { ...base, rootAbsentAfterCleanup };
  return { ...unsigned, measurementDigest: sha(JSON.stringify(unsigned)) };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (process.argv.includes("--durable-observation-child"))
    void durableObservationChild();
  else {
    const durableIndex = process.argv.indexOf("--durable-stage");
    if (durableIndex >= 0)
      void durableMaterializationStage(
        process.argv[durableIndex + 1] as "seed" | "runtime-only" | "recover",
        process.argv[durableIndex + 2]!,
      ).then((value) => process.stdout.write(JSON.stringify(value)));
    else if (!process.argv.includes("--react-server-child")) {
      const child = spawnSync(
        process.execPath,
        [
          "--conditions=react-server",
          ...process.execArgv,
          process.argv[1]!,
          "--react-server-child",
        ],
        {
          cwd: process.cwd(),
          encoding: "utf8",
          env: { ...process.env, NODE_ENV: "test" },
        },
      );
      if (child.stdout) process.stdout.write(child.stdout);
      if (child.stderr) process.stderr.write(child.stderr);
      if (child.status !== 0) process.exitCode = child.status ?? 1;
    } else
      void runAtomicityValidation().then((value) =>
        process.stdout.write(`${JSON.stringify(value)}\n`),
      );
  }
}
