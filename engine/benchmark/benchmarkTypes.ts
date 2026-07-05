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
  mechanismInferenceScore: number;
  executiveUnderstandingScore: number;
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