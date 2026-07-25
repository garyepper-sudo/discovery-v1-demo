/**
 * Benchmark-only candidate lifecycle contracts.
 *
 * These types are not production workspace, contribution, governance,
 * permission, persistence, or Organizational Model schemas.
 */
export type CandidatePolicyId = "direct" | "strict" | "ecology" | "ecology-undisciplined";
export type CandidateState =
  | "private-exploration"
  | "provisional"
  | "requires-corroboration"
  | "competing-explanation"
  | "contested"
  | "scope-limited"
  | "promoted"
  | "weakened"
  | "displaced"
  | "expired"
  | "rejected"
  | "historically-retained";
export type CandidateWorldId =
  | "weak-later-validated"
  | "ai-hallucination"
  | "partial-combination"
  | "competing-explanations"
  | "local-anomaly"
  | "restricted-insight"
  | "never-resolves"
  | "contrarian-correct";
export type TimeStep = "T1" | "T2" | "T3" | "T4" | "T5" | "T6";
export type CandidateEventKind = "propose" | "support" | "contradict" | "combine" | "expire" | "revoke";
export type AccessLevel = "none" | "aggregate" | "raw";

export type CandidateDefinition = {
  id: string;
  semanticId: string;
  scopeId: string;
  contributorId: string;
  purpose: string;
  restricted: boolean;
  localOnly: boolean;
  aiGenerated: boolean;
};

export type CandidateEvent = {
  id: string;
  at: TimeStep;
  kind: CandidateEventKind;
  candidateId: string;
  sourceId?: string;
  rootSourceIds: string[];
  relatedCandidateIds?: string[];
  malformed?: boolean;
};

export type CandidatePermission = {
  principalId: string;
  scopeId: string;
  purpose: string;
  level: AccessLevel;
  activeUntil?: TimeStep;
};

export type CandidateWorld = {
  id: CandidateWorldId;
  partition: "development" | "held-out" | "permission-validation";
  organizationId: string;
  candidates: CandidateDefinition[];
  events: CandidateEvent[];
  permissions: CandidatePermission[];
  expected: {
    eventuallyPromoted: string[];
    neverPromoted: string[];
    viableAlternatives: string[];
    localExceptions: string[];
    emergentCandidates: string[];
    correctFinalAuthority: string[];
  };
};

export type CandidateSnapshot = {
  candidateId: string;
  semanticId: string;
  at: TimeStep;
  state: CandidateState;
  authoritative: boolean;
  supportRootIds: string[];
  contradictionRootIds: string[];
  ancestryEventIds: string[];
  contributorIds: string[];
  derivedFromCandidateIds: string[];
  confidence: number;
  restricted: boolean;
  localOnly: boolean;
};

export type CandidateProjection = {
  principalId: string;
  at: TimeStep;
  visibleCandidateIds: string[];
  aggregateCandidateIds: string[];
  confidenceByCandidateId: Record<string, number>;
};

export type CandidatePolicyTrace = {
  policyId: CandidatePolicyId;
  worldId: CandidateWorldId;
  transitions: Array<{ candidateId: string; at: TimeStep; from?: CandidateState; to: CandidateState; eventId: string }>;
  snapshots: CandidateSnapshot[];
  finalCandidates: CandidateSnapshot[];
  projections: CandidateProjection[];
  rejectedCycles: string[];
  policyEvaluations: number;
  recomputationFanOut: number;
};

export type CandidateMetrics = {
  creativeYield: {
    validNovelInsightRecall: number;
    validCandidatesPromoted: number;
    emergentInsightsDiscovered: number;
    contrarianTruthsPreserved: number;
    weakSignalsRecovered: number;
    timeToValidPromotion: number;
  };
  contamination: {
    falsePromotionRate: number;
    falseCandidatesPromoted: number;
    duplicateInducedSupport: number;
    aiHallucinationsAuthoritative: number;
    prohibitedInfluence: number;
  };
  diversity: {
    prematureSuppressionRate: number;
    prematureConvergenceRate: number;
    viableAlternativesPreserved: number;
    unresolvedCandidatesPreserved: number;
    candidateRedundancy: number;
  };
  epistemic: {
    ancestryCompleteness: number;
    independenceAccuracy: number;
    contradictionPreservation: number;
    scopeAccuracy: number;
    authorityStateAccuracy: number;
    historicalLineage: number;
    abstentionCorrectness: number;
  };
  permission: {
    directDisclosure: number;
    indirectInfluence: number;
    confidenceLeakage: number;
    sanitizedInfluenceCorrect: number;
    strictNoninterferenceEqual: number;
    revocationResidualInfluence: number;
  };
  operational: {
    candidateObjectCount: number;
    authoritativeObjectCount: number;
    duplicateRatio: number;
    recomputationFanOut: number;
    transitionCount: number;
    dormantCandidateCount: number;
    debuggingTraceSize: number;
    candidateEfficiency: number;
  };
};

export type CandidateFailure = {
  severity: "critical" | "major" | "minor";
  code: string;
  detail: string;
};

export type CandidateRunResult = {
  policyId: CandidatePolicyId;
  worldId: CandidateWorldId;
  partition: CandidateWorld["partition"];
  trace: CandidatePolicyTrace;
  metrics: CandidateMetrics;
  failures: CandidateFailure[];
};
