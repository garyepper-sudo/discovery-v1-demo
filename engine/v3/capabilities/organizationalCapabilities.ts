import type {
  KnowledgeReference,
  OrganizationalKnowledgeNode,
} from "../cognition/cognitiveGraph";

export type OrganizationalCapabilityStatus =
  | "new"
  | "reinforced"
  | "stable";

export type OrganizationalCapability = Omit<
  OrganizationalKnowledgeNode,
  "type" | "status" | "supportedBy" | "supports"
> & {
  type: "capability";

  description: string;

  status: OrganizationalCapabilityStatus;

  stability: number;

  supportedBy: KnowledgeReference[];
  supports: KnowledgeReference[];

  dynamicIds: string[];
  understandingIds: string[];
  meaningIds: string[];
  conceptIds: string[];
  phenomenonIds: string[];

  supportingEvidence: string[];
  contradictingEvidence: string[];
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

  dynamicIds: string[];
  supportedBy: KnowledgeReference[];
};