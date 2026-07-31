export type AcquisitionStrategy =
  | "highest-confidence-gain"
  | "highest-understanding-gain"
  | "highest-explanation-discrimination";

export type ExplanationId =
  | "capacity"
  | "decision-rights"
  | "coordination"
  | "strategy"
  | "knowledge"
  | "incentives"
  | "leadership";

export type EvidenceEffect =
  | "support"
  | "weaken"
  | "rule-out"
  | "shared"
  | "irrelevant";

export type EvidenceCandidate = {
  id: string;
  description: string;
  effort: number;
  confidenceGain: number;
  understandingGain: number;
  decisionRelevance: number;
  admissible: boolean;
  causalStrength: "descriptive" | "comparative" | "counterfactual";
  predictedOutcomes: Partial<Record<ExplanationId, string>>;
  observedEffects: Partial<Record<ExplanationId, EvidenceEffect>>;
};

export type DiscriminationScenario = {
  id: string;
  sourceBenchmark:
    | "competingExplanationAdjudication"
    | "causalConstraintReasoningBenchmark"
    | "evidenceIndependenceBenchmark";
  sourceScenarioId: string;
  question: string;
  organizationId: string;
  initialExplanations: ExplanationId[];
  initiallyLeading: ExplanationId;
  correctExplanations: ExplanationId[];
  evidenceCandidates: EvidenceCandidate[];
};

export type AcquisitionStep = {
  evidenceId: string;
  strategyScore: number;
  viableBefore: ExplanationId[];
  viableAfter: ExplanationId[];
  ambiguityBefore: number;
  ambiguityAfter: number;
  falseEliminations: ExplanationId[];
};

export type StrategyScenarioResult = {
  strategy: AcquisitionStrategy;
  scenarioId: string;
  sourceBenchmark: DiscriminationScenario["sourceBenchmark"];
  sourceScenarioId: string;
  reachedCorrectUnderstanding: boolean;
  evidenceItemsUsed: number;
  totalEffort: number;
  ambiguityReduction: number;
  explanationsEliminated: number;
  falseEliminations: number;
  falseEliminationRate: number;
  truthfulness: number;
  causalRestraint: number;
  utility: number;
  finalViableExplanations: ExplanationId[];
  steps: AcquisitionStep[];
};

export type StrategyMetrics = {
  strategy: AcquisitionStrategy;
  scenarios: number;
  correctSupportedUnderstanding: number;
  meanEvidenceItems: number;
  meanEffort: number;
  meanAmbiguityReduction: number;
  evidenceEfficiency: number;
  competingExplanationsEliminated: number;
  falseEliminationRate: number;
  truthfulness: number;
  causalRestraint: number;
  utility: number;
  deterministic: boolean;
};

export type ExperimentReport = {
  experimentId: "expected-explanation-discrimination-001";
  status: "benchmark-only";
  scenarios: number;
  strategyMetrics: StrategyMetrics[];
  researchAnswers: {
    maintainsExplanationSpace: boolean;
    explicitCompetitionPreservesTruthfulness: boolean;
    evidenceCanBeScoredForDiscrimination: boolean;
    bestStrategy: AcquisitionStrategy | "inconclusive";
    ownership:
      | "same-as-expected-understanding-gain"
      | "product-layer"
      | "interpretation-layer"
      | "candidate-cognitive-primitive"
      | "inconclusive";
  };
};
