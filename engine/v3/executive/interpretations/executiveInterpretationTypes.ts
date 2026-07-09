import type {
  ExecutiveChangeItem,
  ExecutiveMentalModelEvolution,
  ExecutiveNarrative,
  ExecutiveNarrativeContinuity,
  ExecutiveUnderstandingItem,
} from "../executiveState";

export type ExecutiveInterpretationInput = {
  narratives: ExecutiveNarrative[];
  currentUnderstanding: ExecutiveUnderstandingItem[];
  whatChanged: ExecutiveChangeItem[];
  organizationConfidence?: number;
};

export type ExecutiveInterpretation = {
  currentExplanation: string;
  explanationEvolution: string;
  confidenceNarrative: string;
  competingExplanationNarrative: string;
  remainingUncertainty: string;
  evidenceThatCouldChangeTheExplanation: string;
  executiveSummary: string;

  sourceNarrativeId?: string;
  sourceContinuity?: ExecutiveNarrativeContinuity;
  sourceMentalModelEvolution?: ExecutiveMentalModelEvolution;
};