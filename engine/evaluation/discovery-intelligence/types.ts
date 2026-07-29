export const DISCOVERY_INTELLIGENCE_DIMENSIONS = [
  "organizational_understanding",
  "truthfulness",
  "decision_utility",
  "evidence_acquisition",
  "communication_quality",
  "learning_quality",
  "model_stewardship",
  "longitudinal_improvement",
] as const;

export type IntelligenceDimensionId =
  (typeof DISCOVERY_INTELLIGENCE_DIMENSIONS)[number];

export type MeasurementKind = "measured" | "estimated" | "human_only";
export type DimensionRole =
  | "optimization_target"
  | "supporting_capability"
  | "hard_constraint";

export type MetricDefinition = {
  id: string;
  label: string;
  definition: string;
  measurement: string;
  kind: MeasurementKind;
  examples: string[];
  failureModes: string[];
};

export type DimensionDefinition = {
  id: IntelligenceDimensionId;
  label: string;
  role: DimensionRole;
  definition: string;
  purpose: string;
  relationshipToUnderstanding: string;
  metrics: MetricDefinition[];
};

export type OrganizationalDomain =
  | "sales"
  | "operations"
  | "hr"
  | "finance"
  | "strategy"
  | "manufacturing"
  | "healthcare"
  | "government"
  | "agriculture"
  | "technology"
  | "professional_services"
  | "retail"
  | "supply_chain"
  | "customer_success"
  | "marketing"
  | "product";

export type EvidenceExpectation = {
  id: string;
  statement: string;
  role: "supporting" | "weakening" | "contrasting" | "context";
};

export type IntelligenceScenario = {
  id: string;
  organizationId: string;
  domain: OrganizationalDomain;
  question: string;
  evidence: EvidenceExpectation[];
  groundTruth: string | null;
  competingExplanations: string[];
  expectedUncertainty: string[];
  highestValueNextEvidence: string[];
};

export type MetricObservation = {
  metricId: string;
  value: number | null;
  kind: MeasurementKind;
  evidenceRefs: string[];
  notes?: string;
};

export type ScenarioEvaluationInput = {
  scenarioId: string;
  organizationId: string;
  observations: MetricObservation[];
};

export type MetricScore = MetricObservation & {
  dimensionId: IntelligenceDimensionId;
};

export type DimensionScore = {
  id: IntelligenceDimensionId;
  role: DimensionRole;
  score: number | null;
  confidence: number;
  metrics: MetricScore[];
};

export type ConstraintResult = {
  id: IntelligenceDimensionId;
  score: number | null;
  threshold: number;
  passed: boolean;
};

export type IntelligenceEvaluation = {
  frameworkVersion: string;
  scenarioId: string;
  organizationId: string;
  overallScore: number | null;
  confidence: number;
  dimensions: DimensionScore[];
  constraints: ConstraintResult[];
  recommendation: "promote" | "hold" | "block" | "human_review_required";
  regressions: string[];
};

export type IntelligenceTrendPoint = {
  label: string;
  frameworkVersion: string;
  overallScore: number | null;
  dimensionScores: Partial<Record<IntelligenceDimensionId, number>>;
};

export type IntelligenceReport = {
  frameworkVersion: string;
  generatedFrom: "deterministic_input";
  overallScore: number | null;
  confidence: number;
  dimensionScores: DimensionScore[];
  historicalTrend: IntelligenceTrendPoint[];
  benchmarkTrend: IntelligenceTrendPoint[];
  regressions: string[];
  architectureChanges: string[];
  recommendation: IntelligenceEvaluation["recommendation"];
};
