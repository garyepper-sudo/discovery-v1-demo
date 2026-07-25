import type {
  GeneratedCognition,
  InferenceScenario,
} from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type FamilyId =
  | "commercial"
  | "escalation"
  | "optimization"
  | "customer";

export type ConfigurationKind =
  | "reveal"
  | "topology-disconnected"
  | "topology-connected"
  | "bridge-removal"
  | "peripheral-removal"
  | "redundant"
  | "complementary"
  | "noise"
  | "alternative"
  | "temporal";

export type EvidenceConfiguration = {
  id: string;
  familyId: FamilyId;
  kind: ConfigurationKind;
  stage: number;
  scenario: InferenceScenario;
  bridgeSourceId?: string;
  expectedEmergence: boolean;
};

export type AnalysisNode = {
  id: string;
  kind: "evidence" | "silo" | "mechanism";
};

export type AnalysisEdge = {
  id: string;
  source: string;
  target: string;
  kind: "silo-membership" | "lexical-overlap" | "temporal" | "lineage";
};

export type AnalysisGraph = {
  nodes: AnalysisNode[];
  edges: AnalysisEdge[];
};

export type RelationalMetrics = {
  evidenceCount: number;
  siloCount: number;
  uniqueSourceCount: number;
  characterVolume: number;
  largestSiloConcentration: number;
  redundancyRatio: number;
  complementarityRatio: number;
  connectedComponents: number;
  largestComponentRatio: number;
  crossSiloEdgeCount: number;
  crossSiloEdgeDensity: number;
  bridgeEdgeCount: number;
  articulationPointCount: number;
  maximumCausalDepth: number;
  temporalSpanDays: number;
  temporalConsistency: number;
  contradictionCount: number;
  mechanismCount: number;
  qualifyingMechanismCount: number;
  maximumSupportingSilos: number;
  mechanismConfidence: number;
  lineageCompleteness: number;
};

export type EmergenceScore = {
  criteria: {
    nonLocality: boolean;
    relationalNovelty: boolean;
    crossSiloNecessity: boolean;
    mechanisticCompleteness: boolean;
    discriminability: boolean;
    predictiveUtility: boolean;
    interventionUtility: boolean;
    groundedness: boolean;
    counterfactualSensitivity: boolean;
  };
  passedCriteria: number;
  emerged: boolean;
  explanationScore: number;
  confidence: number;
};

export type ConfigurationResult = {
  configuration: EvidenceConfiguration;
  cognition: GeneratedCognition;
  graph: AnalysisGraph;
  metrics: RelationalMetrics;
  score: EmergenceScore;
  trace: unknown;
};
