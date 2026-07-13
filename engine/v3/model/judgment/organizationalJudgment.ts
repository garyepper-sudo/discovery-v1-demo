import type { KnowledgeReference } from "../../cognition/cognitiveGraph";
import type { PredictionReflection } from "../predictions/buildPredictionReflection";

export type OrganizationalExplanationType =
  | "causal"
  | "constraint"
  | "coordination"
  | "ownership"
  | "risk"
  | "capability"
  | "execution"
  | "governance"
  | "unknown";

export type OrganizationalJudgmentStatus =
  | "accepted"
  | "competing"
  | "weak"
  | "rejected";

export type OrganizationalJudgmentCriteria = {
  evidentialSupport: number;
  explanatoryPower: number;
  parsimony: number;
  causalPlausibility: number;
  contradictionRisk: number;
  executiveSignificance: number;
  interventionLeverage: number;
};

export type OrganizationalExplanation = {
  id: string;
  title: string;
  summary: string;

  explanationType: OrganizationalExplanationType;

  supportedPathIds: string[];
  explainedEffectIds: string[];
  relatedRootCauseIds: string[];
  relatedLeveragePointIds: string[];
  relatedExecutiveConclusionIds: string[];

  assumptions: string[];
  evidenceReferences: KnowledgeReference[];

  confidence: number;
};

export type OrganizationalJudgment = {
  id: string;
  explanationId: string;

  title: string;
  assessment: string;

  criteria: OrganizationalJudgmentCriteria;

  overallScore: number;
  confidence: number;
  rank: number;

  status: OrganizationalJudgmentStatus;

  strengths: string[];
  weaknesses: string[];

  competingExplanationIds: string[];
  rejectedExplanationIds: string[];

  evidenceReferences: KnowledgeReference[];

  executiveRecommendation: string;
};

export type RejectedExplanation = {
  explanationId: string;
  reason: string;
  confidence: number;
};

export type TheoryValidationEvidence = {
  label: string;
  rationale: string;
  confidence?: number;
};

export type CompetingTheoryAssessment = {
  theory: string;
  reasonItWasConsidered: string;
  reasonItLost: string;
  confidence: number;
};

export type TheoryValidation = {
  dominantTheory: string | null;

  whyDiscoveryBelievesIt: string;

  supportingMechanisms: TheoryValidationEvidence[];
  supportingOrganizationalBeliefs: TheoryValidationEvidence[];

  competingTheoriesConsidered: CompetingTheoryAssessment[];

  contradictoryOrWeakeningEvidence: TheoryValidationEvidence[];

  calibratedConfidenceExplanation: string;

  additionalEvidenceThatWouldIncreaseConfidence: string[];
  evidenceThatWouldFalsifyTheory: string[];

  executiveRecommendation: string;
};

export type OrganizationalUnderstandingState = {
  status: string;
  summary: string;
  confidence: number;
};

export type OrganizationalUnderstandingCondition = {
  id: string | null;
  name: string;
  status: string;
  summary: string;
  confidence: number;
};

export type OrganizationalUnderstandingInvestigation = {
  id: string | null;
  topic: string;
  reason: string;
  suggestedExecutiveQuestion: string;
  expectedConfidenceGain: number;
  affectedConditions: string[];
};

export type OrganizationalUnderstanding = {
  /**
   * Discovery's single leading organizational conclusion.
   *
   * This should be concise enough to serve as the canonical
   * executive understanding headline.
   */
  statement: string;

  /**
   * A short explanation of the leading understanding.
   *
   * This should explain the conclusion without reconstructing
   * the complete reasoning chain.
   */
  summary: string;

  /**
   * Discovery's integrated assessment of the organization's
   * current operating state.
   */
  organizationalState: OrganizationalUnderstandingState | null;

  /**
   * The highest-priority organizational condition currently
   * shaping the organization's state.
   */
  dominantCondition: OrganizationalUnderstandingCondition | null;

  /**
   * The leading higher-order theory explaining the dominant
   * organizational condition.
   */
  dominantTheory: string | null;

  /**
   * Mechanisms supporting the current understanding.
   */
  supportingMechanisms: TheoryValidationEvidence[];

  /**
   * Organizational beliefs supporting the current understanding.
   */
  supportingOrganizationalBeliefs: TheoryValidationEvidence[];

  /**
   * Plausible alternative theories considered by Discovery.
   */
  competingTheories: CompetingTheoryAssessment[];

  /**
   * Evidence that contradicts or weakens the current understanding.
   */
  contradictoryOrWeakeningEvidence: TheoryValidationEvidence[];

  /**
   * Discovery's calibrated confidence in the current understanding.
   *
   * Stored as a normalized value between 0 and 1.
   */
  confidence: number;

  /**
   * Why Discovery assigns the current confidence level.
   */
  confidenceExplanation: string;

  /**
   * Evidence that would materially increase confidence.
   */
  additionalEvidenceNeeded: string[];

  /**
   * Evidence that would weaken or falsify the current understanding.
   */
  falsifyingEvidence: string[];

  /**
   * The highest-value executive response to the current understanding.
   */
  executiveRecommendation: string;

  /**
   * The highest-value next investigation for reducing uncertainty.
   */
  nextInvestigation: OrganizationalUnderstandingInvestigation | null;

  /**
   * Executive narrative generated from the structured understanding.
   *
   * This is an expression of Organizational Understanding,
   * not the canonical understanding itself.
   */
  narrative: string;
};

export type OrganizationalAssessment = {
  /**
   * Concise summary of the Executive Assessment.
   *
   * Retained during migration for existing consumers.
   */
  summary: string;

  strongestJudgmentId: string | null;

  judgments: OrganizationalJudgment[];
  rejectedExplanations: RejectedExplanation[];

  /**
   * The canonical Organizational Understanding produced by
   * Executive Assessment.
   *
   * Executive Projection, Atlas, and downstream executive
   * experiences should migrate toward consuming this object
   * rather than reconstructing understanding from lower-level
   * cognitive products.
   */
  organizationalUnderstanding: OrganizationalUnderstanding;

  /**
   * Structured reflection on Discovery's most important
   * predicted future organizational state.
   *
   * Executive Assessment consumes this object but does not
   * recreate prediction reasoning.
   */
  predictionReflection?: PredictionReflection;

  /**
   * Legacy executive narrative fields.
   *
   * These remain temporarily for compatibility while downstream
   * consumers migrate to organizationalUnderstanding.
   */
  executiveNarrative: string;
  recommendedFocus: string[];

  primaryMechanismIds?: string[];
  primaryMechanismSummaries?: string[];
  mechanismCenteredNarrative?: string;

  theoryValidation?: TheoryValidation;

  confidence: number;
};