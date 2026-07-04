export type OrganizationalEntityType =
  | "actor"
  | "team"
  | "system"
  | "process"
  | "technology"
  | "risk"
  | "opportunity"
  | "phenomenon"
  | "concept"
  | "unknown";

export type OrganizationalEntityRelationshipType =
  | "owns"
  | "uses"
  | "dependsOn"
  | "enables"
  | "constrains"
  | "affects"
  | "reportsTo"
  | "collaboratesWith"
  | "duplicates"
  | "conflictsWith"
  | "relatesTo";

export type OrganizationalEntityRelationship = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: OrganizationalEntityRelationshipType;
  confidence: number;
  evidenceIds: string[];
  firstSeen: string;
  lastSeen: string;
};

export type OrganizationalEntity = {
  id: string;
  organizationId: string;

  canonicalName: string;
  normalizedName: string;
  aliases: string[];

  type: OrganizationalEntityType;
  description?: string;

  confidence: number;
  stability: "candidate" | "emerging" | "stable";

  firstSeen: string;
  lastSeen: string;
  mentionCount: number;

  observationIds: string[];
  beliefIds: string[];
  understandingIds: string[];
  capabilityIds: string[];
  dynamicIds: string[];
  phenomenonIds: string[];
  conceptIds: string[];

  relatedEntityIds: string[];

  createdAt: string;
  updatedAt: string;
};