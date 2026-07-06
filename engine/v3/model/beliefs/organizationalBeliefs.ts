export type OrganizationalBeliefTrend =
  | "strengthening"
  | "weakening"
  | "stable";

export type OrganizationalBelief = {
  id: string;
  statement: string;
  confidence: number;

  supportingMechanismIds: string[];
  supportingPatternIds: string[];
  supportingConceptIds: string[];
  supportingEvidenceIds: string[];

  contradictoryEvidenceIds: string[];

  trend: OrganizationalBeliefTrend;
  lastUpdatedAt: string;
};

export type OrganizationalBeliefInput = {
  mechanismIds?: string[];
  patternIds?: string[];
  conceptIds?: string[];
  evidenceIds?: string[];
  contradictoryEvidenceIds?: string[];
};

export type OrganizationalBeliefRevision = {
  beliefId: string;
  previousConfidence: number;
  revisedConfidence: number;
  trend: OrganizationalBeliefTrend;
  reason: string;
};