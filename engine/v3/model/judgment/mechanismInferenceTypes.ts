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

export type PhenomenonLike = {
  id: string;
  type?: string;
  label?: string;
  summary?: string;
  description?: string;
  confidence?: number;
  strength?: number;
  relatedPatternIds?: string[];
  relatedObservationIds?: string[];
  possibleMechanismTypes?: string[];
  understandingIds?: string[];
};

export type UnderstandingLike = {
  id: string;
  evidenceIds?: string[];
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

/**
 * Semantic concepts represent compressed organizational understanding.
 * They remain useful reinforcement signals, but they are no longer
 * the primary source of mechanism inference.
 */
export type SemanticConceptLike = {
  id: string;
  title?: string;
  label?: string;
  summary?: string;
  description?: string;
  confidence?: number;
};

export type CompressedPatternThemeLike = {
  id: string;
  label?: string;
  summary?: string;
  confidence?: number;
  supportingPatternIds?: string[];
  supportingObservationIds?: string[];
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
   * Phenomena represent interpreted organizational conditions.
   * Mechanisms should be inferred from these conditions as operating forces.
   */
  phenomena?: PhenomenonLike[];

  /** Source understandings used only to resolve phenomenon provenance. */
  understandings?: UnderstandingLike[];

  /**
   * Supporting ontology input.
   * Patterns provide recurrence evidence that can reinforce mechanisms.
   */
  patterns?: PatternLike[];

  /**
   * Compressed organizational understanding.
   * Concepts can reinforce or contextualize operating forces.
   */
  semanticConcepts?: SemanticConceptLike[];

  /**
   * Compressed pattern themes represent graph-derived abstractions across
   * related patterns. They should become the preferred substrate for
   * mechanism inference while preserving pattern traceability.
   */
  compressedPatternThemes?: CompressedPatternThemeLike[];

  /**
   * Transitional compatibility inputs.
   * These enrich mechanism inference but should not be the primary source
   * of the mechanism ontology.
   */
  explanations?: ExplanationLike[];
  reasoningPaths?: ReasoningPathLike[];
  capabilities?: CapabilityLike[];
  understandingClusters?: UnderstandingClusterLike[];
  judgments?: OrganizationalJudgmentLike[];
};

export type MechanismCandidate = {
  id: string;

  phenomenonIds: string[];
  patternIds: string[];
  compressedThemeIds: string[];
  explanationIds: string[];
  reasoningPathIds: string[];
  capabilityIds: string[];
  clusterIds: string[];
  judgmentIds: string[];
  semanticConceptIds: string[];
  mechanismType?: string;

  sourceTexts: string[];

  sharedBehaviors: string[];
  sharedCapabilities: string[];
  sharedConsequences: string[];

  convergenceScore: number;
  noveltyScore: number;
  confidence: number;
};
