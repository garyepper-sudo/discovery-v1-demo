export type Level = "low" | "moderate" | "high";
export type ObjectiveStatus =
  | "unknown"
  | "inferred-low-confidence"
  | "inferred-high-confidence"
  | "confirmed";
export type Optimizer = "understanding-first" | "objective-first" | "balanced" | "custom";
export type ResultType =
  | "recommendation"
  | "conditional-recommendation"
  | "confidence-improvement-only"
  | "objective-confirmation-required"
  | "scenario-comparison-required"
  | "abstention";

export type ObjectiveContext = {
  status: ObjectiveStatus;
  primaryObjective: string | null;
  secondaryObjectives: string[];
  objectiveEvidenceRefs: string[];
  objectiveConfidence: Level | null;
};

export type OptimizationContext = {
  optimizer: Optimizer;
  timeHorizon: "30-days" | "12-months" | null;
  riskTolerance: Level;
  costSensitivity: Level;
  speedPriority: Level;
  understandingPriority: Level;
  reversibilityPreference: "required" | "preferred" | "neutral";
  evidenceRequirement:
    | "existing-only"
    | "new-evidence-allowed"
    | "action-before-more-evidence-allowed";
  constraints: string[];
};

export type ExperimentAction = {
  id: string;
  type: "inspect" | "pilot" | "control" | "mitigate" | "defer";
  target: string;
  timing: string;
  objectiveAffinity: string[];
  understandingValue: Level;
  speed: Level;
  cost: Level;
  risk: Level;
  reversible: boolean;
  evidenceSupported: boolean;
  governanceAllowed: boolean;
};

export type RecommendationScenario = {
  scenarioId: string;
  organizationId: string;
  title: string;
  understandingRevisionRef: string;
  understanding: string;
  competingExplanations: string[];
  highStakes: boolean;
  objectives: string[];
  wrongObjective: string;
  actions: ExperimentAction[];
  negativeControl?: "no-authorized-action" | "unsupported-forecast";
};

export type ExperimentCondition = {
  id: string;
  label: string;
  objective: ObjectiveContext;
  optimization: OptimizationContext | null;
};

export type RecommendationForecast = {
  horizon: string;
  expectedDirection: Array<{
    dimension: string;
    direction: "improve" | "worsen" | "mixed" | "unchanged" | "unknown";
    magnitude: "small" | "moderate" | "large" | "unknown";
    confidence: Level;
    basis: string;
  }>;
  keyDependencies: string[];
  failureModes: string[];
  disconfirmingSignals: string[];
};

export type RecommendationExperimentCandidate = {
  scenarioId: string;
  organizationId: string;
  recommendationId: string;
  understandingRevisionRef: string;
  objectiveContext: ObjectiveContext;
  optimizationContext: OptimizationContext;
  action: Pick<ExperimentAction, "type" | "target" | "timing"> | null;
  resultType: ResultType;
  rationale: {
    whyThis: string;
    whyNow: string;
    whyNotAlternatives: string;
    understandingDependency: string;
    objectiveDependency: string;
    constraintDependency: string;
  };
  assumptions: string[];
  tradeoffs: string[];
  forecast: RecommendationForecast | null;
};

export type CandidateScore = {
  recommendationId: string;
  objectiveCoherence: number;
  understandingCoherence: number;
  constraintCompliance: number;
  tradeoffTransparency: number;
  alternativeDiscrimination: number;
  objectiveAssumptionTransparency: number;
  stability: number;
  sensitivity: number;
  actionability: number;
  trust: number;
  forecastCalibration: number;
  understandingPreservation: number;
  coherenceScore: number;
};
