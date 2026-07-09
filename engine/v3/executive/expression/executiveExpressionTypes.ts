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
};

export type ExecutiveExpressionContext = {
  audience: ExecutiveExpressionAudience;
  generatedAt?: string;
  lastInvestigation?: string;
};