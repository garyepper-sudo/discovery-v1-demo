import type { InferenceScenario } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { FormationInput, SupportStatus } from "../causal-mechanism-formation-experiment-001/types";

export type CandidateTopology = "linear" | "branching" | "converging" | "mixed" | "unresolved";
export type EdgeBasis =
  | "explicit-causal-language"
  | "temporal-contrast"
  | "intervention-response"
  | "cross-case-contrast"
  | "repeated-transition"
  | "multi-source-convergence"
  | "unsupported";

export type CandidateCausalNode = {
  id: string;
  statement: string;
  role: "upstream-driver" | "mediator" | "downstream-outcome" | "activation-condition";
  artifactIds: string[];
  evidenceIds: string[];
  supportingSiloIds: string[];
  supportStatus: SupportStatus;
};

export type CandidateCausalEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relationship: string;
  basis: EdgeBasis;
  supportForms: EdgeBasis[];
  artifactIds: string[];
  evidenceIds: string[];
  supportingSiloIds: string[];
  supportStatus: SupportStatus;
  confidence: number;
  alternativeDirections: string[];
  confounders: string[];
};

export type TopologyCandidate = {
  id: string;
  strategy:
    | "explicit-linear"
    | "implicit-linear"
    | "explicit-topology"
    | "implicit-topology"
    | "conservative-unified";
  topology: CandidateTopology;
  nodes: CandidateCausalNode[];
  edges: CandidateCausalEdge[];
  activatingConditions: string[];
  competingExplanations: Array<{
    explanation: string;
    supportingArtifactIds: string[];
    supportingEvidenceIds: string[];
    contradictingArtifactIds: string[];
    relativeSupport: number;
    discriminatingEvidenceNeeded: string[];
  }>;
  implications: Array<{
    trigger: string;
    predictedOutcome: string;
    affectedBranchOrPathIds: string[];
    horizon?: string;
    confidence: number;
    artifactIds: string[];
    evidenceIds: string[];
  }>;
  falsificationCriteria: Array<{
    criterion: string;
    affectedBranchOrPathIds: string[];
    artifactIds: string[];
    evidenceIds: string[];
  }>;
  confidence: number;
  classification: "fragment" | "causal-hypothesis" | "qualified-causal-mechanism" | "rejected";
  missingStructure: string[];
  recommendedNextEvidence: Array<{
    missingRelationship: string;
    purpose:
      | "direction" | "mediation" | "branch-support" | "driver-support"
      | "alternative-discrimination" | "activation" | "implication" | "falsification";
    suggestedSourceOrSilo?: string;
    reason: string;
  }>;
};

export type RefinementScenario = {
  id: string;
  category: "explicit-linear" | "implicit-linear" | "explicit-branching"
    | "explicit-converging" | "implicit-branching" | "implicit-converging" | "control";
  scenario: InferenceScenario;
};

export type RegisteredInput = FormationInput;
export type RefinementTruth = {
  scenarioId: string;
  expectedTopology: CandidateTopology;
  shouldQualify: boolean;
  expectedEdges: Array<[string, string]>;
};
