export type OrganizationalPhenomenonStatus =
  | "emerging"
  | "strengthening"
  | "stable"
  | "weakening"
  | "fragmented";

export type OrganizationalPhenomenon = {
  id: string;
  label: string;
  description: string;

  clusterIds: string[];
  understandingIds: string[];

  status: OrganizationalPhenomenonStatus;

  confidence: number;
  strength: number;

  executiveMeaning: string;
  evidenceSummary: string;
  changeExplanation: string;

  firstDetectedAt: string;
  lastUpdatedAt: string;
};

export type OrganizationalPhenomenaState = {
  phenomena: OrganizationalPhenomenon[];
  lastUpdatedAt?: string;
};