import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { productAnswerVersions } from "../answers";
import { getProductUnknownHistory } from "../unknowns";
import { stableId } from "../workflow/text";
import {
  PRODUCT_IMPROVEMENT_OUTCOME_EVENT_KIND,
  PRODUCT_IMPROVEMENT_OUTCOME_EVENT_SCHEMA_VERSION,
  type ProductConfidenceImprovementGovernedEvent,
  type ProductConfidenceImprovementOutcomeObservation,
} from "./contracts";
import { productConfidenceImprovementEvents } from "./improvementLifecycle";

export type ProductConfidenceImprovementOutcomeObservationInput = Omit<ProductConfidenceImprovementOutcomeObservation,
  "kind" | "schemaVersion" | "observationId" | "observationVersion" | "supersedesObservationId" | "operationFingerprint">;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${key}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function isOutcome(value: unknown): value is ProductConfidenceImprovementOutcomeObservation {
  const event = value as Partial<ProductConfidenceImprovementOutcomeObservation>;
  return event?.kind === PRODUCT_IMPROVEMENT_OUTCOME_EVENT_KIND
    && event.schemaVersion === PRODUCT_IMPROVEMENT_OUTCOME_EVENT_SCHEMA_VERSION
    && typeof event.observationId === "string"
    && typeof event.observationVersion === "number"
    && typeof event.operationFingerprint === "string";
}

export function productConfidenceImprovementOutcomeObservations(runtime: OrganizationRuntime): ProductConfidenceImprovementOutcomeObservation[] {
  const events = runtime.memory.events.filter(isOutcome)
    .filter((event) => event.organizationId === runtime.metadata.organizationId);
  const byOperation = new Map<string, ProductConfidenceImprovementOutcomeObservation[]>();
  for (const event of events) {
    const history = byOperation.get(event.operationId) ?? [];
    history.push(event);
    byOperation.set(event.operationId, history);
  }
  for (const history of byOperation.values()) {
    history.sort((left, right) => left.observationVersion - right.observationVersion);
    for (let index = 0; index < history.length; index += 1) {
      const event = history[index]!;
      if (event.observationVersion !== index + 1
        || event.supersedesObservationId !== (history[index - 1]?.observationId ?? null)
        || !Number.isFinite(Date.parse(event.occurredAt))
        || (history[index - 1] && Date.parse(event.occurredAt) < Date.parse(history[index - 1]!.occurredAt))) {
        throw new Error("Improvement outcome contains a contradictory observation history.");
      }
    }
  }
  return events.sort((left, right) => left.observationVersion - right.observationVersion || left.observationId.localeCompare(right.observationId));
}

function assertScopedReference(organizationId: string, reference: string): void {
  const match = reference.match(/^organization:([^:]+):/);
  if (match && match[1] !== organizationId) throw new Error("Improvement outcome contains a cross-organization reference.");
}

function assertUnderstandingReference(runtime: OrganizationRuntime, reference: string): void {
  assertScopedReference(runtime.metadata.organizationId, reference);
  const prefix = `organization:${runtime.metadata.organizationId}:understanding:`;
  if (!reference.startsWith(prefix)) throw new Error("Improvement outcome Understanding reference is invalid.");
  const revision = Number(reference.slice(prefix.length));
  if (!Number.isInteger(revision) || revision < 0 || revision > runtime.metadata.investigationCount) {
    throw new Error("Improvement outcome Understanding revision is unavailable.");
  }
}

function assertExactReferences(runtime: OrganizationRuntime, input: ProductConfidenceImprovementOutcomeObservationInput): ProductConfidenceImprovementGovernedEvent {
  if (input.organizationId !== runtime.metadata.organizationId) throw new Error("Improvement outcome organization mismatch.");
  const operation = productConfidenceImprovementEvents(runtime)
    .find((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3" && event.eventId === input.operationEventId);
  if (!operation || operation.operationId !== input.operationId || operation.questionId !== input.questionId
    || operation.unknownId !== input.unknownId || operation.proposalId !== input.proposalId) {
    throw new Error("Improvement outcome operation lineage is unavailable.");
  }
  const unknownHistory = getProductUnknownHistory({ runtime, questionId: input.questionId, unknownId: input.unknownId });
  const beforeUnknown = unknownHistory.find((event) => event.eventId === input.before.unknownVersionRef);
  if (!beforeUnknown) throw new Error("Improvement outcome prior Unknown revision is unavailable.");
  const afterUnknown = input.after.unknownVersionRef
    ? unknownHistory.find((event) => event.eventId === input.after.unknownVersionRef)
    : null;
  if (input.after.unknownVersionRef && !afterUnknown) throw new Error("Improvement outcome subsequent Unknown revision is unavailable.");
  const answers = productAnswerVersions({ runtime, questionId: input.questionId });
  for (const reference of [input.before.answerVersionRef, input.after.answerVersionRef]) {
    if (reference && !answers.some((answer) => answer.answerVersionId === reference)) throw new Error("Improvement outcome Answer revision is unavailable.");
  }
  const evidenceIds = new Set(runtime.organizationModel.nodes.filter((node) => node.type === "evidence").map((node) => node.id));
  if (input.admittedEvidenceIds.some((id) => !evidenceIds.has(id))) {
    throw new Error("Improvement outcome admitted Evidence is unavailable from canonical Evidence governance.");
  }
  assertUnderstandingReference(runtime, input.before.understandingRevisionRef);
  if (input.after.understandingRevisionRef) assertUnderstandingReference(runtime, input.after.understandingRevisionRef);
  for (const reference of [
    ...input.resultArtifactRefs, ...input.informationRefs, ...input.evidenceCandidateRefs,
    ...input.admittedEvidenceIds, input.observationSourceRef, input.observerAuthorityRef,
  ]) assertScopedReference(input.organizationId, reference);
  const expectedEventType = {
    authorized: "improvement-authorized", declined: "improvement-declined", started: "improvement-initiated",
    cancelled: "improvement-cancelled", completed: "improvement-completed", failed: "improvement-failed",
  }[input.state];
  if (operation.eventType !== expectedEventType) throw new Error("Improvement outcome state does not match the exact operation lifecycle event.");
  if (Date.parse(operation.occurredAt) > Date.parse(input.occurredAt)) throw new Error("Improvement outcome chronology is invalid.");

  const unknownSame = input.after.unknownVersionRef === input.before.unknownVersionRef;
  if (input.observedChange.unknown === "unchanged" && !unknownSame) throw new Error("Unknown unchanged classification contradicts exact revisions.");
  if (["changed", "narrowed", "resolved"].includes(input.observedChange.unknown) && (!afterUnknown || unknownSame)) {
    throw new Error("Unknown changed classification requires distinct exact revisions.");
  }
  if (input.observedChange.unknown === "resolved" && afterUnknown?.eventType !== "unknown-resolved") {
    throw new Error("Unknown resolved classification contradicts the exact revision.");
  }
  if (input.observedChange.unknown === "narrowed" && afterUnknown?.eventType !== "unknown-targeted") {
    throw new Error("Unknown narrowed classification contradicts the exact revision.");
  }
  const answerSame = input.after.answerVersionRef === input.before.answerVersionRef;
  if (input.observedChange.answer === "unchanged" && !answerSame) throw new Error("Answer unchanged classification contradicts exact revisions.");
  if (input.observedChange.answer === "changed" && (!input.after.answerVersionRef || answerSame)) throw new Error("Answer changed classification requires distinct exact revisions.");
  const understandingSame = input.after.understandingRevisionRef === input.before.understandingRevisionRef;
  if (input.observedChange.understanding === "unchanged" && !understandingSame) throw new Error("Understanding unchanged classification contradicts exact revisions.");
  if (input.observedChange.understanding === "changed" && (!input.after.understandingRevisionRef || understandingSame)) throw new Error("Understanding changed classification requires distinct exact revisions.");
  return operation;
}

function assertTruthfulOutcome(input: ProductConfidenceImprovementOutcomeObservationInput): void {
  if (!Number.isFinite(Date.parse(input.occurredAt))) throw new Error("Improvement outcome observation time is invalid.");
  if (input.state === "completed" && !input.completedAt) throw new Error("Completed improvement outcome requires a completion time.");
  if (input.state !== "completed" && input.completedAt) throw new Error("Only a completed improvement outcome may have a completion time.");
  if (input.evidenceAdmissionDisposition === "admitted" && input.admittedEvidenceIds.length === 0) throw new Error("Admitted Evidence disposition requires exact Evidence references.");
  if (input.evidenceAdmissionDisposition === "partially-admitted" && input.admittedEvidenceIds.length === 0) throw new Error("Partial Evidence admission requires exact Evidence references.");
  if (input.evidenceAdmissionDisposition === "not-evaluated" || input.evidenceAdmissionDisposition === "rejected") {
    if (input.admittedEvidenceIds.length > 0) throw new Error("Non-admission outcome cannot retain admitted Evidence references.");
  }
  const noAdmission = input.admittedEvidenceIds.length === 0;
  if (noAdmission && (input.observedChange.unknown !== "unmeasured" && input.observedChange.unknown !== "unchanged"
    || input.observedChange.answer === "changed" || input.observedChange.understanding === "changed")) {
    throw new Error("Improvement without admitted Evidence cannot claim cognitive improvement.");
  }
  if (!input.after.unknownVersionRef && input.observedChange.unknown !== "unmeasured") throw new Error("Unknown change requires an exact subsequent revision.");
  if (!input.after.answerVersionRef && input.observedChange.answer !== "unmeasured") throw new Error("Answer change requires an exact subsequent revision.");
  if (!input.after.understandingRevisionRef && input.observedChange.understanding !== "unmeasured") throw new Error("Understanding change requires an exact subsequent revision.");
  if (input.completedAt && (Date.parse(input.completedAt) > Date.parse(input.occurredAt))) throw new Error("Improvement outcome completion chronology is invalid.");
}

export function recordConfidenceImprovementOutcomeObservation(input: {
  runtime: OrganizationRuntime;
  observation: ProductConfidenceImprovementOutcomeObservationInput;
  expectedCurrentVersion: number | null;
}): { runtime: OrganizationRuntime; observation: ProductConfidenceImprovementOutcomeObservation; idempotent: boolean } {
  assertExactReferences(input.runtime, input.observation);
  assertTruthfulOutcome(input.observation);
  const existing = productConfidenceImprovementOutcomeObservations(input.runtime)
    .filter((event) => event.operationId === input.observation.operationId);
  const current = existing.reduce<ProductConfidenceImprovementOutcomeObservation | undefined>((latest, event) =>
    !latest || event.observationVersion > latest.observationVersion ? event : latest, undefined);
  const observationVersion = (input.expectedCurrentVersion ?? 0) + 1;
  const fingerprint = stableId("product-improvement-outcome-operation", input.observation.operationId, String(observationVersion), canonical(input.observation));
  const replay = existing.find((event) => event.operationFingerprint === fingerprint);
  if (replay) return { runtime: input.runtime, observation: replay, idempotent: true };
  if ((current?.observationVersion ?? null) !== input.expectedCurrentVersion) throw new Error("Improvement outcome current version changed.");
  const observationId = stableId("product-improvement-outcome-event", fingerprint);
  const event: ProductConfidenceImprovementOutcomeObservation = {
    ...input.observation,
    kind: PRODUCT_IMPROVEMENT_OUTCOME_EVENT_KIND,
    schemaVersion: PRODUCT_IMPROVEMENT_OUTCOME_EVENT_SCHEMA_VERSION,
    observationId,
    observationVersion,
    supersedesObservationId: current?.observationId ?? null,
    operationFingerprint: fingerprint,
    resultArtifactRefs: [...new Set(input.observation.resultArtifactRefs)].sort(),
    informationRefs: [...new Set(input.observation.informationRefs)].sort(),
    evidenceCandidateRefs: [...new Set(input.observation.evidenceCandidateRefs)].sort(),
    admittedEvidenceIds: [...new Set(input.observation.admittedEvidenceIds)].sort(),
    limitations: [...new Set(input.observation.limitations)].sort(),
  };
  return {
    runtime: { ...input.runtime, memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] } },
    observation: event,
    idempotent: false,
  };
}
