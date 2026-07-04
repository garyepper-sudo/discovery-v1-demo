export type OrganizationalConceptStatus = "new" | "reinforced" | "stable";

export type OrganizationalConcept = {
  id: string;

  statement: string;
  summary: string;

  understandingIds: string[];

  confidence: number;
  coverage: number;
  stability: number;
  novelty: number;
  explanatoryPower: number;

  status: OrganizationalConceptStatus;

  explanation: string;
};