export const PRODUCT_QUESTION_EVENT_KIND = "product-question-event" as const;
export const PRODUCT_QUESTION_SCHEMA_VERSION = "1" as const;

export type ProductQuestionStatus =
  | "created"
  | "searching"
  | "answered"
  | "improving"
  | "decision_in_progress"
  | "monitoring"
  | "archived";

export type ProductQuestionConfidenceReference = {
  level: "low" | "moderate" | "high";
  score: number | null;
  meaning: string;
  principalLimiter: string;
  authoritativeSource: string;
};

export type ProductQuestionSearchHistoryEntry = {
  id: string;
  timestamp: string;
  scope: string;
  sourceIds: string[];
  limitations: string[];
  changeProduced: boolean;
};

export type ProductQuestionAnswerHistoryEntry = {
  answerId: string;
  canonicalSource: string;
  revision: number;
  reasonForChange: string;
  changeReceiptId: string;
  timestamp: string;
  confidence: ProductQuestionConfidenceReference;
};

export type ProductQuestionDecisionHistoryEntry = {
  decisionId: string;
  answerId: string;
  timestamp: string;
  status: string;
};

export type ProductQuestionOutcomeHistoryEntry = {
  outcomeId: string;
  decisionId: string;
  timestamp: string;
  result: string;
  learningId: string | null;
};

export type ProductQuestionInsightHistoryEntry = {
  insightId: string;
  answerId: string | null;
  timestamp: string;
};

export type ProductQuestionImprovementHistoryEntry = {
  actionId: string;
  suggestedAt: string;
  reason: string;
  completedAt: string | null;
  answerChanged: boolean | null;
  confidenceChanged: boolean | null;
};

export type ProductQuestionTimelineEntry = {
  id: string;
  type:
    | "question_created"
    | "search_completed"
    | "answer_recorded"
    | "improvement_recorded"
    | "decision_linked"
    | "outcome_linked"
    | "learning_applied"
    | "insight_linked"
    | "status_changed";
  timestamp: string;
  label: string;
  referenceId: string | null;
};

export type ProductQuestion = {
  id: string;
  organizationId: string;
  title: string;
  /** Compatibility alias for the Phase 1 workspace contract. */
  text: string;
  status: ProductQuestionStatus;
  createdAt: string;
  updatedAt: string;
  currentAnswerId: string | null;
  currentDecisionId: string | null;
  currentConfidence: ProductQuestionConfidenceReference | null;
  revision: number;
  searchHistory: ProductQuestionSearchHistoryEntry[];
  answerHistory: ProductQuestionAnswerHistoryEntry[];
  decisionHistory: ProductQuestionDecisionHistoryEntry[];
  outcomeHistory: ProductQuestionOutcomeHistoryEntry[];
  insightHistory: ProductQuestionInsightHistoryEntry[];
  improvementHistory: ProductQuestionImprovementHistoryEntry[];
  timeline: ProductQuestionTimelineEntry[];
};

type QuestionEventPayload =
  | { type: "question_created"; title: string }
  | { type: "search_completed"; search: ProductQuestionSearchHistoryEntry }
  | { type: "answer_recorded"; answer: ProductQuestionAnswerHistoryEntry }
  | { type: "improvement_recorded"; improvement: ProductQuestionImprovementHistoryEntry }
  | { type: "decision_linked"; decision: ProductQuestionDecisionHistoryEntry }
  | { type: "outcome_linked"; outcome: ProductQuestionOutcomeHistoryEntry }
  | { type: "learning_applied"; learningId: string; outcomeId: string }
  | { type: "insight_linked"; insight: ProductQuestionInsightHistoryEntry }
  | { type: "status_changed"; status: ProductQuestionStatus };

export type ProductQuestionEvent = QuestionEventPayload & {
  kind: typeof PRODUCT_QUESTION_EVENT_KIND;
  schemaVersion: typeof PRODUCT_QUESTION_SCHEMA_VERSION;
  id: string;
  questionId: string;
  organizationId: string;
  occurredAt: string;
};

export type ProductQuestionEventInput =
  ProductQuestionEvent extends infer Event
    ? Event extends ProductQuestionEvent
      ? Omit<Event, "kind" | "schemaVersion" | "id">
      : never
    : never;
