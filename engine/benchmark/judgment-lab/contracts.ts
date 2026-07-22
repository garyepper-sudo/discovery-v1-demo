export type EvaluationUsage = "development" | "regression" | "holdout";

export type BenchmarkCategory =
  | "mechanism-library"
  | "perspective"
  | "metamorphic"
  | "regression";

export type JudgmentBenchmarkCase = {
  id: string;
  usage: EvaluationUsage;
  category: BenchmarkCategory;
  mechanismId?: string;
  organizationId: string;
  perspectiveIds: string[];
  evidenceSubsetIds: string[];
  groundTruthId: string;
};

export type SyntheticOrganizationSpec = {
  id: string;
  name: string;
  industry: string;
  maturity: "startup" | "scale-up" | "mid-market" | "enterprise" | "family-owned" | "private-equity-backed" | "public-company";
  usage: EvaluationUsage;
  description: string;
  investigationQuestion: string;
  strategy: { statedPriorities: string[]; actualTradeoffs: string[] };
  structure: { functions: string[]; executiveRoles: string[]; decisionRights: string[] };
  operatingReality: {
    currentInitiatives: string[];
    measurableSymptoms: string[];
    historicalEvents: string[];
    organizationalTensions: string[];
  };
  artifactIds: string[];
  perspectiveIds: string[];
  groundTruthId: string;
};

export type OrganizationGroundTruth = {
  id: string;
  organizationId: string;
  dominantConstraint: { id: string; label: string; rationale: string };
  contributingConditions: string[];
  causalMechanisms: string[];
  misleadingExplanations: Array<{ claim: string; whyPlausible: string; whyIncompleteOrWrong: string }>;
  highestLeverageIntervention: { label: string; rationale: string };
  acceptableAlternativeInterventions: string[];
  harmfulInterventions: string[];
  criticalMissingEvidence: string[];
  expectedUncertainty: string[];
  expectedRecommendationDisposition: "proceed" | "do-not-proceed" | "investigate-further";
  evidenceSensitivity: Array<{ evidenceChange: string; expectedJudgmentEffect: string }>;
};

export type SyntheticEvidenceArtifact = {
  id: string;
  organizationId: string;
  title: string;
  artifactType: "strategy" | "board-deck" | "financial-review" | "operating-review" | "leadership-notes" | "customer-feedback" | "sales-review" | "product-roadmap" | "engineering-retrospective" | "org-chart" | "policy" | "decision-log" | "initiative-update" | "market-analysis" | "other";
  authorRole: string;
  createdAt: string;
  reliability: "low" | "moderate" | "high";
  staleness: "current" | "aging" | "stale";
  content: string;
  groundTruthTags?: string[];
};

export type ExecutiveExperienceProfile = {
  yearsInRole?: number;
  priorIndustries?: string[];
  priorFunctionalRoles?: string[];
  companyScaleExperience?: string[];
  transformationExperience?: string[];
  founderBackground?: boolean;
  publicCompanyExperience?: boolean;
};

export type ExecutivePerspective = {
  id: string;
  role: string;
  level: "executive" | "board" | "functional-leader";
  primaryObjectives: string[];
  preferredMetrics: string[];
  typicalEvidenceSources: string[];
  decisionHorizon: string;
  riskOrientation: string;
  likelyBlindSpots: string[];
  defaultHypotheses: string[];
  communicationPreferences: string[];
  evidenceAccess: { includedArtifactIds: string[]; excludedArtifactIds: string[] };
  knownFacts: string[];
  unsupportedBeliefs: string[];
  experience?: ExecutiveExperienceProfile;
};

export type JudgmentLabOutput = {
  dominantUnderstanding?: string;
  primaryConstraint?: string;
  causalMechanisms: string[];
  recommendation?: string;
  recommendationDisposition?: string;
  confidence?: number;
  uncertainty: string[];
  missingEvidence: string[];
  supportingEvidenceIds: string[];
  communicationHeadline?: string;
  communicationSummary?: string;
};

export type JudgmentLabRunResult = {
  organizationId: string;
  perspectiveId: string;
  fixedTimestamp: string;
  evidenceArtifactIds: string[];
  engineInput: string;
  output: JudgmentLabOutput;
};

export type ScoreDimension = { score: number; maxScore: 5; passed: boolean; rationale: string; evidence: string[] };
export type JudgmentScorecard = {
  constraintAccuracy: ScoreDimension;
  causalFidelity: ScoreDimension;
  evidenceGrounding: ScoreDimension;
  contradictionHandling: ScoreDimension;
  recommendationQuality: ScoreDimension;
  confidenceCalibration: ScoreDimension;
  uncertaintyQuality: ScoreDimension;
  robustness: ScoreDimension;
  sensitivity: ScoreDimension;
  executiveCommunication: ScoreDimension;
};

export type PerspectiveAssessment = {
  perspectiveId: string;
  evidenceCoverage: "narrow" | "moderate" | "broad";
  expectedBlindSpots: string[];
  appropriateUncertainty: string[];
  overreachDetected: boolean;
  perspectiveFitRationale: string;
};

export type JudgmentFailureType = "none" | "ingestion" | "entity-resolution" | "evidence-weighting" | "contradiction-handling" | "mechanism-selection" | "condition-ranking" | "ancestry-loss" | "confidence-calibration" | "uncertainty-quality" | "recommendation-mismatch" | "executive-language" | "benchmark-gap";
export type JudgmentFailure = { type: JudgmentFailureType; severity: "low" | "medium" | "high"; description: string; supportingEvidence: string[]; likelyProducerArea?: string };

export type JudgmentFailureMemory = {
  regressionId: string;
  failureType: Exclude<JudgmentFailureType, "none">;
  severity: JudgmentFailure["severity"];
  producerBoundary: string;
  benchmarkCategory: BenchmarkCategory;
  benchmarkCaseId: string;
  organizationId: string;
  perspectiveId: string;
  supportingEvidence: string[];
};

export type JudgmentEvaluation = {
  run: JudgmentLabRunResult;
  scorecard: JudgmentScorecard;
  perspective: PerspectiveAssessment;
  failures: JudgmentFailure[];
  failureMemory: JudgmentFailureMemory[];
};
