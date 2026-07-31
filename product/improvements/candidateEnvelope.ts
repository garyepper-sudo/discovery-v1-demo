import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  MaterialAcquisitionActionType,
  MaterialAcquisitionCandidateEnvelope,
  MaterialAcquisitionEstimate,
} from "../acquisition";
import { buildDurableProductQuestion } from "../questions";
import { getProductUnknownHistory } from "../unknowns";
import { listOptimizationContextVersions, listOrganizationalObjectiveVersions, objectiveVersionRef, optimizationContextVersionRef } from "../objectives";
import { stableId } from "../workflow/text";
import type { ProductConfidenceImprovementEvent, ProductConfidenceImprovementProposal } from "./contracts";

export type ProductConfidenceImprovementEnvelopeProjection =
  | { status: "complete"; envelope: MaterialAcquisitionCandidateEnvelope; missingFields: [] }
  | { status: "incomplete"; envelope: null; missingFields: string[]; historicalEventId: string };

export type ProductConfidenceImprovementEnvelopeContext = {
  authorityRef: string;
  authorizationSatisfied: boolean;
  governanceAllowed: boolean;
  governanceContextRefs: string[];
  consentState: "not-required" | "required" | "granted" | "declined" | "unknown";
  targetAccessible: boolean;
  executionAvailable: boolean;
  ownerAvailable: boolean;
  expectedInformationClass: string;
  expectedOrganizationalRelevance: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  relevanceToUnknown: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  reliability: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  existingEvidenceQuality: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  directCost: MaterialAcquisitionEstimate<"none" | "low" | "moderate" | "high">;
  reversibility: MaterialAcquisitionEstimate<"reversible" | "partially-reversible" | "irreversible">;
  organizationalBurden: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  requiredSourceAccess: MaterialAcquisitionCandidateEnvelope["requiredSourceAccess"];
  privacyConstraints: string[];
  cancellation: MaterialAcquisitionCandidateEnvelope["cancellation"];
  resourceConstraintRefs: string[];
  assumptions: string[];
  lineage: string[];
  objectiveVersionRef: string | null;
  optimizationContextVersionRef: string | null;
  stoppingCondition: string;
  expectedEvidenceLineage: MaterialAcquisitionCandidateEnvelope["candidate"]["expectedEvidenceLineage"];
  materialEffectTargets: MaterialAcquisitionCandidateEnvelope["candidate"]["materialEffectTargets"];
  projectedAt: string;
};

const actionType: Record<ProductConfidenceImprovementProposal["actionType"], MaterialAcquisitionActionType> = {
  "inspect-existing-evidence": "inspect-existing-evidence",
  "search-authorized-source": "search-authorized-source",
  "request-document": "request-document",
  "ask-authorized-person": "ask-authorized-person",
  "run-comparison": "compare-existing-evidence",
  "collect-measurement": "recommend-measurement",
  "monitor-over-time": "monitor-signal",
  "test-through-decision": "recommend-experiment",
  "wait-for-outcome": "wait-for-outcome",
  "no-safe-operation": "abstain",
};

const available = <T>(value: T, sourceRef: string): MaterialAcquisitionEstimate<T> => ({
  state: "available", value, sourceRef, qualification: "Structured action-owner contract value.", maturity: "owner-provided",
});

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${key}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function materialAcquisitionEnvelopeDigest(envelope: MaterialAcquisitionCandidateEnvelope): string {
  return stableId("material-acquisition-candidate-envelope-digest", canonical(envelope));
}

function assertScopedReference(organizationId: string, reference: string | null): void {
  if (!reference) return;
  const match = reference.match(/^organization:([^:]+):/);
  if (match && match[1] !== organizationId) throw new Error("Candidate envelope contains a cross-organization reference.");
}

function unavailableFields(envelope: Omit<MaterialAcquisitionCandidateEnvelope, "envelopeId" | "unavailableFields" | "withheldFields">): string[] {
  const fields: string[] = [];
  const visit = (value: unknown, path: string) => {
    if (value && typeof value === "object" && "state" in value) {
      if ((value as { state: string }).state !== "available" && (value as { state: string }).state !== "not-applicable") fields.push(path);
      return;
    }
    if (Array.isArray(value)) return;
    if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) visit(item, path ? `${path}.${key}` : key);
  };
  visit(envelope, "");
  return fields.sort();
}

export function projectConfidenceImprovementCandidateEnvelope(input: {
  runtime: OrganizationRuntime;
  proposal: ProductConfidenceImprovementProposal;
  context: ProductConfidenceImprovementEnvelopeContext;
}): MaterialAcquisitionCandidateEnvelope {
  const { runtime, proposal, context } = input;
  if (proposal.organizationId !== runtime.metadata.organizationId) throw new Error("Candidate envelope organization mismatch.");
  const question = buildDurableProductQuestion({ runtime, questionId: proposal.questionId });
  if (!question) throw new Error("Candidate envelope Product Question was not found.");
  const unknownHistory = getProductUnknownHistory({ runtime, questionId: proposal.questionId, unknownId: proposal.unknownId });
  const unknown = unknownHistory.find((event) => event.eventId === proposal.unknownRevisionRef);
  if (!unknown || unknownHistory.at(-1)?.eventId !== unknown.eventId) throw new Error("Candidate envelope requires the exact current Unknown revision.");
  const currentUnderstanding = `organization:${proposal.organizationId}:understanding:${runtime.metadata.investigationCount}`;
  if (proposal.understandingRevisionRef !== currentUnderstanding) throw new Error("Candidate envelope requires the exact current Understanding revision.");
  if (!Number.isFinite(Date.parse(context.projectedAt)) || !context.authorityRef.trim()) throw new Error("Candidate envelope projection authority and time are required.");
  for (const reference of [
    context.authorityRef, context.objectiveVersionRef, context.optimizationContextVersionRef,
    ...context.governanceContextRefs, ...context.resourceConstraintRefs, ...context.lineage,
    ...context.requiredSourceAccess.flatMap((item) => [item.sourceScopeRef, item.authorizationRef]),
    context.expectedEvidenceLineage?.sourceScopeRef ?? null,
    ...proposal.sourceScopeRefs, ...proposal.personScopeRefs,
  ]) assertScopedReference(proposal.organizationId, reference);
  if (context.objectiveVersionRef) {
    const exists = listOrganizationalObjectiveVersions(runtime).some((objective) =>
      objectiveVersionRef(objective.organizationId, objective.objectiveId, objective.version) === context.objectiveVersionRef);
    if (!exists) throw new Error("Candidate envelope Objective version is unavailable.");
  }
  if (context.optimizationContextVersionRef) {
    const exists = listOptimizationContextVersions(runtime).some((item) =>
      optimizationContextVersionRef(item.organizationId, item.optimizationContextId, item.version) === context.optimizationContextVersionRef);
    if (!exists) throw new Error("Candidate envelope Optimization Context version is unavailable.");
  }

  const targetRef = stableId("product-improvement-target", proposal.organizationId, proposal.proposalId, JSON.stringify(proposal.actionTarget));
  const ownerRef = "product-confidence-improvement";
  const reasonCodes = [
    context.ownerAvailable ? null : "owner-unavailable",
    context.targetAccessible ? null : "target-inaccessible",
    context.executionAvailable ? null : "execution-unavailable",
    context.authorizationSatisfied ? null : "authorization-denied",
    context.governanceAllowed ? null : "governance-prohibited",
    context.consentState === "granted" || context.consentState === "not-required" ? null : `consent-${context.consentState}`,
    context.materialEffectTargets.length ? "material-effect-confirmed" : null,
  ].filter((value): value is string => Boolean(value)).sort();
  const base = {
    schemaVersion: "1" as const,
    organizationId: proposal.organizationId,
    actionOwner: { ownerRef, contractVersion: "3", authorityRef: context.authorityRef },
    candidate: {
      candidateId: proposal.proposalId,
      actionType: actionType[proposal.actionType],
      actionOwnerRef: ownerRef,
      target: { kind: proposal.actionTarget.kind, targetRef, organizationId: proposal.organizationId },
      uncertaintyRef: proposal.unknownRevisionRef,
      materialEffectTargets: [...context.materialEffectTargets].sort(),
      eligibility: {
        ownerAvailable: context.ownerAvailable, targetAccessible: context.targetAccessible,
        executionAvailable: context.executionAvailable, authorizationSatisfied: context.authorizationSatisfied,
        governanceAllowed: context.governanceAllowed, consentState: context.consentState, reasonCodes,
      },
      expectedInformationContribution: available(proposal.expectedValue.understandingImprovement, `proposal:${proposal.proposalId}:expected-value`),
      expectedOrganizationalRelevance: context.expectedOrganizationalRelevance,
      expectedDiscriminationGain: available(proposal.expectedValue.discriminationGain, `proposal:${proposal.proposalId}:discrimination-gain`),
      burden: available(proposal.executionCost.burden, `proposal:${proposal.proposalId}:burden`),
      cost: context.directCost,
      delay: available<"immediate" | "short" | "material" | "unknown">(proposal.executionCost.delay === "immediate" ? "immediate" : proposal.executionCost.delay === "short" ? "short" : "material", `proposal:${proposal.proposalId}:delay`),
      reliability: context.reliability,
      existingEvidenceQuality: context.existingEvidenceQuality,
      reversibility: context.reversibility,
      stoppingCondition: context.stoppingCondition,
      expectedEvidenceLineage: context.expectedEvidenceLineage,
    },
    question: { questionId: proposal.questionId, revision: question.revision },
    unknown: { unknownId: proposal.unknownId, unknownVersionRef: proposal.unknownRevisionRef },
    understandingRevisionRef: proposal.understandingRevisionRef,
    objectiveVersionRef: context.objectiveVersionRef,
    optimizationContextVersionRef: context.optimizationContextVersionRef,
    expectedInformationClass: context.expectedInformationClass,
    relevanceToUnknown: context.relevanceToUnknown,
    requiredSourceAccess: context.requiredSourceAccess.map((item) => ({ ...item })).sort((a, b) => a.sourceScopeRef.localeCompare(b.sourceScopeRef)),
    privacyConstraints: [...new Set(context.privacyConstraints)].sort(),
    humanBurden: available(proposal.executionCost.burden, `proposal:${proposal.proposalId}:human-burden`),
    organizationalBurden: context.organizationalBurden,
    cancellation: { ...context.cancellation },
    resourceConstraintRefs: [...new Set(context.resourceConstraintRefs)].sort(),
    governanceContextRefs: [...new Set(context.governanceContextRefs)].sort(),
    assumptions: [...new Set(context.assumptions)].sort(),
    lineage: [...new Set([`proposal:${proposal.proposalId}`, `unknown:${proposal.unknownRevisionRef}`, ...context.lineage])].sort(),
    projectedAt: context.projectedAt,
  };
  const unavailable = unavailableFields(base);
  const withheld = unavailable.filter((field) => {
    const parts = field.split(".");
    let value: any = base;
    for (const part of parts) value = value?.[part];
    return value?.state === "permission-withheld" || value?.state === "intentionally-undisclosed";
  });
  const envelopeId = stableId("material-acquisition-candidate-envelope", canonical(base), unavailable.join("|"), withheld.join("|"));
  return { ...base, envelopeId, unavailableFields: unavailable, withheldFields: withheld };
}

export function isCompleteMaterialAcquisitionEnvelope(envelope: MaterialAcquisitionCandidateEnvelope): boolean {
  return envelope.unavailableFields.length === 0
    && envelope.schemaVersion === "1"
    && Boolean(envelope.envelopeId.trim() && envelope.organizationId.trim()
      && envelope.actionOwner.ownerRef.trim() && envelope.actionOwner.contractVersion.trim()
      && envelope.actionOwner.authorityRef.trim() && envelope.candidate.candidateId.trim()
      && envelope.question.questionId.trim() && envelope.unknown.unknownId.trim()
      && envelope.unknown.unknownVersionRef.trim() && envelope.understandingRevisionRef.trim()
      && envelope.expectedInformationClass.trim() && envelope.candidate.stoppingCondition.trim()
      && envelope.cancellation.characteristics.trim() && envelope.projectedAt.trim())
    && envelope.candidate.eligibility.ownerAvailable
    && envelope.candidate.eligibility.targetAccessible
    && envelope.candidate.eligibility.executionAvailable
    && envelope.candidate.eligibility.authorizationSatisfied
    && envelope.candidate.eligibility.governanceAllowed
    && (envelope.candidate.eligibility.consentState === "granted" || envelope.candidate.eligibility.consentState === "not-required");
}

export function projectStoredImprovementCandidateEnvelope(event: ProductConfidenceImprovementEvent): ProductConfidenceImprovementEnvelopeProjection {
  if (event.schemaVersion === "3") {
    return isCompleteMaterialAcquisitionEnvelope(event.candidateEnvelope)
      ? { status: "complete", envelope: event.candidateEnvelope, missingFields: [] }
      : { status: "incomplete", envelope: null, missingFields: [...event.candidateEnvelope.unavailableFields], historicalEventId: event.eventId };
  }
  return {
    status: "incomplete",
    envelope: null,
    historicalEventId: event.eventId,
    missingFields: [
      "authorization-state", "governance-state", "expected-information-contribution",
      "expected-organizational-relevance", "expected-discrimination-gain", "burden",
      "direct-cost", "expected-delay", "reliability", "existing-evidence-quality",
      "reversibility", "question-revision", "objective-version", "optimization-context-version",
    ],
  };
}
