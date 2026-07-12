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

export type ExecutiveAssessment = {
  /**
   * Concise statement of Discovery's executive assessment.
   */
  summary: string;

  /**
   * Full executive-facing narrative explaining the assessment.
   */
  executiveNarrative: string;

  /**
   * Discovery's confidence in the assessment.
   */
  confidence: number;

  /**
   * Highest-priority areas leadership should focus on.
   */
  recommendedFocus: string[];

  /**
   * Structured validation of the theory supporting the assessment.
   */
  theoryValidation?: ExecutiveTheoryValidation;
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

export type ExecutiveInvestigationStrategy = {
  /**
   * Discovery's current approach to directing future learning.
   */
  mode:
    | "explore"
    | "challenge"
    | "preserve"
    | "exploit";

  /**
   * Why Discovery selected this strategy.
   */
  rationale: string[];

  /**
   * Whether Discovery should actively seek evidence that could
   * weaken or falsify its current leading explanation.
   */
  prioritizeContradictoryEvidence: boolean;

  /**
   * Whether Discovery should broaden the range of evidence
   * and investigation topics it considers.
   */
  prioritizeEvidenceDiversity: boolean;

  /**
   * Multiplier applied when reducing the priority of
   * recently repeated investigation topics.
   */
  repeatedTopicPenaltyMultiplier: number;

  /**
   * Additional priority given to knowledge-preservation evidence.
   */
  knowledgePreservationBoost: number;

  /**
   * Additional priority given to organizational learning-loop evidence.
   */
  learningLoopBoost: number;

  /**
   * Additional priority given to longitudinal condition evidence.
   */
  persistenceBoost: number;
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
   * Discovery's canonical executive assessment.
   *
   * This preserves Executive Assessment as a first-class object
   * through the Executive Projection instead of decomposing it
   * exclusively into downstream presentation fields.
   */
  executiveAssessment?: ExecutiveAssessment;

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
   * Discovery's current approach to directing future learning.
   */
  investigationStrategy?: ExecutiveInvestigationStrategy;

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
   * This remains available independently because Theory Validation
   * is also a registered cognitive capability.
   */
  theoryValidation?: ExecutiveTheoryValidation;

  /**
   * How Discovery arrived at its current understanding.
   */
  evolution: {
    milestones: ExecutiveEvolutionMilestone[];
  };
};