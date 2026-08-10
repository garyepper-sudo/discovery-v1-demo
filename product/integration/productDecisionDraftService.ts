import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  currentProductDecisionDraftRevision,
  productDecisionDraftEvents,
  productDecisionDraftHistory,
  recordProductDecisionDraftRevision,
  bindProductDecisionDraftBodyPublicationV1,
  productDecisionDraftDigest,
  type ProductDecisionDraftAuthorityGrantV1,
  type ProductDecisionDraftOperation,
  type ProductDecisionDraftReadResultV1,
  type ProductDecisionDraftRecordResultV1,
  type ProductDecisionDraftContentV1,
  type CreateProductDecisionDraftRequestV1,
  type ReadProductDecisionDraftRequestV1,
  type RecordProductDecisionDraftRequestV1,
  type ReviseProductDecisionDraftRequestV1,
} from "../decisions";
import {
  assertCanonicalProductMaterializationInstructionIntegrityV1,
  type CanonicalProductMaterializationInstructionV1,
} from "../workflow/leadershipConversation/canonicalProductMaterializationContracts";
import { serializeProductArtifactBodyV1 } from "../persistence/productArtifactBodyContracts";
import type { ProductArtifactBodyRepository } from "../persistence/productArtifactBodyRepository";
import type { ProductArtifactBodyRefV1 } from "../persistence/productArtifactBodyContracts";
import type { ProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";

export type ProductDecisionDraftServiceDependencies = {
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read" | "replace">;
  bodyRepository?: ProductArtifactBodyRepository;
  completeInspectionMetadata?(input:{organizationId:string;questionId:string;draftId:string;draftRevisionId:string;creationOperationId:string;requestFingerprint:string;body:ProductArtifactBodyRefV1;stageReceiptDigest:string}):Promise<ProductArtifactInspectionMetadataV1>;
  authorize(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    operation: ProductDecisionDraftOperation;
    scope: { type: "product-question"; id: string };
    purpose: ProductDecisionDraftAuthorityGrantV1["purpose"];
    sensitivity: "standard";
    evaluatedAt: string;
  }): Promise<ProductDecisionDraftAuthorityGrantV1>;
  authorizeMaterialization?(input: {
    instruction: CanonicalProductMaterializationInstructionV1;
    operation: "product-decision-draft:create" | "product-decision-draft:revise";
  }): Promise<ProductDecisionDraftAuthorityGrantV1>;
};

export type ProductDecisionDraftMutationResultV1 = ProductDecisionDraftRecordResultV1 & {
  runtimeRevision: string;
};

const denied = (): Error => new Error("Product Decision Draft operation access denied.");
const purpose = (operation: ProductDecisionDraftOperation): ProductDecisionDraftAuthorityGrantV1["purpose"] =>
  operation === "product-decision-draft:create" ? "create-product-decision-draft"
    : operation === "product-decision-draft:revise" ? "revise-product-decision-draft"
      : "read-product-decision-draft";

export class ProductDecisionDraftService {
  constructor(private readonly dependencies: ProductDecisionDraftServiceDependencies) {}

  private async grant(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    operation: ProductDecisionDraftOperation;
    evaluatedAt: string;
  }): Promise<ProductDecisionDraftAuthorityGrantV1> {
    const context = {
      ...input, scope: { type: "product-question" as const, id: input.questionId },
      purpose: purpose(input.operation), sensitivity: "standard" as const,
    };
    const grant = await this.dependencies.authorize(context);
    if (!grant.authorized || grant.operation !== input.operation
      || grant.organizationId !== input.organizationId || grant.questionId !== input.questionId
      || grant.scope.type !== context.scope.type || grant.scope.id !== context.scope.id
      || grant.purpose !== context.purpose || grant.sensitivity !== context.sensitivity
      || grant.status !== "active") throw denied();
    return grant;
  }

  private async runtime(organizationId: string): Promise<StoredOrganizationRuntime> {
    const stored = await this.dependencies.runtimeRepository.read(organizationId);
    if (!stored || stored.runtime.metadata.organizationId !== organizationId) {
      throw new Error("Authorized Organization Runtime is unavailable.");
    }
    return stored;
  }

  private async record(input: {
    userId: string;
    request: RecordProductDecisionDraftRequestV1;
    operation: "product-decision-draft:create" | "product-decision-draft:revise";
    storageOperation: RuntimeStorageOperationMetadata;
  }): Promise<ProductDecisionDraftMutationResultV1> {
    const grant = await this.grant({
      userId: input.userId, organizationId: input.request.organizationId,
      questionId: input.request.questionId, operation: input.operation,
      evaluatedAt: input.request.recordedAt,
    });
    const stored = await this.runtime(input.request.organizationId);
    const recorded = recordProductDecisionDraftRevision({ runtime: stored.runtime, request: input.request, grant });
    if (recorded.result.idempotent) {
      const ref=recorded.result.revision.protectedBody;if(!ref||!this.dependencies.bodyRepository)throw new Error("Product Decision Draft split-persistence replay is unavailable.");const content=JSON.parse(new TextDecoder().decode(await this.dependencies.bodyRepository.readStagedExact(ref))) as ProductDecisionDraftContentV1;return{...recorded.result,revision:{...recorded.result.revision,...content},runtimeRevision:stored.revision};
    }
    if(!this.dependencies.bodyRepository)throw new Error("Product Decision Draft split-persistence owner is unavailable.");
    const draftBody:ProductDecisionDraftContentV1={title:recorded.result.revision.title,intervention:recorded.result.revision.intervention,rationale:recorded.result.revision.rationale,assumptions:recorded.result.revision.assumptions,risks:recorded.result.revision.risks,expectedOutcomes:recorded.result.revision.expectedOutcomes,measures:recorded.result.revision.measures,intendedDecisionMakerRef:recorded.result.revision.intendedDecisionMakerRef,intendedDecisionMakerLabel:recorded.result.revision.intendedDecisionMakerLabel,proposedReviewDate:recorded.result.revision.proposedReviewDate};
    const staged=await this.dependencies.bodyRepository.stage({contractVersion:"1",organizationId:input.request.organizationId,semanticOwner:"product-decision-draft",artifactType:"product-decision-draft",artifactId:recorded.result.revision.draftId,artifactRevision:recorded.result.revision.revisionId,schemaRef:"discovery:product:decision-draft-body:v1",bytes:serializeProductArtifactBodyV1(draftBody)});
    if(!this.dependencies.completeInspectionMetadata)throw new Error("Product Decision Draft inspection metadata owner is unavailable.");
    const inspectionMetadata=await this.dependencies.completeInspectionMetadata({organizationId:input.request.organizationId,questionId:input.request.questionId,draftId:recorded.result.revision.draftId,draftRevisionId:recorded.result.revision.revisionId,creationOperationId:recorded.result.receipt.operationId,requestFingerprint:recorded.result.revision.requestFingerprint,body:staged.body,stageReceiptDigest:staged.receiptDigest});
    const bound=bindProductDecisionDraftBodyPublicationV1({runtime:recorded.runtime,result:recorded.result,body:staged.body,stageReceiptDigest:staged.receiptDigest,inspectionMetadata});
    const bytes = new TextEncoder().encode(JSON.stringify(bound.runtime, null, 2));
    const persisted = await this.dependencies.runtimeRepository.replace(
      input.request.organizationId, bytes, stored.revision, input.storageOperation,
    );
    const persistedEvent = productDecisionDraftEvents(persisted.runtime)
      .find((event) => event.revision.revisionId === bound.result.revision.revisionId);
    if (!persistedEvent || persistedEvent.receipt.receiptId !== bound.result.receipt.receiptId) {
      throw new Error("Persisted Product Decision Draft receipt is unavailable.");
    }
    return {
      revision: structuredClone(bound.result.revision),
      receipt: structuredClone(persistedEvent.receipt),
      idempotent: false,
      runtimeRevision: persisted.revision,
    };
  }

  create(input: {
    userId: string;
    request: CreateProductDecisionDraftRequestV1;
    storageOperation: RuntimeStorageOperationMetadata;
  }): Promise<ProductDecisionDraftMutationResultV1> {
    if (input.request.expectedCurrentRevision !== null || input.request.predecessorRevisionId !== null) {
      return Promise.reject(new Error("Draft create request has revision state."));
    }
    return this.record({ ...input, operation: "product-decision-draft:create" });
  }

  revise(input: {
    userId: string;
    request: ReviseProductDecisionDraftRequestV1;
    storageOperation: RuntimeStorageOperationMetadata;
  }): Promise<ProductDecisionDraftMutationResultV1> {
    if (input.request.expectedCurrentRevision === null || input.request.predecessorRevisionId === null) {
      return Promise.reject(new Error("Draft revise request is missing revision state."));
    }
    return this.record({ ...input, operation: "product-decision-draft:revise" });
  }

  async materializeCommittedInstruction(input: {
    instruction: CanonicalProductMaterializationInstructionV1;
    storageOperation: RuntimeStorageOperationMetadata;
  }): Promise<ProductDecisionDraftMutationResultV1> {
    const { instruction } = input;
    assertCanonicalProductMaterializationInstructionIntegrityV1(instruction);
    const draft = instruction.draftMaterialization;
    if (!draft.required) throw new Error("Canonical Product Decision Draft materialization is not required.");
    if (!this.dependencies.authorizeMaterialization) throw new Error("Canonical Product Decision Draft materialization authorization is unavailable.");
    const stored = await this.runtime(instruction.organizationId);
    const persistedOperation = stored.runtime.memory.events.find((event) => {
      if (!event || typeof event !== "object") return false;
      const candidate = event as { contributionOperationId?: unknown; productMaterializationInstruction?: { instructionDigest?: unknown } };
      return candidate.contributionOperationId === instruction.canonicalOperationId
        && candidate.productMaterializationInstruction?.instructionDigest === instruction.instructionDigest;
    });
    if (!persistedOperation) throw new Error("Canonical Product materialization instruction provenance is unavailable.");
    const materializationEvents = productDecisionDraftEvents(stored.runtime)
      .filter((event) => event.materializationReceipt?.canonicalOperationId === instruction.canonicalOperationId);
    if (materializationEvents.length > 1) throw new Error("Canonical Product Decision Draft stage is ambiguous.");
    const completed = materializationEvents[0];
    if (completed?.materializationReceipt) {
      if (completed.materializationReceipt.instructionDigest !== instruction.instructionDigest
        || completed.draftMutation?.instructionDigest !== instruction.instructionDigest) {
        throw new Error("Canonical Product Decision Draft materialization collision.");
      }
      if(!completed.revision.protectedBody||!this.dependencies.bodyRepository)throw new Error("Canonical Product Decision Draft split-persistence replay is unavailable.");
      const content=JSON.parse(new TextDecoder().decode(await this.dependencies.bodyRepository.readStagedExact(completed.revision.protectedBody))) as ProductDecisionDraftContentV1;
      return {
        revision: {...structuredClone(completed.revision),...content},
        receipt: structuredClone(completed.receipt),
        materializationReceipt: structuredClone(completed.materializationReceipt),
        idempotent: true,
        runtimeRevision: stored.revision,
      };
    }
    const rawIdempotencyKey = `canonical-materialization:${instruction.canonicalOperationId}:draft`;
    if (productDecisionDraftDigest(rawIdempotencyKey) !== draft.idempotencyKeyDigest) {
      throw new Error("Canonical Product Decision Draft idempotency binding is invalid.");
    }
    const operation = draft.payload.expectedCurrentRevision === null
      ? "product-decision-draft:create" as const
      : "product-decision-draft:revise" as const;
    const grant = await this.dependencies.authorizeMaterialization({ instruction, operation });
    const payload = draft.payload;
    const request: RecordProductDecisionDraftRequestV1 = {
      contractVersion: "1",
      organizationId: instruction.organizationId,
      questionId: instruction.questionId,
      sourceAnswerId: payload.sourceAnswerId,
      draftId: operation === "product-decision-draft:create" ? null : draft.draftId,
      expectedQuestionRevision: payload.expectedQuestionRevision,
      expectedCurrentRevision: payload.expectedCurrentRevision,
      predecessorRevisionId: payload.predecessorRevisionId,
      originatingProposalRef: payload.originatingProposalRef,
      content: {
        title: payload.title,
        intervention: payload.intervention,
        rationale: payload.rationale,
        assumptions: payload.assumptions,
        risks: payload.risks,
        expectedOutcomes: payload.expectedOutcomes,
        measures: payload.measures,
        intendedDecisionMakerRef: payload.intendedDecisionMakerRef,
        intendedDecisionMakerLabel: payload.intendedDecisionMakerLabel,
        proposedReviewDate: payload.proposedReviewDate,
      },
      recordedAt: instruction.evaluatedAt,
      idempotencyKey: rawIdempotencyKey,
      materializationBinding: {
        contractVersion: "1",
        canonicalOperationId: instruction.canonicalOperationId,
        instructionDigest: instruction.instructionDigest,
        draftEnvelopeDigest: draft.draftEnvelopeDigest,
        materialReferenceDigest: instruction.materialEnvelopeDigest,
        expectedRuntimeRevision: stored.revision,
        lineagePolicyVersion: instruction.lineagePolicyVersion,
      },
    };
    const recorded = recordProductDecisionDraftRevision({ runtime: stored.runtime, request, grant });
    if (recorded.result.idempotent) {
      if (!recorded.result.materializationReceipt) throw new Error("Canonical Product Decision Draft stage receipt is unavailable.");
      const ref=recorded.result.revision.protectedBody;if(!ref||!this.dependencies.bodyRepository)throw new Error("Canonical Product Decision Draft split-persistence replay is unavailable.");const content=JSON.parse(new TextDecoder().decode(await this.dependencies.bodyRepository.readStagedExact(ref))) as ProductDecisionDraftContentV1;return{...recorded.result,revision:{...recorded.result.revision,...content},runtimeRevision:stored.revision};
    }
    if(!this.dependencies.bodyRepository)throw new Error("Canonical Product Decision Draft split-persistence owner is unavailable.");
    const draftBody:ProductDecisionDraftContentV1={title:recorded.result.revision.title,intervention:recorded.result.revision.intervention,rationale:recorded.result.revision.rationale,assumptions:recorded.result.revision.assumptions,risks:recorded.result.revision.risks,expectedOutcomes:recorded.result.revision.expectedOutcomes,measures:recorded.result.revision.measures,intendedDecisionMakerRef:recorded.result.revision.intendedDecisionMakerRef,intendedDecisionMakerLabel:recorded.result.revision.intendedDecisionMakerLabel,proposedReviewDate:recorded.result.revision.proposedReviewDate};
    const staged=await this.dependencies.bodyRepository.stage({contractVersion:"1",organizationId:instruction.organizationId,semanticOwner:"product-decision-draft",artifactType:"product-decision-draft",artifactId:recorded.result.revision.draftId,artifactRevision:recorded.result.revision.revisionId,schemaRef:"discovery:product:decision-draft-body:v1",bytes:serializeProductArtifactBodyV1(draftBody)});
    if(!this.dependencies.completeInspectionMetadata)throw new Error("Product Decision Draft inspection metadata owner is unavailable.");
    const inspectionMetadata=await this.dependencies.completeInspectionMetadata({organizationId:instruction.organizationId,questionId:instruction.questionId,draftId:recorded.result.revision.draftId,draftRevisionId:recorded.result.revision.revisionId,creationOperationId:recorded.result.receipt.operationId,requestFingerprint:recorded.result.revision.requestFingerprint,body:staged.body,stageReceiptDigest:staged.receiptDigest});
    const bound=bindProductDecisionDraftBodyPublicationV1({runtime:recorded.runtime,result:recorded.result,body:staged.body,stageReceiptDigest:staged.receiptDigest,inspectionMetadata});
    const bytes = new TextEncoder().encode(JSON.stringify(bound.runtime, null, 2));
    const persisted = await this.dependencies.runtimeRepository.replace(
      instruction.organizationId,
      bytes,
      stored.revision,
      input.storageOperation,
    );
    const persistedEvent = productDecisionDraftEvents(persisted.runtime)
      .find((event) => event.materializationReceipt?.instructionDigest === instruction.instructionDigest);
    if (!persistedEvent?.materializationReceipt || !persistedEvent.draftMutation) {
      throw new Error("Persisted canonical Product Decision Draft stage is unavailable.");
    }
    return {
      revision: {...structuredClone(persistedEvent.revision),...draftBody},
      receipt: structuredClone(persistedEvent.receipt),
      materializationReceipt: structuredClone(persistedEvent.materializationReceipt),
      idempotent: false,
      runtimeRevision: persisted.revision,
    };
  }

  async read(input: {
    userId: string;
    request: ReadProductDecisionDraftRequestV1;
  }): Promise<ProductDecisionDraftReadResultV1 & { runtimeRevision: string | null }> {
    let grant: ProductDecisionDraftAuthorityGrantV1;
    try {
      grant = await this.grant({ userId: input.userId, ...input.request, operation: "product-decision-draft:read" });
    } catch {
      return { status: "withheld", current: null, history: [], runtimeRevision: null };
    }
    void grant;
    const stored = await this.runtime(input.request.organizationId);
    const current = currentProductDecisionDraftRevision(stored.runtime, input.request.questionId);
    if (!current) return { status: "unavailable", current: null, history: [], runtimeRevision: stored.revision };
    const history = productDecisionDraftHistory(stored.runtime, input.request.questionId, current.draftId)
      .map((revision) => ({
        lifecycle: revision.revisionId === current.revisionId ? "active" as const : "superseded" as const,
        revision,
      }));
    return {
      status: "available", current: { lifecycle: "active", revision: current }, history,
      runtimeRevision: stored.revision,
    };
  }
}
