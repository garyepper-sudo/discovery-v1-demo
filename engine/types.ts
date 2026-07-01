export type InvestigationInput = {
  company: string;
  website: string;
  industry: string;
  question: string;
  context: string;
};

export type ParsedInput = {
  rawText: string;
  facts: string[];
  assumptions: string[];
  questions: string[];
  entities: string[];
  atoms: CognitiveAtom[];
  evidence: Evidence[];
};

export type CognitiveAtom = {
  id: string;
  source: string;

  kind:
    | "fact"
    | "question"
    | "assumption"
    | "goal"
    | "risk"
    | "opportunity"
    | "observation"
    | "decision";

  subject: string;
  predicate: string;
  confidence: number;
};

export type EvidenceType =
  | "fact"
  | "claim"
  | "metric"
  | "event"
  | "observation"
  | "risk"
  | "opportunity"
  | "question"
  | "contradiction";

export interface Evidence {
  id: string;
  text: string;
  type: EvidenceType;
  source: string;
  confidence: number;
  entities: string[];
  tags: string[];
}

export type Observation = {
  title: string;
  description: string;
  sourceText: string;
  confidence: number;
};

export type Signal = {
  title: string;
  category: string;
  importance: number;
  evidence: string;
  whyItMatters: string;
};

export type Surprise = {
  title: string;
  score: number;
  reason: string;
};

export type DiscoveryBrief = {
  executiveSummary: string;
  keySignals: string[];
  risks: string[];
  opportunities: string[];
  leadershipQuestions: string[];
  recommendedNextMoves: string[];
};

export type GraphNode = {
  id: string;
  label: string;
  kind: string;
  weight: number;
};

export type GraphEdge = {
  source: string;
  target: string;
  relationship: string;
  weight: number;
};

export type KnowledgeGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centralNodes: string[];
};

export type WorkspaceCluster = {
  id: string;
  title: string;
  theme: string;
  evidenceIds: string[];
  observations: string[];
  confidence: number;
  tags: string[];
};

export type WorkspaceContradiction = {
  title: string;
  tension: string;
  relatedObservations: string[];
};

export type Workspace = {
  clusters: WorkspaceCluster[];
  contradictions: WorkspaceContradiction[];
  dominantTheme: string;
  openQuestions: string[];
  workspaceHealth: {
    coherence: number;
    instability: number;
    surprisePotential: number;
  };
  evidenceCount: number;
  clusterCount: number;
};

export type ReasoningPattern = {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  relatedClusters: string[];
  confidence: number;
};

export type CausalChain = {
  id: string;
  cause: string;
  mechanism: string;
  effect: string;
  evidenceIds: string[];
  confidence: number;
};

export type CompetingExplanation = {
  id: string;
  title: string;
  explanation: string;
  supportingEvidence: string[];
  weakeningEvidence: string[];
  confidence: number;
};

export type StrategicTension = {
  title: string;
  left: string;
  right: string;
  strength: number;
  explanation: string;
};

export type Hypothesis = {
  title: string;
  explanation: string;
  confidence: number;
  supportingEvidence: string[];
  evidenceNeeded: string[];
};

export type Belief = {
  id: string;
  statement: string;
  confidence: number;
  supportingEvidence: string[];
  opposingEvidence: string[];
  assumptions: string[];
  evidenceNeeded: string[];
  status: "emerging" | "supported" | "uncertain";
  reasoning: string;
};

export type UnderstandingStatus =
  | "emerging"
  | "developing"
  | "strong"
  | "resolved";

export interface Understanding {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  evidenceIds: string[];
  observationIds: string[];
  supportingHypotheses: string[];
  conflictingEvidence: string[];
  relatedUnderstandings: string[];
  openQuestions: string[];
  status: UnderstandingStatus;
  lastUpdated: string;
}

export type EngineResult = {
  input: InvestigationInput;
  parsed: ParsedInput;
  observations: Observation[];
  workspace: Workspace;
  patterns: ReasoningPattern[];
  causalChains: CausalChain[];
  explanations: CompetingExplanation[];
  tensions: StrategicTension[];
  hypotheses: Hypothesis[];
  beliefs: Belief[];
  signals: Signal[];
  surprises: Surprise[];
  understandings: Understanding[];
  brief: DiscoveryBrief;
};