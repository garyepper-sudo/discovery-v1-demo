export type ExecutiveEvolutionMilestone = {
  id: string;
  label: string;
  description: string;
  isCurrent: boolean;
};

export type ExecutiveAttentionSeverity =
  | "low"
  | "medium"
  | "high";

export type ExecutiveTheoryValidationEvidence = {
  label: string;
  rationale: string;
  confidence?: number;
};

export type ExecutiveCompetingTheory = {
  theory: string;
  reasonItWasConsidered: string;
  reasonItLost: string;
  confidence: number;
};

export type ExecutiveTheoryValidation = {
  dominantTheory: string | null;
  whyDiscoveryBelievesIt: string;

  supportingMechanisms: ExecutiveTheoryValidationEvidence[];
  supportingOrganizationalBeliefs: ExecutiveTheoryValidationEvidence[];

  competingTheoriesConsidered: ExecutiveCompetingTheory[];
  contradictoryOrWeakeningEvidence: ExecutiveTheoryValidationEvidence[];

  calibratedConfidenceExplanation: string;

  additionalEvidenceThatWouldIncreaseConfidence: string[];
  evidenceThatWouldFalsifyTheory: string[];

  executiveRecommendation: string;
};

export type ExecutiveProjection = {
  /**
   * Executive workspace metadata.
   *
   * These values describe the current executive session,
   * not Discovery's cognitive state.
   */
  workspace: {
    title: string;
    status: string;
    updatedLabel: string | null;
  };

  /**
   * Discovery's current leading organizational understanding.
   */
  currentUnderstanding: {
    belief: string;
    mindStatus: string;
    confidence: number;
    organizationalCoherence: number;
  };

  /**
   * Executive explanation of the current understanding.
   */
  explanation: {
    why: string;
    whatCouldChangeThis: string;
    nextMove: string;
  };

  /**
   * The single highest-priority item that deserves
   * executive attention right now.
   */
  executiveAttention: {
    title: string;
    summary: string;
    severity: ExecutiveAttentionSeverity;
  };

  /**
   * Structured validation of Discovery's current leading theory.
   *
   * This is optional so the existing executive experience can continue
   * rendering when runtime theory validation is not yet available.
   */
  theoryValidation?: ExecutiveTheoryValidation;

  /**
   * How Discovery arrived at its current understanding.
   */
  evolution: {
    milestones: ExecutiveEvolutionMilestone[];
  };
};