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
  type ProductDecisionDraftAuthorityGrantV1,
  type ProductDecisionDraftOperation,
  type ProductDecisionDraftReadResultV1,
  type ProductDecisionDraftRecordResultV1,
  type CreateProductDecisionDraftRequestV1,
  type ReadProductDecisionDraftRequestV1,
  type RecordProductDecisionDraftRequestV1,
  type ReviseProductDecisionDraftRequestV1,
} from "../decisions";

export type ProductDecisionDraftServiceDependencies = {
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read" | "replace">;
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
    if (recorded.result.idempotent) return { ...recorded.result, runtimeRevision: stored.revision };
    const bytes = new TextEncoder().encode(JSON.stringify(recorded.runtime, null, 2));
    const persisted = await this.dependencies.runtimeRepository.replace(
      input.request.organizationId, bytes, stored.revision, input.storageOperation,
    );
    const persistedEvent = productDecisionDraftEvents(persisted.runtime)
      .find((event) => event.revision.revisionId === recorded.result.revision.revisionId);
    if (!persistedEvent || persistedEvent.receipt.receiptId !== recorded.result.receipt.receiptId) {
      throw new Error("Persisted Product Decision Draft receipt is unavailable.");
    }
    return {
      revision: structuredClone(persistedEvent.revision),
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
