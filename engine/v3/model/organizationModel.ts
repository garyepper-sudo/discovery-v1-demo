import type { KnowledgeReference } from "../cognition/cognitiveGraph";
import type {
  OrganizationalEntity,
  OrganizationalEntityRelationship,
} from "../entities/organizationalEntity";

export type OrganizationModelNodeType =
  | "entity"
  | "evidence"
  | "observation"
  | "belief"
  | "understanding"
  | "cluster"
  | "dynamic"
  | "capability"
  | "phenomenon"
  | "concept"
  | "memory";

export type OrganizationModelEdgeType =
  | "supports"
  | "contradicts"
  | "strengthens"
  | "weakens"
  | "causes"
  | "dependsOn"
  | "derivedFrom"
  | "partOf"
  | "similarTo"
  | "explains"
  | "reinforces"
  | "referencesEntity"
  | "relatesToEntity";

export type OrganizationModelMetrics = {
  coherence: number;
  continuity: number;
  integration: number;
  adaptability: number;
  emergence: number;
};

export type OrganizationModelNode = {
  id: string;
  type: OrganizationModelNodeType;
  label: string;
  summary: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  references?: KnowledgeReference[];
  metadata?: Record<string, unknown>;
};

export type OrganizationModelEdge = {
  id: string;
  from: string;
  to: string;
  type: OrganizationModelEdgeType;
  strength: number;
  explanation: string;
  createdAt: string;
  updatedAt: string;
  references?: KnowledgeReference[];
};

export type OrganizationModelSnapshot = {
  id: string;
  createdAt: string;
  reason: string;
  nodeCount: number;
  edgeCount: number;
};

export type OrganizationModel = {
  organizationId: string;
  version: number;

  createdAt: string;
  updatedAt: string;

  /**
   * Canonical organizational graph.
   * Every downstream cognitive layer should increasingly
   * reference these persistent entities rather than raw text.
   */
  entities: OrganizationalEntity[];

  /**
   * Persistent relationships between entities.
   * These represent the evolving organizational structure.
   */
  entityRelationships: OrganizationalEntityRelationship[];

  /**
   * Unified cognitive graph.
   * Nodes increasingly reference entities instead of
   * storing duplicated organizational concepts.
   */
  nodes: OrganizationModelNode[];

  edges: OrganizationModelEdge[];

  /**
   * Historical snapshots for longitudinal reasoning.
   */
  snapshots: OrganizationModelSnapshot[];

  /**
   * Overall health of the organizational understanding model.
   */
  metrics: OrganizationModelMetrics;
};