import type { InferenceScenario } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type SupportStatus =
  | "explicit"
  | "deterministically-derived"
  | "supported-but-ambiguous"
  | "unavailable"
  | "unsupported";

export type ScenarioKind = "positive" | "negative";
export type CausalScenario = {
  id: string;
  family: string;
  kind: ScenarioKind;
  scenario: InferenceScenario;
};

export type SupportedStatement = {
  statement: string;
  artifactIds: string[];
  evidenceIds: string[];
  supportStatus: SupportStatus;
};

export type MediatingRelationship = {
  from: string;
  relationship: string;
  to: string;
  artifactIds: string[];
  evidenceIds: string[];
  supportStatus: SupportStatus;
};

export type CandidateCausalMechanism = {
  id: string;
  strategy: "production" | "pairwise" | "alternative-aware" | "conservative";
  upstreamDrivers: SupportedStatement[];
  mediatingRelationships: MediatingRelationship[];
  downstreamOutcomes: SupportedStatement[];
  activatingConditions: SupportedStatement[];
  persistenceConditions: SupportedStatement[];
  competingExplanations: Array<{
    explanation: string;
    supportingArtifactIds: string[];
    supportingEvidenceIds: string[];
    contradictingArtifactIds: string[];
    discriminatingEvidenceNeeded: string[];
    relativeSupport: number;
  }>;
  implications: Array<{
    trigger: string;
    predictedOutcome: string;
    horizon?: string;
    confidence: number;
    artifactIds: string[];
    evidenceIds: string[];
  }>;
  falsificationCriteria: Array<{
    criterion: string;
    artifactIds: string[];
    evidenceIds: string[];
  }>;
  supportingSiloIds: string[];
  supportingArtifactIds: string[];
  supportingEvidenceIds: string[];
  opposingArtifactIds: string[];
  opposingEvidenceIds: string[];
  confidence: number;
  classification:
    | "fragment"
    | "causal-hypothesis"
    | "qualified-causal-mechanism"
    | "rejected";
  missingStructure: string[];
  recommendedNextEvidence: Array<{
    missingRelationship: string;
    purpose:
      | "mediation"
      | "activation"
      | "direction"
      | "alternative-discrimination"
      | "implication"
      | "falsification";
    suggestedSourceOrSilo?: string;
    reason: string;
  }>;
};

export type FormationInput = {
  scenarioId: string;
  rawEvidence: Array<{
    id: string;
    sourceId?: string;
    silo?: string;
    text: string;
    observedAt?: string;
  }>;
  artifacts: Array<{ id: string; text: string; evidenceIds: string[] }>;
  productionMechanisms: Array<{
    id: string;
    cause: string;
    mechanism: string;
    effect: string;
    confidence: number;
    evidenceIds: string[];
    silos: string[];
  }>;
};

export type ScoringTruth = {
  scenarioId: string;
  shouldQualify: boolean;
  expectedTerms: string[];
  heldOutOutcomeTerms: string[];
};
