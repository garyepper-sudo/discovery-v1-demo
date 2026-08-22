import { createHash } from "node:crypto";

import type { ScopedGovernanceContext } from "../governance/scopedGovernanceContext";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
} from "../runtime/organizationRuntimeRepository";
import type {
  CanonicalUnderstandingCompositionEvaluationOperationV1,
  CanonicalUnderstandingCompositionEvaluationReceiptV1,
  CanonicalUnderstandingRevisionOperationRecordV1,
} from "../runtime/organizationalUnderstandingState";
import { validateCanonicalExplanationGovernanceLineage } from "../model/judgment/completeOrganizationalExplanations";
import {
  createCanonicalEvidenceContributionLineageEnvelope,
  createCanonicalEvidenceContributionOperationContext,
  validateCanonicalEvidenceAdmissionOperationBatch,
} from "../governance/canonicalScopeLineage";
import type {
  CanonicalUnderstandingComposition,
  CanonicalUnderstandingEpistemicRevisionV1,
} from "./buildCanonicalUnderstandingCompatibilityShadow";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
  canonicalUnderstandingExplanationSetDigest,
} from "./buildCanonicalUnderstandingCompatibilityShadow";

export const CANONICAL_UNDERSTANDING_REVISION_OPERATION =
  "organizational-understanding:revise-confidence-uncertainty" as const;
export const CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION =
  "organizational-understanding:evaluate-explanation-support" as const;

export type EvaluateCanonicalUnderstandingCompositionRequestV1 = {
  contractVersion: "1"; organizationId: string; questionId: string; seriesId: string; occurrenceId: string;
  contributionOperationId: string; purpose: string;
  sensitivity: "standard" | "restricted" | "private"; actorRef: string;
  occurredAt: string; idempotencyKey: string; expectedRuntimeRevision: string;
  authorization: ScopedGovernanceContext; operation: RuntimeStorageOperationMetadata;
};

export type CanonicalUnderstandingEvaluationMaterializationLinkageV1 = {
  seriesId: string;
  occurrenceId: string;
  contributionOperationId: string;
  instructionDigest: string;
  receiptId: string;
  receiptDigest: string;
  sourceContentVersions: Array<{
    sourceBindingId: string;
    sourceContentVersionId: string;
    normalizedContentDigest: string;
  }>;
};

export type ReviseCanonicalUnderstandingConfidenceRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  stableUnderstandingId: string;
  expectedPredecessorRevisionId: string;
  confidence: number | null;
  uncertainty: string[];
  supportingMaterialRefs: string[];
  contradictingMaterialRefs: string[];
  interpretationVersion: string;
  purpose: string;
  sensitivity: "standard" | "restricted" | "private";
  actorRef: string;
  occurredAt: string;
  idempotencyKey: string;
  expectedRuntimeRevision: string;
  authorization: ScopedGovernanceContext;
  operation: RuntimeStorageOperationMetadata;
};

export type CanonicalUnderstandingRevisionReceiptV1 = {
  contractVersion: "1";
  operationId: string;
  organizationId: string;
  questionId: string;
  stableUnderstandingId: string;
  predecessorRevisionId: string;
  revisionId: string;
  conclusionRevisionId: string;
  changeType: "confidence" | "uncertainty" | "confidence-and-uncertainty";
  authorityRefs: string[];
  policyRefs: string[];
  idempotencyKeyDigest: string;
  requestFingerprint: string;
  eventId: string;
  runtimeRevisionBefore: string;
  runtimeRevisionAfter: string;
  occurredAt: string;
  receiptDigest: string;
};

const stable = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
          .join(",")}}`
      : JSON.stringify(value);
const digest = (value: unknown): string =>
  createHash("sha256").update(stable(value)).digest("hex");
const unique = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));
const exact = (value: string): boolean =>
  value.trim() === value && value.length > 0 && value !== "*";
const deny = (): never => {
  throw new Error("Canonical Organizational Understanding revision denied.");
};

function currentRevision(composition: CanonicalUnderstandingComposition) {
  return composition.epistemicRevisions?.find(
    (item) => item.revisionId === composition.currentEpistemicRevisionId,
  );
}

export class CanonicalOrganizationalUnderstandingRevisionService {
  constructor(
    private readonly repository: Pick<OrganizationRuntimeRepository, "read" | "replace">,
    private readonly clock: { now(): string },
    private readonly evaluationLineage?: {
      validateMaterializationInstruction(input: unknown): void;
      resolveCurrent(input: {
        organizationId: string; questionId: string; seriesId: string; occurrenceId: string;
        contributionOperationId: string; purpose: string; evaluatedAt: string; actorRef:string;
      }): Promise<CanonicalUnderstandingEvaluationMaterializationLinkageV1 | null>;
    },
  ) {}

  async evaluateComposition(request: EvaluateCanonicalUnderstandingCompositionRequestV1): Promise<{
    receipt: CanonicalUnderstandingCompositionEvaluationReceiptV1; idempotent: boolean;
  } | { disposition: "insufficient"; receipt: null; idempotent: false }> {
    const auth = request.authorization;
    const allowedRequestKeys = new Set(["contractVersion", "organizationId", "questionId",
      "seriesId", "occurrenceId", "contributionOperationId", "purpose",
      "sensitivity", "actorRef", "occurredAt", "idempotencyKey", "expectedRuntimeRevision",
      "authorization", "operation"]);
    if (Object.keys(request).some((key) => !allowedRequestKeys.has(key)) || request.contractVersion !== "1" ||
      ![request.organizationId, request.questionId, request.seriesId, request.occurrenceId,
        request.contributionOperationId, request.purpose,
        request.actorRef, request.idempotencyKey, request.expectedRuntimeRevision].every(exact) ||
      request.occurredAt !== this.clock.now() || !Number.isFinite(Date.parse(request.occurredAt)) ||
      auth.disposition !== "authorized" || auth.operation !== CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION ||
      auth.organizationId !== request.organizationId || auth.subjectId !== request.actorRef ||
      auth.purpose !== request.purpose || auth.sensitivity !== request.sensitivity ||
      auth.evaluatedAt !== request.occurredAt || auth.temporal.mode !== "current" ||
      auth.requestedScope.organizationId !== request.organizationId ||
      auth.authorityRefs.length === 0 || auth.policyRefs.length === 0 ||
      request.operation.requestId !== request.idempotencyKey || request.operation.operatorId !== request.actorRef) deny();
    const evaluationLineage = this.evaluationLineage;
    if (!evaluationLineage) throw new Error("Canonical Organizational Understanding revision denied.");
    const keyDigest = digest(["canonical-understanding-composition-evaluation", request.idempotencyKey]);
    const requestFingerprint = digest({ organizationId: request.organizationId, questionId: request.questionId,
      seriesId: request.seriesId, occurrenceId: request.occurrenceId,
      contributionOperationId: request.contributionOperationId, purpose: request.purpose, sensitivity: request.sensitivity,
      actorRef: request.actorRef, occurredAt: request.occurredAt,
      authorityRefs: unique(auth.authorityRefs), policyRefs: unique(auth.policyRefs), governanceContextId: auth.contextId });
    const stored = await this.repository.read(request.organizationId);
    if (!stored) throw new Error("Canonical Organizational Understanding revision denied.");
    const currentRuntime = stored;
    const state = currentRuntime.runtime.memory.organizationalUnderstandingState;
    const operations = state.canonicalCompositionEvaluationOperations ?? [];
    const prior = operations.find((item) => item.idempotencyKeyDigest === keyDigest);
    if (prior) {
      if (prior.requestFingerprint !== requestFingerprint) deny();
      const { recordDigest, ...recordUnsigned } = prior;
      if (recordDigest !== digest(recordUnsigned) || prior.organizationId !== request.organizationId) deny();
      const receipt = (state.canonicalCompositionEvaluationReceipts ?? []).find(
        (item) => item.receiptDigest === prior.receiptDigest);
      if (!receipt) throw new Error("Canonical Organizational Understanding revision denied.");
      const { receiptDigest, ...receiptUnsigned } = receipt;
      if (receiptDigest !== digest(receiptUnsigned) || receipt.organizationId !== request.organizationId ||
        receipt.operationId !== prior.operationId || receipt.requestFingerprint !== requestFingerprint) deny();
      return { receipt: structuredClone(receipt), idempotent: true };
    }
    if (currentRuntime.revision !== request.expectedRuntimeRevision) deny();
    const operationRecords = currentRuntime.runtime.memory.events.filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && (item as { kind?: unknown }).kind === "canonical-evidence-contribution-operation" &&
        (item as { contributionOperationId?: unknown }).contributionOperationId === request.contributionOperationId));
    if (operationRecords.length !== 1) deny();
    const operationRecord = operationRecords[0]!;
    const operationKeys = ["kind", "contractVersion", "organizationId", "questionId", "contributionOperationId",
      "idempotencyKeyDigest", "requestFingerprint", "canonicalAdmissionBatch", "lineageEnvelopeDigest",
      "cognitionDisposition", "evidenceAccepted", "productQuestionRevisionBefore", "productQuestionRevisionAfter",
      "canonicalUnderstandingChange", "productMaterializationInstruction", "recordedAt", "recordDigest"];
    if (Object.keys(operationRecord).some((key) => !operationKeys.includes(key)) ||
      operationRecord.kind !== "canonical-evidence-contribution-operation" || operationRecord.contractVersion !== "1") deny();
    const admissionBatch=(operationRecord as {canonicalAdmissionBatch?:import("../governance/canonicalScopeLineage").CanonicalEvidenceAdmissionOperationBatchV1}).canonicalAdmissionBatch;
    if (!admissionBatch) throw new Error("Canonical Organizational Understanding revision denied.");
    const admissions=admissionBatch.admissions;
    if(!admissions.length)deny();
    const scopeLineageIndex = currentRuntime.runtime.memory.canonicalScopeLineageIndex;
    if (!scopeLineageIndex) return deny();
    validateCanonicalEvidenceAdmissionOperationBatch({ organizationId: request.organizationId,
      batch: admissionBatch, scopeLineageIndex });
    const { recordDigest, ...operationRecordUnsigned } = operationRecord;
    const instruction = operationRecord.productMaterializationInstruction;
    if (typeof recordDigest !== "string" || recordDigest !== digest(operationRecordUnsigned) ||
      operationRecord.organizationId !== request.organizationId || operationRecord.questionId !== request.questionId ||
      !instruction || typeof instruction !== "object") deny();
    const instructionRecord = instruction as Record<string, unknown>;
    evaluationLineage.validateMaterializationInstruction(instruction);
    if (instructionRecord.contractVersion !== "1" || instructionRecord.canonicalOperationId !== request.contributionOperationId ||
      instructionRecord.questionId !== request.questionId || instructionRecord.organizationId !== request.organizationId ||
      instructionRecord.conversationId !== request.occurrenceId ||
      instructionRecord.requestFingerprint !== operationRecord.requestFingerprint ||
      instructionRecord.idempotencyKeyDigest !== operationRecord.idempotencyKeyDigest ||
      typeof instructionRecord.instructionDigest !== "string" || !Array.isArray(instructionRecord.materialReferences)) deny();
    const expectedMaterialReferences = unique(admissions.flatMap((item) =>
      [item.canonicalEvidenceId, item.canonicalAdmissionId, item.attributionId]));
    if (stable(instructionRecord.materialReferences) !== stable(expectedMaterialReferences)) deny();
    const operationContext = createCanonicalEvidenceContributionOperationContext({
      contributionOperationId: request.contributionOperationId, organizationId: request.organizationId,
      questionId: request.questionId, purposeRef: request.purpose,
      requestFingerprint: operationRecord.requestFingerprint as string,
      idempotencyKeyDigest: operationRecord.idempotencyKeyDigest as string,
    });
    const lineageEnvelope = createCanonicalEvidenceContributionLineageEnvelope({
      context: operationContext, admissionBatch,
    });
    if (operationRecord.lineageEnvelopeDigest !== lineageEnvelope.envelopeDigest) deny();
    const resolvedLineage = await evaluationLineage.resolveCurrent({ organizationId: request.organizationId,
      questionId: request.questionId, seriesId: request.seriesId, occurrenceId: request.occurrenceId,
      contributionOperationId: request.contributionOperationId, purpose: request.purpose, evaluatedAt: request.occurredAt,actorRef:request.actorRef });
    if (!resolvedLineage || resolvedLineage.seriesId !== request.seriesId || resolvedLineage.occurrenceId !== request.occurrenceId ||
      resolvedLineage.contributionOperationId !== request.contributionOperationId ||
      resolvedLineage.instructionDigest !== instructionRecord.instructionDigest || !exact(resolvedLineage.receiptId) ||
      !/^[a-f0-9]{64}$/.test(resolvedLineage.receiptDigest)) {
      throw new Error("Canonical Organizational Understanding revision denied.");
    }
    const lineage = resolvedLineage;
    const persistedExplanations=currentRuntime.runtime.memory.organizationalExplanations;
    const operationLinkedExplanations = persistedExplanations.filter((explanation) =>
      explanation.canonicalGovernanceLineage?.operationRefs.some(
        (ref) => ref.contributionOperationId === request.contributionOperationId));
    if (!operationLinkedExplanations.length) {
      return { disposition: "insufficient", receipt: null, idempotent: false };
    }
    const exactExplanations = operationLinkedExplanations.filter((explanation) =>
      explanation.canonicalGovernanceLineage?.operationRefs.some((ref) => ref.contributionOperationId === request.contributionOperationId &&
        ref.questionId === request.questionId && ref.purposeRef === request.purpose));
    if (exactExplanations.length !== operationLinkedExplanations.length) deny();
    const explanationIds = unique(exactExplanations.map((item) => item.id));
    const expectedDigests = unique(exactExplanations.map((item) => item.canonicalGovernanceLineage!.lineageDigest));
    const actualDigests: string[] = [];
    for (const explanation of exactExplanations) {
      const lineage = explanation.canonicalGovernanceLineage;
      if (!lineage || explanation.organizationId !== request.organizationId) {
        throw new Error("Canonical Organizational Understanding revision denied.");
      }
      validateCanonicalExplanationGovernanceLineage(lineage);
      if (lineage.organizationId !== request.organizationId ||
        stable(lineage.purposeRefs) !== stable([request.purpose])) deny();
      const refs = lineage.operationRefs.filter((ref) => ref.contributionOperationId === request.contributionOperationId &&
        ref.questionId === request.questionId && ref.purposeRef === request.purpose);
      if (refs.length !== 1 || refs[0]!.envelopeDigest !== lineageEnvelope.envelopeDigest ||
        refs[0]!.canonicalOperationResultDigest !== lineageEnvelope.canonicalOperationResultDigest) deny();
      actualDigests.push(lineage.lineageDigest);
    }
    if (actualDigests.length !== exactExplanations.length || stable(unique(actualDigests)) !== stable(expectedDigests)) deny();
    const directSupports = exactExplanations.flatMap((item) => item.canonicalGovernanceLineage!.directMaterialSupports);
    if(stable(unique(directSupports.map(support=>support.canonicalEvidenceId)))!==stable(unique(admissions.map(item=>item.canonicalEvidenceId)))||
      stable(unique(directSupports.map(support=>support.canonicalAdmissionId)))!==stable(unique(admissions.map(item=>item.canonicalAdmissionId)))||
      stable(unique(directSupports.map(support=>support.attributionId)))!==stable(unique(admissions.map(item=>item.attributionId))))deny();
    const supportsForBindingValidation = exactExplanations.flatMap((item) => item.canonicalGovernanceLineage!.materialSupports);
    if (directSupports.some((support) => support.originBatchDigest !== admissionBatch.batchDigest)) deny();
    const currentAttributions = currentRuntime.runtime.memory.canonicalScopeLineageIndex?.evidenceAttributions ?? [];
    for (const support of supportsForBindingValidation) {
      const attribution = currentAttributions.filter((item) => item.attributionId === support.attributionId);
      if (attribution.length !== 1 ||
        attribution[0]!.organizationId !== request.organizationId ||
        attribution[0]!.evidenceId !== support.canonicalEvidenceId ||
        attribution[0]!.evidenceAdmissionId !== support.canonicalAdmissionId ||
        attribution[0]!.attributionVersion !== support.attributionRevision ||
        attribution[0]!.digest !== support.attributionDigest) deny();
    }
    for (const support of directSupports) {
      const admission = admissions.filter((item) => item.attributionId === support.attributionId);
      if (admission.length !== 1 || admission[0]!.attributionVersion !== support.attributionRevision ||
        admission[0]!.attributionDigest !== support.attributionDigest) deny();
    }
    const bindingRefs = unique(supportsForBindingValidation.flatMap((item) => item.sourceBindingRefs.map((ref) => `${ref.sourceBindingId}@${ref.sourceGovernanceRevision}`)));
    const directBindingRefs = unique(directSupports.flatMap((item) => item.sourceBindingRefs.map((ref) => `${ref.sourceBindingId}@${ref.sourceGovernanceRevision}`)));
    const currentBindings = currentRuntime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings ?? [];
    for (const ref of bindingRefs) {
      const separator = ref.lastIndexOf("@");
      const id = ref.slice(0, separator), revision = ref.slice(separator + 1);
      const binding = currentBindings.filter((item) => item.bindingId === id && item.digest === revision);
      if (binding.length !== 1) deny();
    }
    const sourceVersions = [...lineage.sourceContentVersions].sort((a, b) => a.sourceBindingId.localeCompare(b.sourceBindingId));
    if (sourceVersions.length !== directBindingRefs.length || new Set(sourceVersions.map((item) => item.sourceBindingId)).size !== sourceVersions.length) deny();
    for (const source of sourceVersions) {
      if (![source.sourceBindingId, source.sourceContentVersionId, source.normalizedContentDigest].every(exact)) deny();
      const binding = currentBindings.find((item) => item.bindingId === source.sourceBindingId);
      if (!binding || binding.source.normalizedContentDigest !== source.normalizedContentDigest ||
        !directBindingRefs.includes(`${binding.bindingId}@${binding.digest}`)) deny();
    }
    const explanationSetDigest = canonicalUnderstandingExplanationSetDigest(exactExplanations);
    const before = structuredClone(state.canonicalCompositions ?? []);
    const proposed = buildCanonicalUnderstandingCompatibilityShadow({ organizationId: request.organizationId,
      explanations: exactExplanations, authorityTransitionMode: "explicit", previousCompositions: before,
      now: request.occurredAt });
    if (proposed.length !== 1) deny();
    const target = proposed[0]!;
    if (auth.requestedScope.type !== target.scope.type || auth.requestedScope.id !== target.scope.id) deny();
    const current = before.find((item) => item.id === target.id);
    const disposition = current?.revisionId === target.revisionId ? "no_change" as const : "changed" as const;
    const resulting = disposition === "no_change" ? current! : target;
    const next = disposition === "no_change" ? before : [...before.filter((item) => item.id !== target.id), target]
      .sort((a, b) => a.id.localeCompare(b.id));
    const lineages = exactExplanations.map((item) => item.canonicalGovernanceLineage!);
    const supports = lineages.flatMap((item) => item.materialSupports);
    const opRefs = lineages.flatMap((item) => item.operationRefs)
      .filter((item) => item.contributionOperationId === request.contributionOperationId);
    const compositionRefs = (items: readonly CanonicalUnderstandingComposition[]) => items
      .map((item) => ({ compositionId: item.id, revisionId: item.revisionId }))
      .sort((a, b) => a.compositionId.localeCompare(b.compositionId));
    const operationId = `canonical-understanding-composition-evaluation:v1:${digest([request.organizationId, keyDigest, requestFingerprint])}`;
    const runtime = structuredClone(currentRuntime.runtime);
    runtime.memory.organizationalUnderstandingState.canonicalCompositions = next;
    const unsigned = { contractVersion: "1" as const,
      kind: "canonical-understanding-composition-evaluation-receipt" as const, operationId,
      organizationId: request.organizationId, questionId: request.questionId,
      seriesId: request.seriesId, occurrenceId: request.occurrenceId,
      contributionOperationId: request.contributionOperationId, purpose: request.purpose,
      authorityRefs: unique(auth.authorityRefs), policyRefs: unique(auth.policyRefs),
      explanationIds, explanationLineageDigests: expectedDigests, explanationSetDigest,
      evidenceIds: unique(exactExplanations.flatMap((item) => item.evidenceIds)),
      admissionIds: unique(supports.map((item) => item.canonicalAdmissionId)),
      attributionIds: unique(supports.map((item) => item.attributionId)),
      sourceBindingRevisionRefs: unique(supports.flatMap((item) => item.sourceBindingRefs.map((ref) => `${ref.sourceBindingId}@${ref.sourceGovernanceRevision}`))),
      admissionBatchDigests: unique(supports.map((item) => item.originBatchDigest)),
      operationResultDigests: unique(opRefs.map((item) => item.canonicalOperationResultDigest)),
      operationEnvelopeDigests: unique(opRefs.map((item) => item.envelopeDigest)),
      materializationInstructionDigest: lineage.instructionDigest,
      materializationReceiptId: lineage.receiptId, materializationReceiptDigest: lineage.receiptDigest,
      sourceContentVersions: sourceVersions,
      predecessorCompositionRefs: current ? compositionRefs([current]) : [], resultingCompositionRefs: compositionRefs([resulting]),
      projectionSourceRef: { owner: "canonical-organizational-understanding" as const,
        compositionId: resulting.id, revisionId: resulting.revisionId },
      disposition, idempotencyKeyDigest: keyDigest, requestFingerprint, runtimeRevisionBefore: currentRuntime.revision,
      runtimeRevisionAfter: digest({ canonicalCompositions: next, operationId }), occurredAt: request.occurredAt };
    const receipt: CanonicalUnderstandingCompositionEvaluationReceiptV1 = { ...unsigned, receiptDigest: digest(unsigned) };
    runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationReceipts = [
      ...(state.canonicalCompositionEvaluationReceipts ?? []), receipt,
    ];
    const recordUnsigned = { contractVersion: "1" as const, operationId, organizationId: request.organizationId,
      idempotencyKeyDigest: keyDigest, requestFingerprint, receiptDigest: receipt.receiptDigest, recordedAt: request.occurredAt };
    const record: CanonicalUnderstandingCompositionEvaluationOperationV1 = { ...recordUnsigned, recordDigest: digest(recordUnsigned) };
    runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationOperations = [...operations, record];
    const persisted = await this.repository.replace(request.organizationId,
      new TextEncoder().encode(JSON.stringify(runtime, null, 2)), currentRuntime.revision, request.operation);
    if (!persisted.runtime.memory.organizationalUnderstandingState.canonicalCompositionEvaluationReceipts
      ?.some((item) => item.receiptDigest === receipt.receiptDigest)) deny();
    return { receipt, idempotent: false };
  }

  async revise(
    request: ReviseCanonicalUnderstandingConfidenceRequestV1,
  ): Promise<{ receipt: CanonicalUnderstandingRevisionReceiptV1; idempotent: boolean }> {
    const authorization = request.authorization;
    const allowedRequestKeys = new Set([
      "contractVersion", "organizationId", "questionId", "stableUnderstandingId",
      "expectedPredecessorRevisionId", "confidence", "uncertainty",
      "supportingMaterialRefs", "contradictingMaterialRefs", "interpretationVersion",
      "purpose", "sensitivity", "actorRef", "occurredAt", "idempotencyKey",
      "expectedRuntimeRevision", "authorization", "operation",
    ]);
    if (
      Object.keys(request).some((key) => !allowedRequestKeys.has(key)) ||
      request.contractVersion !== "1" ||
      !exact(request.organizationId) ||
      !exact(request.questionId) ||
      !exact(request.stableUnderstandingId) ||
      !exact(request.expectedPredecessorRevisionId) ||
      !exact(request.interpretationVersion) ||
      !exact(request.purpose) ||
      !exact(request.actorRef) ||
      !exact(request.idempotencyKey) ||
      request.occurredAt !== this.clock.now() ||
      !Number.isFinite(Date.parse(request.occurredAt)) ||
      (request.confidence !== null &&
        (!Number.isFinite(request.confidence) || request.confidence < 0 || request.confidence > 1)) ||
      authorization.disposition !== "authorized" ||
      authorization.operation !== CANONICAL_UNDERSTANDING_REVISION_OPERATION ||
      authorization.organizationId !== request.organizationId ||
      authorization.subjectId !== request.actorRef ||
      authorization.purpose !== request.purpose ||
      authorization.sensitivity !== request.sensitivity ||
      authorization.evaluatedAt !== request.occurredAt ||
      authorization.temporal.mode !== "current" ||
      authorization.requestedScope.organizationId !== request.organizationId ||
      authorization.authorityRefs.length === 0 ||
      authorization.policyRefs.length === 0
    ) deny();

    const uncertainty = unique(request.uncertainty);
    const supportingMaterialRefs = unique(request.supportingMaterialRefs);
    const contradictingMaterialRefs = unique(request.contradictingMaterialRefs);
    if (
      uncertainty.some((item) => !exact(item)) ||
      supportingMaterialRefs.length + contradictingMaterialRefs.length === 0 ||
      [...supportingMaterialRefs, ...contradictingMaterialRefs].some((item) => !exact(item))
    ) deny();

    const keyDigest = digest(["canonical-understanding-revision-idempotency", request.idempotencyKey]);
    const requestFingerprint = digest({
      contractVersion: request.contractVersion,
      organizationId: request.organizationId,
      questionId: request.questionId,
      stableUnderstandingId: request.stableUnderstandingId,
      expectedPredecessorRevisionId: request.expectedPredecessorRevisionId,
      confidence: request.confidence,
      uncertainty,
      supportingMaterialRefs,
      contradictingMaterialRefs,
      interpretationVersion: request.interpretationVersion,
      purpose: request.purpose,
      sensitivity: request.sensitivity,
      actorRef: request.actorRef,
      occurredAt: request.occurredAt,
      operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION,
      authorityRefs: authorization.authorityRefs,
      policyRefs: authorization.policyRefs,
      governanceContextId: authorization.contextId,
    });

    const stored = await this.repository.read(request.organizationId);
    if (!stored) return deny();
    const state = stored.runtime.memory.organizationalUnderstandingState;
    const operations = state.canonicalRevisionOperations ?? [];
    const prior = operations.find((item) => item.idempotencyKeyDigest === keyDigest);
    if (prior) {
      if (prior.requestFingerprint !== requestFingerprint) deny();
      const receipt = (stored.runtime.memory.events as unknown[]).find(
        (item): item is CanonicalUnderstandingRevisionReceiptV1 =>
          Boolean(
            item &&
              typeof item === "object" &&
              (item as { kind?: string }).kind === "canonical-understanding-revision-receipt" &&
              (item as CanonicalUnderstandingRevisionReceiptV1).receiptDigest === prior.receiptDigest,
          ),
      );
      if (!receipt) return deny();
      return { receipt: structuredClone(receipt), idempotent: true };
    }
    if (stored.revision !== request.expectedRuntimeRevision) return deny();

    const composition = state.canonicalCompositions?.find(
      (item) => item.id === request.stableUnderstandingId,
    );
    if (!composition) return deny();
    if (composition.organizationId !== request.organizationId) return deny();
    if (
      authorization.requestedScope.type !== composition.scope.type ||
      authorization.requestedScope.id !== composition.scope.id
    ) return deny();
    const predecessor = currentRevision(composition);
    const predecessorId = predecessor?.revisionId ?? composition.revisionId;
    if (predecessorId !== request.expectedPredecessorRevisionId) deny();
    const confidenceChanged = predecessor ? predecessor.confidence !== request.confidence : request.confidence !== null;
    const uncertaintyChanged = predecessor
      ? stable(predecessor.uncertainty) !== stable(uncertainty)
      : stable(composition.compositionUncertainty) !== stable(uncertainty);
    if (!confidenceChanged && !uncertaintyChanged) deny();
    if (
      predecessor &&
      stable(predecessor.supportingMaterialRefs) !== stable(supportingMaterialRefs) &&
      !confidenceChanged &&
      !uncertaintyChanged
    ) deny();

    const operationId = `canonical-understanding-revision-operation:v1:${digest([
      request.organizationId,
      keyDigest,
      requestFingerprint,
    ])}`;
    const revisionUnsigned = {
      contractVersion: "1" as const,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      conclusionRevisionId: composition.revisionId,
      confidence: request.confidence,
      uncertainty,
      supportingMaterialRefs,
      contradictingMaterialRefs,
      scopeDigest: digest(composition.scope),
      interpretationVersion: request.interpretationVersion,
      operationId,
      occurredAt: request.occurredAt,
      actorRef: request.actorRef,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
    };
    const revisionDigest = digest(revisionUnsigned);
    const revision: CanonicalUnderstandingEpistemicRevisionV1 = {
      ...revisionUnsigned,
      revisionId: `${composition.id}:epistemic-revision:${revisionDigest}`,
      revisionDigest,
    };
    const changeType = confidenceChanged && uncertaintyChanged
      ? "confidence-and-uncertainty" as const
      : confidenceChanged ? "confidence" as const : "uncertainty" as const;
    const eventId = `canonical-understanding-revision-event:v1:${digest([operationId, revision.revisionId])}`;

    const runtime = structuredClone(stored.runtime);
    const nextState = runtime.memory.organizationalUnderstandingState;
    const target = nextState.canonicalCompositions?.find((item) => item.id === composition.id);
    if (!target) return deny();
    target.epistemicRevisions = [...(target.epistemicRevisions ?? []), revision];
    target.currentEpistemicRevisionId = revision.revisionId;
    target.updatedAt = request.occurredAt;

    const receiptUnsigned = {
      contractVersion: "1" as const,
      operationId,
      organizationId: request.organizationId,
      questionId: request.questionId,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      revisionId: revision.revisionId,
      conclusionRevisionId: composition.revisionId,
      changeType,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
      idempotencyKeyDigest: keyDigest,
      requestFingerprint,
      eventId,
      runtimeRevisionBefore: stored.revision,
      runtimeRevisionAfter: digest(runtime),
      occurredAt: request.occurredAt,
    };
    const receipt = { ...receiptUnsigned, receiptDigest: digest(receiptUnsigned) };
    (runtime.memory.events as unknown[]).push({
      kind: "canonical-understanding-revision-event",
      contractVersion: "1",
      eventId,
      operationId,
      organizationId: request.organizationId,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      revisionId: revision.revisionId,
      changeType,
      operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION,
      actorRef: request.actorRef,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
      requestFingerprint,
      occurredAt: request.occurredAt,
    }, {
      kind: "canonical-understanding-revision-receipt",
      ...receipt,
    });
    const operationRecordUnsigned = {
      contractVersion: "1" as const,
      operationId,
      organizationId: request.organizationId,
      stableUnderstandingId: composition.id,
      revisionId: revision.revisionId,
      predecessorRevisionId: predecessorId,
      idempotencyKeyDigest: keyDigest,
      requestFingerprint,
      eventId,
      receiptDigest: receipt.receiptDigest,
      recordedAt: request.occurredAt,
    };
    const operationRecord: CanonicalUnderstandingRevisionOperationRecordV1 = {
      ...operationRecordUnsigned,
      recordDigest: digest(operationRecordUnsigned),
    };
    nextState.canonicalRevisionOperations = [...operations, operationRecord];
    const bytes = new TextEncoder().encode(JSON.stringify(runtime, null, 2));
    const persisted = await this.repository.replace(
      request.organizationId,
      bytes,
      stored.revision,
      request.operation,
    );
    const persistedReceipt = (persisted.runtime.memory.events as unknown[]).find(
      (item) =>
        Boolean(
          item &&
            typeof item === "object" &&
            (item as { receiptDigest?: string }).receiptDigest === receipt.receiptDigest,
        ),
    );
    if (!persistedReceipt) deny();
    return { receipt, idempotent: false };
  }
}
