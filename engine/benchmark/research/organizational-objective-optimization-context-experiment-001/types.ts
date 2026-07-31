export type ContractFeature =
  | "understanding" | "objective" | "objective-authority" | "objective-confidence"
  | "objective-version" | "objective-scope" | "success-criterion" | "objective-conflict"
  | "structured-context" | "time" | "risk-appetite" | "risk-capacity"
  | "reversibility" | "cost" | "urgency" | "governance" | "resources"
  | "execution-capacity" | "alternatives" | "distribution" | "information-value"
  | "operating-facts" | "metric-boundary" | "path-dependence";

export type ExpectedDisposition =
  | "objective-recommendation-eligible"
  | "understanding-recommendation"
  | "confirm-objective"
  | "resolve-objective-conflict"
  | "ask-material-context"
  | "abstain";

export type DesignScenario = {
  id: string;
  label: string;
  required: ContractFeature[];
  expected: ExpectedDisposition;
  operatingCondition: "routine" | "growth" | "crisis" | "turnaround" | "regulatory";
  wordingVariantOf?: string;
  negativeControl?: boolean;
};
export type ArchitectureId = "current-phase2c2" | "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type ArchitectureProfile = {
  id: ArchitectureId;
  label: string;
  features: ContractFeature[];
  complexity: number;
  operatingContextObject: boolean;
  objectiveFirst: boolean;
  understandingFirst: boolean;
  governedBalance: boolean;
};

export type ArchitectureMetrics = {
  architectureId: ArchitectureId;
  scenarioCount: number;
  requirementCoverage: number;
  correctDispositionRate: number;
  objectiveFidelity: number;
  contextSensitivity: number;
  conflictHandling: number;
  authorityHandling: number;
  governanceIntegrity: number;
  wordingStability: number;
  appropriateAbstention: number;
  understandingFallback: number;
  explanationQuality: number;
  complexityPenalty: number;
  overallScore: number;
};

export type ElicitationMetrics = {
  strategy: "full-form" | "minimal-fixed" | "adaptive-value-of-information";
  averageQuestions: number;
  unnecessaryQuestionRate: number;
  missedMaterialContextRate: number;
  correctDispositionRate: number;
};
