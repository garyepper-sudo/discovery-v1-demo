import type { OrganizationalExplanation } from "./organizationalJudgment";

export type PatternLike = {
  id: string;
  label?: string;
  statement?: string;
  description?: string;
  reason?: string;
  confidence?: number;
  strength?: number;
  relatedBeliefIds?: string[];
  relatedObservationIds?: string[];
};

export type ReasoningPathLike = {
  id: string;
  sourceLabel?: string;
  targetLabel?: string;
  reasoningType?: string;
  directness?: string;
  summary?: string;
  confidence?: number;
};

export type CapabilityLike = {
  id: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  status?: string;
  confidence?: number;
};

export type UnderstandingClusterLike = {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  confidence?: number;
};

export type OrganizationalJudgmentLike = {
  id: string;
  explanationId?: string;
  confidence?: number;
  executiveUtility?: number;
  actionability?: number;
  summary?: string;
};

export type ExplanationLike = OrganizationalExplanation & {
  interpretation?: string;
  executiveImplication?: string;
  type?: string;
  executiveUtility?: number;
};

export type InferOrganizationalMechanismsInput = {
  /**
   * Primary ontology input.
   * Mechanisms should increasingly be inferred from recurring patterns.
   */
  patterns?: PatternLike[];

  /**
   * Transitional compatibility inputs.
   * These remain until the ontology migration is complete.
   */
  explanations?: ExplanationLike[];
  reasoningPaths?: ReasoningPathLike[];
  capabilities?: CapabilityLike[];
  understandingClusters?: UnderstandingClusterLike[];
  judgments?: OrganizationalJudgmentLike[];
};

export type MechanismCandidate = {
  id: string;

  explanationIds: string[];
  reasoningPathIds: string[];
  capabilityIds: string[];
  clusterIds: string[];
  judgmentIds: string[];

  sourceTexts: string[];

  sharedBehaviors: string[];
  sharedCapabilities: string[];
  sharedConsequences: string[];

  convergenceScore: number;
  noveltyScore: number;
  confidence: number;
};