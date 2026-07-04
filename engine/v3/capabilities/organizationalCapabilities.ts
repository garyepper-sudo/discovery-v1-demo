export type OrganizationalCapabilityStatus = "new" | "reinforced" | "stable";

export type OrganizationalCapability = {
  id: string;
  label: string;
  description: string;

  confidence: number;
  strength: number;
  stability: number;
  status: OrganizationalCapabilityStatus;

  understandingIds: string[];
  meaningIds: string[];
  conceptIds: string[];
  phenomenonIds: string[];

  supportingEvidence: string[];
  contradictingEvidence: string[];

  createdAt: string;
  updatedAt: string;
};

export type OrganizationalCapabilitiesState = {
  capabilities: OrganizationalCapability[];
  lastUpdated: string;
};

export type DetectedOrganizationalCapability = {
  label: string;
  description: string;
  confidence: number;
  evidence: string[];
  understandingIds: string[];
};