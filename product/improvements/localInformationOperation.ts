import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { buildDurableProductQuestion } from "../questions";
import { getProductUnknownHistory } from "../unknowns";
import { listOptimizationContextVersions, listOrganizationalObjectiveVersions, objectiveVersionRef, optimizationContextVersionRef } from "../objectives";
import { stableId } from "../workflow/text";
import { isCompleteMaterialAcquisitionEnvelope, materialAcquisitionEnvelopeDigest } from "./candidateEnvelope";
import {
  PRODUCT_LOCAL_INFORMATION_OPERATION_EVENT_KIND,
  PRODUCT_LOCAL_INFORMATION_OPERATION_SCHEMA_VERSION,
  type ProductConfidenceImprovementGovernedEvent,
  type ProductLocalInformationOperationRequest,
  type ProductLocalInformationOperationResult,
} from "./contracts";
import { productConfidenceImprovementEvents, recordConfidenceImprovementEvent } from "./improvementLifecycle";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${key}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function isResult(value: unknown): value is ProductLocalInformationOperationResult {
  const item = value as Partial<ProductLocalInformationOperationResult>;
  return item?.kind === PRODUCT_LOCAL_INFORMATION_OPERATION_EVENT_KIND
    && item.schemaVersion === PRODUCT_LOCAL_INFORMATION_OPERATION_SCHEMA_VERSION
    && typeof item.resultId === "string" && typeof item.resultDigest === "string";
}

export function productLocalInformationOperationResults(runtime: OrganizationRuntime): ProductLocalInformationOperationResult[] {
  return runtime.memory.events.filter(isResult)
    .filter((result) => result.organizationId === runtime.metadata.organizationId)
    .sort((left, right) => left.completedAt.localeCompare(right.completedAt) || left.resultId.localeCompare(right.resultId));
}

function assertCurrentGovernedChoice(runtime: OrganizationRuntime, request: ProductLocalInformationOperationRequest): ProductConfidenceImprovementGovernedEvent {
  const receipt = request.humanChoiceReceipt;
  const event = productConfidenceImprovementEvents(runtime).find((candidate): candidate is ProductConfidenceImprovementGovernedEvent =>
    candidate.schemaVersion === "3" && candidate.eventId === receipt.eventId);
  const operationHistory = productConfidenceImprovementEvents(runtime).filter((candidate) => candidate.operationId === request.operationId);
  const current = operationHistory.at(-1);
  if (!event || current?.eventId !== event.eventId) throw new Error("Local information operation requires the exact current governed human-choice receipt.");
  if (event.eventType !== "improvement-authorized" || request.executionAuthorization !== "execute-existing-local-read-only-operation") throw new Error("Local information operation execution is not authorized.");
  if (event.actorRef !== request.actorRef || event.authorityRef !== request.authorityRef) throw new Error("Local information operation authority changed.");
  if (!isCompleteMaterialAcquisitionEnvelope(event.candidateEnvelope)
    || event.candidateEnvelopeDigest !== materialAcquisitionEnvelopeDigest(event.candidateEnvelope)
    || event.candidateEnvelope.envelopeId !== request.candidateEnvelopeId
    || event.candidateEnvelopeDigest !== request.candidateEnvelopeDigest) throw new Error("Local information operation candidate envelope changed.");
  return event;
}

function assertCurrentReferences(runtime: OrganizationRuntime, request: ProductLocalInformationOperationRequest, event: ProductConfidenceImprovementGovernedEvent): void {
  if (request.organizationId !== runtime.metadata.organizationId || request.proposal.organizationId !== request.organizationId) throw new Error("Local information operation organization mismatch.");
  const question = buildDurableProductQuestion({ runtime, questionId: request.questionId });
  if (!question || question.revision !== request.questionRevision || event.questionRevision !== request.questionRevision) throw new Error("Local information operation Question revision changed.");
  const unknownHistory = getProductUnknownHistory({ runtime, questionId: request.questionId, unknownId: request.unknownId });
  const boundUnknown = unknownHistory.find((item) => item.eventId === request.unknownRevisionRef);
  const currentUnknown = unknownHistory.at(-1);
  const targetedByThisOperation = currentUnknown?.eventType === "unknown-targeted"
    && currentUnknown.targetingOperationRef === request.proposal.proposalId;
  if (!boundUnknown || (!targetedByThisOperation && currentUnknown?.eventId !== request.unknownRevisionRef)) throw new Error("Local information operation Unknown revision changed.");
  const currentUnderstanding = `organization:${request.organizationId}:understanding:${runtime.metadata.investigationCount}`;
  if (request.understandingRevisionRef !== currentUnderstanding || event.understandingRevisionRef !== currentUnderstanding) throw new Error("Local information operation Understanding revision changed.");
  if (request.proposal.proposalId !== event.proposalId || request.proposal.unknownRevisionRef !== request.unknownRevisionRef
    || request.proposal.understandingRevisionRef !== request.understandingRevisionRef) throw new Error("Local information operation proposal changed.");
  if (request.objectiveVersionRef !== event.objectiveVersionRef || request.optimizationContextVersionRef !== event.optimizationContextVersionRef) throw new Error("Local information operation Objective or Context changed.");
  if (request.objectiveVersionRef && !listOrganizationalObjectiveVersions(runtime).some((item) => objectiveVersionRef(item.organizationId, item.objectiveId, item.version) === request.objectiveVersionRef)) throw new Error("Local information operation Objective is stale.");
  if (request.optimizationContextVersionRef && !listOptimizationContextVersions(runtime).some((item) => optimizationContextVersionRef(item.organizationId, item.optimizationContextId, item.version) === request.optimizationContextVersionRef)) throw new Error("Local information operation Optimization Context is stale.");
  const envelope = event.candidateEnvelope;
  if (!envelope.candidate.eligibility.authorizationSatisfied) throw new Error("Local information operation authority was revoked.");
  if (!envelope.candidate.eligibility.governanceAllowed) throw new Error("Local information operation is governance prohibited.");
  if (envelope.requiredSourceAccess.some((source) => source.state !== "authorized" && source.state !== "not-required")) throw new Error("Local information operation source access is unavailable.");
}

export function executeLocalInformationOperation(input: { runtime: OrganizationRuntime; request: ProductLocalInformationOperationRequest }): { runtime: OrganizationRuntime; result: ProductLocalInformationOperationResult; idempotent: boolean } {
  const { runtime, request } = input;
  if (request.operationType !== "inspect-existing-evidence" || request.proposal.actionType !== "inspect-existing-evidence" || request.proposal.actionTarget.kind !== "existing-evidence-set") throw new Error("Local information operation type is not implemented.");
  if (!request.idempotencyKey.trim() || !Number.isFinite(Date.parse(request.requestedAt))) throw new Error("Local information operation request is invalid.");
  const requestDigest = stableId("product-local-information-operation-request", canonical({ ...request, humanChoiceReceipt: request.humanChoiceReceipt.eventId }));
  const existing = productLocalInformationOperationResults(runtime).find((result) => result.operationId === request.operationId);
  if (existing) {
    if (existing.requestDigest !== requestDigest) throw new Error("Local information operation ID conflict.");
    return { runtime, result: existing, idempotent: true };
  }
  const event = assertCurrentGovernedChoice(runtime, request);
  assertCurrentReferences(runtime, request, event);
  const declaredIds = [...new Set(request.proposal.actionTarget.evidenceIds)].sort();
  if (canonical(declaredIds) !== canonical([...new Set(request.sourceEvidenceIds)].sort())) throw new Error("Local information operation source scope changed.");
  const evidenceNodes = new Map(runtime.organizationModel.nodes.filter((node) => node.type === "evidence").map((node) => [node.id, node]));
  const nodes = declaredIds.map((id) => evidenceNodes.get(id));
  if (nodes.some((node) => !node)) throw new Error("Local information operation authorized Evidence is unavailable.");
  const information = nodes.map((node) => {
    const sourceDigest = stableId("product-local-information-source", node!.id, node!.summary, String(node!.metadata?.contentDigest ?? ""));
    return { informationId: stableId("product-local-information", request.operationId, node!.id, sourceDigest), informationClass: "existing-admitted-evidence-inspection" as const, sourceEvidenceId: node!.id, sourceDigest, summary: node!.summary };
  });
  const requestedSourceDigests = [...request.sourceDigests].sort((left, right) => left.evidenceId.localeCompare(right.evidenceId));
  const actualSourceDigests = information.map((item) => ({ evidenceId: item.sourceEvidenceId, digest: item.sourceDigest }));
  if (canonical(requestedSourceDigests) !== canonical(actualSourceDigests)) throw new Error("Local information operation source digest changed.");
  const completed = recordConfidenceImprovementEvent({ runtime, proposal: request.proposal, candidateEnvelope: event.candidateEnvelope, eventType: "improvement-completed", operationId: request.operationId, expectedCurrentEventVersion: event.eventVersion, actorRef: request.actorRef, occurredAt: request.requestedAt, resultSourceRefs: declaredIds, reason: "The authorized local read-only inspection completed; cognitive effects remain separately observed." });
  const completedEvent = productConfidenceImprovementEvents(completed.runtime).find((item): item is ProductConfidenceImprovementGovernedEvent => item.schemaVersion === "3" && item.operationId === request.operationId && item.eventVersion === event.eventVersion + 1)!;
  const unsigned = { kind: PRODUCT_LOCAL_INFORMATION_OPERATION_EVENT_KIND, schemaVersion: PRODUCT_LOCAL_INFORMATION_OPERATION_SCHEMA_VERSION, resultId: stableId("product-local-information-operation-result", request.operationId, requestDigest), operationId: request.operationId, organizationId: request.organizationId, questionId: request.questionId, questionRevision: request.questionRevision, unknownId: request.unknownId, unknownRevisionRef: request.unknownRevisionRef, understandingRevisionRef: request.understandingRevisionRef, objectiveVersionRef: request.objectiveVersionRef, optimizationContextVersionRef: request.optimizationContextVersionRef, proposalId: request.proposal.proposalId, candidateEnvelopeId: request.candidateEnvelopeId, candidateEnvelopeDigest: request.candidateEnvelopeDigest, humanChoiceEventId: event.eventId, completionEventId: completedEvent.eventId, executionAuthorization: request.executionAuthorization as "execute-existing-local-read-only-operation", operationType: "inspect-existing-evidence" as const, actorRef: request.actorRef, authorityRef: request.authorityRef, sourceEvidenceIds: declaredIds, sourceDigests: information.map((item) => item.sourceDigest), information, informationProduced: information.length > 0, evidenceCandidateRefs: [] as [], admittedEvidenceIds: [] as [], limitations: ["This result organizes already admitted Evidence and creates no new Evidence or cognitive authority."], unavailableFields: [], withheldFields: [], startedAt: request.requestedAt, completedAt: request.requestedAt, status: "completed" as const, requestDigest };
  const result: ProductLocalInformationOperationResult = { ...unsigned, resultDigest: stableId("product-local-information-operation-result-digest", canonical(unsigned), completedEvent.eventId) };
  return { runtime: { ...completed.runtime, memory: { ...completed.runtime.memory, events: [...completed.runtime.memory.events, result] } }, result, idempotent: false };
}
