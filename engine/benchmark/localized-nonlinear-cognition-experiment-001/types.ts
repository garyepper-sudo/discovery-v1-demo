import type { InferenceScenario } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export type ArchitectureId = "stable-linear" | "localized-nonlinear" | "pervasive-nonlinear";
export type TransitionKind =
  | "fragment-to-hypothesis" | "hypothesis-to-qualified"
  | "inactive-to-active" | "active-to-inhibited" | "active-to-amplified"
  | "state-transition" | "confirm" | "weaken" | "retire"
  | "promote-alternative" | "reverse-transition";

export type CognitiveInput = {
  scenarioId: string;
  complementarySupport: number;
  redundantSupport: number;
  mediationSupport: number;
  alternativeMargin: number;
  stateContrastSupport: number;
  conditionSupport: number;
  conditionMode: "activate" | "inhibit" | "amplify" | "none";
  accumulatedStateSupport: number;
  contradictionSupport: number;
  predictionRegistered: boolean;
  outcomeDiscrimination: number;
  outcomeTarget: "leading" | "alternative" | "neither" | "ambiguous";
  cycleOutcomes: Array<"leading" | "alternative" | "neither" | "ambiguous">;
  irrelevantEvidence: number;
  lowQualityConflict: number;
  externalShock: boolean;
  lineageIds: string[];
};

export type CognitiveTransition = {
  kind: TransitionKind;
  reason: string;
  lineageIds: string[];
  reversibleBy: string;
};

export type ArchitectureOutput = {
  architecture: ArchitectureId;
  scenarioId: string;
  mechanismStatus: "fragment" | "hypothesis" | "qualified" | "retired";
  mechanismConfidence: number;
  activationStatus: "static" | "inactive" | "active" | "inhibited" | "amplified" | "unresolved";
  organizationalState: "stable" | "transitioned" | "reversed";
  leadingExplanation: "leading" | "alternative" | "unresolved";
  prediction: number;
  interventionTarget: "mechanism" | "condition" | "alternative" | "none";
  transitions: CognitiveTransition[];
  confidenceHistory: number[];
  lineageIds: string[];
  interpretation: string[];
};

export type NonlinearScenario = {
  id: string;
  family: string;
  kind: "positive" | "control";
  scenario: InferenceScenario;
};

export type ScenarioTruth = {
  scenarioId: string;
  expectedTransitions: TransitionKind[];
  expectedMechanismStatus: ArchitectureOutput["mechanismStatus"];
  expectedActivation: ArchitectureOutput["activationStatus"];
  expectedLeading: ArchitectureOutput["leadingExplanation"];
  expectedPrediction: number;
  expectedIntervention: ArchitectureOutput["interventionTarget"];
  nonlinearExpected: boolean;
};

export type ZoneConfig = {
  formation: boolean;
  stateInteraction: boolean;
  outcomeRevision: boolean;
};
