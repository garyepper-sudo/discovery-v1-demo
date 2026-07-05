import type { KnowledgeReference } from "../../cognition/cognitiveGraph";

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

export type OrganizationalAssessment = {
  summary: string;

  strongestJudgmentId: string | null;

  judgments: OrganizationalJudgment[];
  rejectedExplanations: RejectedExplanation[];

  executiveNarrative: string;
  recommendedFocus: string[];

  primaryMechanismIds?: string[];
  primaryMechanismSummaries?: string[];
  mechanismCenteredNarrative?: string;

  confidence: number;
};