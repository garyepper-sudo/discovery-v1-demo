export type MaterialAcquisitionEstimate<T> =
  | {
      state: "available";
      value: T;
      sourceRef: string;
      qualification: string;
      maturity: "synthetic" | "fixture-backed" | "owner-provided" | "outcome-calibrated";
    }
  | { state: "unknown"; reason: string }
  | { state: "not-applicable" }
  | { state: "permission-withheld" }
  | { state: "owner-unimplemented" }
  | { state: "unreliable"; reason: string }
  | { state: "deferred-until-execution" }
  | { state: "intentionally-undisclosed"; policyRef: string };

export type MaterialAcquisitionActionType =
  | "inspect-existing-evidence" | "compare-existing-evidence" | "search-authorized-source"
  | "ask-authorized-person" | "request-document" | "recommend-survey"
  | "recommend-measurement" | "recommend-experiment" | "monitor-signal"
  | "wait-for-outcome" | "stop" | "abstain";

export type MaterialAcquisitionCandidate = {
  candidateId: string;
  actionType: MaterialAcquisitionActionType;
  actionOwnerRef: string;
  target: { kind: string; targetRef: string; organizationId: string };
  uncertaintyRef: string;
  materialEffectTargets: Array<"unknown" | "answer" | "objective" | "recommendation" | "decision">;
  eligibility: {
    ownerAvailable: boolean;
    targetAccessible: boolean;
    executionAvailable: boolean;
    authorizationSatisfied: boolean;
    governanceAllowed: boolean;
    consentState: "not-required" | "required" | "granted" | "declined" | "unknown";
    reasonCodes: string[];
  };
  expectedInformationContribution: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  expectedOrganizationalRelevance: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  expectedDiscriminationGain: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  burden: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  cost: MaterialAcquisitionEstimate<"none" | "low" | "moderate" | "high">;
  delay: MaterialAcquisitionEstimate<"immediate" | "short" | "material" | "unknown">;
  reliability: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  existingEvidenceQuality: MaterialAcquisitionEstimate<"low" | "moderate" | "high">;
  reversibility: MaterialAcquisitionEstimate<"reversible" | "partially-reversible" | "irreversible">;
  stoppingCondition: string;
  expectedEvidenceLineage: {
    sourceKind: string;
    sourceScopeRef: string;
    admissionRequired: true;
  } | null;
};

export type MaterialAcquisitionBudgetContext = {
  maxBurden: "low" | "moderate" | "high" | null;
  maxCost: "none" | "low" | "moderate" | "high" | null;
  maxDelay: "immediate" | "short" | "material" | null;
  irreversibleActionAllowed: boolean;
  materialPreferencesComplete: boolean;
  budgetExhausted: boolean;
  userDeclined: boolean;
};

export type MaterialInformationAcquisitionInput = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  understandingRevisionRef: string;
  materialUncertainty: {
    unknownId: string;
    unknownVersionRef: string;
    status: "open" | "targeted";
    investigationOpportunityRef: string | null;
  };
  purpose:
    | "improve-understanding" | "resolve-objective-ambiguity"
    | "resolve-optimization-ambiguity" | "improve-recommendation-eligibility"
    | "evaluate-decision" | "await-learning";
  candidates: MaterialAcquisitionCandidate[];
  budgetContext: MaterialAcquisitionBudgetContext;
  authorizationContextRef: string;
  governanceContextRefs: string[];
  evaluatedAt: string;
};

export type MaterialAcquisitionExplanation = {
  uncertaintyRef: string;
  rationale: string;
  alternativeCandidateIds: string[];
  limitations: string[];
  stoppingCondition: string | null;
};

export type MaterialInformationAcquisitionResult =
  | {
      kind: "selected-action";
      selectionId: string;
      selected: MaterialAcquisitionCandidate;
      alternatives: MaterialAcquisitionCandidate[];
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "material-tie";
      selectionId: string;
      candidates: MaterialAcquisitionCandidate[];
      discriminatingQuestion: string | null;
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "stop";
      selectionId: string;
      reason: "understanding-sufficient" | "insufficient-net-value" | "awaiting-outcome" | "budget-exhausted" | "remaining-actions-unreliable" | "user-declined";
      explanation: MaterialAcquisitionExplanation;
    }
  | {
      kind: "abstain";
      selectionId: string;
      reason: "no-authorized-action" | "governance-blocked" | "missing-material-input" | "incomparable-actions" | "selector-unsupported";
      explanation: MaterialAcquisitionExplanation;
    };

export type MaterialAcquisitionCalibrationManifest = {
  manifestVersion: "1";
  registeredBeforeSelection: true;
  cases: Array<{
    caseId: string;
    classification: "live" | "controlled-synthetic";
    organizationRef: string;
    questionRevisionRef: string;
    unknownVersionRef: string;
    comparatorSource: string;
    candidateIds: string[];
    expectedHardGate: string;
    holdout: boolean;
    missingOutcomeData: string[];
  }>;
  metrics: string[];
  promotionThresholds: Record<string, number>;
};
