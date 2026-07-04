export type FunctionalInterpretationStatus = "new" | "reinforced" | "stable";

export type FunctionalInterpretationCategory =
  | "authority"
  | "coordination"
  | "information"
  | "knowledge"
  | "execution"
  | "learning"
  | "decision"
  | "ownership"
  | "communication"
  | "risk"
  | "adaptation"
  | "planning"
  | "prioritization"
  | "accountability"
  | "resourceAllocation"
  | "governance"
  | "unknown";

export type FunctionalInterpretation = {
  id: string;

  statement: string;
  category: FunctionalInterpretationCategory;
  description: string;

  confidence: number;
  strength: number;
  status: FunctionalInterpretationStatus;

  supportingUnderstandingIds: string[];
  supportingCapabilityIds?: string[];

  createdAt: string;
  updatedAt: string;
};

export type FunctionalInterpretationState = {
  interpretations: FunctionalInterpretation[];
  lastUpdatedAt?: string;
};