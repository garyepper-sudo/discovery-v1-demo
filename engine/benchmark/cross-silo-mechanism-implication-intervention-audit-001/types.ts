import type {
  GeneratedCognition,
  InferenceScenario,
} from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type AuditScenario = {
  id: string;
  kind: "positive" | "negative";
  pattern: string;
  scenario: InferenceScenario;
};

export type AuditedCausalChain = {
  mechanismId?: string;
  upstreamDriver?: string;
  mediatingLinks: string[];
  downstreamOutcome?: string;
  activatingConditions: string[];
  persistenceConditions: string[];
  predictionHorizon?: string;
  supportingSilos: string[];
  supportingEvidenceIds: string[];
  opposingEvidenceIds: string[];
  competingExplanations: string[];
  falsificationCriteria: string[];
  confidence?: number;
  lineageComplete: boolean;
};

export type CompletenessAudit = {
  fields: Record<string, boolean>;
  score: number;
  classification:
    | "complete"
    | "partially complete"
    | "local fragment"
    | "plausible but underdetermined"
    | "unsupported false positive";
};

export type ContractId =
  | "current-production"
  | "minimal-completeness"
  | "full-causal-implication"
  | "adversarially-strict";

export type RegisteredAudit = {
  scenario: AuditScenario;
  cognition: GeneratedCognition;
  trace: unknown;
  chains: AuditedCausalChain[];
  completeness: CompletenessAudit[];
  predictionAudit: unknown;
  interventionAudit: unknown;
  recompositions: unknown[];
  eligibility: Record<ContractId, boolean>;
};
