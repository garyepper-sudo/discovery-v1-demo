/* ==========================================================
   Discovery V3
   Cognitive Graph
   Canonical Organizational Knowledge Model
   ========================================================== */

export type OrganizationalKnowledgeNodeType =
  | "observation"
  | "belief"
  | "understanding"
  | "dynamic"
  | "capability"
  | "meaning"
  | "concept"
  | "phenomenon";

export type OrganizationalKnowledgeStatus =
  | "emerging"
  | "stable"
  | "strengthening"
  | "weakening"
  | "constrained"
  | "healthy"
  | "new"
  | "reinforced"
  | "unknown";

export interface KnowledgeReference {
  id: string;
  type: OrganizationalKnowledgeNodeType;
}

export interface OrganizationalKnowledgeNode {
  id: string;

  type: OrganizationalKnowledgeNodeType;

  label: string;

  summary?: string;

  confidence: number;

  strength: number;

  status?: OrganizationalKnowledgeStatus;

  /**
   * Upstream knowledge nodes that directly support this node.
   */
  supportedBy: KnowledgeReference[];

  /**
   * Downstream knowledge nodes derived from this node.
   */
  supports: KnowledgeReference[];

  metadata?: Record<string, unknown>;

  createdAt: string;

  updatedAt: string;
}

export interface CognitiveGraph {
  nodes: OrganizationalKnowledgeNode[];
}

export function createKnowledgeNode(
  node: OrganizationalKnowledgeNode
): OrganizationalKnowledgeNode {
  return node;
}