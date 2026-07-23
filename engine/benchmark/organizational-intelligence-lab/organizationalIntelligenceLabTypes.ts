/**
 * Benchmark-only contracts. These are not production Intelligence Scope,
 * authorization, persistence, or Organizational Intelligence primitives.
 */
export type ContextKind = "individual" | "team" | "function" | "project" | "organization";
export type IntelligencePurpose = "culture-health" | "delivery-health" | "product-launch" | "strategy" | "organizational-learning";
export type AccessLevel = "none" | "aggregate" | "raw";
export type ClaimTrend = "improving" | "stable" | "declining" | "uncertain";

export type BenchmarkIntelligenceContext = {
  id: string;
  label: string;
  kind: ContextKind;
  parentIds: string[];
  memberPrincipalIds: string[];
};

export type BenchmarkPrincipal = {
  id: string;
  label: string;
  role: string;
};

export type BenchmarkSensitivity = {
  source: "public" | "internal" | "restricted";
  claim: "ordinary" | "sensitive" | "highly-sensitive";
  identity: "anonymous" | "indirect" | "identifiable";
  aggregationRisk: "low" | "moderate" | "high";
};

export type BenchmarkContribution = {
  id: string;
  contextIds: string[];
  category: string;
  rawText: string;
  sanitizedClaim: string;
  trend: ClaimTrend;
  confidence: number;
  validScopeIds: string[];
  generalizableToContextIds: string[];
  purposes: IntelligencePurpose[];
  sensitivity: BenchmarkSensitivity;
  contributorPrincipalId: string;
};

export type BenchmarkVisibilityRule = {
  principalId: string;
  contextId: string;
  purpose: IntelligencePurpose;
  level: AccessLevel;
  activeFrom: string;
  activeUntil?: string;
};

export type BenchmarkVisibilityPolicy = {
  id: string;
  rules: BenchmarkVisibilityRule[];
};

export type BenchmarkRequest = {
  principalId: string;
  contextId: string;
  purpose: IntelligencePurpose;
  question: string;
  at: string;
};

export type BenchmarkLineageReference = {
  contributionId: string;
  sourceContextIds: string[];
  derivationPaths: string[];
};

export type BenchmarkScopedAnswer = {
  request: BenchmarkRequest;
  answer: string;
  confidence: number;
  trend: ClaimTrend;
  safeEvidenceCategories: string[];
  missingIntelligence: string[];
  suggestedCollection: string[];
  visibleRawContributionIds: string[];
  aggregateContributionIds: string[];
  internalLineage: BenchmarkLineageReference[];
  projectedLineage: Array<{ category: string; sourceCount: number }>;
  contradictions: Array<{ localClaimId: string; broaderClaimId: string }>;
  rejectedContributionIds: string[];
};

export type BenchmarkFixture = {
  fixedNow: string;
  contexts: BenchmarkIntelligenceContext[];
  principals: BenchmarkPrincipal[];
  contributions: BenchmarkContribution[];
  visibilityPolicy: BenchmarkVisibilityPolicy;
};

export type EvaluationDimension =
  | "standaloneUtility"
  | "scopeFidelity"
  | "claimValidity"
  | "generalizationDiscipline"
  | "crossLevelCoherence"
  | "contradictionPreservation"
  | "privacyProtection"
  | "indirectLeakageResistance"
  | "purposeLimitation"
  | "lineageIntegrity"
  | "duplicateEvidenceResistance"
  | "confidenceCalibration"
  | "missingIntelligenceQuality"
  | "propagationUsefulness"
  | "abstractionSafety"
  | "userAppropriateLanguage"
  | "architectureReuse"
  | "deterministicBehavior";

export type BenchmarkCaseResult = {
  id: string;
  name: string;
  dimensions: Record<EvaluationDimension, number>;
  hardFailures: string[];
  observations: string[];
};

export type ContextComplexityMeasurement = {
  contextCount: number;
  contributionCount: number;
  uniqueDerivations: number;
  rawDerivationPaths: number;
  duplicateDerivationsRemoved: number;
  contradictionsPreserved: number;
  processingSteps: number;
  maximumPathDepth: number;
};

export type ArchitectureClassification =
  | "SUPPORTED_BY_CURRENT_ARCHITECTURE"
  | "SUPPORTED_WITH_SCOPED_COMPOSITION"
  | "PARTIALLY_SUPPORTED_GENUINE_GAP_FOUND"
  | "HYPOTHESIS_NOT_SUPPORTED";
