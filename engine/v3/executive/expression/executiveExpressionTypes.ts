export type ExecutiveExpressionAudience =
  | "ceo"
  | "board"
  | "researcher"
  | "department-leader"
  | "operations"
  | "sales"
  | "military"
  | "scientific";

export type ExecutiveExpressionSectionId =
  | "since-last-spoke"
  | "what-discovery-noticed"
  | "what-discovery-understands"
  | "why-it-matters"
  | "what-discovery-does-not-know"
  | "how-the-executive-can-help";

export type ExecutiveCommunicationSection = {
  id: ExecutiveExpressionSectionId;
  question: string;
  eyebrow: string;
  headline: string;
  summary: string;
  observation?: string;
  whyItMatters?: string;
  confidenceStory?: string;
  uncertainty?: string;
  recommendation?: string;
  supportingPoints: string[];
  transition?: string;
};

/**
 * Represents how Discovery's internal explanation of the organization
 * has evolved between investigations.
 *
 * This does not create new organizational understanding.
 * It interprets how Discovery's existing understanding has changed.
 */
export type ExecutiveMentalModelEvolution = {
  /**
   * Discovery's current explanation of the organization.
   */
  currentExplanation: string;

  /**
   * What Discovery now explains differently.
   */
  explanationChanged: string;

  /**
   * Why confidence changed.
   */
  confidenceChanged: string;

  /**
   * Explanations that became less likely.
   */
  weakenedExplanations: string[];

  /**
   * What Discovery still cannot confidently explain.
   */
  remainingUncertainty: string;

  /**
   * Which future evidence would most likely revise the current explanation.
   */
  whatCouldChangeDiscoverysMind: string;
};

export type ExecutiveNarrative = {
  headline: string;
  summary: string;
  executiveObservation: string;
  confidenceStory: string;
  whyItMatters: string;
  learningQuestion: string;
  executiveRecommendation: string;
  evidenceNarrative: string;
  uncertaintyStatement: string;
  potentialBusinessImpact: string;
  recommendedEvidence: string[];
  recommendedConnections: string[];
  confidenceGain?: string;

  /**
   * Sprint 51
   *
   * Describes how Discovery's internal explanation evolved rather than
   * simply reporting observations.
   */
  mentalModelEvolution?: ExecutiveMentalModelEvolution;
};

export type ExecutiveExpressionContext = {
  audience: ExecutiveExpressionAudience;
  generatedAt?: string;
  lastInvestigation?: string;
};