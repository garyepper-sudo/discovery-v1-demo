import type { KnowledgeReference } from "../../cognition/cognitiveGraph";
import type {
  OrganizationalExplanation,
  OrganizationalExplanationType,
} from "./organizationalJudgment";

export type OrganizationalTheoryPhenomenon =
  | "coordinationBottleneck"
  | "authorityAmbiguity"
  | "executionFragility"
  | "informationBreakdown"
  | "processTechnologyMismatch"
  | "accountabilityGap"
  | "capabilityConstraint"
  | "reinforcingFailureLoop"
  | "governanceGap"
  | "resourceConstraint"
  | "decisionLatency"
  | "operatingModelMismatch"
  | "unknown";

export type OrganizationalTheoryStatus =
  | "candidate"
  | "supported"
  | "contested"
  | "weak"
  | "dominant";

export type OrganizationalTheoryEvidence = {
  explanationId?: string;
  reasoningPathId?: string;
  summary: string;
  references: KnowledgeReference[];
  confidence: number;
};

export type OrganizationalTheoryContradiction = {
  explanationId?: string;
  reasoningPathId?: string;
  summary: string;
  references: KnowledgeReference[];
  severity: number;
};

export type OrganizationalTheory = {
  id: string;

  title: string;
  thesis: string;
  summary: string;

  phenomenon: OrganizationalTheoryPhenomenon;
  status: OrganizationalTheoryStatus;

  explanationIds: string[];
  reasoningPathIds: string[];

  /**
   * Keeps the theory self-contained so later judgment stages do not need to
   * repeatedly reconstruct the explanation objects from IDs.
   */
  supportingExplanations: OrganizationalExplanation[];

  explanationTypes: OrganizationalExplanationType[];

  systemicCauses: string[];
  symptoms: string[];
  reinforcingPatterns: string[];

  affectedNodeIds: string[];
  centralNodeIds: string[];

  evidenceFor: OrganizationalTheoryEvidence[];
  evidenceAgainst: OrganizationalTheoryContradiction[];

  predictedDownstreamEffects: string[];
  likelyExecutiveInterpretation: string;

  confidence: number;
  explanatoryPower: number;
  actionability: number;
  strategicImportance: number;
  contradictionRisk: number;

  score: number;
};

export type FormOrganizationalTheoriesInput = {
  explanations: OrganizationalExplanation[];
  maxTheories?: number;
};

export type FormOrganizationalTheoriesOutput = {
  theories: OrganizationalTheory[];
};