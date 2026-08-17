import { createHash } from "node:crypto";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  canonicalScopeLineageDigest,
  createCanonicalEvidenceContributionOperationContext,
  validateCanonicalEvidenceContributionLineageEnvelope,
  type CanonicalEvidenceAdmissionOperationBatchV1,
} from "../../engine/v3/governance/canonicalScopeLineage";
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
  productConfidenceImprovementEvents,
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
  CanonicalEvidenceAdmissionPreflight,
  CanonicalEvidenceContributionMutationResultV1,
  CanonicalEvidenceContributionOperationRecordV1,
  CanonicalEvidenceContributionOperationResultV1,
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
import type { LeadershipConversationProductOperations } from "../workflow/leadershipConversation";
import type { CanonicalLeadershipConversationOwnerRouter } from "./canonicalLeadershipConversationOwnerRouter";
import {
  resolveCanonicalOrganizationalUnderstandingChange,
  validateCanonicalOrganizationalUnderstandingChangeOutcome,
  validateCanonicalOrganizationalUnderstandingChangeResult,
  type CanonicalOrganizationalUnderstandingChangeOutcomeV1,
} from "../../engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange";
import {
  assertCanonicalProductMaterializationCandidatePreflightIntegrityV1,
  assertCanonicalProductMaterializationInstructionIntegrityV1,
  type CanonicalProductMaterializationCandidatePreflightV1,
  type CanonicalProductMaterializationInstructionV1,
} from "../workflow/leadershipConversation/canonicalProductMaterializationContracts";

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
    operationContext?: import("../../engine/v3/governance/canonicalScopeLineage").CanonicalEvidenceContributionOperationContextV1;
    replayOnly?: boolean;
  }): Promise<CanonicalInvestigationResult>;
  evidenceContributionPurposeRef?(input:{organizationId:string;questionId:string}):string;
  preflightCanonicalEvidence?(input: {
    runtime: StoredOrganizationRuntime["runtime"];
    question: string;
    contribution: CanonicalEvidenceContribution;
  }): Promise<CanonicalEvidenceAdmissionPreflight>;
  resolveCandidateProductMaterializationInstruction?(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    runtimeRevisionBefore: string;
    candidateRuntime: StoredOrganizationRuntime["runtime"];
    candidateRuntimeStateDigest: string;
    operationRecord: Omit<CanonicalEvidenceContributionOperationRecordV1, "recordDigest" | "productMaterializationInstruction">;
    materializationContext: {
      conversationId: string;
      proposalId: string;
      targetProductWorkflowId: string;
      integrationReceiptId: string;
      routingLinkId: string;
      draftMaterialization: CanonicalProductMaterializationInstructionV1["draftMaterialization"];
    };
  }): Promise<{
    preflight: CanonicalProductMaterializationCandidatePreflightV1;
    instruction: CanonicalProductMaterializationInstructionV1;
  }>;
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
  leadershipConversation?: LeadershipConversationProductOperations;
  leadershipConversationOwnerRouter?: CanonicalLeadershipConversationOwnerRouter;
};

function canonicalReplayValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalReplayValue).sort().join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${key}:${canonicalReplayValue((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function canonicalOperationValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalOperationValue).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalOperationValue((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function operationDigest(value: unknown): string {
  return createHash("sha256").update(canonicalOperationValue(value)).digest("hex");
}

function normalizedContributionDigest(content: string): string {
  return operationDigest(content.normalize("NFKC").replace(/\s+/g, " ").trim());
}

function contributionIdentity(input: {
  organizationId: string;
  questionId: string;
  contribution: CanonicalEvidenceContribution;
}): { idempotencyKeyDigest: string; requestFingerprint: string; contributionOperationId: string } {
  const idempotencyKeyDigest = operationDigest(["canonical-evidence-contribution", input.contribution.idempotencyKey]);
  const requestFingerprint = operationDigest({contractVersion:"1",organizationId:input.organizationId,questionId:input.questionId,sourceId:input.contribution.sourceId,sourceType:input.contribution.sourceType,normalizedContentDigest:normalizedContributionDigest(input.contribution.content),contributedAt:input.contribution.contributedAt});
  return {idempotencyKeyDigest,requestFingerprint,contributionOperationId:`canonical-evidence-contribution-operation:v1:${operationDigest([input.organizationId,input.questionId,idempotencyKeyDigest,requestFingerprint])}`};
}

function operationRecord(value: unknown): CanonicalEvidenceContributionOperationRecordV1 | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate=value as Partial<CanonicalEvidenceContributionOperationRecordV1>;
  return candidate.kind==="canonical-evidence-contribution-operation"&&candidate.contractVersion==="1"?candidate as CanonicalEvidenceContributionOperationRecordV1:undefined;
}

function validateAdmissionBatch(batch: CanonicalEvidenceAdmissionOperationBatchV1, organizationId: string, runtime: StoredOrganizationRuntime["runtime"], previousRuntime?: StoredOrganizationRuntime["runtime"]): void {
  if(batch.contractVersion!=="1"||batch.organizationId!==organizationId)throw new Error("Canonical Evidence contribution result is invalid.");
  const {batchDigest,...unsigned}=batch;
  if(batchDigest!==canonicalScopeLineageDigest(unsigned))throw new Error("Canonical Evidence contribution result is invalid.");
  const evidenceIds=new Set<string>();const admissionIds=new Set<string>();const attributionIds=new Set<string>();const locals=new Set<string>();
  const index=runtime.memory.canonicalScopeLineageIndex;
  for(const item of batch.admissions){
    if(item.contractVersion!=="1"||evidenceIds.has(item.canonicalEvidenceId)||admissionIds.has(item.canonicalAdmissionId)||attributionIds.has(item.attributionId)||item.investigationEvidenceIds.length===0||item.sourceBindings.length===0)throw new Error("Canonical Evidence contribution result is invalid.");
    evidenceIds.add(item.canonicalEvidenceId);admissionIds.add(item.canonicalAdmissionId);attributionIds.add(item.attributionId);
    for(const localId of item.investigationEvidenceIds){if(locals.has(localId))throw new Error("Canonical Evidence contribution result is invalid.");locals.add(localId);}
    const attribution=index?.evidenceAttributions.find(value=>value.attributionId===item.attributionId);
    if(!attribution||attribution.organizationId!==organizationId||attribution.evidenceId!==item.canonicalEvidenceId||attribution.evidenceAdmissionId!==item.canonicalAdmissionId||attribution.attributionVersion!==item.attributionVersion||attribution.digest!==item.attributionDigest)throw new Error("Canonical Evidence contribution result is invalid.");
    const itemBindingIds=item.sourceBindings.map(value=>value.sourceBindingId);
    if(new Set(itemBindingIds).size!==itemBindingIds.length||canonicalOperationValue([...itemBindingIds].sort())!==canonicalOperationValue([...attribution.sourceBindingIds].sort()))throw new Error("Canonical Evidence contribution result is invalid.");
    for(const binding of item.sourceBindings){const retained=index?.sourceBindings.find(value=>value.bindingId===binding.sourceBindingId);if(!retained||retained.organizationId!==organizationId||retained.topologyId!==attribution.topologyId||retained.source.sourceId!==binding.sourceId||retained.source.sourceVersion!==binding.sourceVersion||retained.source.normalizedContentDigest!==binding.normalizedContentDigest)throw new Error("Canonical Evidence contribution result is invalid.");}
    if(previousRuntime){
      const priorAttributions=previousRuntime.memory.canonicalScopeLineageIndex?.evidenceAttributions??[];
      const expectedDisposition=priorAttributions.some(value=>value.attributionId===item.attributionId)
        ? "existing-attribution-replayed"
        : priorAttributions.some(value=>value.evidenceId===item.canonicalEvidenceId)
          ? "existing-evidence-new-provenance"
          : "new-canonical-evidence";
      if(item.disposition!==expectedDisposition)throw new Error("Canonical Evidence contribution result is invalid.");
    }
  }
  const expected=batch.admissions.length===0?"not-admitted":batch.admissionDisposition;
  if(expected!==batch.admissionDisposition)throw new Error("Canonical Evidence contribution result is invalid.");
}

function validateOperationRecord(record: CanonicalEvidenceContributionOperationRecordV1): void {
  const {recordDigest,...unsigned}=record;
  if(!record.lineageEnvelopeDigest||recordDigest!==operationDigest(unsigned))throw new Error("Canonical Evidence contribution replay is invalid.");
  if(record.canonicalUnderstandingChange){
    validateCanonicalOrganizationalUnderstandingChangeOutcome(record.canonicalUnderstandingChange);
  }
  if(record.canonicalUnderstandingChange?.status==="available"){
    validateCanonicalOrganizationalUnderstandingChangeResult(record.canonicalUnderstandingChange.result);
    if(record.canonicalUnderstandingChange.result.organizationId!==record.organizationId||record.canonicalUnderstandingChange.result.questionId!==record.questionId||record.canonicalUnderstandingChange.result.contributionOperationId!==record.contributionOperationId)throw new Error("Canonical Evidence contribution replay is invalid.");
  }
  if(record.productMaterializationInstruction){
    assertCanonicalProductMaterializationInstructionIntegrityV1(record.productMaterializationInstruction);
    if(record.productMaterializationInstruction.organizationId!==record.organizationId||record.productMaterializationInstruction.questionId!==record.questionId||record.productMaterializationInstruction.canonicalOperationId!==record.contributionOperationId||record.productMaterializationInstruction.requestFingerprint!==record.requestFingerprint)throw new Error("Canonical Product materialization instruction replay is invalid.");
  }
}

function historicalChangeOutcome():CanonicalOrganizationalUnderstandingChangeOutcomeV1{
  return {status:"unavailable",reason:"historical-operation-result-unavailable"};
}

function validatePreflight(
  preflight: CanonicalEvidenceAdmissionPreflight,
  organizationId: string,
  runtime: StoredOrganizationRuntime["runtime"],
): void {
  const currentIndex=runtime.memory.canonicalScopeLineageIndex;
  const sourceBindings=[...new Map([...(currentIndex?.sourceBindings??[]),...preflight.sourceBindings].map(value=>[value.bindingId,value])).values()];
  const evidenceAttributions=[...new Map([...(currentIndex?.evidenceAttributions??[]),...preflight.evidenceAttributions].map(value=>[value.attributionId,value])).values()];
  const prospectiveRuntime={
    ...runtime,
    memory:{
      ...runtime.memory,
      canonicalScopeLineageIndex:{
        kind:"canonical-scope-lineage-index" as const,
        schemaVersion:"1" as const,
        organizationId,
        topologyId:preflight.topology.topologyId,
        sourceBindings,
        evidenceAttributions,
        derivedLineages:runtime.memory.canonicalScopeLineageIndex?.derivedLineages??[],
        digest:preflight.digest,
      },
    },
  };
  validateAdmissionBatch(preflight.operationBatch,organizationId,prospectiveRuntime,runtime);
}

function hasPriorQuestionSupport(
  records:readonly CanonicalEvidenceContributionOperationRecordV1[],
  runtime:StoredOrganizationRuntime["runtime"],
  organizationId:string,
  questionId:string,
  batch:CanonicalEvidenceAdmissionOperationBatchV1,
):boolean{
  const supported=new Map<string,string>();
  for(const record of records.filter(value=>value.organizationId===organizationId&&value.questionId===questionId)){
    validateOperationRecord(record);
    validateAdmissionBatch(record.canonicalAdmissionBatch,organizationId,runtime);
    for(const item of record.canonicalAdmissionBatch.admissions)supported.set(item.attributionId,canonicalOperationValue({canonicalEvidenceId:item.canonicalEvidenceId,canonicalAdmissionId:item.canonicalAdmissionId,attributionId:item.attributionId,sourceBindings:item.sourceBindings}));
  }
  return batch.admissions.every(item=>supported.get(item.attributionId)===canonicalOperationValue({canonicalEvidenceId:item.canonicalEvidenceId,canonicalAdmissionId:item.canonicalAdmissionId,attributionId:item.attributionId,sourceBindings:item.sourceBindings}));
}

function governedChoiceContextMatches(input: {
  proposal: ProductConfidenceImprovementProposal;
  context: ProductConfidenceImprovementEnvelopeContext;
  envelope: ReturnType<typeof projectConfidenceImprovementCandidateEnvelope>;
}): boolean {
  const { proposal, context, envelope } = input;
  const expectedLineage = [...new Set([`proposal:${proposal.proposalId}`, `unknown:${proposal.unknownRevisionRef}`, ...context.lineage])].sort();
  return envelope.actionOwner.authorityRef === context.authorityRef
    && envelope.objectiveVersionRef === context.objectiveVersionRef
    && envelope.optimizationContextVersionRef === context.optimizationContextVersionRef
    && envelope.expectedInformationClass === context.expectedInformationClass
    && envelope.candidate.eligibility.authorizationSatisfied === context.authorizationSatisfied
    && envelope.candidate.eligibility.governanceAllowed === context.governanceAllowed
    && envelope.candidate.eligibility.consentState === context.consentState
    && envelope.candidate.eligibility.targetAccessible === context.targetAccessible
    && envelope.candidate.eligibility.executionAvailable === context.executionAvailable
    && envelope.candidate.eligibility.ownerAvailable === context.ownerAvailable
    && canonicalReplayValue(envelope.candidate.expectedOrganizationalRelevance) === canonicalReplayValue(context.expectedOrganizationalRelevance)
    && canonicalReplayValue(envelope.relevanceToUnknown) === canonicalReplayValue(context.relevanceToUnknown)
    && canonicalReplayValue(envelope.candidate.reliability) === canonicalReplayValue(context.reliability)
    && canonicalReplayValue(envelope.candidate.existingEvidenceQuality) === canonicalReplayValue(context.existingEvidenceQuality)
    && canonicalReplayValue(envelope.candidate.cost) === canonicalReplayValue(context.directCost)
    && canonicalReplayValue(envelope.candidate.reversibility) === canonicalReplayValue(context.reversibility)
    && canonicalReplayValue(envelope.organizationalBurden) === canonicalReplayValue(context.organizationalBurden)
    && canonicalReplayValue(envelope.requiredSourceAccess) === canonicalReplayValue(context.requiredSourceAccess)
    && canonicalReplayValue(envelope.privacyConstraints) === canonicalReplayValue(context.privacyConstraints)
    && canonicalReplayValue(envelope.cancellation) === canonicalReplayValue(context.cancellation)
    && canonicalReplayValue(envelope.resourceConstraintRefs) === canonicalReplayValue(context.resourceConstraintRefs)
    && canonicalReplayValue(envelope.governanceContextRefs) === canonicalReplayValue(context.governanceContextRefs)
    && canonicalReplayValue(envelope.assumptions) === canonicalReplayValue(context.assumptions)
    && canonicalReplayValue(envelope.lineage) === canonicalReplayValue(expectedLineage)
    && envelope.candidate.stoppingCondition === context.stoppingCondition
    && canonicalReplayValue(envelope.candidate.expectedEvidenceLineage) === canonicalReplayValue(context.expectedEvidenceLineage)
    && canonicalReplayValue(envelope.candidate.materialEffectTargets) === canonicalReplayValue(context.materialEffectTargets)
    && envelope.projectedAt === context.projectedAt;
}

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

  private leadership(): LeadershipConversationProductOperations {
    if (!this.dependencies.leadershipConversation) throw new Error("Leadership Conversation operations are unavailable.");
    return this.dependencies.leadershipConversation;
  }

  private leadershipRouter(): CanonicalLeadershipConversationOwnerRouter {
    if (!this.dependencies.leadershipConversationOwnerRouter) {
      throw new Error("Leadership Conversation canonical owner router is unavailable.");
    }
    return this.dependencies.leadershipConversationOwnerRouter;
  }

  getLeadershipConversationWorkspace(input: Parameters<LeadershipConversationProductOperations["workspace"]>[0]) { return this.leadership().workspace(input); }
  recordLeadershipConversationContext(input: Parameters<LeadershipConversationProductOperations["recordContext"]>[0]) { return this.leadership().recordContext(input); }
  createPreparedWorkProductVersion(input: Parameters<LeadershipConversationProductOperations["recordPreparation"]>[0]) { return this.leadership().recordPreparation(input); }
  freezePreparedWorkProduct(input: Parameters<LeadershipConversationProductOperations["freeze"]>[0]) { return this.leadership().freeze(input); }
  receiveLeadershipConversationUpload(input: Parameters<LeadershipConversationProductOperations["receiveUpload"]>[0]) { return this.leadership().receiveUpload(input); }
  generateLeadershipConversationProposals(input: Parameters<LeadershipConversationProductOperations["generateFixtureProposals"]>[0]) { return this.leadership().generateFixtureProposals(input); }
  recordTakeawayProposalDisposition(input: Parameters<LeadershipConversationProductOperations["review"]>[0]) { return this.leadership().review(input); }
  routeApprovedTakeawayProposal(input: Parameters<CanonicalLeadershipConversationOwnerRouter["routeApproved"]>[0]) { return this.leadershipRouter().routeApproved(input); }
  prepareNextLeadershipConversation(input: Parameters<LeadershipConversationProductOperations["linkFuturePreparation"]>[0]) { return this.leadership().linkFuturePreparation(input); }
  resetLeadershipConversationDevelopmentScenario(input: Parameters<LeadershipConversationProductOperations["reset"]>[0]) { return this.leadership().reset(input); }

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
      if (existing.title !== input.question.trim()) {
        throw new Error("Product Question idempotency conflict.");
      }
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

  private async contributeEvidenceMutation(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: RuntimeStorageOperationMetadata;
    materializationContext?: Parameters<NonNullable<CanonicalProductWorkspaceAdapterDependencies["resolveCandidateProductMaterializationInstruction"]>>[0]["materializationContext"];
  }, requireCanonicalResult: boolean, requireMaterializationInstruction = false): Promise<CanonicalWorkspaceReadResult | CanonicalEvidenceContributionMutationResultV1> {
    const stored = await this.authorizedRuntime(input);
    const question = buildDurableProductQuestion({ runtime: stored.runtime, questionId: input.questionId });
    if (!question) throw new Error("Product Question was not found in this organization.");
    const identity=contributionIdentity(input);
    const operationContext=createCanonicalEvidenceContributionOperationContext({contributionOperationId:identity.contributionOperationId,organizationId:input.organizationId,questionId:input.questionId,purposeRef:this.dependencies.evidenceContributionPurposeRef?.(input)??`product-question:${input.questionId}`,requestFingerprint:identity.requestFingerprint,idempotencyKeyDigest:identity.idempotencyKeyDigest});
    const marker = stableId("product-contribution", input.organizationId, input.contribution.idempotencyKey);
    const acceptedMarkers = new Set([
      marker,
      ...(input.contribution.priorIdempotencyKeys ?? []).map((key) =>
        stableId("product-contribution", input.organizationId, key)
      ),
    ]);
    const records=stored.runtime.memory.events.map(operationRecord).filter((value):value is CanonicalEvidenceContributionOperationRecordV1=>Boolean(value));
    const acceptedKeyDigests=new Set([identity.idempotencyKeyDigest,...(input.contribution.priorIdempotencyKeys??[]).map(key=>operationDigest(["canonical-evidence-contribution",key]))]);
    const replayRecord=records.find(record=>acceptedKeyDigests.has(record.idempotencyKeyDigest));
    if(replayRecord){
      validateOperationRecord(replayRecord);
      if(replayRecord.organizationId!==input.organizationId||replayRecord.questionId!==input.questionId||replayRecord.requestFingerprint!==identity.requestFingerprint)throw new Error("Canonical Evidence contribution replay conflicts with the request.");
      validateAdmissionBatch(replayRecord.canonicalAdmissionBatch,input.organizationId,stored.runtime);
      const workspace=buildProductQuestionWorkspace({runtime:stored.runtime,question:question.title,questionId:question.id});
      const contributionResult:CanonicalEvidenceContributionOperationResultV1={contractVersion:"1",organizationId:input.organizationId,questionId:input.questionId,contributionOperationId:replayRecord.contributionOperationId,operationDisposition:"idempotent-replay",cognitionDisposition:"exact-operation-replay",admissions:replayRecord.canonicalAdmissionBatch.admissions,evidenceAccepted:replayRecord.evidenceAccepted,runtimeRevisionBefore:stored.revision,runtimeRevisionAfter:stored.revision,productQuestionRevisionBefore:replayRecord.productQuestionRevisionBefore,productQuestionRevisionAfter:replayRecord.productQuestionRevisionAfter,canonicalUnderstandingChange:replayRecord.canonicalUnderstandingChange??historicalChangeOutcome(),canonicalResultDigest:replayRecord.recordDigest};
      if(requireMaterializationInstruction&&!replayRecord.productMaterializationInstruction)throw new Error("Canonical Product materialization instruction is unavailable for replay.");
      return requireCanonicalResult?{workspace,runtimeRevision:stored.revision,contributionResult,...(replayRecord.productMaterializationInstruction?{productMaterializationInstruction:replayRecord.productMaterializationInstruction}:{})}:{workspace,runtimeRevision:stored.revision};
    }
    if(records.some(record=>record.idempotencyKeyDigest===identity.idempotencyKeyDigest))throw new Error("Canonical Evidence contribution replay conflicts with the request.");
    if (stored.runtime.memory.events.some((event) =>
      event
      && typeof event === "object"
      && acceptedMarkers.has(String((event as { id?: unknown }).id ?? ""))
    )) {
      if(requireCanonicalResult)throw new Error("Canonical Evidence contribution result is unavailable for a legacy replay.");
      return this.getQuestionWorkspace(input);
    }
    if(requireCanonicalResult&&!this.dependencies.preflightCanonicalEvidence)throw new Error("Canonical Evidence admission preflight is unavailable.");
    const preflight=this.dependencies.preflightCanonicalEvidence?await this.dependencies.preflightCanonicalEvidence({runtime:stored.runtime,question:question.title,contribution:input.contribution}):undefined;
    if(preflight)validatePreflight(preflight,input.organizationId,stored.runtime);
    const replayOnly=Boolean(preflight
      &&preflight.operationBatch.admissions.length>0
      &&preflight.operationBatch.admissions.every(item=>item.disposition==="existing-attribution-replayed")
      &&hasPriorQuestionSupport(records,stored.runtime,input.organizationId,input.questionId,preflight.operationBatch));
    const investigated = await this.dependencies.investigate({
          runtime: stored.runtime,
          question: question.title,
          contribution: input.contribution,
          operationContext,
          replayOnly,
        });
    if (investigated.runtime.metadata.organizationId !== input.organizationId) {
      throw new Error("Investigation changed organization identity.");
    }
    const batch=investigated.canonicalEvidenceAdmissionBatch;
    const lineageEnvelope=investigated.canonicalEvidenceLineageEnvelope;
    if(requireCanonicalResult&&!batch)throw new Error("Canonical Evidence contribution result is unavailable.");
    if(requireCanonicalResult&&!lineageEnvelope)throw new Error("Canonical Evidence contribution lineage commitment is unavailable.");
    if(lineageEnvelope)validateCanonicalEvidenceContributionLineageEnvelope({envelope:lineageEnvelope,context:operationContext});
    if(batch)validateAdmissionBatch(batch,input.organizationId,investigated.runtime,stored.runtime);
    if(preflight&&canonicalOperationValue(preflight.operationBatch)!==canonicalOperationValue(batch))throw new Error("Canonical Evidence admission preflight changed during execution.");
    if(replayOnly){
      const executionPreflight=await this.dependencies.preflightCanonicalEvidence!({runtime:stored.runtime,question:question.title,contribution:input.contribution});
      validatePreflight(executionPreflight,input.organizationId,stored.runtime);
      if(canonicalOperationValue(executionPreflight)!==canonicalOperationValue(preflight))throw new Error("Canonical Evidence admission preflight changed during execution.");
    }
    const batchForRecord=batch;
    let record:CanonicalEvidenceContributionOperationRecordV1|undefined;
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
    const resultingQuestion=buildDurableProductQuestion({runtime,questionId:question.id});
    if(!resultingQuestion)throw new Error("Investigation removed Product Question identity.");
    const cognitionDisposition=replayOnly?"no-new-canonical-input" as const:"executed" as const;
    const canonicalUnderstandingChange=resolveCanonicalOrganizationalUnderstandingChange({organizationId:input.organizationId,questionId:input.questionId,contributionOperationId:identity.contributionOperationId,beforeCompositions:stored.runtime.memory.organizationalUnderstandingState?.canonicalCompositions,afterCompositions:runtime.memory.organizationalUnderstandingState?.canonicalCompositions});
    const recordBase=batchForRecord&&lineageEnvelope?{kind:"canonical-evidence-contribution-operation" as const,contractVersion:"1" as const,organizationId:input.organizationId,questionId:input.questionId,contributionOperationId:identity.contributionOperationId,idempotencyKeyDigest:identity.idempotencyKeyDigest,requestFingerprint:identity.requestFingerprint,canonicalAdmissionBatch:batchForRecord,lineageEnvelopeDigest:lineageEnvelope.envelopeDigest,cognitionDisposition,evidenceAccepted:investigated.evidenceAccepted,productQuestionRevisionBefore:question.revision,productQuestionRevisionAfter:resultingQuestion.revision,canonicalUnderstandingChange,recordedAt:input.contribution.contributedAt}:undefined;
    let materializationInstruction:CanonicalProductMaterializationInstructionV1|undefined;
    if(requireMaterializationInstruction){
      if(!recordBase||!this.dependencies.resolveCandidateProductMaterializationInstruction)throw new Error("Canonical Product materialization preflight is unavailable.");
      if(!input.materializationContext)throw new Error("Canonical Product materialization context is unavailable.");
      const resolved=await this.dependencies.resolveCandidateProductMaterializationInstruction({userId:input.userId,organizationId:input.organizationId,questionId:input.questionId,runtimeRevisionBefore:stored.revision,candidateRuntime:runtime,candidateRuntimeStateDigest:operationDigest(runtime),operationRecord:recordBase,materializationContext:input.materializationContext});
      assertCanonicalProductMaterializationCandidatePreflightIntegrityV1(resolved.preflight);
      assertCanonicalProductMaterializationInstructionIntegrityV1(resolved.instruction);
      if(resolved.preflight.disposition!=="approved"||resolved.preflight.organizationId!==input.organizationId||resolved.preflight.questionId!==input.questionId||resolved.preflight.expectedRuntimeRevision!==stored.revision)throw new Error("Canonical Product materialization preflight was rejected.");
      if(resolved.instruction.organizationId!==input.organizationId||resolved.instruction.questionId!==input.questionId||resolved.instruction.canonicalOperationId!==identity.contributionOperationId||resolved.instruction.requestFingerprint!==identity.requestFingerprint||resolved.instruction.idempotencyKeyDigest!==identity.idempotencyKeyDigest||resolved.instruction.expectedRuntimeRevision!==stored.revision||resolved.instruction.committedRuntimeStateDigest!==operationDigest(runtime))throw new Error("Canonical Product materialization instruction conflicts with the candidate mutation.");
      materializationInstruction=resolved.instruction;
    }
    const recordUnsigned=recordBase?{...recordBase,...(materializationInstruction?{productMaterializationInstruction:materializationInstruction}:{})}:undefined;
    record=recordUnsigned?{...recordUnsigned,recordDigest:operationDigest(recordUnsigned)}:undefined;
    if(record)runtime={...runtime,memory:{...runtime.memory,events:[...runtime.memory.events,record]}};
    const persisted = await this.replace({ stored, runtime, operation: input.operation });
    const persistedWorkspace=buildProductQuestionWorkspace({
        runtime: persisted.runtime,
        question: question.title,
        questionId: question.id,
      });
    if(!requireCanonicalResult)return {workspace:persistedWorkspace,runtimeRevision:persisted.revision};
    if(!record||!batch)throw new Error("Canonical Evidence contribution result is unavailable.");
    const persistedRecord=persisted.runtime.memory.events.map(operationRecord).find(value=>value?.contributionOperationId===record.contributionOperationId);
    if(!persistedRecord)throw new Error("Canonical Evidence contribution result was not persisted.");
    if(!persistedRecord.canonicalUnderstandingChange)throw new Error("Canonical Evidence contribution change result was not persisted.");
    validateOperationRecord(persistedRecord);validateAdmissionBatch(batch,input.organizationId,persisted.runtime,stored.runtime);
    const contributionResult:CanonicalEvidenceContributionOperationResultV1={contractVersion:"1",organizationId:input.organizationId,questionId:input.questionId,contributionOperationId:identity.contributionOperationId,operationDisposition:batch.admissionDisposition,cognitionDisposition,admissions:batch.admissions,evidenceAccepted:investigated.evidenceAccepted,runtimeRevisionBefore:stored.revision,runtimeRevisionAfter:persisted.revision,productQuestionRevisionBefore:question.revision,productQuestionRevisionAfter:persistedWorkspace.question.revision,canonicalUnderstandingChange:persistedRecord.canonicalUnderstandingChange,canonicalResultDigest:record.recordDigest};
    return {workspace:persistedWorkspace,runtimeRevision:persisted.revision,contributionResult,...(persistedRecord.productMaterializationInstruction?{productMaterializationInstruction:persistedRecord.productMaterializationInstruction}:{})};
  }

  async contributeEvidence(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalWorkspaceReadResult> {
    return this.contributeEvidenceMutation(input,false) as Promise<CanonicalWorkspaceReadResult>;
  }

  async contributeEvidenceWithCanonicalResult(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: RuntimeStorageOperationMetadata;
  }): Promise<CanonicalEvidenceContributionMutationResultV1> {
    return this.contributeEvidenceMutation(input,true) as Promise<CanonicalEvidenceContributionMutationResultV1>;
  }

  async contributeEvidenceWithCanonicalMaterializationInstruction(input: {
    userId: string;
    organizationId: string;
    questionId: string;
    contribution: CanonicalEvidenceContribution;
    operation: RuntimeStorageOperationMetadata;
    materializationContext: Parameters<NonNullable<CanonicalProductWorkspaceAdapterDependencies["resolveCandidateProductMaterializationInstruction"]>>[0]["materializationContext"];
  }): Promise<CanonicalEvidenceContributionMutationResultV1 & { productMaterializationInstruction: CanonicalProductMaterializationInstructionV1 }> {
    const result=await this.contributeEvidenceMutation(input,true,true) as CanonicalEvidenceContributionMutationResultV1;
    if(!result.productMaterializationInstruction)throw new Error("Canonical Product materialization instruction was not persisted.");
    return {...result,productMaterializationInstruction:result.productMaterializationInstruction};
  }

  async findCanonicalEvidenceContributionOperation(input:{organizationId:string;contributionOperationId:string}):Promise<CanonicalEvidenceContributionOperationRecordV1|null>{
    const stored=await this.dependencies.runtimeRepository.read(input.organizationId);
    if(!stored)return null;
    const record=stored.runtime.memory.events.map(operationRecord).find(value=>value?.contributionOperationId===input.contributionOperationId)??null;
    if(record)validateOperationRecord(record);
    return record?structuredClone(record):null;
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
    const existingOperation = input.expectedCurrentEventVersion === null
      ? productConfidenceImprovementEvents(stored.runtime).find((event) =>
          event.schemaVersion === "3" && event.operationId === input.operationId)
      : undefined;
    const expectedEventType = input.disposition === "authorized"
      ? "improvement-authorized"
      : input.disposition === "declined"
        ? "improvement-declined"
        : "improvement-deferred";
    if (existingOperation?.schemaVersion === "3" && (
      existingOperation.actorRef !== input.userId
      || existingOperation.eventType !== expectedEventType
      || existingOperation.occurredAt !== input.occurredAt
      || existingOperation.reason !== (input.reason ?? null)
    )) {
      throw new Error("Improvement operation replay payload changed.");
    }
    if (existingOperation?.schemaVersion === "3" && !governedChoiceContextMatches({ proposal: input.proposal, context: input.context, envelope: existingOperation.candidateEnvelope })) {
      throw new Error("Improvement operation replay context changed.");
    }
    const envelope = existingOperation?.schemaVersion === "3"
      ? existingOperation.candidateEnvelope
      : projectConfidenceImprovementCandidateEnvelope({ runtime: stored.runtime, proposal: input.proposal, context: input.context });
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
