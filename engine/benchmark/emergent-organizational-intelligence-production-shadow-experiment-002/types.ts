import type { InvestigationEvidenceSource } from "../../types";

export type RawSiloEvidence = InvestigationEvidenceSource & {
  silo: string;
};

export type InferenceScenario = {
  id: string;
  organizationId: string;
  company: string;
  industry: string;
  question: string;
  evidence: RawSiloEvidence[];
};

export type ScoringTruth = {
  scenarioId: string;
  family:
    | "commercial-complexity"
    | "decision-escalation"
    | "local-optimization"
    | "customer-misdiagnosis"
    | "delayed-consequence"
    | "contradictory-local"
    | "single-silo"
    | "unrelated"
    | "insufficient"
    | "coincidental"
    | "structural-change";
  emergentExpected: boolean;
  expectedMechanismTerms: string[];
  expectedOutcomeTerms: string[];
  expectedInterventionTerms: string[];
  requiredSilos: string[];
};

export type HeldOutFuture = {
  scenarioId: string;
  content: string;
  outcomeTerms: string[];
  effectiveInterventionTerms: string[];
};

export type GeneratedMechanism = {
  id: string;
  cause: string;
  mechanism: string;
  effect: string;
  confidence: number;
  evidenceIds: string[];
  sourceIds: string[];
  silos: string[];
  crossSilo: boolean;
  explicitInSingleSource: boolean;
};

export type GeneratedCognition = {
  scenarioId: string;
  rawEvidence: Array<{
    id: string;
    sourceId?: string;
    silo?: string;
    text: string;
  }>;
  observations: unknown[];
  signals: unknown[];
  contradictions: unknown[];
  themes: unknown[];
  mechanisms: GeneratedMechanism[];
  beliefs: unknown[];
  hypotheses: unknown[];
  causalChains: unknown[];
  explanations: unknown[];
  understanding: unknown[];
  phenomena: unknown[];
  concepts: unknown[];
  theories: unknown[];
  conditions: unknown[];
  organizationalState: unknown;
  predictions: unknown[];
  executiveAssessment: unknown;
  executiveRecommendation: unknown;
  stagesExercised: string[];
};

export type ModelId =
  | "best-silo"
  | "local-aggregation"
  | "generic-summary"
  | "production-state"
  | "production-combined"
  | "verbal-projection";

export type RegisteredOrganizationalPrediction = {
  scenarioId: string;
  modelId: ModelId;
  variantId?: string;
  explanation: string;
  mechanismId?: string;
  predictedOutcome: string;
  triggeringConditions: string[];
  predictionHorizon: string;
  confidence: number;
  recommendedIntervention: string;
  expectedInterventionEffect: string;
  supportingEvidenceIds: string[];
  supportingCognitionArtifactIds: string[];
  falsificationCriteria: string[];
  abstained: boolean;
};

export type VerbalEmergentUnderstanding = {
  whatDiscoverySees: string;
  whyThisWasHardToSee: string;
  evidenceChain: string[];
  whatThisExplains: string;
  whatDiscoveryPredicts: string;
  whatWouldChangeTheConclusion: string;
  whatToDoNext: string;
};

export type ModelScore = {
  mechanismCorrectness: number;
  predictionAccuracy: number;
  interventionAccuracy: number;
  abstentionQuality: number;
  lineage: number;
  calibrationError: number;
  total: number;
};
