import type {
  OrganizationalAssessment,
  OrganizationalExplanation,
  OrganizationalJudgment,
} from "./model/judgment/organizationalJudgment";

export type V3EvidenceType =
  | "fact"
  | "claim"
  | "question"
  | "risk"
  | "opportunity"
  | "decision"
  | "metric"
  | "unknown";

export type V3Observation = {
  id: string;
  statement: string;
  evidenceIds: string[];
  confidence: number;
  keywords: string[];
  entities: string[];
  source: "evidence" | "signal" | "theme" | "inference";
};

export type V3Polarity =
  | "positive"
  | "negative"
  | "neutral"
  | "mixed"
  | "unknown";

export type V3SignalStrength = "weak" | "moderate" | "strong";

export type V3ConfidenceBand = "low" | "medium" | "high";

export type V3PriorityScore = {
  confidence: number;
  importance: number;
  connectedness: number;
  urgency: number;
  total: number;
};

export type V3Evidence = {
  id: string;
  text: string;
  type: V3EvidenceType;
  confidence: number;
  keywords: string[];
  entities: string[];
  source: string;

  polarity?: V3Polarity;
  strength?: V3SignalStrength;
  confidenceBand?: V3ConfidenceBand;
  relatedEvidenceIds?: string[];
  inferredFrom?: string[];
};

export type V3EvidenceRelationshipType =
  | "supports"
  | "contradicts"
  | "depends_on"
  | "explains"
  | "extends"
  | "duplicates";

export type V3EvidenceRelationship = {
  id: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  type: V3EvidenceRelationshipType;
  confidence: number;
  explanation: string;
};

export type V3EvidenceGraphNode = {
  id: string;
  evidenceId: string;
  label: string;
  confidence: number;
  type: V3Evidence["type"];
  polarity?: V3Evidence["polarity"];
  strength?: V3Evidence["strength"];
  keywords: string[];
  entities: string[];
  connectionCount: number;
};

export type V3EvidenceGraphEdge = {
  id: string;
  fromEvidenceId: string;
  toEvidenceId: string;
  type: V3EvidenceRelationshipType;
  confidence: number;
  explanation: string;
};

export type V3EvidenceCluster = {
  id: string;
  evidenceIds: string[];
  dominantRelationshipTypes: V3EvidenceRelationshipType[];
  confidence: number;
  label: string;
};

export type V3EvidenceGraph = {
  nodes: V3EvidenceGraphNode[];
  edges: V3EvidenceGraphEdge[];
  clusters: V3EvidenceCluster[];

  metrics: {
    evidenceCount: number;
    relationshipCount: number;
    density: number;
    averageConfidence: number;
    contradictionCount: number;
    supportCount: number;
    explanationCount: number;
  };
};

export type V3EvidenceNetwork = {
  evidence: V3Evidence[];
  relationships: V3EvidenceRelationship[];
  graph: V3EvidenceGraph;

  summary: {
    evidenceCount: number;
    relationshipCount: number;
    clusterCount: number;
    dominantRelationshipTypes: V3EvidenceRelationshipType[];
    mostConnectedEvidenceIds: string[];
    contradictionCount: number;
    density: number;
    averageConfidence: number;
  };
};

export type V3Signal = {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  confidence: number;
  polarity: "positive" | "negative" | "neutral";
  priority?: V3PriorityScore;
};

export type V3Theme = {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  confidence: number;
  signalIds?: string[];
  keywords?: string[];
  entities?: string[];
  polarity?: V3Polarity;
  strength?: V3SignalStrength;
  stability?: number;
  priority?: V3PriorityScore;
};

export type V3ThemeRelationship = {
  id: string;
  sourceThemeId: string;
  targetThemeId: string;
  relationship:
    | "supports"
    | "reinforces"
    | "contradicts"
    | "depends_on"
    | "causes"
    | "correlates";
  confidence: number;
  explanation: string;
  sharedEvidenceIds: string[];
};

export type V3Contradiction = {
  id: string;
  title: string;
  explanation: string;
  evidenceIds: string[];
  confidence: number;
  signalIds?: string[];
  severity?: V3SignalStrength;
  unresolvedQuestion?: string;
  opposingEvidenceIds?: string[];
  priority?: V3PriorityScore;
};

export type V3MechanismType =
  | "causal"
  | "reinforcing"
  | "constraint"
  | "tension"
  | "dependency"
  | "unknown";

export type V3Mechanism = {
  id: string;
  title: string;
  type: V3MechanismType;

  themeIds: string[];
  beliefIds: string[];

  cause: string;
  mechanism: string;
  effect: string;

  evidenceIds: string[];
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  relationshipIds: string[];
  contradictionIds: string[];

  explanation: string;
  assumptions: string[];
  risks: string[];
  openQuestions: string[];

  confidence: number;
  strength: number;
  stability: number;
  priority?: V3PriorityScore;
};

export type V3HypothesisStatus =
  | "leading"
  | "plausible"
  | "weak"
  | "challenged";

export type V3Hypothesis = {
  id: string;
  title: string;
  explanation: string;
  status: V3HypothesisStatus;
  confidence: number;

  supportingEvidenceIds: string[];
  weakeningEvidenceIds: string[];
  mechanismIds: string[];
  themeIds: string[];
  beliefIds: string[];
  contradictionIds: string[];

  strengths: string[];
  weaknesses: string[];
  distinguishingQuestions: string[];
};

export type V3CausalChain = {
  id: string;
  cause: string;
  mechanism: string;
  effect: string;
  evidenceIds: string[];
  themeIds: string[];
  confidence: number;
  signalIds?: string[];
  strength?: V3SignalStrength;
  assumptions?: string[];
  risks?: string[];
  priority?: V3PriorityScore;
};

export type V3Explanation = {
  id: string;
  title: string;
  explanation: string;
  supportingEvidenceIds: string[];
  weakeningEvidenceIds: string[];
  confidence: number;

  signalIds?: string[];
  themeIds?: string[];
  causalChainIds?: string[];
  mechanismIds?: string[];
  contradictionIds?: string[];
};

export type V3ExecutiveUnderstanding = {
  headline: string;
  explanation: string;
  confidence: number;
  evidenceSummary: string[];
  contradictions: string[];
  openQuestions: string[];
  nextMoves: string[];
};

export type V3Understanding = {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  supportScore: number;
  contradictionScore: number;
  noveltyScore: number;
  evidenceIds: string[];
  themeIds: string[];
  explanationIds: string[];
  causalChainIds: string[];
  mechanismIds?: string[];
  supportingReasons: string[];
  contradictions: string[];
  unknowns: string[];
  implications: string[];
  recommendations: string[];

  signalIds?: string[];
  beliefIds?: string[];
  organismState?: V3OrganismState;
  priority?: V3PriorityScore;
};

export type V3Belief = {
  id: string;
  headline: string;
  confidence: number;
  explanation: string;
  understandingId: string;

  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
  mechanismIds: string[];
  themeIds: string[];
  contradictionIds: string[];

  supportingReasons: string[];
  concerns: string[];
  nextQuestions: string[];

  stability?: number;
  utility?: number;
  priority?: V3PriorityScore;

  signalIds?: string[];
  causalChainIds?: string[];
};

export type V3UnderstandingDelta = {
  newBeliefs: string[];
  strengthenedBeliefs: string[];
  weakenedBeliefs: string[];
  resolvedContradictions: string[];
  newContradictions: string[];
  confidenceChanges: {
    sourceId: string;
    sourceType: "theme" | "mechanism" | "belief" | "understanding";
    previousConfidence?: number;
    currentConfidence: number;
    direction: "up" | "down" | "unchanged";
    explanation: string;
  }[];
  healthChanges: {
    metric: "density" | "coherence" | "tension" | "maturity" | "uncertainty";
    previousValue?: number;
    currentValue: number;
    direction: "up" | "down" | "unchanged";
    explanation: string;
  }[];
};

export type V3EmergenceEvent = {
  id: string;
  title: string;
  description: string;
  understandingId?: string;
  strength: number;
  evidenceIds: string[];

  signalIds?: string[];
  themeIds?: string[];
  mechanismIds?: string[];
  beliefIds?: string[];
  eventType?:
    | "new_pattern"
    | "resolved_tension"
    | "new_tension"
    | "confidence_shift";
};

export type V3ReasoningNodeType =
  | "evidence"
  | "signal"
  | "theme"
  | "mechanism"
  | "contradiction"
  | "causal"
  | "explanation"
  | "understanding"
  | "belief"
  | "executive";

export type V3ReasoningEdgeType =
  | "supports"
  | "explains"
  | "complicates"
  | "contradicts"
  | "causes"
  | "summarizes"
  | "forms";

export type V3ReasoningNode = {
  id: string;
  type: V3ReasoningNodeType;
  label: string;
  description?: string;
  confidence?: number;
  sourceId: string;
};

export type V3ReasoningEdge = {
  id: string;
  from: string;
  to: string;
  type: V3ReasoningEdgeType;
  weight: number;
  primary?: boolean;
  explanation?: string;
};

export type V3ReasoningGraph = {
  nodes: V3ReasoningNode[];
  edges: V3ReasoningEdge[];
  executiveNodeId?: string;
};

export type V3OrganismParticleKind =
  | "evidence"
  | "signal"
  | "theme"
  | "mechanism"
  | "contradiction"
  | "causal"
  | "belief"
  | "understanding";

export type V3OrganismParticle = {
  id: string;
  kind: V3OrganismParticleKind;
  label: string;
  sourceId: string;
  confidence: number;
  strength: number;
  connections: string[];
};

export type V3OrganismEvidenceCluster = {
  id: string;
  label: string;
  evidenceIds: string[];
  confidence: number;
  tension: number;
};

export type V3OrganismEmergingPattern = {
  id: string;
  title: string;
  description: string;
  evidenceIds: string[];
  confidence: number;
  strength: number;
};

export type V3OrganismState = {
  particles: V3OrganismParticle[];
  centerId?: string;

  evidenceClusters: V3OrganismEvidenceCluster[];

  mechanisms: V3Mechanism[];
  hypotheses: V3Hypothesis[];
  beliefs: V3Belief[];
  contradictions: V3Contradiction[];

  mechanismIds: string[];
  hypothesisIds: string[];
  beliefIds: string[];
  contradictionIds: string[];

  uncertainty: number;
  emergingPatterns: V3OrganismEmergingPattern[];

  density: number;
  coherence: number;
  tension: number;
  maturity: number;
};

export type DiscoveryV3Result = {
  evidence: V3Evidence[];
  observations: V3Observation[];
  evidenceRelationships: V3EvidenceRelationship[];
  evidenceNetwork?: V3EvidenceNetwork;

  signals: V3Signal[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];

  mechanisms: V3Mechanism[];
  hypotheses: V3Hypothesis[];

  causalChains: V3CausalChain[];

  explanations: V3Explanation[];
  understanding: V3Understanding[];
  beliefs: V3Belief[];
  emergenceEvents: V3EmergenceEvent[];
  executiveUnderstanding: V3ExecutiveUnderstanding;

  delta?: V3UnderstandingDelta;

  propagatedConfidence?: import("./confidencePropagation").V3PropagatedConfidence;
  reasoningGraph?: V3ReasoningGraph;
  organismState?: V3OrganismState;

  organizationalExplanations?: OrganizationalExplanation[];
  organizationalJudgments?: OrganizationalJudgment[];
  executiveAssessment?: OrganizationalAssessment;
};