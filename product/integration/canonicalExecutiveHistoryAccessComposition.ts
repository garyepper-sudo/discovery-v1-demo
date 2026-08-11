import type {
  ExecutiveObservedOutcome,
  ExecutiveReview,
} from "../../engine/v3/work/executiveReview";
import type { ExecutiveLearning } from "../../engine/v3/work/executiveLearning";
import { saveExecutiveReview } from "../../engine/v3/work/saveExecutiveReview";
import { saveExecutiveLearning } from "../../engine/v3/work/saveExecutiveLearning";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { ExecutiveHistoryCurrentAccessService } from "../../engine/v3/governance/executiveHistoryCurrentAccessService";
import {
  executiveHistoryDigest,
  executiveHistoryStable,
  type ExecutiveHistoryAccessPolicyRevisionV1,
  type ExecutiveHistoryAccessRequestV1,
  type ExecutiveHistoryRecordKind,
} from "../../engine/v3/governance/executiveHistoryCurrentAccessContracts";

type CreateBase = {
  organizationId: string;
  policyRevisionId: string;
  sensitivity: "standard" | "restricted" | "private";
  creationOperationId: string;
  occurredAt: string;
  actorRef: string;
  idempotencyKey: string;
  runtimeOperation: RuntimeStorageOperationMetadata;
};

export type ExecutiveHistoryCreateResult<T> =
  | { disposition: "committed"; record: T; bindingRevisionId: string; runtimeRevision: string }
  | { disposition: "semantic-committed/access-pending"; record: T; runtimeRevision: string };

export type ExecutiveHistorySafeProjectionItemV1 = {
  contractVersion: "1";
  organizationId: string;
  recordKind: "executive-review" | "observed-outcome" | "executive-learning";
  recordId: string;
  parentReviewId: string | null;
  label: "Executive review" | "Observed outcome" | "Executive learning";
  occurredAt: string | null;
  accessResultDigest: string;
  projectionDigest: string;
};

export type ExecutiveHistorySafeProjectionV1 =
  | { contractVersion: "1"; disposition: "inaccessible"; item: null }
  | { contractVersion: "1"; disposition: "available"; item: ExecutiveHistorySafeProjectionItemV1 };

const INACCESSIBLE_EXECUTIVE_HISTORY_PROJECTION: ExecutiveHistorySafeProjectionV1 = {
  contractVersion: "1",
  disposition: "inaccessible",
  item: null,
};

function safeItem(
  input: Omit<ExecutiveHistorySafeProjectionItemV1, "contractVersion" | "projectionDigest">,
): ExecutiveHistorySafeProjectionItemV1 {
  const unsigned = { contractVersion: "1" as const, ...input };
  return { ...unsigned, projectionDigest: executiveHistoryDigest(unsigned) };
}

export function serializeExecutiveHistorySafeProjectionV1(
  projection: ExecutiveHistorySafeProjectionV1,
): string {
  return `${executiveHistoryStable(projection)}\n`;
}

export class CanonicalExecutiveHistoryAccessComposition {
  constructor(
    private readonly dependencies: {
      access: ExecutiveHistoryCurrentAccessService;
      runtime: OrganizationRuntimeRepository;
      authorizeAdministration(input: {
        organizationId: string;
        actorRef: string;
        operation: "create" | "recover";
      }): Promise<boolean>;
    },
  ) {}

  private async authorized(request: ExecutiveHistoryAccessRequestV1) {
    const result = await this.dependencies.access.authorize(request);
    return result.disposition === "authorized" ? result : null;
  }

  async readReview(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "executive-review" },
  ): Promise<{ accessResultDigest: string; review: ExecutiveReview } | null> {
    const access = await this.authorized(request);
    if (!access) return null;
    const stored = await this.dependencies.runtime.read(request.organizationId);
    const review = stored?.runtime.memory.executiveReviews.find(
      (value) => value.id === request.recordId,
    );
    if (!review || review.organizationId !== request.organizationId) return null;
    return { accessResultDigest: access.resultDigest, review: structuredClone(review) };
  }

  async readOutcome(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "observed-outcome" },
  ): Promise<{ accessResultDigest: string; outcome: ExecutiveObservedOutcome } | null> {
    const access = await this.authorized(request);
    if (!access) return null;
    const stored = await this.dependencies.runtime.read(request.organizationId);
    const review = stored?.runtime.memory.executiveReviews.find(
      (value) => value.id === request.parentReviewId,
    );
    const outcome = review?.observedOutcomes.find(
      (value) => value.expectedOutcomeId === request.recordId,
    );
    if (!review || review.organizationId !== request.organizationId || !outcome) return null;
    return { accessResultDigest: access.resultDigest, outcome: structuredClone(outcome) };
  }

  async readLearning(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "executive-learning" },
  ): Promise<{ accessResultDigest: string; learning: ExecutiveLearning } | null> {
    const access = await this.authorized(request);
    if (!access) return null;
    const stored = await this.dependencies.runtime.read(request.organizationId);
    const learning = stored?.runtime.memory.executiveLearning.find(
      (value) => value.id === request.recordId,
    );
    if (!learning || learning.organizationId !== request.organizationId) return null;
    return { accessResultDigest: access.resultDigest, learning: structuredClone(learning) };
  }

  async projectReview(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "executive-review" },
  ): Promise<ExecutiveHistorySafeProjectionV1> {
    const result = await this.readReview(request);
    if (!result) return structuredClone(INACCESSIBLE_EXECUTIVE_HISTORY_PROJECTION);
    return {
      contractVersion: "1",
      disposition: "available",
      item: safeItem({
        organizationId: request.organizationId,
        recordKind: "executive-review",
        recordId: result.review.id,
        parentReviewId: null,
        label: "Executive review",
        occurredAt: result.review.reviewedAt,
        accessResultDigest: result.accessResultDigest,
      }),
    };
  }

  async projectOutcome(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "observed-outcome" },
  ): Promise<ExecutiveHistorySafeProjectionV1> {
    const result = await this.readOutcome(request);
    if (!result) return structuredClone(INACCESSIBLE_EXECUTIVE_HISTORY_PROJECTION);
    return {
      contractVersion: "1",
      disposition: "available",
      item: safeItem({
        organizationId: request.organizationId,
        recordKind: "observed-outcome",
        recordId: result.outcome.expectedOutcomeId,
        parentReviewId: request.parentReviewId ?? null,
        label: "Observed outcome",
        occurredAt: null,
        accessResultDigest: result.accessResultDigest,
      }),
    };
  }

  async projectLearning(
    request: ExecutiveHistoryAccessRequestV1 & { recordKind: "executive-learning" },
  ): Promise<ExecutiveHistorySafeProjectionV1> {
    const result = await this.readLearning(request);
    if (!result) return structuredClone(INACCESSIBLE_EXECUTIVE_HISTORY_PROJECTION);
    return {
      contractVersion: "1",
      disposition: "available",
      item: safeItem({
        organizationId: request.organizationId,
        recordKind: "executive-learning",
        recordId: result.learning.id,
        parentReviewId: result.learning.executiveReviewId,
        label: "Executive learning",
        occurredAt: result.learning.learnedAt,
        accessResultDigest: result.accessResultDigest,
      }),
    };
  }

  async listAuthorized(requests: readonly ExecutiveHistoryAccessRequestV1[]) {
    const values: { recordKind: string; recordId: string; accessResultDigest: string }[] = [];
    for (const request of requests) {
      const access = await this.dependencies.access.authorize(request);
      if (access.disposition === "authorized") {
        values.push({
          recordKind: request.recordKind,
          recordId: request.recordId,
          accessResultDigest: access.resultDigest,
        });
      }
    }
    return values;
  }

  async createReview(
    input: CreateBase & { review: ExecutiveReview },
  ): Promise<ExecutiveHistoryCreateResult<ExecutiveReview>> {
    return this.create("executive-review", input.review.id, null, input.review, input, (runtime) =>
      saveExecutiveReview({ runtime, review: input.review }),
    );
  }

  async createLearning(
    input: CreateBase & { learning: ExecutiveLearning },
  ): Promise<ExecutiveHistoryCreateResult<ExecutiveLearning>> {
    return this.create(
      "executive-learning",
      input.learning.id,
      input.learning.executiveReviewId,
      input.learning,
      input,
      (runtime) => saveExecutiveLearning({ runtime, learning: input.learning }),
    );
  }

  private async create<T extends ExecutiveReview | ExecutiveLearning>(
    kind: ExecutiveHistoryRecordKind,
    recordId: string,
    parentReviewId: string | null,
    record: T,
    input: CreateBase,
    save: (runtime: OrganizationRuntime) => OrganizationRuntime,
  ): Promise<ExecutiveHistoryCreateResult<T>> {
    if (
      !(await this.dependencies.authorizeAdministration({
        organizationId: input.organizationId,
        actorRef: input.actorRef,
        operation: "create",
      }))
    ) {
      throw new Error("Executive History creation is inaccessible.");
    }
    await this.dependencies.access.createPendingBinding({
      organizationId: input.organizationId,
      recordKind: kind,
      recordId,
      parentReviewId,
      policyRevisionId: input.policyRevisionId,
      sensitivity: input.sensitivity,
      creationOperationId: input.creationOperationId,
      effectiveAt: input.occurredAt,
      actorRef: input.actorRef,
      idempotencyKey: `${input.idempotencyKey}:pending`,
    });
    const stored = await this.dependencies.runtime.read(input.organizationId);
    if (!stored) throw new Error("Organization Runtime is unavailable.");
    const collection =
      kind === "executive-review"
        ? stored.runtime.memory.executiveReviews
        : stored.runtime.memory.executiveLearning;
    const existing = collection.find((value) => value.id === recordId);
    let persisted = stored;
    if (existing) {
      if (executiveHistoryDigest(existing) !== executiveHistoryDigest(record)) {
        throw new Error("Executive History semantic identity collision.");
      }
    } else {
      const runtime = save(stored.runtime);
      persisted = await this.dependencies.runtime.replace(
        input.organizationId,
        new TextEncoder().encode(JSON.stringify(runtime, null, 2)),
        stored.revision,
        input.runtimeOperation,
      );
    }
    try {
      const binding = await this.dependencies.access.activateBinding({
        organizationId: input.organizationId,
        recordKind: kind,
        recordId,
        occurredAt: input.occurredAt,
        actorRef: input.actorRef,
        idempotencyKey: `${input.idempotencyKey}:activate`,
        semanticOwnerPublicationRef: persisted.revision,
        semanticOwnerIntegrityDigest: executiveHistoryDigest(record),
      });
      return {
        disposition: "committed",
        record: structuredClone(record),
        bindingRevisionId: binding.bindingRevisionId,
        runtimeRevision: persisted.revision,
      };
    } catch {
      return {
        disposition: "semantic-committed/access-pending",
        record: structuredClone(record),
        runtimeRevision: persisted.revision,
      };
    }
  }

  async recover(input: {
    organizationId: string;
    recordKind: ExecutiveHistoryRecordKind;
    recordId: string;
    occurredAt: string;
    actorRef: string;
    idempotencyKey: string;
  }) {
    if (
      !(await this.dependencies.authorizeAdministration({
        organizationId: input.organizationId,
        actorRef: input.actorRef,
        operation: "recover",
      }))
    ) {
      throw new Error("Executive History recovery is inaccessible.");
    }
    const stored = await this.dependencies.runtime.read(input.organizationId);
    if (!stored) throw new Error("Organization Runtime is unavailable.");
    const record =
      input.recordKind === "executive-review"
        ? stored.runtime.memory.executiveReviews.find((value) => value.id === input.recordId)
        : stored.runtime.memory.executiveLearning.find((value) => value.id === input.recordId);
    if (!record) throw new Error("Executive History recovery owner record is unavailable.");
    return this.dependencies.access.activateBinding({
      ...input,
      semanticOwnerPublicationRef: stored.revision,
      semanticOwnerIntegrityDigest: executiveHistoryDigest(record),
    });
  }
}

export function assertExecutiveHistoryPolicyIsContentFree(
  policy: ExecutiveHistoryAccessPolicyRevisionV1,
): void {
  const serialized = JSON.stringify(policy).toLowerCase();
  for (const forbidden of [
    "summary",
    "observation",
    "organizationalknowledge",
    "futurerecommendationchanges",
    "evidence",
    "sourcecontent",
    "understanding",
  ]) {
    if (serialized.includes(forbidden)) {
      throw new Error("Executive History access policy contains protected semantic content.");
    }
  }
}
