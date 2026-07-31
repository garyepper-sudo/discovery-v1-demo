import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { buildDurableProductQuestion } from "../questions/questionLifecycle";
import { listProductUnknowns } from "../unknowns";
import { normalize, stableId } from "../workflow/text";
import {
  PRODUCT_IMPROVEMENT_EVENT_KIND, PRODUCT_IMPROVEMENT_EVENT_SCHEMA_VERSION,
  PRODUCT_IMPROVEMENT_LEGACY_EVENT_SCHEMA_VERSION,
  type ProductConfidenceImprovementEvent, type ProductConfidenceImprovementEventType,
  type ProductConfidenceImprovementGovernedEvent,
  type ProductConfidenceImprovementProposal, type ProductConfidenceImprovementReceipt,
  type ProductConfidenceImprovementResult,
} from "./contracts";
import type { MaterialAcquisitionCandidateEnvelope } from "../acquisition";
import { isCompleteMaterialAcquisitionEnvelope, materialAcquisitionEnvelopeDigest } from "./candidateEnvelope";

const value = { low: 0, moderate: 1, high: 2 };
const delay = { immediate: 0, short: 1, medium: 2, long: 3 };
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).sort().join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v as object).sort().map(k => `${k}:${canonical((v as any)[k])}`).join(",")}}`;
  return JSON.stringify(typeof v === "string" ? normalize(v) : v);
}
export function improvementOpportunityId(input: { organizationId: string; questionId: string; unknownId: string; unknownRevisionRef: string }) {
  return stableId("product-improvement-opportunity", input.organizationId, input.questionId, input.unknownId, input.unknownRevisionRef);
}
export function buildImprovementProposal(input: Omit<ProductConfidenceImprovementProposal, "contractVersion" | "proposalId" | "opportunityId" | "requiresHumanAuthorization">): ProductConfidenceImprovementProposal {
  const opportunityId = improvementOpportunityId(input);
  const proposalId = stableId("product-improvement-proposal", opportunityId, canonical({
    actionType: input.actionType, actionTarget: input.actionTarget,
    expectedValue: input.expectedValue, executionCost: input.executionCost,
    sourceScopeRefs: input.sourceScopeRefs, personScopeRefs: input.personScopeRefs,
    answerVersionId: input.answerVersionId, abstentionOperationId: input.abstentionOperationId,
    understandingRevisionRef: input.understandingRevisionRef,
  }));
  return { ...input, contractVersion: 1, proposalId, opportunityId, requiresHumanAuthorization: true };
}
function score(p: ProductConfidenceImprovementProposal) {
  return [value[p.expectedValue.discriminationGain], value[p.expectedValue.understandingImprovement],
    -value[p.executionCost.governanceRisk], -value[p.executionCost.burden], -delay[p.executionCost.delay], -value[p.executionCost.effort]];
}
function compare(a: ProductConfidenceImprovementProposal, b: ProductConfidenceImprovementProposal) {
  const x = score(a), y = score(b);
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return y[i] - x[i];
  return a.proposalId.localeCompare(b.proposalId);
}
export function generateConfidenceImprovementProposals(input: {
  runtime: OrganizationRuntime; questionId: string; unknownId: string;
  candidates: ProductConfidenceImprovementProposal[];
  noSafeOperation?: Extract<ProductConfidenceImprovementResult, { kind: "no-safe-operation" }>;
}): ProductConfidenceImprovementResult {
  if (!buildDurableProductQuestion({ runtime: input.runtime, questionId: input.questionId })) throw new Error("Product Question was not found.");
  const unknown = listProductUnknowns({ runtime: input.runtime, questionId: input.questionId }).find(x => x.unknownId === input.unknownId);
  if (!unknown?.actionable) return { kind: "no-safe-operation", reason: "unknown-not-actionable", limitation: "The exact Unknown is not current and actionable." };
  if (!input.candidates.length) return input.noSafeOperation ?? { kind: "no-safe-operation", reason: "insufficient-target-definition", limitation: "No bounded authorized action target can be formed." };
  for (const p of input.candidates) if (p.organizationId !== input.runtime.metadata.organizationId || p.questionId !== input.questionId || p.unknownId !== input.unknownId) throw new Error("Proposal scope mismatch.");
  const proposals = [...input.candidates].sort(compare);
  const tied = proposals.length > 1 && canonical(score(proposals[0])) === canonical(score(proposals[1]));
  return { kind: "proposals", proposals, highestValueProposalId: tied ? null : proposals[0].proposalId, rankingExplanation: "Discrimination gain, understanding improvement, governance safety, burden, delay, then effort." };
}
function isEvent(x: unknown): x is ProductConfidenceImprovementEvent {
  const v = x as any;
  return v?.kind === PRODUCT_IMPROVEMENT_EVENT_KIND
    && (v.schemaVersion === PRODUCT_IMPROVEMENT_EVENT_SCHEMA_VERSION || v.schemaVersion === PRODUCT_IMPROVEMENT_LEGACY_EVENT_SCHEMA_VERSION)
    && typeof v.eventId === "string" && typeof v.operationFingerprint === "string";
}
function validateGovernedHistory(events: ProductConfidenceImprovementEvent[]): void {
  const byOperation = new Map<string, ProductConfidenceImprovementGovernedEvent[]>();
  for (const event of events) {
    if (event.schemaVersion !== "3") continue;
    if (!Number.isInteger(event.eventVersion) || event.eventVersion < 1
      || event.candidateEnvelopeDigest !== materialAcquisitionEnvelopeDigest(event.candidateEnvelope)) {
      throw new Error("Improvement operation contains a malformed governed history.");
    }
    const group = byOperation.get(event.operationId) ?? [];
    group.push(event);
    byOperation.set(event.operationId, group);
  }
  for (const history of byOperation.values()) {
    history.sort((left, right) => left.eventVersion - right.eventVersion);
    for (let index = 0; index < history.length; index += 1) {
      const event = history[index]!;
      const prior = history[index - 1];
      if (event.eventVersion !== index + 1
        || event.supersedesEventId !== (prior?.eventId ?? null)
        || !Number.isFinite(Date.parse(event.occurredAt))
        || (prior && Date.parse(event.occurredAt) < Date.parse(prior.occurredAt))
        || (prior && (event.proposalId !== prior.proposalId
          || event.candidateEnvelope.envelopeId !== prior.candidateEnvelope.envelopeId
          || event.candidateEnvelopeDigest !== prior.candidateEnvelopeDigest
          || event.questionRevision !== prior.questionRevision
          || event.unknownRevisionRef !== prior.unknownRevisionRef
          || event.understandingRevisionRef !== prior.understandingRevisionRef))) {
        throw new Error("Improvement operation contains a contradictory governed history.");
      }
    }
  }
}
export function productConfidenceImprovementEvents(runtime: OrganizationRuntime) {
  const events = runtime.memory.events.filter(isEvent).filter(e => e.organizationId === runtime.metadata.organizationId);
  validateGovernedHistory(events);
  return events;
}
export function recordConfidenceImprovementEvent(input: {
  runtime: OrganizationRuntime; proposal: ProductConfidenceImprovementProposal;
  eventType: ProductConfidenceImprovementEventType; operationId: string; actorRef: string; occurredAt: string;
  resultEvidenceIds?: string[]; resultSourceRefs?: string[]; limitationCode?: string | null; reason?: string | null;
  candidateEnvelope?: MaterialAcquisitionCandidateEnvelope;
  expectedCurrentEventVersion?: number | null;
}): { runtime: OrganizationRuntime; receipt: ProductConfidenceImprovementReceipt } {
  if (!input.actorRef || input.eventType === "improvement-authorized" && !input.proposal.requiresHumanAuthorization) throw new Error("Explicit human authorization is required.");
  const governed = Boolean(input.candidateEnvelope);
  if (governed && (!isCompleteMaterialAcquisitionEnvelope(input.candidateEnvelope!)
    || input.candidateEnvelope!.candidate.candidateId !== input.proposal.proposalId
    || input.candidateEnvelope!.organizationId !== input.proposal.organizationId
    || input.candidateEnvelope!.question.questionId !== input.proposal.questionId
    || input.candidateEnvelope!.unknown.unknownId !== input.proposal.unknownId
    || input.candidateEnvelope!.unknown.unknownVersionRef !== input.proposal.unknownRevisionRef
    || input.candidateEnvelope!.understandingRevisionRef !== input.proposal.understandingRevisionRef)) {
    throw new Error("Improvement governed event requires the exact complete candidate envelope.");
  }
  const operationEvents = productConfidenceImprovementEvents(input.runtime).filter((event) => event.operationId === input.operationId);
  const currentGoverned = operationEvents.filter((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3")
    .reduce<ProductConfidenceImprovementGovernedEvent | undefined>((current, event) => !current || event.eventVersion > current.eventVersion ? event : current, undefined);
  const eventVersion = governed ? (input.expectedCurrentEventVersion ?? 0) + 1 : null;
  const fingerprint = stableId("product-improvement-operation", input.operationId, input.eventType, input.proposal.proposalId, canonical({
    resultEvidenceIds: input.resultEvidenceIds ?? [], resultSourceRefs: input.resultSourceRefs ?? [], limitationCode: input.limitationCode, reason: input.reason,
    candidateEnvelope: input.candidateEnvelope ?? null, eventVersion,
  }));
  const prior = operationEvents.find(e => e.operationFingerprint === fingerprint);
  if (prior) {
    const { kind: _k, schemaVersion: _s, operationFingerprint: _f, ...receipt } = prior;
    return { runtime: input.runtime, receipt };
  }
  if (!governed && operationEvents.length > 0) throw new Error("Improvement operation conflict.");
  if (governed && (currentGoverned?.eventVersion ?? null) !== input.expectedCurrentEventVersion) throw new Error("Improvement operation current version changed.");
  const base = {
    kind: PRODUCT_IMPROVEMENT_EVENT_KIND,
    eventType: input.eventType, eventId: stableId("product-improvement-event", fingerprint),
    operationId: input.operationId, operationFingerprint: fingerprint,
    organizationId: input.proposal.organizationId, questionId: input.proposal.questionId,
    unknownId: input.proposal.unknownId, proposalId: input.proposal.proposalId,
    actionType: input.proposal.actionType, actionTarget: input.proposal.actionTarget,
    actorRef: input.actorRef, occurredAt: input.occurredAt,
    resultEvidenceIds: [...new Set(input.resultEvidenceIds ?? [])].sort(),
    resultSourceRefs: [...new Set(input.resultSourceRefs ?? [])].sort(),
    limitationCode: input.limitationCode ?? null, reason: input.reason ?? null,
  };
  const event: ProductConfidenceImprovementEvent = input.candidateEnvelope ? {
    ...base,
    schemaVersion: PRODUCT_IMPROVEMENT_EVENT_SCHEMA_VERSION,
    eventVersion: eventVersion!,
    supersedesEventId: currentGoverned?.eventId ?? null,
    candidateEnvelope: input.candidateEnvelope,
    candidateEnvelopeDigest: materialAcquisitionEnvelopeDigest(input.candidateEnvelope),
    questionRevision: input.candidateEnvelope.question.revision,
    unknownRevisionRef: input.candidateEnvelope.unknown.unknownVersionRef,
    understandingRevisionRef: input.candidateEnvelope.understandingRevisionRef,
    objectiveVersionRef: input.candidateEnvelope.objectiveVersionRef,
    optimizationContextVersionRef: input.candidateEnvelope.optimizationContextVersionRef,
    authorityRef: input.candidateEnvelope.actionOwner.authorityRef,
    governanceContextRefs: [...input.candidateEnvelope.governanceContextRefs],
  } : {
    ...base,
    schemaVersion: PRODUCT_IMPROVEMENT_LEGACY_EVENT_SCHEMA_VERSION,
  };
  const runtime = { ...input.runtime, memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] } };
  const { kind: _k, schemaVersion: _s, operationFingerprint: _f, ...receipt } = event;
  return { runtime, receipt };
}
