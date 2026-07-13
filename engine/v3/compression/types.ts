export type OrganizationalConceptStatus =
  | "new"
  | "reinforced"
  | "stable";

export type OrganizationalConcept = {
  // Canonical identity
  id: string;

  // Executive abstraction
  statement: string;
  summary: string;
  explanation: string;

  // Provenance
  understandingIds: string[];

  // Cognitive fitness
  confidence: number;
  coverage: number;
  stability: number;
  novelty: number;
  explanatoryPower: number;

  // Lifecycle
  status: OrganizationalConceptStatus;
};