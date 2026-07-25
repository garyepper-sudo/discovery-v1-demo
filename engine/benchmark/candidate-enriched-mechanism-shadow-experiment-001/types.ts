import type {
  GeneratedCognition,
  InferenceScenario,
} from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type DerivationStatus =
  | "explicit"
  | "deterministically-derived"
  | "supported-but-ambiguous"
  | "unavailable"
  | "unsupported";

export type DerivedField = {
  statement: string;
  artifactIds: string[];
  evidenceIds: string[];
  productionStage: string;
  derivationRule: string;
  derivationStatus: DerivationStatus;
  competingInterpretations: boolean;
  temporalOrderDependent: boolean;
  crossSiloDependent: boolean;
};

export type CandidateEnrichedMechanism = {
  id: string;
  strategy: "current" | "direct-lineage" | "full-context" | "conservative";
  sourceMechanismIds: string[];
  upstreamDriver?: DerivedField;
  mediatingRelationships: DerivedField[];
  downstreamOutcomes: DerivedField[];
  activatingConditions: DerivedField[];
  persistenceConditions: DerivedField[];
  competingExplanations: DerivedField[];
  implications: DerivedField[];
  falsificationCriteria: DerivedField[];
  supportingSiloIds: string[];
  supportingArtifactIds: string[];
  supportingEvidenceIds: string[];
  opposingArtifactIds: string[];
  opposingEvidenceIds: string[];
  confidence: number;
  completeness: "fragment" | "hypothesis" | "qualified" | "rejected";
  missingFields: string[];
  recommendedNextEvidence: Array<{
    missingRelationship: string;
    sourceOrSiloType?: string;
    reason: string;
  }>;
};

export type ShadowScenario = {
  id: string;
  kind: "positive" | "negative";
  scenario: InferenceScenario;
};

export type RegisteredShadow = {
  scenario: ShadowScenario;
  cognition: GeneratedCognition;
  candidates: CandidateEnrichedMechanism[];
  qualifications: Record<string, boolean>;
  predictionRecoverability: unknown[];
  interventionRecoverability: unknown[];
};
