import type { InferenceScenario } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { CandidateTopology } from "../causal-mechanism-formation-refinement-experiment-002/types";

export type WritingStyle =
  | "executive-email" | "slack" | "meeting-notes" | "customer-interview"
  | "board-summary" | "engineering-standup" | "finance-commentary"
  | "hr-observation" | "operations-report" | "fragmented-bullets";

export type NaturalLanguageScenario = {
  id: string;
  family: string;
  industry: string;
  style: WritingStyle;
  terminologySet: string;
  kind: "positive" | "negative";
  scenario: InferenceScenario;
};

export type GeneralizationTruth = {
  scenarioId: string;
  shouldQualify: boolean;
  expectedTopology: CandidateTopology;
  expectedNodes: string[];
  linguisticPhenomena: string[];
};

export type FailureReason =
  | "exact-grammar-dependence"
  | "synonym-drift"
  | "implicit-mediation"
  | "temporal-ambiguity"
  | "hidden-activation"
  | "political-language"
  | "missing-chronology"
  | "pronoun-reference"
  | "fragmented-structure"
  | "none";
