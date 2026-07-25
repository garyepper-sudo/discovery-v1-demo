import type {
  V3Contradiction,
  V3Mechanism,
} from "../../v3/types";
import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../v3/model/state/inferOrganizationalConditions";

/**
 * Experiment-local contracts. These are deliberately not exported by
 * production cognition or persisted in Organization Runtime.
 */
export type MechanismArtifact = Pick<
  V3Mechanism,
  | "id"
  | "cause"
  | "mechanism"
  | "effect"
  | "confidence"
  | "stability"
  | "evidenceIds"
  | "contradictionIds"
>;
export type ContradictionArtifact = Pick<
  V3Contradiction,
  "id" | "explanation" | "evidenceIds" | "opposingEvidenceIds" | "confidence"
>;
export type ConditionArtifact = Pick<
  OrganizationalCondition,
  "id" | "name" | "status" | "confidence" | "trend" | "supportingMechanismIds"
>;
export type StateArtifact = Pick<
  OrganizationalState,
  "id" | "summary" | "status" | "confidence" | "dominantConditions"
>;

export type ProductionDerivedSnapshot = {
  id: string;
  recordedAt: string;
  evidenceIds: string[];
  mechanisms: MechanismArtifact[];
  contradictions: ContradictionArtifact[];
  conditions: ConditionArtifact[];
  state: StateArtifact;
};

export type InferenceScenario = {
  id: string;
  inferenceWindow: ProductionDerivedSnapshot[];
};

export type FutureOutcome = {
  scenarioId: string;
  triggerObserved: boolean;
  realizedConditionIds: string[];
  realizedSummary: string;
};

export type ScoringTruth = {
  scenarioId: string;
  family:
    | "temporary-change"
    | "structural-transition"
    | "competing"
    | "unstable"
    | "recurrence-without-mechanism"
    | "mechanism-without-restoration"
    | "contradictory";
  shouldAbstain: boolean;
  expectedConditionId?: string;
};

export type CandidateOrganizationalAttractor = {
  id: string;
  targetState: { conditionIds: string[]; stateSummary: string };
  restoringMechanismIds: string[];
  activatingConditions: Array<{ condition: string; evidenceIds: string[] }>;
  weakeningConditions: Array<{ condition: string; evidenceIds: string[] }>;
  historicalSupport: Array<{
    beforeStateId: string;
    perturbationEvidenceIds: string[];
    afterStateId: string;
    restorationObserved: boolean;
  }>;
  implications: Array<{
    id: string;
    triggeringCondition: string;
    predictedOutcome: string;
    predictionHorizon: string;
    confidence: number;
    distinguishingFromBaseline: string;
  }>;
  supportingArtifactIds: string[];
  opposingArtifactIds: string[];
  persistenceConfidence: number;
  falsificationCriteria: string[];
  abstentionReason?: string;
};

export type RegisteredPrediction = {
  modelId: "state" | "mechanisms" | "combined" | "attractor";
  scenarioId: string;
  predictionId: string;
  triggeringCondition: string;
  predictedOutcome: string;
  predictedConditionId?: string;
  confidence: number;
  supportingArtifactIds: string[];
  falsificationCondition: string;
  abstained: boolean;
};

export type ModelScore = {
  accuracy: number;
  triggerAccuracy: number;
  conditionalSpecificity: number;
  restorationDetection: number;
  mechanisticGrounding: number;
  temporalGrounding: number;
  falsifiability: number;
  counterevidenceIntegration: number;
  abstentionQuality: number;
  calibrationError: number;
  total: number;
};
