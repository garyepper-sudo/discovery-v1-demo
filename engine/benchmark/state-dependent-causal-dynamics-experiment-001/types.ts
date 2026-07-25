import type { InferenceScenario } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type DynamicClass =
  | "inactive" | "activated" | "amplified" | "suppressed" | "threshold"
  | "saturated" | "persistent" | "unresolved" | "unknown";

export type DynamicObservation = {
  observationId: string;
  sourceNode: string;
  targetNode: string;
  stateVariable: string;
  stateLevel: number;
  upstreamLevel: number;
  outcomeLevel: number;
  period: number;
  conditionPresent: boolean;
  historicalExposure: number;
  evidenceIds: string[];
  artifactIds: string[];
  siloIds: string[];
};

export type DynamicEdge = {
  id: string;
  sourceNode: string;
  targetNode: string;
  dynamicClasses: DynamicClass[];
  activationConditions: string[];
  inhibitionConditions: string[];
  amplificationConditions: string[];
  saturationConditions: string[];
  adaptationConditions: string[];
  supportedState: string;
  confidence: number;
  evidenceIds: string[];
  artifactIds: string[];
  siloIds: string[];
  observations: DynamicObservation[];
  implications: Array<{
    condition: string;
    predictedOutcomeLevel: number;
    evidenceIds: string[];
  }>;
  falsification: string[];
  classification: "dynamic" | "static" | "unresolved" | "rejected";
};

export type DynamicFamily = {
  opaqueId: string;
  sourceNode: string;
  targetNode: string;
  stateVariable: string;
  variants: Array<{
    stateLevel: number;
    upstreamLevel: number;
    outcomeLevel: number;
    conditionPresent: boolean;
    historicalExposure?: number;
  }>;
  heldOut: {
    stateLevel: number;
    upstreamLevel: number;
    outcomeLevel: number;
    conditionPresent: boolean;
    historicalExposure?: number;
  };
};

export type DynamicScenario = {
  familyOpaqueId: string;
  variantIndex: number;
  scenario: InferenceScenario;
};

export type DynamicTruth = {
  familyOpaqueId: string;
  expectedClasses: DynamicClass[];
  dynamicExpected: boolean;
  relevantVariable: string;
};
