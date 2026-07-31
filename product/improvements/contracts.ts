import type { MaterialAcquisitionCandidateEnvelope } from "../acquisition";

export const PRODUCT_IMPROVEMENT_EVENT_KIND = "product-question-improvement-event" as const;
export const PRODUCT_IMPROVEMENT_EVENT_SCHEMA_VERSION = "3" as const;
export const PRODUCT_IMPROVEMENT_LEGACY_EVENT_SCHEMA_VERSION = "2" as const;
export const PRODUCT_IMPROVEMENT_OUTCOME_EVENT_KIND = "product-question-improvement-outcome-event" as const;
export const PRODUCT_IMPROVEMENT_OUTCOME_EVENT_SCHEMA_VERSION = "1" as const;

export type ProductConfidenceImprovementActionType =
  | "inspect-existing-evidence" | "search-authorized-source" | "request-document"
  | "ask-authorized-person" | "run-comparison" | "collect-measurement"
  | "monitor-over-time" | "test-through-decision" | "wait-for-outcome"
  | "no-safe-operation";

export type ProductConfidenceImprovementTarget =
  | { kind: "existing-evidence-set"; evidenceIds: string[] }
  | { kind: "authorized-source"; connectedSourceId: string; queryScope: string }
  | { kind: "document-request"; documentType: string; ownerScopeRef: string | null }
  | { kind: "person-question"; personScopeRef: string; questionPrompt: string }
  | { kind: "comparison"; comparisonSubjects: string[]; measureRefs: string[] }
  | { kind: "measurement"; metricRef: string; scopeRef: string; observationWindow: string | null }
  | { kind: "monitoring"; signalRef: string; cadenceRef: string }
  | { kind: "decision-test"; explanationRefs: string[]; expectedOutcomeRef: string }
  | { kind: "outcome-wait"; decisionId: string; expectedOutcomeRef: string }
  | { kind: "none"; reasonCode: string };

export type ProductConfidenceImprovementProposal = {
  contractVersion: 1;
  proposalId: string; opportunityId: string;
  organizationId: string; questionId: string; unknownId: string;
  actionType: ProductConfidenceImprovementActionType;
  actionTarget: ProductConfidenceImprovementTarget;
  summary: string; rationale: string;
  expectedValue: {
    understandingImprovement: "low" | "moderate" | "high";
    discriminationGain: "low" | "moderate" | "high";
    confidenceImpact: "none-expected" | "possible" | "likely";
    explanation: string;
  };
  executionCost: {
    effort: "low" | "moderate" | "high";
    delay: "immediate" | "short" | "medium" | "long";
    burden: "low" | "moderate" | "high";
    governanceRisk: "low" | "moderate" | "high";
  };
  prerequisites: Array<{ kind: string; ref: string }>;
  sourceScopeRefs: string[]; personScopeRefs: string[];
  answerVersionId: string | null; abstentionOperationId: string | null;
  understandingRevisionRef: string; unknownRevisionRef: string;
  requiresHumanAuthorization: true; generatedAt: string;
};

export type ProductConfidenceImprovementResult =
  | { kind: "proposals"; proposals: ProductConfidenceImprovementProposal[]; highestValueProposalId: string | null; rankingExplanation: string }
  | { kind: "no-safe-operation"; reason: "no-authorized-source" | "permission-limited" | "awaiting-outcome" | "existing-evidence-exhausted" | "burden-disproportionate" | "unknown-not-actionable" | "insufficient-target-definition"; limitation: string };

export type ProductConfidenceImprovementEventType =
  | "improvement-authorized" | "improvement-initiated" | "improvement-completed"
  | "improvement-no-change" | "improvement-declined" | "improvement-deferred" | "improvement-unavailable"
  | "improvement-failed" | "improvement-cancelled";

type ProductConfidenceImprovementEventBase = {
  kind: typeof PRODUCT_IMPROVEMENT_EVENT_KIND;
  eventType: ProductConfidenceImprovementEventType;
  eventId: string; operationId: string; operationFingerprint: string;
  organizationId: string; questionId: string; unknownId: string; proposalId: string;
  actionType: ProductConfidenceImprovementActionType;
  actionTarget: ProductConfidenceImprovementTarget;
  actorRef: string; occurredAt: string;
  resultEvidenceIds: string[]; resultSourceRefs: string[];
  limitationCode: string | null; reason: string | null;
};

export type ProductConfidenceImprovementLegacyEvent = ProductConfidenceImprovementEventBase & {
  schemaVersion: typeof PRODUCT_IMPROVEMENT_LEGACY_EVENT_SCHEMA_VERSION;
};

export type ProductConfidenceImprovementGovernedEvent = ProductConfidenceImprovementEventBase & {
  schemaVersion: typeof PRODUCT_IMPROVEMENT_EVENT_SCHEMA_VERSION;
  eventVersion: number;
  supersedesEventId: string | null;
  candidateEnvelope: MaterialAcquisitionCandidateEnvelope;
  candidateEnvelopeDigest: string;
  questionRevision: number;
  unknownRevisionRef: string;
  understandingRevisionRef: string;
  objectiveVersionRef: string | null;
  optimizationContextVersionRef: string | null;
  authorityRef: string;
  governanceContextRefs: string[];
};

export type ProductConfidenceImprovementEvent =
  | ProductConfidenceImprovementLegacyEvent
  | ProductConfidenceImprovementGovernedEvent;

export type ProductConfidenceImprovementReceipt = Omit<ProductConfidenceImprovementEvent, "kind" | "schemaVersion" | "operationFingerprint">;

export type ProductConfidenceImprovementOutcomeState =
  | "authorized" | "declined" | "started" | "cancelled" | "completed" | "failed";

export type ProductConfidenceImprovementOutcomeObservation = {
  kind: typeof PRODUCT_IMPROVEMENT_OUTCOME_EVENT_KIND;
  schemaVersion: typeof PRODUCT_IMPROVEMENT_OUTCOME_EVENT_SCHEMA_VERSION;
  observationId: string;
  observationVersion: number;
  supersedesObservationId: string | null;
  operationId: string;
  operationEventId: string;
  organizationId: string;
  questionId: string;
  unknownId: string;
  proposalId: string;
  state: ProductConfidenceImprovementOutcomeState;
  completedAt: string | null;
  actualBurden: "low" | "moderate" | "high" | "unknown";
  actualDirectCost: { state: "known"; value: number; currency: string } | { state: "unknown" } | { state: "not-applicable" };
  actualDelay: "immediate" | "short" | "material" | "unknown";
  resultArtifactRefs: string[];
  informationRefs: string[];
  evidenceCandidateRefs: string[];
  admittedEvidenceIds: string[];
  evidenceAdmissionDisposition: "not-evaluated" | "rejected" | "partially-admitted" | "admitted";
  before: { unknownVersionRef: string; answerVersionRef: string | null; understandingRevisionRef: string };
  after: { unknownVersionRef: string | null; answerVersionRef: string | null; understandingRevisionRef: string | null };
  observedChange: { unknown: "unmeasured" | "unchanged" | "narrowed" | "resolved" | "changed"; answer: "unmeasured" | "unchanged" | "changed"; understanding: "unmeasured" | "unchanged" | "changed" };
  limitations: string[];
  observationSourceRef: string;
  observerRef: string;
  observerAuthorityRef: string;
  occurredAt: string;
  operationFingerprint: string;
};
