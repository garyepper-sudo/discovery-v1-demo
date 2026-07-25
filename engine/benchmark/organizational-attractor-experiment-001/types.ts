/**
 * Experimental-only contracts for Organizational Attractor Experiment 001.
 *
 * These types are not production cognition, Runtime, or schema contracts.
 */

export type Direction = "centralizing" | "decentralizing";
export type ObservedState = "centralized" | "mixed" | "decentralized";
export type Horizon = "short" | "medium" | "long";

export type AttractorEvidence = {
  id: string;
  sourceId: string;
  sourceType:
    | "leadership-action"
    | "manager-behavior"
    | "employee-observation"
    | "incentive"
    | "information-flow"
    | "decision-history"
    | "intervention-result";
  period: "historical" | "baseline" | "perturbation" | "restoration";
  observation: string;
  direction: Direction;
  strength: number;
  structural: boolean;
  mechanism:
    | "executive-override"
    | "risk-avoidance"
    | "error-penalty"
    | "information-concentration"
    | "approval-dependency"
    | "delegated-authority"
    | "learning-safety"
    | "distributed-information";
  condition: string;
};

export type AttractorPhase = {
  id: string;
  observedState: ObservedState;
  evidence: AttractorEvidence[];
};

export type SyntheticOrganization = {
  id: string;
  name: string;
  phases: AttractorPhase[];
  expected: {
    hiddenAttractor: Direction | null;
    restorationA: Record<Horizon, ObservedState>;
    restorationB: Record<Horizon, ObservedState>;
  };
};

export type RestoringMechanism = {
  mechanism: AttractorEvidence["mechanism"];
  evidenceIds: string[];
  contribution: number;
};

export type TrajectoryPrediction = {
  horizon: Horizon;
  state: ObservedState;
  confidence: number;
  basisEvidenceIds: string[];
};

export type CandidateOrganizationalAttractor = {
  id: string;
  targetState: "centralized-decision-control" | "distributed-decision-control";
  restoringMechanisms: RestoringMechanism[];
  activatingConditions: string[];
  weakeningConditions: string[];
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  predictedTrajectory: TrajectoryPrediction[];
  persistenceConfidence: number;
  falsificationCriteria: string[];
};

export type InferenceResult = {
  candidate: CandidateOrganizationalAttractor | null;
  abstentionReason: string | null;
  trace: {
    independentSourceCount: number;
    supportingMechanismCount: number;
    supportingPeriods: number;
    structuralSupport: number;
    directionalBalance: number;
    supportingWeight: number;
    opposingWeight: number;
  };
};

export type PredictionModelId =
  | "organizational-state"
  | "mechanisms"
  | "candidate-attractor";

export type ModelPrediction = {
  model: PredictionModelId;
  branch: "restoration-a" | "restoration-b";
  predictions: TrajectoryPrediction[];
};

export type DimensionScore = {
  earned: number;
  possible: number;
  rationale: string;
};

export type ExperimentScore = {
  dimensions: {
    emergence: DimensionScore;
    mechanisticGrounding: DimensionScore;
    persistence: DimensionScore;
    interventionSensitivity: DimensionScore;
    predictionQuality: DimensionScore;
    falsifiability: DimensionScore;
    counterEvidenceIntegration: DimensionScore;
    determinism: DimensionScore;
  };
  rawScore: number;
  falsePositivePenalty: number;
  overallScore: number;
  negativeControlFalsePositives: string[];
  modelAccuracy: Record<PredictionModelId, number>;
  hardGates: {
    distributedEmergence: boolean;
    negativeControls: boolean;
    incrementalPredictionValue: boolean;
    falsifiable: boolean;
    deterministic: boolean;
    interventionSensitive: boolean;
  };
  passed: boolean;
};
