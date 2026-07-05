import type { KnowledgeReference } from "../../cognition/cognitiveGraph";

export type OrganizationalReasoningDirectness =
  | "direct"
  | "indirect"
  | "emergent";

export type OrganizationalReasoningType =
  | "causal"
  | "dependency"
  | "constraint"
  | "ownership"
  | "failurePropagation"
  | "capabilityFormation"
  | "riskAmplification"
  | "leverage"
  | "unknown";

export type OrganizationalReasoningStep = {
  fromNodeId: string;
  fromLabel: string;
  relationship: string;
  toNodeId: string;
  toLabel: string;
  confidence: number;
  evidenceReferences: KnowledgeReference[];
};

export type OrganizationalReasoningPath = {
  id: string;
  sourceNodeId: string;
  sourceLabel: string;
  targetNodeId: string;
  targetLabel: string;

  steps: OrganizationalReasoningStep[];
  pathLength: number;

  reasoningType: OrganizationalReasoningType;
  directness: OrganizationalReasoningDirectness;

  confidence: number;
  causalStrength: number;
  executiveRelevance: number;

  summary: string;
  evidenceReferences: KnowledgeReference[];
};

export type OrganizationalIndirectEffect = {
  id: string;
  pathId: string;

  sourceNodeId: string;
  sourceLabel: string;

  targetNodeId: string;
  targetLabel: string;

  effect: string;
  confidence: number;
  evidenceReferences: KnowledgeReference[];
};

export type OrganizationalLeveragePoint = {
  id: string;
  nodeId: string;
  label: string;

  reason: string;
  interventionPotential: number;
  confidence: number;

  upstreamNodeIds: string[];
  downstreamNodeIds: string[];

  evidenceReferences: KnowledgeReference[];
};

export type OrganizationalRootCause = {
  id: string;
  nodeId: string;
  label: string;

  affectedNodeIds: string[];
  affectedLabels: string[];

  reason: string;
  confidence: number;
  severity: number;
  executiveRelevance: number;

  supportingPathIds: string[];
  evidenceReferences: KnowledgeReference[];
};

export type OrganizationalReasoningConclusion = {
  id: string;
  pathId: string;

  claim: string;
  confidence: number;

  directness: OrganizationalReasoningDirectness;
  reasoningType: OrganizationalReasoningType;

  explanation: string;
  evidenceChain: KnowledgeReference[];

  leveragePointIds: string[];
};

export type OrganizationalReasoningResult = {
  paths: OrganizationalReasoningPath[];
  indirectEffects: OrganizationalIndirectEffect[];
  leveragePoints: OrganizationalLeveragePoint[];
  rootCauses: OrganizationalRootCause[];
  conclusions: OrganizationalReasoningConclusion[];
  executiveSummary: string[];
};