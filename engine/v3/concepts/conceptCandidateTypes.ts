export type ConceptCandidateSourceType =
  | "mechanism"
  | "mechanism-network"
  | "mechanism-pattern"
  | "organizational-belief"
  | "dynamic"
  | "understanding-cluster"
  | "understanding";

export type ConceptCandidateStrength = "weak" | "moderate" | "strong";

export type ConceptCandidate = {
  id: string;

  statement: string;
  summary: string;

  sourceType: ConceptCandidateSourceType;
  sourceIds: string[];

  supportingUnderstandingIds: string[];
  supportingMechanismIds: string[];
  supportingPatternIds: string[];
  supportingBeliefIds: string[];
  supportingDynamicIds: string[];
  supportingClusterIds: string[];

  keywords: string[];
  semanticSignature: string;

  confidence: number;
  strength: ConceptCandidateStrength;

  explanation: string;
};