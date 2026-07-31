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
import {
  generateConfidenceImprovementProposals,
  projectConfidenceImprovementCandidateEnvelope,
  recordConfidenceImprovementEvent,
  recordConfidenceImprovementOutcomeObservation,
  type ProductConfidenceImprovementEnvelopeContext,
  type ProductConfidenceImprovementOutcomeObservationInput,
  type ProductConfidenceImprovementProposal,
  type ProductConfidenceImprovementResult,
} from "../improvements";
import {
  evaluateObjectiveRecommendationEligibility as evaluateObjectiveEligibility,
  projectUnderstandingRecommendation,
  type ProductObjectiveContext,
  type ProductOptimizationContextInput,
  type ProductRecommendationSecondaryEffect,
} from "../recommendations";
import { adoptLegacyProductQuestions } from "./adoptLegacyQuestions";
import {
  recordOptimizationContextVersion,
  recordOrganizationalObjectiveVersion,
  resolveProductObjectiveContext,
  validateRuntimeObjectiveReferences,
  type ProductObjectiveAuthorityGrant,
  type ProductObjectiveReferenceValidation,
  type ProductObjectiveScope,
  type ProductOptimizationContext,
  type ProductOrganizationalObjective,
} from "../objectives";
import type {
  CanonicalEvidenceContribution,
  CanonicalAnswerReadResult,
  CanonicalAnswerRefreshResult,
  CanonicalInvestigationResult,
  CanonicalWorkspaceReadResult,
  CanonicalUnknownMutationResult,
  CanonicalUnknownReadResult,
  CanonicalImprovementProposalResult,
  CanonicalImprovementAuthorizationResult,
  CanonicalImprovementEnvelopeResult,
  CanonicalImprovementOutcomeResult,
  CanonicalUnderstandingRecommendationResult,
  CanonicalObjectiveRecommendationEligibilityResult,
  CanonicalObjectiveMutationResult,
  CanonicalOptimizationContextMutationResult,
  CanonicalObjectiveContextResolutionResult,
  ProductQuestionAdoptionReceipt,
  ProductQuestionSummary,
} from "./contracts";

export type CanonicalProductWorkspaceAdapterDependencies = {
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read" | "replace">;
  authorize(input: {
    userId: string;
    organizationId: string;
  }): Promise<boolean>;
  authorizeImprovementOperation?(input: {
    userId: string;
    organizationId: string;
    operation:
      | "candidate:project"
      | "choice:authorize"
      | "choice:decline"
      | "choice:defer"
      | "choice:correct"
      | "outcome:observe"
      | "outcome:correct";
  }): Promise<boolean>;
  investigate(input: {
    runtime: StoredOrganizationRuntime["runtime"];
    question: string;
    contribution: CanonicalEvidenceContribution;
  }): Promise<CanonicalInvestigationResult>;
  authorizeObjectiveScope?(input: {
    userId: string;
    organizationId: string;
    scope: ProductObjectiveScope;
    requestedAuthorityScopeRef: string;
    operation: "objective:create" | "objective:revise" | "context:create" | "context:revise" | "read";
  }): Promise<ProductObjectiveAuthorityGrant>;
  validateObjectiveReferences?(input: {
    userId: string;
    organizationId: string;
    objective?: ProductOrganizationalObjective;
    optimizationContext?: ProductOptimizationContext;
  }): Promise<ProductObjectiveReferenceValidation>;
};

type ProductImprovementAuthorizationOperation =
  | "candidate:project"
  | "choice:authorize"
  | "choice:decline"
  | "choice:defer"
  | "choice:correct"
  | "outcome:observe"
  | "outcome:correct";

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

  private async authorizedImprovementRuntime(input: {
    userId: string;
    organizationId: string;
    operation: ProductImprovementAuthorizationOperation;
  }): Promise<StoredOrganizationRuntime> {
    const generallyAuthorized = await this.dependencies.authorize(input);
    const operationAuthorized = this.dependencies.authorizeImprovementOperation
      ? await this.dependencies.authorizeImprovementOperation(input)
      : false;
    if (!generallyAuthorized || !operationAuthorized) throw new Error("Product improvement operation access denied.");
    const stored = await this.dependencies.runtimeRepository.read(input.organizationId);
    if (!stored || stored.runtime.metadata.organizationId !== input.organizationId) {
      throw new Error("Authorized Organization Runtime is missing or mismatched.");
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

  async generateImprovementProposals(input: {
    userId: string; organizationId: string; questionId: string; unknownId: string;
    candidates: ProductConfidenceImprovementProposal[];
    noSafeOperation?: Extract<ProductConfidenceImprovementResult, { kind: "no-safe-operation" }>;
  }): Promise<CanonicalImprovementProposalResult> {
    const stored = await this.authorizedRuntime(input);
    return {
      result: generateConfidenceImprovementProposals({
        runtime: stored.runtime, questionId: input.questionId, unknownId: input.unknownId,
        candidates: input.candidates, noSafeOperation: input.noSafeOperation,
      }),
      runtimeRevision: stored.revision,
    };
  }

  async getUnderstandingRecommendations(input: {
    userId: string; organizationId: string; questionId: string; unknownId: string;
    candidates: ProductConfidenceImprovementProposal[];
    noSafeOperation?: Extract<ProductConfidenceImprovementResult, { kind: "no-safe-operation" }>;
    secondaryEffects?: Record<string, ProductRecommendationSecondaryEffect[]>;
  }): Promise<CanonicalUnderstandingRecommendationResult> {
    const stored = await this.authorizedRuntime(input);
    const proposalResult = generateConfidenceImprovementProposals({
      runtime: stored.runtime,
      questionId: input.questionId,
      unknownId: input.unknownId,
      candidates: input.candidates,
      noSafeOperation: input.noSafeOperation,
    });
    if (proposalResult.kind === "no-safe-operation") {
      return { recommendations: [], proposalResult, runtimeRevision: stored.revision };
    }
    const unknown = listCurrentProductUnknowns({ runtime: stored.runtime, questionId: input.questionId })
      .find((item) => item.unknownId === input.unknownId);
    if (!unknown) throw new Error("Understanding Recommendation target Unknown is not current.");
    return {
      recommendations: proposalResult.proposals.map((proposal) =>
        projectUnderstandingRecommendation({
          proposal,
          unknown,
          secondaryEffects: input.secondaryEffects?.[proposal.proposalId],
        })
      ),
      proposalResult,
      runtimeRevision: stored.revision,
    };
  }

  async evaluateObjectiveRecommendationEligibility(input: {
    userId: string; organizationId: string; questionId: string;
    understandingRevisionRef: string;
    objectiveContext: ProductObjectiveContext;
    optimizationContext: ProductOptimizationContextInput | null;
  }): Promise<CanonicalObjectiveRecommendationEligibilityResult> {
    const stored = await this.authorizedRuntime(input);
    if (!buildDurableProductQuestion({ runtime: stored.runtime, questionId: input.questionId })) {
      throw new Error("Product Question was not found in this organization.");
    }
    return {
      eligibility: evaluateObjectiveEligibility({
        understandingRevisionRef: input.understandingRevisionRef,
        objectiveContext: input.objectiveContext,
        optimizationContext: input.optimizationContext,
      }),
      runtimeRevision: stored.revision,
    };
  }

  private async objectiveGrant(input: {
    userId: string;
    organizationId: string;
    scope: ProductObjectiveScope;
    requestedAuthorityScopeRef: string;
    operation: "objective:create" | "objective:revise" | "context:create" | "context:revise" | "read";
  }): Promise<ProductObjectiveAuthorityGrant> {
    if (!this.dependencies.authorizeObjectiveScope) throw new Error("Objective scope authority resolver is unavailable.");
    const grant = await this.dependencies.authorizeObjectiveScope(input);
    if (!grant.authorized) throw new Error("Objective scope authority denied.");
    return grant;
  }

  private async objectiveReferences(input: {
    userId: string;
    organizationId: string;
    objective?: ProductOrganizationalObjective;
    optimizationContext?: ProductOptimizationContext;
    runtime: StoredOrganizationRuntime["runtime"];
  }): Promise<ProductObjectiveReferenceValidation> {
    if (!this.dependencies.validateObjectiveReferences) throw new Error("Objective reference resolver is unavailable.");
    const runtimeValidation = validateRuntimeObjectiveReferences(input);
    const externalValidation = await this.dependencies.validateObjectiveReferences(input);
    const invalidRefs = [...new Set([...runtimeValidation.invalidRefs, ...externalValidation.invalidRefs])].sort();
    return { valid: runtimeValidation.valid && externalValidation.valid && invalidRefs.length === 0, invalidRefs };
  }

  async recordObjective(input: {
    userId: string;
    organizationId: string;
    objective: ProductOrganizationalObjective;
    expectedCurrentVersion: number | null;
    operationId: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalObjectiveMutationResult> {
    const stored = await this.authorizedRuntime(input);
    const requestedAuthorityScopeRef = input.objective.authority.authorityScopeRef
      ?? (input.objective.scope.kind === "organization" ? "organization" : JSON.stringify(input.objective.scope));
    const grant = await this.objectiveGrant({
      ...input, scope: input.objective.scope, requestedAuthorityScopeRef,
      operation: input.expectedCurrentVersion === null ? "objective:create" : "objective:revise",
    });
    const references = await this.objectiveReferences({ ...input, runtime: stored.runtime, objective: input.objective });
    const recorded = recordOrganizationalObjectiveVersion({
      runtime: stored.runtime, objective: input.objective,
      expectedCurrentVersion: input.expectedCurrentVersion, operationId: input.operationId,
      grant, references,
    });
    const persisted = recorded.runtime === stored.runtime ? stored : await this.replace({ stored, runtime: recorded.runtime, operation: input.operation });
    return { objective: input.objective, objectiveVersionRef: recorded.objectiveVersionRef, idempotent: recorded.idempotent, runtimeRevision: persisted.revision };
  }

  async recordOptimizationContext(input: {
    userId: string;
    organizationId: string;
    scope: ProductObjectiveScope;
    optimizationContext: ProductOptimizationContext;
    expectedCurrentVersion: number | null;
    operationId: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalOptimizationContextMutationResult> {
    const stored = await this.authorizedRuntime(input);
    const grant = await this.objectiveGrant({
      ...input, requestedAuthorityScopeRef: input.optimizationContext.authorityScopeRef,
      operation: input.expectedCurrentVersion === null ? "context:create" : "context:revise",
    });
    const references = await this.objectiveReferences({ ...input, runtime: stored.runtime, optimizationContext: input.optimizationContext });
    const recorded = recordOptimizationContextVersion({
      runtime: stored.runtime, context: input.optimizationContext,
      expectedCurrentVersion: input.expectedCurrentVersion, operationId: input.operationId,
      grant, references,
    });
    const persisted = recorded.runtime === stored.runtime ? stored : await this.replace({ stored, runtime: recorded.runtime, operation: input.operation });
    return { optimizationContext: input.optimizationContext, optimizationContextVersionRef: recorded.optimizationContextVersionRef, idempotent: recorded.idempotent, runtimeRevision: persisted.revision };
  }

  async resolveObjectiveContext(input: {
    userId: string;
    organizationId: string;
    scope: ProductObjectiveScope;
    evaluationAt: string;
    governanceProhibition?: string | null;
  }): Promise<CanonicalObjectiveContextResolutionResult> {
    const stored = await this.authorizedRuntime(input);
    await this.objectiveGrant({
      ...input,
      requestedAuthorityScopeRef: input.scope.kind === "organization" ? "organization" : JSON.stringify(input.scope),
      operation: "read",
    });
    return { resolution: resolveProductObjectiveContext({ runtime: stored.runtime, scope: input.scope, evaluationAt: input.evaluationAt, governanceProhibition: input.governanceProhibition }), runtimeRevision: stored.revision };
  }

  async authorizeImprovement(input: {
    userId: string; organizationId: string; questionId: string;
    proposal: ProductConfidenceImprovementProposal; operationId: string; occurredAt: string;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalImprovementAuthorizationResult> {
    const stored = await this.authorizedRuntime(input);
    const authorized = recordConfidenceImprovementEvent({
      runtime: stored.runtime, proposal: input.proposal,
      eventType: "improvement-authorized", operationId: input.operationId,
      actorRef: input.userId, occurredAt: input.occurredAt,
    });
    const unknown = listCurrentProductUnknowns({ runtime: authorized.runtime, questionId: input.questionId })
      .find(item => item.unknownId === input.proposal.unknownId);
    if (!unknown) throw new Error("Improvement target Unknown is not current.");
    const targeted = unknown.status === "targeted" ? null : recordProductUnknownOperation({
      runtime: authorized.runtime, questionId: input.questionId,
      operationId: `${input.operationId}:target-unknown`, occurredAt: input.occurredAt,
      actorRef: input.userId,
      authorizationScopeRef: `organization:${input.organizationId}:question:${input.questionId}`,
      candidate: {
        unknownId: unknown.unknownId, organizationId: unknown.organizationId,
        questionId: unknown.questionId, category: unknown.category, target: unknown.target,
        summary: unknown.summary, whyItMatters: unknown.whyItMatters,
        sourceAncestry: unknown.sourceAncestry,
      },
      transition: { type: "target", targetingOperationRef: input.proposal.proposalId },
      reason: "An authorized improvement proposal targets this exact Unknown.",
    });
    const runtime = targeted?.runtime ?? authorized.runtime;
    const persisted = runtime === stored.runtime ? stored : await this.replace({
      stored, runtime, operation: input.operation,
    });
    return {
      receipt: authorized.receipt,
      unknown: targeted?.projection ?? unknown,
      runtimeRevision: persisted.revision,
    };
  }

  async projectImprovementCandidateEnvelope(input: {
    userId: string; organizationId: string; questionId: string;
    proposal: ProductConfidenceImprovementProposal;
    context: ProductConfidenceImprovementEnvelopeContext;
  }): Promise<CanonicalImprovementEnvelopeResult> {
    const stored = await this.authorizedImprovementRuntime({ ...input, operation: "candidate:project" });
    if (input.proposal.questionId !== input.questionId) throw new Error("Improvement candidate Question scope mismatch.");
    return {
      envelope: projectConfidenceImprovementCandidateEnvelope({ runtime: stored.runtime, proposal: input.proposal, context: input.context }),
      runtimeRevision: stored.revision,
    };
  }

  async recordGovernedImprovementChoice(input: {
    userId: string; organizationId: string; questionId: string;
    proposal: ProductConfidenceImprovementProposal;
    context: ProductConfidenceImprovementEnvelopeContext;
    disposition: "authorized" | "declined" | "deferred";
    operationId: string;
    expectedCurrentEventVersion: number | null;
    occurredAt: string;
    reason?: string | null;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalImprovementAuthorizationResult> {
    const stored = await this.authorizedImprovementRuntime({
      ...input,
      operation: input.expectedCurrentEventVersion !== null
        ? "choice:correct"
        : input.disposition === "authorized" ? "choice:authorize" : input.disposition === "declined" ? "choice:decline" : "choice:defer",
    });
    const envelope = projectConfidenceImprovementCandidateEnvelope({ runtime: stored.runtime, proposal: input.proposal, context: input.context });
    const recorded = recordConfidenceImprovementEvent({
      runtime: stored.runtime,
      proposal: input.proposal,
      eventType: input.disposition === "authorized" ? "improvement-authorized" : input.disposition === "declined" ? "improvement-declined" : "improvement-deferred",
      operationId: input.operationId,
      actorRef: input.userId,
      occurredAt: input.occurredAt,
      reason: input.reason,
      candidateEnvelope: envelope,
      expectedCurrentEventVersion: input.expectedCurrentEventVersion,
    });
    const unknown = listCurrentProductUnknowns({ runtime: recorded.runtime, questionId: input.questionId })
      .find((item) => item.unknownId === input.proposal.unknownId);
    if (!unknown) throw new Error("Improvement target Unknown is not current.");
    const targeted = input.disposition === "authorized" && unknown.status !== "targeted" ? recordProductUnknownOperation({
      runtime: recorded.runtime, questionId: input.questionId,
      operationId: `${input.operationId}:target-unknown`, occurredAt: input.occurredAt,
      actorRef: input.userId,
      authorizationScopeRef: `organization:${input.organizationId}:question:${input.questionId}`,
      candidate: {
        unknownId: unknown.unknownId, organizationId: unknown.organizationId,
        questionId: unknown.questionId, category: unknown.category, target: unknown.target,
        summary: unknown.summary, whyItMatters: unknown.whyItMatters, sourceAncestry: unknown.sourceAncestry,
      },
      transition: { type: "target", targetingOperationRef: input.proposal.proposalId },
      reason: "An authorized governed improvement proposal targets this exact Unknown.",
    }) : null;
    const runtime = targeted?.runtime ?? recorded.runtime;
    const persisted = runtime === stored.runtime ? stored : await this.replace({ stored, runtime, operation: input.operation });
    return { receipt: recorded.receipt, unknown: targeted?.projection ?? unknown, runtimeRevision: persisted.revision };
  }

  async recordImprovementOutcomeObservation(input: {
    userId: string; organizationId: string;
    observation: ProductConfidenceImprovementOutcomeObservationInput;
    expectedCurrentVersion: number | null;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalImprovementOutcomeResult> {
    const stored = await this.authorizedImprovementRuntime({
      ...input,
      operation: input.expectedCurrentVersion === null ? "outcome:observe" : "outcome:correct",
    });
    const recorded = recordConfidenceImprovementOutcomeObservation({
      runtime: stored.runtime,
      observation: input.observation,
      expectedCurrentVersion: input.expectedCurrentVersion,
    });
    const persisted = recorded.runtime === stored.runtime ? stored : await this.replace({ stored, runtime: recorded.runtime, operation: input.operation });
    return { observation: recorded.observation, idempotent: recorded.idempotent, runtimeRevision: persisted.revision };
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
