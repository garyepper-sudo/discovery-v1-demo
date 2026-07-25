/**
 * Benchmark-only architecture contracts.
 *
 * These types do not define production workspaces, contributions, permissions,
 * persistence, or Organizational Model behavior.
 */
export type ArchitectureId = "independent" | "central" | "hybrid" | "hybrid-bypass" | "hybrid-no-independence";
export type WorldId = "duplicate-ancestry" | "local-exception" | "restricted-evidence" | "cross-scope-root" | "unsupported-ai";
export type ScopeId = "team-a" | "team-b" | "team-exception" | "function-specialist" | "organization";
export type PrincipalId = "analyst-a" | "analyst-b" | "specialist" | "manager" | "employee" | "executive";
export type Purpose = "delivery-learning" | "workforce-planning" | "strategy";
export type AccessLevel = "none" | "aggregate" | "raw";
export type ContributionKind = "evidence" | "assertion" | "hypothesis" | "exception" | "symptom" | "relationship";
export type AdmissionDisposition =
  | "accepted"
  | "accepted-limited"
  | "accepted-assertion"
  | "accepted-provisional"
  | "rejected"
  | "deferred"
  | "private"
  | "restricted"
  | "invalid-ancestry"
  | "invalid-duplicate"
  | "invalid-purpose";

export type BenchmarkContribution = {
  id: string;
  semanticId: string;
  kind: ContributionKind;
  scopeId: ScopeId;
  contributorId: PrincipalId;
  sourceId?: string;
  rootSourceIds: string[];
  purpose: Purpose;
  confidence: number;
  provisional: boolean;
  aiGenerated: boolean;
  private: boolean;
  restricted: boolean;
  localOnly: boolean;
  supportsClaimId?: string;
  contradictsClaimId?: string;
  relationship?: { from: string; to: string };
  validFrom: string;
};

export type PermissionRule = {
  principalId: PrincipalId;
  purpose: Purpose;
  scopeId: ScopeId;
  level: AccessLevel;
  activeUntil?: string;
};

export type ArchitectureWorld = {
  id: WorldId;
  heldOut: boolean;
  fixedNow: string;
  organizationId: string;
  contributions: BenchmarkContribution[];
  permissions: PermissionRule[];
  expected: {
    authoritativeClaimIds: string[];
    localExceptionIds: string[];
    emergentClaimIds: string[];
    rejectedAuthoritativeIds: string[];
    contradictionPairs: Array<[string, string]>;
  };
};

export type DurableObject = {
  id: string;
  semanticId: string;
  status: "provisional" | "authoritative" | "rejected" | "private";
  scopeId: ScopeId;
  contributorIds: PrincipalId[];
  rootSourceIds: string[];
  confidence: number;
  purpose: Purpose;
  restricted: boolean;
  localOnly: boolean;
  ancestryIds: string[];
  validFrom: string;
};

export type Projection = {
  principalId: PrincipalId;
  purpose: Purpose;
  visibleObjectIds: string[];
  aggregateObjectIds: string[];
  confidenceBySemanticId: Record<string, number>;
  contradictionIds: string[];
};

export type ArchitectureTrace = {
  architectureId: ArchitectureId;
  worldId: WorldId;
  admissions: Array<{ contributionId: string; disposition: AdmissionDisposition }>;
  durableObjects: DurableObject[];
  authoritativeObjects: DurableObject[];
  projections: Projection[];
  rejectedCycles: string[];
  processingSteps: number;
  policyEvaluations: number;
  recomputationFanOut: number;
};

export type HardGateFailure = {
  severity: "critical" | "major" | "minor";
  code: string;
  detail: string;
};

export type ArchitectureMetrics = {
  understanding: {
    localClaimPrecision: number;
    localClaimRecall: number;
    broaderSynthesisPrecision: number;
    broaderSynthesisRecall: number;
    localExceptionPreservation: number;
    broaderPatternPreservation: number;
    emergentInsightPrecision: number;
    emergentInsightRecall: number;
    unsupportedGeneralizations: number;
    abstentionCorrect: boolean;
  };
  epistemic: {
    ancestryCompleteness: number;
    sourceIndependenceAccuracy: number;
    duplicateInducedSupportDelta: number;
    contradictionPreservation: number;
    unsupportedAdmissions: number;
    attributionIntegrity: number;
    orphanedDerivations: number;
    circularSupport: number;
    provisionalContamination: number;
    historicalOverwrite: number;
  };
  permission: {
    directLeakage: number;
    strictNoninterferenceDelta: number;
    sanitizedInfluenceCorrect: boolean;
    unauthorizedConfidenceDelta: number;
    structuralLeakage: number;
    cumulativeInference: number;
    triangulationSuccess: number;
    purposeViolations: number;
    revocationResidualInfluence: number;
    identityDisclosure: number;
    staleProjectionRejected: boolean;
  };
  architecture: {
    durableObjectCount: number;
    duplicateStateRatio: number;
    maximumDerivationDepth: number;
    recomputationFanOut: number;
    policyEvaluations: number;
    deterministicTraceLength: number;
    debuggingTraceSize: number;
    adapterSpecificRuleCount: number;
    failureBlastRadius: number;
  };
};

export type ArchitectureRunResult = {
  architectureId: ArchitectureId;
  worldId: WorldId;
  heldOut: boolean;
  trace: ArchitectureTrace;
  metrics: ArchitectureMetrics;
  failures: HardGateFailure[];
};
