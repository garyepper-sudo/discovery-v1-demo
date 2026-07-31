export const PRODUCT_UNKNOWN_EVENT_KIND = "product-question-unknown-event" as const;
export const PRODUCT_UNKNOWN_EVENT_SCHEMA_VERSION = "2" as const;

export type ProductUnknownCategory =
  | "missing-evidence"
  | "missing-relationship"
  | "unresolved-contradiction"
  | "competing-explanation-discrimination"
  | "measurement-gap"
  | "authority-or-ownership-gap"
  | "freshness-gap"
  | "scope-or-permission-gap"
  | "outcome-validation-gap"
  | "unsupported-assumption";

export type ProductUnknownTarget =
  | { kind: "explanation"; explanationId: string }
  | { kind: "relationship"; subjectRef: string; predicate: string; objectRef: string }
  | { kind: "measurement"; metricRef: string; scopeRef: string }
  | { kind: "authority"; authorityScopeRef: string }
  | { kind: "freshness"; understandingRef: string; sourceScopeRef: string }
  | { kind: "permission"; restrictedScopeRef: string }
  | { kind: "outcome"; decisionId: string; expectedOutcomeRef: string }
  | { kind: "assumption"; assumptionRef: string };

export type ProductUnknownSourceAncestry = Array<{
  kind:
    | "answer-operation"
    | "answer-version"
    | "evidence"
    | "explanation"
    | "contradiction"
    | "freshness-evaluation"
    | "permission-evaluation"
    | "decision"
    | "outcome"
    | "governed-determination";
  id: string;
}>;

export type ProductUnknownResolutionAncestry =
  | { kind: "evidence"; evidenceIds: string[] }
  | { kind: "outcome"; outcomeVersionId: string }
  | { kind: "decision"; decisionId: string }
  | { kind: "governed-determination"; determinationRef: string };

export type ProductUnknownStatus =
  | "open"
  | "targeted"
  | "resolved"
  | "superseded"
  | "retired";

export type ProductUnknownCandidate = {
  unknownId: string;
  organizationId: string;
  questionId: string;
  category: ProductUnknownCategory;
  target: ProductUnknownTarget;
  summary: string;
  whyItMatters: string;
  sourceAncestry: ProductUnknownSourceAncestry;
};

export type ProductUnknownLifecycleEventType =
  | "unknown-opened"
  | "unknown-targeted"
  | "unknown-resolved"
  | "unknown-reopened"
  | "unknown-superseded"
  | "unknown-retired";

export type ProductUnknownLifecycleEvent = {
  kind: typeof PRODUCT_UNKNOWN_EVENT_KIND;
  schemaVersion: typeof PRODUCT_UNKNOWN_EVENT_SCHEMA_VERSION;
  eventType: ProductUnknownLifecycleEventType;
  eventId: string;
  operationId: string;
  operationFingerprint: string;
  organizationId: string;
  questionId: string;
  unknownId: string;
  category: ProductUnknownCategory;
  target: ProductUnknownTarget;
  sourceAncestry: ProductUnknownSourceAncestry;
  summary: string;
  whyItMatters: string;
  reason: string;
  actorRef: string;
  authorizationScopeRef: string;
  occurredAt: string;
  targetingOperationRef: string | null;
  resolutionAncestry: ProductUnknownResolutionAncestry | null;
  supersededByUnknownId: string | null;
};

export type ProductUnknownProjection = {
  unknownId: string;
  organizationId: string;
  questionId: string;
  category: ProductUnknownCategory;
  target: ProductUnknownTarget;
  status: ProductUnknownStatus;
  summary: string;
  whyItMatters: string;
  sourceAncestry: ProductUnknownSourceAncestry;
  resolutionAncestry: ProductUnknownResolutionAncestry | null;
  openedAt: string;
  lastChangedAt: string;
  current: boolean;
  actionable: boolean;
  supersededByUnknownId: string | null;
  targetingOperationRef: string | null;
};

export type ProductUnknownOperationReceipt = {
  operationId: string;
  organizationId: string;
  questionId: string;
  unknownId: string;
  result:
    | "opened"
    | "targeted"
    | "resolved"
    | "reopened"
    | "superseded"
    | "retired";
  priorStatus: ProductUnknownStatus | null;
  currentStatus: ProductUnknownStatus;
  eventId: string;
  changeProduced: true;
  limitationCode: null;
  occurredAt: string;
};

export type ProductUnknownOperationInput = {
  runtime: import("../../engine/v3/runtime/organizationRuntime").OrganizationRuntime;
  questionId: string;
  operationId: string;
  occurredAt: string;
  actorRef: string;
  authorizationScopeRef: string;
  candidate: ProductUnknownCandidate;
  transition:
    | { type: "open" }
    | { type: "target"; targetingOperationRef: string }
    | { type: "resolve"; resolutionAncestry: ProductUnknownResolutionAncestry }
    | { type: "reopen"; sourceAncestry: ProductUnknownSourceAncestry }
    | { type: "supersede"; replacement: ProductUnknownCandidate }
    | { type: "retire" };
  reason: string;
};
