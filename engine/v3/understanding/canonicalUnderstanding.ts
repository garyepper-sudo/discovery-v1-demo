export type UnderstandingStatus =
  | "emerging"
  | "active"
  | "reinforced"
  | "declining";

export type CanonicalUnderstanding = {
  id: string;
  title: string;
  statement: string;
  mechanism: string;

  confidence: number;
  strength: number;
  stability: number;

  status: UnderstandingStatus;

  supportingEvidence: string[];
  supportingDynamics: string[];
  supportingCapabilities: string[];
  contradictoryEvidence: string[];

  investigationIds: string[];

  createdAt: string;
  updatedAt: string;
};

export function createUnderstandingId(statement: string): string {
  return statement
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8)
    .join("-");
}