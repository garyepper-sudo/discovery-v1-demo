import type { V3Contradiction, V3Mechanism } from "../../v3/types";
import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../v3/model/state/inferOrganizationalConditions";
import type { OrganizationalTheory } from "../../v3/model/memory/organizationalTheories";

export type SiloEvidence = {
  id: string;
  silo: string;
  observation: string;
  localInterpretation: string;
  observedAt: string;
};

export type CanonicalArtifacts = {
  mechanisms: Array<
    Pick<
      V3Mechanism,
      "id" | "cause" | "mechanism" | "effect" | "confidence" | "evidenceIds"
    >
  >;
  contradictions: Array<
    Pick<
      V3Contradiction,
      "id" | "explanation" | "confidence" | "evidenceIds" | "opposingEvidenceIds"
    >
  >;
  theories: Array<
    Pick<
      OrganizationalTheory,
      "id" | "title" | "explanation" | "confidence" | "supportingEvidence"
    >
  >;
  conditions: Array<
    Pick<
      OrganizationalCondition,
      "id" | "name" | "status" | "confidence" | "supportingMechanismIds"
    >
  >;
  state: Pick<
    OrganizationalState,
    "id" | "summary" | "confidence" | "dominantConditions"
  >;
  historicalTransitions: Array<{
    id: string;
    beforeState: string;
    afterState: string;
    evidenceIds: string[];
  }>;
};

export type InferenceScenario = {
  id: string;
  evidence: SiloEvidence[];
  artifacts: CanonicalArtifacts;
};

export type ScoringTruth = {
  scenarioId: string;
  family:
    | "cross-functional-bottleneck"
    | "misdiagnosed-constraint"
    | "feedback-loop"
    | "delayed-consequence"
    | "reconciled-local-explanations"
    | "single-silo-answer"
    | "insufficient"
    | "coincidental-correlation"
    | "unresolved-contradiction";
  expectedMechanismId?: string;
  expectedOutcome?: string;
  effectiveIntervention?: string;
  requiredSilos: string[];
  shouldAbstain: boolean;
};

export type FutureOutcome = {
  scenarioId: string;
  observedOutcome: string;
  effectiveIntervention?: string;
};

export type EmergentOrganizationalUnderstanding = {
  explanation: string;
  mechanismId: string;
  requiredSilos: string[];
  supportingEvidenceIds: string[];
  reconciledLocalInterpretations: string[];
  discoveredRelationships: string[];
  discoveredMechanisms: string[];
  interventionImplications: string[];
  predictedOutcomes: string[];
  confidence: number;
  falsificationCriteria: string[];
};

export type ModelId =
  | "best-silo"
  | "majority"
  | "summary"
  | "state"
  | "canonical-combined"
  | "emergent";

export type RegisteredDecision = {
  modelId: ModelId;
  scenarioId: string;
  mechanismId?: string;
  explanation: string;
  predictedOutcome?: string;
  recommendedIntervention?: string;
  supportingEvidenceIds: string[];
  confidence: number;
  falsificationCondition: string;
  abstained: boolean;
};

export type ModelScore = {
  explanationAccuracy: number;
  predictionAccuracy: number;
  interventionQuality: number;
  crossSiloNecessity: number;
  individualRecoverability: number;
  mechanisticGrounding: number;
  relationalNovelty: number;
  lineage: number;
  counterevidence: number;
  abstention: number;
  calibrationError: number;
  total: number;
};
