/**
 * Intermediate cognitive object produced during abstraction.
 *
 * Concept candidates collect supporting organizational evidence,
 * mechanisms, beliefs, dynamics, and semantic relationships before
 * Discovery determines whether they should become persistent
 * Organizational Concepts.
 */
export type ConceptCandidateSourceType =
  | "mechanism"
  | "mechanism-network"
  | "mechanism-pattern"
  | "organizational-belief"
  | "dynamic"
  | "understanding-cluster"
  | "understanding";

export type ConceptCandidateStrength =
  | "weak"
  | "moderate"
  | "strong";

export type ConceptCandidate = {
  // Identity
  id: string;

  // Candidate interpretation
  statement: string;
  summary: string;
  explanation: string;

  // Origin
  sourceType: ConceptCandidateSourceType;
  sourceIds: string[];

  // Provenance
  supportingUnderstandingIds: string[];
  supportingMechanismIds: string[];
  supportingPatternIds: string[];
  supportingBeliefIds: string[];
  supportingDynamicIds: string[];
  supportingClusterIds: string[];

  // Semantic identity
  keywords: string[];
  semanticSignature: string;

  // Candidate quality
  confidence: number;
  strength: ConceptCandidateStrength;
};