export type SemanticObservationSourceType =
  | "understanding"
  | "understanding-cluster"
  | "dynamic"
  | "meaning-signal"
  | "organizational-concept"
  | "phenomenon"
  | "mechanism"
  | "mechanism-network"
  | "mechanism-pattern"
  | "organizational-belief"
  | "concept-candidate";

export type SemanticStrength = "weak" | "moderate" | "strong";

export type SemanticCohortState =
  | "emerging"
  | "stable"
  | "strengthening"
  | "weakening"
  | "fragmenting"
  | "obsolete";

/**
 * Canonical semantic interpretation of a cohort.
 *
 * This is Discovery's persistent representation of what the
 * semantic structure actually means. Higher cognitive layers
 * (Beliefs, Concept Candidates, Executive Assessment, etc.)
 * should consume this rather than independently reconstructing
 * organizational meaning.
 */
export type SemanticCohortMeaning = {
  statement: string;
  summary: string;

  /**
   * The explanatory frame that best describes this cohort.
   * Optional because some cohorts may not yet match a known frame.
   */
  explanatoryFrameId?: string;

  /**
   * Canonical concepts represented by this semantic structure.
   */
  conceptIds: string[];

  /**
   * Confidence in this semantic interpretation.
   */
  confidence: number;
};

export type SemanticObservation = {
  id: string;

  statement: string;
  summary: string;

  sourceType: SemanticObservationSourceType;
  sourceIds: string[];

  supportingUnderstandingIds: string[];
  supportingClusterIds: string[];
  supportingDynamicIds: string[];
  supportingMeaningSignalIds: string[];
  supportingConceptIds: string[];
  supportingPhenomenonIds: string[];
  supportingMechanismIds: string[];
  supportingNetworkIds: string[];
  supportingPatternIds: string[];
  supportingBeliefIds: string[];
  supportingCandidateIds: string[];

  keywords: string[];
  semanticSignature: string;

  confidence: number;
  strength: SemanticStrength;

  explanatoryStrength: number;
  organizationalPersistence: number;

  explanation: string;
};

export type SemanticCohort = {
  id: string;

  statement: string;
  summary: string;

  observations: SemanticObservation[];
  observationIds: string[];

  sourceTypes: SemanticObservationSourceType[];
  sourceIds: string[];

  supportingUnderstandingIds: string[];
  supportingClusterIds: string[];
  supportingDynamicIds: string[];
  supportingMeaningSignalIds: string[];
  supportingConceptIds: string[];
  supportingPhenomenonIds: string[];
  supportingMechanismIds: string[];
  supportingNetworkIds: string[];
  supportingPatternIds: string[];

  keywords: string[];
  semanticSignature: string;

  /**
   * Canonical organizational meaning represented by this cohort.
   * This becomes the persistent semantic memory consumed by all
   * higher-order reasoning layers.
   */
  canonicalMeaning: SemanticCohortMeaning;

  confidence: number;
  strength: SemanticStrength;

  explanatoryBreadth: number;
  explanatoryDepth: number;
  semanticStability: number;
  organizationalPersistence: number;

  cohortState: SemanticCohortState;
  occurrenceCount: number;

  /**
   * Downstream cognitive objects derived from this cohort.
   * These are interpretation artifacts—not semantic memory.
   */
  derivedBeliefIds: string[];
  derivedConceptCandidateIds: string[];
  derivedTheoryIds: string[];

  explanation: string;
};

export type SemanticReasoningResult = {
  observations: SemanticObservation[];
  cohorts: SemanticCohort[];
};