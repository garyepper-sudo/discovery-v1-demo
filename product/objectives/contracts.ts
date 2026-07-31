export const PRODUCT_OBJECTIVE_EVENT_KIND = "product-organizational-objective-event" as const;
export const PRODUCT_OPTIMIZATION_CONTEXT_EVENT_KIND = "product-optimization-context-event" as const;
export const PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION = "1" as const;

export type ProductObjectiveScope =
  | { kind: "organization" }
  | { kind: "team"; teamRef: string }
  | { kind: "initiative"; initiativeRef: string }
  | { kind: "question"; questionId: string };

export type ProductOrganizationalObjective = {
  contractVersion: "1";
  objectiveId: string;
  organizationId: string;
  scope: ProductObjectiveScope;
  statement: string;
  desiredChange: {
    target: string;
    direction: "increase" | "decrease" | "maintain" | "achieve" | "avoid";
  };
  successCriteria: Array<{
    criterionId: string;
    statement: string;
    indicatorRef: string | null;
    target: { kind: "qualitative"; description: string }
      | { kind: "quantitative"; value: number; unit: string };
  }>;
  horizon: { startsAt: string | null; targetBy: string | null; reviewAt: string | null };
  status: "proposed" | "inferred" | "confirmed" | "active" | "suspended"
    | "achieved" | "abandoned" | "expired" | "superseded";
  epistemicConfidence: "low" | "moderate" | "high" | null;
  authority: {
    sourceKind: "authorized-user" | "governed-policy" | "decision" | "inference";
    sourceRef: string;
    authorityScopeRef: string | null;
    authorityBasis: string;
    authorizedToEstablish: boolean;
  };
  ancestry: { evidenceRefs: string[]; questionRefs: string[]; decisionRefs: string[]; sourceRefs: string[] };
  parentObjectiveVersionRef: string | null;
  constraintRefs: string[];
  version: number;
  supersedesObjectiveVersionRef: string | null;
  establishedAt: string;
};

export type ProductOptimizationContext = {
  contractVersion: "1";
  optimizationContextId: string;
  organizationId: string;
  objectiveVersionRef: string;
  priorityMode: "maximize-progress" | "minimize-downside" | "maximize-learning"
    | "preserve-optionality" | "balance";
  timePreference: {
    horizon: "immediate" | "near-term" | "medium-term" | "long-term";
    urgency: "low" | "moderate" | "high" | "critical";
    delayTolerance: "low" | "moderate" | "high";
  };
  riskPreference: {
    downsideTolerance: "low" | "moderate" | "high";
    uncertaintyTolerance: "low" | "moderate" | "high";
    irreversibleActionTolerance: "low" | "moderate" | "high";
    riskCapacityAssessmentRef: string | null;
  };
  resourceConstraintRefs: string[];
  governanceConstraintRefs: string[];
  tradeoffPreferences: Array<{
    preferenceId: string;
    criterion: string;
    direction: "increase" | "decrease" | "preserve";
    precedence: "primary" | "secondary" | "tie-breaker";
  }>;
  minimumEvidenceStandard: "exploratory" | "directional" | "substantial" | "high-confidence";
  alternativesRequirement: { minimumMeaningfulAlternatives: number; includeStatusQuo: boolean };
  source: "explicit" | "authorized-policy" | "derived-conditional";
  sourceRef: string | null;
  authorityScopeRef: string;
  assumptions: string[];
  version: number;
  supersedesOptimizationContextVersionRef: string | null;
};

export type ProductObjectiveAuthorityGrant = {
  actorRef: string;
  authorityScopeRef: string;
  authorized: boolean;
  authorizedAt: string;
};

export type ProductObjectiveReferenceValidation = {
  valid: boolean;
  invalidRefs: string[];
};

export type ProductObjectiveVersionEvent = {
  kind: typeof PRODUCT_OBJECTIVE_EVENT_KIND;
  schemaVersion: typeof PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION;
  eventId: string;
  operationId: string;
  organizationId: string;
  objectiveVersionRef: string;
  objective: ProductOrganizationalObjective;
  actorRef: string;
  authorityScopeRef: string;
  occurredAt: string;
};

export type ProductOptimizationContextVersionEvent = {
  kind: typeof PRODUCT_OPTIMIZATION_CONTEXT_EVENT_KIND;
  schemaVersion: typeof PRODUCT_OBJECTIVE_EVENT_SCHEMA_VERSION;
  eventId: string;
  operationId: string;
  organizationId: string;
  optimizationContextVersionRef: string;
  context: ProductOptimizationContext;
  actorRef: string;
  authorityScopeRef: string;
  occurredAt: string;
};

export type ProductObjectiveResolutionStatus =
  | "resolved"
  | "missing-objective"
  | "ambiguous-objectives"
  | "missing-authority"
  | "objective-inactive"
  | "insufficient-success-criteria"
  | "missing-context"
  | "stale-context"
  | "ambiguous-contexts"
  | "missing-material-preference"
  | "governance-prohibited"
  | "unsupported-scope";

export type ProductObjectiveContextResolution = {
  status: ProductObjectiveResolutionStatus;
  objective: ProductOrganizationalObjective | null;
  objectiveVersionRef: string | null;
  optimizationContext: ProductOptimizationContext | null;
  optimizationContextVersionRef: string | null;
  eligibleForObjectiveRecommendation: boolean;
  clarificationQuestion: string | null;
  limitations: string[];
};
