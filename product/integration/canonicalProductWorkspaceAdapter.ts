import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  appendProductQuestionEvent,
  buildDurableProductQuestion,
  createDurableProductQuestion,
  productQuestionEvents,
} from "../questions/questionLifecycle";
import {
  archiveProductQuestion,
  recordProductWorkspaceLifecycle,
} from "../questions/recordProductWorkspaceLifecycle";
import {
  currentProductAnswerVersion,
  evaluationFromWorkspaceAnswer,
  projectProductAnswerVersion,
  recordProductAnswerEvaluation,
} from "../answers/answerLifecycle";
import {
  buildProductQuestionWorkspace,
  type ProductQuestionWorkspace,
} from "../workflow";
import { stableId } from "../workflow/text";
import {
  listCurrentProductUnknowns,
  listProductUnknowns,
  recordProductUnknownOperation,
  type ProductUnknownOperationInput,
} from "../unknowns";
import { adoptLegacyProductQuestions } from "./adoptLegacyQuestions";
import type {
  CanonicalEvidenceContribution,
  CanonicalAnswerReadResult,
  CanonicalAnswerRefreshResult,
  CanonicalInvestigationResult,
  CanonicalWorkspaceReadResult,
  CanonicalUnknownMutationResult,
  CanonicalUnknownReadResult,
  ProductQuestionAdoptionReceipt,
  ProductQuestionSummary,
} from "./contracts";

export type CanonicalProductWorkspaceAdapterDependencies = {
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read" | "replace">;
  authorize(input: {
    userId: string;
    organizationId: string;
  }): Promise<boolean>;
  investigate(input: {
    runtime: StoredOrganizationRuntime["runtime"];
    question: string;
    contribution: CanonicalEvidenceContribution;
  }): Promise<CanonicalInvestigationResult>;
};

export class CanonicalProductWorkspaceAdapter {
  constructor(private readonly dependencies: CanonicalProductWorkspaceAdapterDependencies) {}

  private async authorizedRuntime(input: {
    userId: string;
    organizationId: string;
  }): Promise<StoredOrganizationRuntime> {
    const authorized = await this.dependencies.authorize(input);
    if (!authorized) throw new Error("Product workspace access denied.");
    const stored = await this.dependencies.runtimeRepository.read(input.organizationId);
    if (!stored) throw new Error("Authorized Organization Runtime is missing.");
    if (stored.runtime.metadata.organizationId !== input.organizationId) {
      throw new Error("Product workspace organization mismatch.");
    }
    return stored;
  }

  private async replace(input: {
    stored: StoredOrganizationRuntime;
    runtime: StoredOrganizationRuntime["runtime"];
    operation: RuntimeStorageOperationMetadata;
  }): Promise<StoredOrganizationRuntime> {
    const bytes = new TextEncoder().encode(JSON.stringify(input.runtime, null, 2));
    return this.dependencies.runtimeRepository.replace(
      input.runtime.metadata.organizationId,
      bytes,
      input.stored.revision,
      input.operation,
    );
  }

  async getQuestionWorkspace(input: {
    userId: string;
    organizationId: string;
    questionId: string;
  }): Promise<CanonicalWorkspaceReadResult> {
    const stored = await this.authorizedRuntime(input);
    const question = buildDurableProductQuestion({
      runtime: stored.runtime,
      questionId: input.questionId,
    });
    if (!question) throw new Error("Product Question was not found in this organization.");
    const workspace = buildProductQuestionWorkspace({
      runtime: stored.runtime,
      question: question.title,
      questionId: question.id,
    });
    if (workspace.question.id !== question.id) {
      throw new Error("Canonical workspace did not preserve durable Question identity.");
    }
    return { workspace, runtimeRevision: stored.revision };
  }

  async listQuestions(input: {
    userId: string;
    organizationId: string;
    includeArchived?: boolean;
  }): Promise<ProductQuestionSummary[]> {
    const stored = await this.authorizedRuntime(input);
    const ids = [...new Set(productQuestionEvents(stored.runtime).map((event) => event.questionId))];
    return ids
      .map((questionId) => buildDurableProductQuestion({ runtime: stored.runtime, questionId }))
      .filter((question): question is NonNullable<typeof question> => Boolean(question))
      .filter((question) => input.includeArchived || question.status !== "archived")
      .map((question): ProductQuestionSummary => ({
        id: question.id,
        organizationId: question.organizationId,
        title: question.title,
        status: question.status,
        updatedAt: question.updatedAt,
        currentSupport: question.currentConfidence?.level ?? "no-answer",
        activeDecisionStatus: question.status === "monitoring"
          ? "monitoring"
          : question.currentDecisionId
            ? "committed"
            : "none",
        hasUnresolvedChange: question.improvementHistory.some((item) => item.completedAt === null),
      }))
      .sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt)
        || left.id.localeCompare(right.id)
      );
  }

  async createQuestion(input: {
    userId: string;
    organizationId: string;
    question: string;
    createdAt: string;
    idempotencyKey: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult> {
    const stored = await this.authorizedRuntime(input);
    const questionId = stableId(
      "product-question",
      input.organizationId,
      input.idempotencyKey,
    );
    const existing = buildDurableProductQuestion({ runtime: stored.runtime, questionId });
    if (existing) {
      return this.getQuestionWorkspace({ ...input, questionId });
    }
    const created = createDurableProductQuestion({
      runtime: stored.runtime,
      title: input.question,
      createdAt: input.createdAt,
      questionId,
    });
    const persisted = await this.replace({
      stored,
      runtime: created.runtime,
      operation: input.operation,
    });
    const workspace = buildProductQuestionWorkspace({
      runtime: persisted.runtime,
      question: created.question.title,
      questionId: created.question.id,
    });
    return { workspace, runtimeRevision: persisted.revision };
  }

  async contributeEvidence(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult> {
    const stored = await this.authorizedRuntime(input);
    const question = buildDurableProductQuestion({ runtime: stored.runtime, questionId: input.questionId });
    if (!question) throw new Error("Product Question was not found in this organization.");
    const marker = stableId("product-contribution", input.organizationId, input.contribution.idempotencyKey);
    const acceptedMarkers = new Set([
      marker,
      ...(input.contribution.priorIdempotencyKeys ?? []).map((key) =>
        stableId("product-contribution", input.organizationId, key)
      ),
    ]);
    if (stored.runtime.memory.events.some((event) =>
      event
      && typeof event === "object"
      && acceptedMarkers.has(String((event as { id?: unknown }).id ?? ""))
    )) return this.getQuestionWorkspace(input);
    const investigated = await this.dependencies.investigate({
      runtime: stored.runtime,
      question: question.title,
      contribution: input.contribution,
    });
    if (investigated.runtime.metadata.organizationId !== input.organizationId) {
      throw new Error("Investigation changed organization identity.");
    }
    let runtime = {
      ...investigated.runtime,
      memory: {
        ...investigated.runtime.memory,
        events: [
          ...investigated.runtime.memory.events,
          {
            id: marker,
            kind: "product-question-contribution",
            questionId: input.questionId,
            sourceId: input.contribution.sourceId,
            timestamp: input.contribution.contributedAt,
          },
        ],
      },
    };
    const workspace = buildProductQuestionWorkspace({
      runtime,
      question: question.title,
      questionId: question.id,
    });
    runtime = recordProductWorkspaceLifecycle({
      runtime,
      workspace,
      recordedAt: input.contribution.contributedAt,
    });
    const persisted = await this.replace({ stored, runtime, operation: input.operation });
    return {
      workspace: buildProductQuestionWorkspace({
        runtime: persisted.runtime,
        question: question.title,
        questionId: question.id,
      }),
      runtimeRevision: persisted.revision,
    };
  }

  async recordSearch(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    searchedAt: string;
    sourceIds: string[];
    scope: string;
    limitations: string[];
    changeProduced: boolean;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult> {
    const stored = await this.authorizedRuntime(input);
    const question = buildDurableProductQuestion({
      runtime: stored.runtime,
      questionId: input.questionId,
    });
    if (!question) throw new Error("Product Question was not found in this organization.");
    const searchId = stableId(
      "product-search",
      input.organizationId,
      input.questionId,
      input.searchedAt,
      ...input.sourceIds,
    );
    if (question.searchHistory.some((entry) => entry.id === searchId)) {
      return this.getQuestionWorkspace(input);
    }
    const runtime = appendProductQuestionEvent(
      stored.runtime,
      {
        type: "search_completed",
        questionId: input.questionId,
        organizationId: input.organizationId,
        occurredAt: input.searchedAt,
        search: {
          id: searchId,
          timestamp: input.searchedAt,
          scope: input.scope,
          sourceIds: [...input.sourceIds].sort(),
          limitations: [...input.limitations],
          changeProduced: input.changeProduced,
        },
      },
    );
    const persisted = await this.replace({ stored, runtime, operation: input.operation });
    return this.getQuestionWorkspace(input);
  }

  async createOrRefreshAnswer(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    operationId: string;
    occurredAt: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalAnswerRefreshResult> {
    const stored = await this.authorizedRuntime(input);
    const question = buildDurableProductQuestion({
      runtime: stored.runtime,
      questionId: input.questionId,
    });
    if (!question) throw new Error("Product Question was not found in this organization.");
    const workspace = buildProductQuestionWorkspace({
      runtime: stored.runtime,
      question: question.title,
      questionId: question.id,
    });
    const evidenceConsidered = workspace.latestSearchReceipt?.recordsConsidered ?? 0;
    const evidenceAdmitted = workspace.latestSearchReceipt?.evidenceAdmitted ?? 0;
    const recorded = recordProductAnswerEvaluation({
      runtime: stored.runtime,
      questionId: question.id,
      operationId: input.operationId,
      occurredAt: input.occurredAt,
      authorizationScopeRef: `organization:${input.organizationId}:question:${question.id}`,
      understandingRevisionRef:
        `organization:${input.organizationId}:understanding:${stored.runtime.metadata.investigationCount}`,
      evaluation: evaluationFromWorkspaceAnswer({
        answer: workspace.answer,
        evidenceConsidered,
        evidenceAdmitted,
      }),
      evidenceConsidered,
      evidenceAdmitted,
    });
    const changed = recorded.runtime !== stored.runtime;
    const persisted = changed
      ? await this.replace({
          stored,
          runtime: recorded.runtime,
          operation: input.operation,
        })
      : stored;
    return {
      result: recorded.result,
      receipt: recorded.receipt,
      runtimeRevision: persisted.revision,
    };
  }

  async getCurrentAnswer(input: {
    userId: string;
    organizationId: string;
    questionId: string;
  }): Promise<CanonicalAnswerReadResult> {
    const stored = await this.authorizedRuntime(input);
    if (!buildDurableProductQuestion({
      runtime: stored.runtime,
      questionId: input.questionId,
    })) {
      throw new Error("Product Question was not found in this organization.");
    }
    const current = currentProductAnswerVersion({
      runtime: stored.runtime,
      questionId: input.questionId,
    });
    return {
      answer: current
        ? projectProductAnswerVersion({
            version: current,
            currentAnswerVersionId: current.answerVersionId,
          })
        : null,
      runtimeRevision: stored.revision,
    };
  }

  async mutateUnknown(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    operationId: string;
    occurredAt: string;
    actorRef: string;
    candidate: ProductUnknownOperationInput["candidate"];
    transition: ProductUnknownOperationInput["transition"];
    reason: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalUnknownMutationResult> {
    const stored = await this.authorizedRuntime(input);
    const recorded = recordProductUnknownOperation({
      runtime: stored.runtime,
      questionId: input.questionId,
      operationId: input.operationId,
      occurredAt: input.occurredAt,
      actorRef: input.actorRef,
      authorizationScopeRef:
        `organization:${input.organizationId}:question:${input.questionId}`,
      candidate: input.candidate,
      transition: input.transition,
      reason: input.reason,
    });
    const persisted = recorded.runtime === stored.runtime
      ? stored
      : await this.replace({
          stored,
          runtime: recorded.runtime,
          operation: input.operation,
        });
    return {
      unknown: recorded.projection,
      receipt: recorded.receipt,
      runtimeRevision: persisted.revision,
    };
  }

  async listUnknowns(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    currentOnly?: boolean;
  }): Promise<CanonicalUnknownReadResult> {
    const stored = await this.authorizedRuntime(input);
    if (!buildDurableProductQuestion({ runtime: stored.runtime, questionId: input.questionId })) {
      throw new Error("Product Question was not found in this organization.");
    }
    return {
      unknowns: input.currentOnly === false
        ? listProductUnknowns({ runtime: stored.runtime, questionId: input.questionId })
        : listCurrentProductUnknowns({ runtime: stored.runtime, questionId: input.questionId }),
      runtimeRevision: stored.revision,
    };
  }

  async archiveQuestion(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    archivedAt: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult> {
    const stored = await this.authorizedRuntime(input);
    if (!buildDurableProductQuestion({ runtime: stored.runtime, questionId: input.questionId })) {
      throw new Error("Product Question was not found in this organization.");
    }
    const runtime = archiveProductQuestion({
      runtime: stored.runtime,
      questionId: input.questionId,
      archivedAt: input.archivedAt,
    });
    const persisted = await this.replace({ stored, runtime, operation: input.operation });
    return this.getQuestionWorkspace({ ...input, questionId: input.questionId });
  }

  async adoptLegacyQuestions(input: {
    userId: string;
    organizationId: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<{ receipts: ProductQuestionAdoptionReceipt[]; runtimeRevision: string }> {
    const stored = await this.authorizedRuntime(input);
    const adopted = adoptLegacyProductQuestions({ runtime: stored.runtime });
    const changed = JSON.stringify(adopted.runtime) !== JSON.stringify(stored.runtime);
    const persisted = changed
      ? await this.replace({ stored, runtime: adopted.runtime, operation: input.operation })
      : stored;
    return { receipts: adopted.receipts, runtimeRevision: persisted.revision };
  }
}
