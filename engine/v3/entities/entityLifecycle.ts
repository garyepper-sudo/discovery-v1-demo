import type { OrganizationalEntityType } from "./organizationalEntity";

export type EntityLifecycleStage =
  | "mentioned"
  | "candidate"
  | "classified"
  | "resolved"
  | "merged"
  | "referenced"
  | "stable";

export type EntityMention = {
  id: string;
  organizationId: string;

  text: string;
  normalizedText: string;

  sourceId: string;
  sourceType:
    | "evidence"
    | "observation"
    | "belief"
    | "understanding"
    | "capability"
    | "dynamic"
    | "phenomenon"
    | "concept";

  context: string;

  candidateType: OrganizationalEntityType;
  confidence: number;

  lifecycleStage: EntityLifecycleStage;

  createdAt: string;
};