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

/* ===========================================================
   Organizational Learning Benchmark
   =========================================================== */

export type OrganizationalLearningScore = {
  organizationalLearningScore: number;

  learningVelocity: number;
  memoryGrowth: number;
  understandingGrowth: number;

  beliefStability: number;
  theoryStability: number;
  knowledgeRetention: number;

  mechanismReuse: number;
  conceptReuse: number;

  adaptiveLearning: number;

  passed: boolean;

  diagnosis: string[];
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

export type CognitiveFitnessScore = {
  perception: number;
  patternFormation: number;
  mechanisticReasoning: number;
  organizationalMemory: number;
  conceptFormation: number;
  theoryFormation: number;
  cognitiveIntegration: number;
  executiveUnderstanding: number;
  epistemicIntelligence: number;
  emergence: number;

  overall: number;
  maturityLevel: number;
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

  /**
   * Cognitive Fitness
   */
  cognitiveFitness?: CognitiveFitnessScore;

  /**
   * Organizational Learning
   */
  organizationalLearningScore?: number;
  organizationalLearning?: OrganizationalLearningScore;

  notes: string[];
};

export type BenchmarkReport = {
  generatedAt: string;

  totalBenchmarks: number;
  passedBenchmarks: number;
  failedBenchmarks: number;

  overallScore: number;

  /**
   * Cognitive Fitness
   */
  cognitiveFitnessOverall?: number;
  cognitiveFitness?: CognitiveFitnessScore;

  /**
   * Organizational Learning
   */
  organizationalLearningOverall?: number;
  organizationalLearning?: OrganizationalLearningScore;

  scores: BenchmarkScore[];
};