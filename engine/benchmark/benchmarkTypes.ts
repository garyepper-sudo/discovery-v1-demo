export type BenchmarkEvidence = {
  id: string;
  title: string;
  content: string;
};

export type BenchmarkExpectedOutput = {
  primaryMechanisms: string[];
  secondaryMechanisms?: string[];
  affectedCapabilities?: string[];
  compressedConcepts?: string[];
  avoid?: string[];
};

export type BenchmarkTheoryValidation = {
  dominantTheory?: string | null;

  whyDiscoveryBelievesIt?: string;

  supportingMechanisms?: Array<{
    label?: string;
    rationale?: string;
    confidence?: number;
  }>;

  supportingOrganizationalBeliefs?: Array<{
    label?: string;
    rationale?: string;
    confidence?: number;
  }>;

  competingTheoriesConsidered?: Array<{
    theory?: string;
    reasonItWasConsidered?: string;
    reasonItLost?: string;
    confidence?: number;
  }>;

  contradictoryOrWeakeningEvidence?: Array<{
    label?: string;
    rationale?: string;
    confidence?: number;
  }>;

  calibratedConfidenceExplanation?: string;

  additionalEvidenceThatWouldIncreaseConfidence?: string[];

  evidenceThatWouldFalsifyTheory?: string[];

  executiveRecommendation?: string;
};

export type DiscoveryBenchmarkCase = {
  id: string;
  title: string;
  company: string;
  industry: string;
  question: string;
  context?: string;
  evidence: BenchmarkEvidence[];
  expected: BenchmarkExpectedOutput;
};

export type BenchmarkScore = {
  benchmarkId: string;
  title: string;

  score: number;
  passed: boolean;

  mechanismScore: number;
  capabilityScore: number;
  compressionScore: number;
  executiveScore: number;

  perceptionScore: number;
  patternScore: number;
  patternCoherenceScore: number;
  mechanismInferenceScore: number;
  executiveUnderstandingScore: number;

  theoryValidationScore: number;
  confidenceCalibrationScore: number;
  evidenceAttributionScore: number;

  notes: string[];
};

export type BenchmarkReport = {
  generatedAt: string;
  totalBenchmarks: number;
  passedBenchmarks: number;
  failedBenchmarks: number;
  overallScore: number;
  scores: BenchmarkScore[];
};