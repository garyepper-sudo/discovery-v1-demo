export type DominantCausalChainNodeType =
  | "mechanism"
  | "condition"
  | "organizational_state";

export type DominantCausalChainNode = {
  id: string;
  type: DominantCausalChainNodeType;
  label: string;
  summary?: string;
  confidence?: number;
};

export type DominantCausalChainEdge = {
  fromId: string;
  toId: string;
  relationship:
    | "reinforces"
    | "constrains"
    | "contributes_to"
    | "shapes";
};

export type ExecutiveDominantCausalChain = {
  id: string;
  generatedAt: string;

  dominantConditionId: string;
  rootMechanismIds: string[];
  supportingConditionIds: string[];

  nodes: DominantCausalChainNode[];
  edges: DominantCausalChainEdge[];

  headline: string;
  executiveExplanation: string;
  confidence: number;
  uncertaintySummary: string;
};

export type CausalChainConditionLike = {
  id: string;
  name: string;
  summary?: string;
  whyItMatters?: string;
  confidence?: number;
  strength?: number;
  supportingMechanismIds?: string[];
  upstreamConditionIds?: string[];
  downstreamConditionIds?: string[];
  uncertaintySummary?: string;
};

export type CausalChainMechanismLike = {
  id: string;
  title?: string;
  executiveName?: string;
  summary?: string;
  executiveSummary?: string;
  confidence?: number;
};

export type CausalChainStateLike = {
  id?: string;
  status?: string;
  summary?: string;
  confidence?: number;
  dominantConditions?: string[];
};

export type BuildDominantCausalChainInput = {
  dominantConditionId: string;
  conditions: CausalChainConditionLike[];
  mechanisms?: CausalChainMechanismLike[];
  organizationalState?: CausalChainStateLike;
  now?: string;
};
