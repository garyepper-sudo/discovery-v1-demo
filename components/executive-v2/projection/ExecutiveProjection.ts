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

export type ExecutiveOrganizationalState = {
  /**
   * Discovery's current assessment of the organization's
   * overall operating state.
   */
  status: string;

  /**
   * One executive sentence describing the current state.
   */
  summary: string;

  /**
   * Discovery's confidence in this assessment.
   */
  confidence: number;

  /**
   * Why executives should care.
   */
  executiveImplication: string;

  /**
   * The highest-priority areas requiring attention.
   */
  recommendedFocus: string[];
};

export type ExecutiveOrganizationalCondition = {
  /**
   * Human-readable condition name.
   */
  name: string;

  /**
   * Current operating status.
   *
   * Example:
   * constrained
   * deteriorating
   * improving
   */
  status: string;

  /**
   * Discovery's confidence.
   */
  confidence: number;

  /**
   * One-sentence executive summary.
   */
  summary: string;

  /**
   * Why this matters to leadership.
   */
  whyItMatters: string;

  /**
   * Discovery's recommended action.
   */
  recommendedExecutiveAction: string;
};

export type ExecutiveOrganizationalBelief = {
  /**
   * Discovery's current organizational belief.
   */
  statement: string;

  /**
   * Discovery's confidence in the belief.
   */
  confidence: number;

  /**
   * Emerging, strengthening, stable, weakening, etc.
   */
  trend: string;

  /**
   * Supporting mechanisms.
   */
  supportingMechanisms: string[];

  /**
   * Supporting concepts.
   */
  supportingConcepts: string[];
};

export type ExecutiveInvestigationOpportunity = {
  /**
   * Investigation topic.
   */
  topic: string;

  /**
   * Why Discovery recommends it.
   */
  reason: string;

  /**
   * Executive question to answer.
   */
  suggestedExecutiveQuestion: string;

  /**
   * Estimated confidence improvement.
   */
  expectedConfidenceGain: number;
};

export type ExecutiveOrganizationalLearningProfile = {
  /**
   * Change in organizational understanding.
   */
  understandingGrowth: number;

  /**
   * Growth of organizational memory.
   */
  memoryGrowth: number;

  /**
   * Learning velocity classification.
   */
  learningVelocity: string;

  /**
   * Quantified learning velocity.
   */
  learningVelocityScore: number;

  /**
   * Stability of organizational beliefs.
   */
  beliefStability: number;

  /**
   * Stability of organizational theories.
   */
  theoryStability: number;

  /**
   * Organizational knowledge retention.
   */
  knowledgeRetention: number;

  /**
   * Executive summary of organizational learning.
   */
  summary: string;
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
   * Discovery's integrated assessment of the
   * organization's current operating state.
   */
  organizationalState?: ExecutiveOrganizationalState;

  /**
   * Discovery's highest-priority organizational conditions.
   */
  organizationalConditions?: ExecutiveOrganizationalCondition[];

  /**
   * Discovery's current organizational beliefs.
   */
  organizationalBeliefs?: ExecutiveOrganizationalBelief[];

  /**
   * Discovery's recommended investigations.
   */
  investigationOpportunities?: ExecutiveInvestigationOpportunity[];

  /**
   * Longitudinal organizational learning metrics.
   */
  organizationalLearningProfile?: ExecutiveOrganizationalLearningProfile;

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