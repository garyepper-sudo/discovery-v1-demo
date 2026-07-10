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
  /**
   * Canonical executive semantic model.
   * Downstream layers should express or display these fields, not recreate them.
   */
  currentExplanation: string;
  organizationalTheory: string;
  currentMentalModel: string;

  explanationEvolution: string;
  confidenceNarrative: string;
  competingExplanationNarrative: string;
  remainingUncertainty: string;
  evidenceThatCouldChangeTheExplanation: string;
  executiveSummary: string;

  /**
   * Source traceability only.
   * These fields explain where the interpretation came from.
   */
  sourceNarrativeId?: string;
  sourceContinuity?: ExecutiveNarrativeContinuity;
  sourceMentalModelEvolution?: ExecutiveMentalModelEvolution;
};