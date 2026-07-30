export const PRODUCT_CONTRACT_VERSION = "1" as const;

export type ProductAnswerConfidence = {
  level: "low" | "moderate" | "high";
  score: number | null;
  meaning: string;
  principalLimiter: string;
  authoritativeSource: string;
};

export type ProductSearchSource = {
  id: string;
  type: "manual_upload" | "paste" | "authorized_records";
  label: string;
  authorized: boolean;
  executable: boolean;
};

export type ProductSourceScope = {
  sourceId: string;
  sourceType: string;
  organizationId: string;
};

export type ProductSearchPlan = {
  questionId: string;
  purpose: string;
  status:
    | "ready"
    | "authorization_required"
    | "searching"
    | "completed"
    | "limited";
  requestedSources: ProductSearchSource[];
  limitations: string[];
};

export type ProductSearchReceipt = {
  questionId: string;
  searchedAt: string;
  sourceScopes: ProductSourceScope[];
  recordsConsidered: number | null;
  evidenceAdmitted: number | null;
  limitations: string[];
};

export type ProductEvidencePoint = {
  id: string;
  statement: string;
  sourceLabel: string | null;
  role: "supports" | "weakens" | "discriminates";
};

export type ProductAlternative = {
  id: string;
  explanation: string;
  status: "weakened" | "unresolved";
  basis: string;
};

export type ProductAcquisitionTarget = {
  label: string;
  sourceType: string;
};

export type ProductImprovementAction = {
  id: string;
  type:
    | "search_records"
    | "upload_document"
    | "request_report"
    | "ask_person"
    | "run_survey"
    | "observe_metric"
    | "add_observation";
  title: string;
  reason: string;
  expectedGain: "small" | "moderate" | "large" | "unknown";
  target: ProductAcquisitionTarget | null;
  executable: boolean;
  limitation: string | null;
};

export type ProductAnswer = {
  kind: "answer";
  id: string;
  questionId: string;
  revision: number;
  conclusion: string;
  whyItMatters: string;
  confidence: ProductAnswerConfidence;
  discriminatingEvidence: ProductEvidencePoint[];
  weakenedAlternatives: ProductAlternative[];
  unresolvedAlternatives: ProductAlternative[];
  principalLimiter: string;
  bestNextImprovement: ProductImprovementAction | null;
  decisionImplication: string | null;
  generatedAt: string;
};

export type ProductAnswerAbstention = {
  kind: "abstention";
  questionId: string;
  reason:
    | "no_evidence"
    | "insufficient_specificity"
    | "insufficient_discrimination"
    | "authorization_limited";
  explanation: string;
  principalLimiter: string;
  bestNextImprovement: ProductImprovementAction | null;
  generatedAt: string;
};

export type ProductImprovementPlan = {
  questionId: string;
  currentConfidence: ProductAnswerConfidence;
  bestNextAction: ProductImprovementAction | null;
  alternatives: ProductImprovementAction[];
};

export type ProductExpectedOutcome = {
  id: string;
  description: string;
  timeHorizon: string | null;
};

export type ProductMeasure = {
  id: string;
  name: string;
  baseline: number | null;
  target: number | null;
  unit: string | null;
};

export type ProductOwner = { id: string | null; label: string };

export type ProductDecisionDraft = {
  id: string;
  organizationId: string;
  sourceQuestionId: string;
  sourceAnswerId: string;
  title: string;
  intervention: string;
  rationale: string;
  assumptions: string[];
  risks: string[];
  expectedOutcomes: ProductExpectedOutcome[];
  measures: ProductMeasure[];
  owner: ProductOwner | null;
  proposedReviewDate: string | null;
  readiness:
    | "not_ready"
    | "draft"
    | "ready_for_review"
    | "ready_to_commit";
  readinessLimiter: string | null;
};

export type ProductDecision = {
  id: string;
  organizationId: string;
  sourceQuestionId: string;
  sourceAnswerId: string;
  intervention: string;
  assumptions: string[];
  expectedOutcomes: ProductExpectedOutcome[];
  successCriteria: ProductMeasure[];
  owner: ProductOwner | null;
  reviewDate: string | null;
  status: string;
  decisionRecordId: string;
  workId: string | null;
};

export type ProductOutcomeComparison = {
  expectedOutcomeId: string;
  expected: string;
  observed: string;
  result: "working" | "not_working" | "inconclusive";
};

export type ProductOutcomeReview = {
  decisionId: string;
  status: "too_early" | "inconclusive" | "working" | "not_working" | "mixed";
  comparisons: ProductOutcomeComparison[];
  interpretation: string;
  modelEffect: {
    answerRevised: boolean;
    confidenceChanged: boolean;
    assumptionsValidated: string[];
    assumptionsWeakened: string[];
    newEvidenceAdmitted: boolean;
  };
  nextReviewDate: string | null;
};

export type ProductModelDimension = {
  value: number | null;
  status: "unknown" | "weak" | "developing" | "healthy" | "strong";
  meaning: string;
  limiter: string | null;
};

export type ProductModelTension = {
  id: string;
  statement: string;
  effect: "reduces_coherence" | "reduces_trustworthiness";
};

export type ProductModelState = {
  organizationId: string;
  revision: number;
  developmentalState: "fragmented" | "forming" | "coherent" | "maturing";
  dimensions: {
    coverage: ProductModelDimension;
    coherence: ProductModelDimension;
    freshness: ProductModelDimension;
    trustworthiness: ProductModelDimension;
  };
  tensions: ProductModelTension[];
  latestMeaningfulGrowth: string[];
  projectedAt: string;
};

export type ProductInsight = {
  id: string;
  organizationId: string;
  title: string;
  conclusion: string;
  whyItMatters: string;
  confidence: ProductAnswerConfidence;
  discriminatingEvidence: ProductEvidencePoint[];
  affectedQuestionIds: string[];
  affectedDecisionIds: string[];
  suggestedQuestion: string | null;
  suggestedAction: string | null;
  emittedAt: string;
};

export type ProductChangeReceipt = {
  questionId: string;
  previousAnswerRevision: number | null;
  currentAnswerRevision: number | null;
  primaryChange:
    | "answer_created"
    | "answer_revised"
    | "support_strengthened"
    | "support_weakened"
    | "uncertainty_changed"
    | "improvement_plan_changed"
    | "decision_created"
    | "outcome_recorded"
    | "model_state_changed"
    | "no_material_change"
    | "underdetermined";
  summary: string;
  changedFields: string[];
  occurredAt: string;
};

export type ProductAction =
  | { type: "search_records"; label: string; enabled: boolean; reason: string | null }
  | { type: "add_information"; label: string; enabled: boolean; reason: string | null }
  | { type: "create_decision"; label: string; enabled: boolean; reason: string | null }
  | { type: "review_outcome"; label: string; enabled: boolean; reason: string | null }
  | { type: "ask_followup"; label: string; enabled: boolean; reason: string | null };

export type ProductQuestionWorkspace = {
  contractVersion: typeof PRODUCT_CONTRACT_VERSION;
  question: ProductQuestion;
  searchPlan: ProductSearchPlan | null;
  latestSearchReceipt: ProductSearchReceipt | null;
  answer: ProductAnswer | ProductAnswerAbstention | null;
  improvementPlan: ProductImprovementPlan | null;
  decisionDraft: ProductDecisionDraft | null;
  activeDecision: ProductDecision | null;
  latestOutcomeReview: ProductOutcomeReview | null;
  modelState: ProductModelState;
  latestChange: ProductChangeReceipt | null;
  proactiveInsights: ProductInsight[];
  permittedActions: ProductAction[];
};
import type { ProductQuestion } from "../questions/contracts";

export type { ProductQuestion } from "../questions/contracts";
