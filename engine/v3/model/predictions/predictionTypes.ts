import type {
  OrganizationalPrediction,
  OrganizationalPredictionType,
} from "./organizationalPrediction";

export type PredictionConditionStatus =
  | "stable"
  | "emerging"
  | "improving"
  | "deteriorating"
  | "constrained"
  | "weak"
  | "unresolved";

export type PredictionConditionTrend =
  | "strengthening"
  | "weakening"
  | "stable"
  | "new";

export type PredictionCondition = {
  id: string;
  name: string;
  domain: string;

  status: PredictionConditionStatus;
  trend: PredictionConditionTrend;

  priority:
    | "critical"
    | "high"
    | "medium"
    | "low";

  confidence: number;
  strength: number;

  supportingConceptIds: string[];
  supportingBeliefIds: string[];
  supportingTheoryIds: string[];

  upstreamConditionIds: string[];
  downstreamConditionIds: string[];

  missingEvidence: string[];
  confidenceLimiters: string[];
};

export type PredictionOrganizationalState = {
  id: string;

  status:
    | "healthy"
    | "watch"
    | "strained"
    | "critical"
    | "uncertain";

  confidence: number;

  dominantConditionIds: string[];
  improvingConditionIds: string[];
  deterioratingConditionIds: string[];
  unresolvedConditionIds: string[];
};

export type PredictionLearningProfile = {
  investigationsObserved: number;

  learningVelocityScore: number;
  memoryGrowth: number;
  understandingGrowth: number;

  beliefStability: number;
  theoryStability: number;
  knowledgeRetention: number;
};

export type PredictionContext = {
  conditions: PredictionCondition[];

  organizationalState?: PredictionOrganizationalState;

  learningProfile?: PredictionLearningProfile;

  previousPredictions?: OrganizationalPrediction[];

  now: string;
};

export type PredictionCandidate = {
  id: string;

  predictionType: OrganizationalPredictionType;

  sourceConditionIds: string[];

  targetConditionIds: string[];

  confidence: number;
  likelihood: number;

  explanation: string;
};

export type PredictionInferenceResult = {
  predictions: OrganizationalPrediction[];

  candidates: PredictionCandidate[];

  generatedAt: string;
};