export type OrganizationalMeaningId =
  | "decision_authority"
  | "governance"
  | "execution_capacity"
  | "coordination"
  | "organizational_agility"
  | "innovation_flow"
  | "knowledge_continuity"
  | "organizational_memory"
  | "risk_appetite"
  | "accountability"
  | "ownership"
  | "alignment"
  | "communication"
  | "resource_allocation"
  | "customer_responsiveness"
  | "strategic_uncertainty"
  | "leadership_dependency"
  | "operational_complexity";

export type MeaningSignal = {
  id: string;
  meaningId: OrganizationalMeaningId;
  label: string;
  description: string;
  confidence: number;
  strength: number;
  supportingUnderstandingIds: string[];
  sourceTerms: string[];
};

export type MeaningExtractionInput = {
  id: string;
  statement?: string;
  summary?: string;
  description?: string;
  confidence?: number;
  strength?: number;
};