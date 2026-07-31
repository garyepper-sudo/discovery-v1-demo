export type ObjectiveSignalKind =
  | "declaration"
  | "evidence"
  | "decision"
  | "strategy"
  | "metric"
  | "condition";

export type ObjectiveAuthority = "none" | "contributor" | "delegated" | "governing";

export type ObjectiveSignal = {
  kind: ObjectiveSignalKind;
  objectiveKey: string;
  confidence: number;
  authority: ObjectiveAuthority;
  current: boolean;
};

export type DiscoveryDisposition =
  | "govern"
  | "clarify-authority"
  | "clarify-meaning"
  | "resolve-conflict"
  | "revalidate"
  | "abstain";

export type ObjectiveDiscoveryScenario = {
  id: string;
  label: string;
  signals: ObjectiveSignal[];
  expectedObjectiveKeys: string[];
  expectedDisposition: DiscoveryDisposition;
  minimumQuestions: number;
  ambiguousMeaning: boolean;
  tags: string[];
  wordingVariantOf?: string;
  negativeControl?: boolean;
};

export type DiscoveryArchitectureId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type DiscoveryArchitecture = {
  id: DiscoveryArchitectureId;
  label: string;
  sources: ObjectiveSignalKind[];
  preservesHypotheses: boolean;
  separatesAuthority: boolean;
  detectsVolatility: boolean;
  adaptiveQuestions: boolean;
  complexity: number;
};

export type ScenarioEvaluation = {
  scenarioId: string;
  selectedObjectiveKeys: string[];
  disposition: DiscoveryDisposition;
  questions: number;
  objectiveCorrect: boolean;
  authorityCorrect: boolean;
  ambiguityReduced: boolean;
  falseGovernance: boolean;
};

export type ArchitectureMetrics = {
  architectureId: DiscoveryArchitectureId;
  scenarioCount: number;
  objectiveCorrectness: number;
  authorityCorrectness: number;
  ambiguityReduction: number;
  questionEfficiency: number;
  userBurden: number;
  futureRecommendationReadiness: number;
  stability: number;
  governanceIntegrity: number;
  determinism: number;
  simplicity: number;
  falseGovernanceRate: number;
  overallScore: number;
};

export type InterviewStrategyMetrics = {
  strategy: "full-questionnaire" | "fixed-interview" | "hypothesis-interview" | "hybrid-adaptive";
  averageQuestions: number;
  objectiveCorrectness: number;
  authorityCorrectness: number;
  userBurden: number;
  falseGovernanceRate: number;
};
