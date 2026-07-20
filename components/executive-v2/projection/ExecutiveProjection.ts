import type {
  ExecutiveSimulation,
} from "../../../engine/v3/simulation/executiveSimulation";

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
   * Examples:
   * - constrained
   * - deteriorating
   * - improving
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


export type ExecutivePrimaryConstraint = {
  /**
   * Stable identity for the projected primary constraint.
   */
  id: string;

  /**
   * Identity of the canonical OrganizationalCondition selected
   * as the highest-leverage executive constraint.
   */
  conditionId: string;

  /**
   * Human-readable constraint name.
   */
  title: string;

  /**
   * Concise executive statement of the dominant constraint.
   */
  executiveSummary: string;

  /**
   * Why this constraint requires executive attention now.
   */
  whyNow: string;

  /**
   * Discovery's confidence in the selected constraint.
   */
  confidence: number;

  /**
   * Normalized 0–1 estimate of the constraint's executive leverage.
   */
  leverageScore: number;

  /**
   * Executive urgency classification.
   */
  urgency:
    | "low"
    | "medium"
    | "high"
    | "critical";

  /**
   * Organizational conditions that directly support or relate
   * to the selected constraint.
   */
  supportingConditionIds: string[];

  /**
   * Conditions expected to be influenced by the selected constraint.
   */
  downstreamConditionIds: string[];

  /**
   * Expected organizational impact of addressing the constraint.
   */
  expectedExecutiveImpact: string;

  /**
   * Preserved cognitive ancestry.
   */
  supportingMechanismIds: string[];
  supportingBeliefIds: string[];
  supportingConceptIds: string[];
  supportingTheoryIds: string[];

  /**
   * When Discovery synthesized the constraint.
   */
  generatedAt: string;
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

export type ExecutiveOrganizationalConcept = {
  /**
   * Stable identity for the projected concept.
   */
  id: string;

  /**
   * Human-readable concept name.
   */
  label: string;

  /**
   * Concise statement of the organizational abstraction.
   */
  statement: string;

  /**
   * Why Discovery formed this concept.
   */
  explanation: string;

  /**
   * Discovery's confidence in the concept.
   */
  confidence: number;

  /**
   * Strength of the underlying concept signal.
   */
  strength: number;

  /**
   * Degree to which the concept has emerged from accumulated cognition.
   */
  emergenceScore: number;

  /**
   * Current concept maturity.
   */
  status: "candidate" | "emerging" | "stable";

  /**
   * Number of supporting understandings.
   */
  evidenceCount: number;

  /**
   * Organizational conditions this concept helps explain.
   */
  supportingConditions: string[];
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

export type ExecutivePredictionEvaluation = {
  /**
   * Stable identity of the original prediction being evaluated.
   */
  predictionId: string;

  /**
   * When Discovery evaluated the prediction.
   */
  evaluatedAt: string;

  /**
   * Discovery's current classification of the observed outcome.
   *
   * Inconclusive means later organizational evidence is not yet
   * sufficient to determine prediction performance.
   */
  outcomeStatus:
    | "confirmed"
    | "partially-confirmed"
    | "not-confirmed"
    | "inconclusive";

  /**
   * Normalized prediction accuracy expressed as a percentage.
   */
  accuracyScore: number;

  /**
   * Recommended confidence calibration adjustment expressed
   * as percentage points.
   */
  calibrationDelta: number;

  /**
   * Immediate confidence adjustment expressed as percentage points.
   */
  confidenceAdjustment: number;

  /**
   * Recommended confidence after evaluation, expressed as a percentage.
   */
  recommendedConfidence: number;

  /**
   * Executive summary of what was observed.
   */
  outcomeSummary: string;

  /**
   * Explanation of why Discovery assigned the outcome classification.
   */
  evaluationExplanation: string;

  /**
   * Learning generated from prediction performance.
   */
  learningSignal: string;

  /**
   * Evidence supporting the evaluation.
   */
  supportingEvidenceIds: string[];
};

export type ExecutiveSimulationSummary = {
  /**
   * When Discovery generated this simulated future.
   */
  simulatedAt: string;

  /**
   * Relative future horizon represented by the simulation.
   */
  timeHorizon:
    | "immediate"
    | "near-term"
    | "medium-term"
    | "long-term";

  /**
   * Discovery's confidence in this simulated future.
   */
  confidence: number;

  /**
   * Executive explanation of how Discovery formed the simulation.
   */
  explanation: string;

  /**
   * Organizational conditions projected into the simulated future.
   */
  projectedConditions: string[];

  /**
   * Organizational beliefs projected into the simulated future.
   */
  projectedBeliefs: string[];

  /**
   * Organizational predictions active in the simulated future.
   */
  projectedPredictions: string[];
};
export type ExecutiveExplanation = {
  /**
   * One-paragraph executive summary combining assessment and confidence.
   */
  executiveSummary: string;

  /**
   * Why Discovery believes the current assessment.
   */
  assessmentNarrative: string;

  /**
   * How certain Discovery currently is.
   */
  confidenceNarrative: string;

  /**
   * Why uncertainty still exists.
   */
  uncertaintyNarrative: string;

  /**
   * Highest-value next investigation.
   */
  investigationNarrative: string;

  /**
   * Canonical uncertainty classification.
   */
  uncertaintyStatus: string;

  /**
   * 0–1 uncertainty score.
   */
  overallUncertainty: number;

  /**
   * Current confidence limiters.
   */
  confidenceLimiters: string[];

  /**
   * Highest-value evidence to collect next.
   */
  recommendedEvidenceAreas: string[];
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
   * Canonical executive-facing explanation generated by
   * the Executive Communication Operating System.
   */
  executiveExplanation?: ExecutiveExplanation;
  /**
   * Discovery's integrated assessment of the
   * organization's current operating state.
   */
  organizationalState?: ExecutiveOrganizationalState;

  /**
   * Discovery's single highest-leverage organizational constraint.
   *
   * Produced by deterministic executive synthesis from canonical
   * Organizational Conditions and projected without recreating
   * ranking logic in the presentation layer.
   */
  primaryExecutiveConstraint?: ExecutivePrimaryConstraint;

  /**
   * Discovery's highest-priority organizational conditions.
   */
  organizationalConditions?: ExecutiveOrganizationalCondition[];

  /**
   * Discovery's current organizational beliefs.
   */
  organizationalBeliefs?: ExecutiveOrganizationalBelief[];

  /**
   * Discovery's reusable organizational abstractions.
   *
   * These are formed by the canonical Organizational Concept
   * Formation capability and projected without reconstructing
   * cognition in the presentation layer.
   */
  organizationalConcepts?: ExecutiveOrganizationalConcept[];

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
   * Longitudinal evaluations of previously generated
   * organizational predictions.
   *
   * Produced by CAP-ADP-001 — Prediction Outcome Evaluation.
   *
   * These evaluations are projected from Runtime without
   * recreating outcome classification or calibration logic
   * in the presentation layer.
   */
  predictionEvaluations?: ExecutivePredictionEvaluation[];

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

  /**
   * Backward-compatible flattened summary of Discovery's latest
   * simulated future organizational state.
   *
   * Produced from CAP-SIM-001 — Organizational Simulation.
   *
   * New executive experiences should prefer executiveSimulation,
   * which exposes the canonical CAP-SIM-003 cognitive object.
   */
  simulation?: ExecutiveSimulationSummary;

  /**
   * Canonical executive-facing simulation synthesis.
   *
   * Produced by CAP-SIM-003 — Executive Simulation Synthesis.
   *
   * This preserves the complete optimization objective, recommendation,
   * recommended scenario, alternative scenarios, comparison set, ranking,
   * confidence, risks, tradeoffs, assumptions, and decision drivers without
   * reconstructing cognition in the presentation layer.
   */
  executiveSimulation?: ExecutiveSimulation;

  evolution: {
    milestones: ExecutiveEvolutionMilestone[];
  };
};
