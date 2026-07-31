import type {
  ProductAnswerConfidence,
  ProductEvidencePoint,
} from "../workflow/contracts";
import type { ProductUnknownCandidate } from "../unknowns/contracts";

export const PRODUCT_ANSWER_EVENT_KIND = "product-question-answer-event" as const;
export const PRODUCT_ANSWER_EVENT_SCHEMA_VERSION = "2" as const;
export const PRODUCT_ANSWER_CONTRACT_VERSION = 1 as const;

export type ProductAnswerType =
  | "supported"
  | "competing-explanations"
  | "unsupported";

export type ProductAnswerConfidenceSnapshot = {
  ownerType: "product-answer";
  ownerAnswerVersionId: string;
  level: ProductAnswerConfidence["level"];
  score: number | null;
  meaning: string;
  principalLimiter: string;
  authoritativeSource: string;
  basis: {
    evidentialSupport: string;
    discrimination: string;
    contradictionStatus: string;
    freshnessStatus: string;
  };
  evidenceIds: string[];
  calculatedAt: string;
  calculationContractVersion: 1;
};

export type ProductAnswerVersion = {
  contractVersion: typeof PRODUCT_ANSWER_CONTRACT_VERSION;
  answerVersionId: string;
  answerLineageId: string;
  organizationId: string;
  questionId: string;
  answerType: ProductAnswerType;
  statement: string;
  explanationSummary: string;
  evidenceBasis: {
    supportingEvidenceIds: string[];
    opposingEvidenceIds: string[];
    informingEvidenceIds: string[];
  };
  evidenceCitations: ProductEvidencePoint[];
  competingExplanationRefs: Array<{
    explanationId: string;
    explanation: string;
    role: "plausible" | "weakened" | "not-supported";
  }>;
  confidence: ProductAnswerConfidenceSnapshot | null;
  understandingRevisionRef: string;
  answerOperationId: string;
  createdAt: string;
  supersedesAnswerVersionId: string | null;
  authorizationScopeRef: string;
  limitation: string | null;
};

export type ProductAnswerProjection = {
  answerVersionId: string;
  questionId: string;
  answerType: ProductAnswerType;
  statement: string;
  why: string;
  evidenceCitations: ProductEvidencePoint[];
  competingExplanations: ProductAnswerVersion["competingExplanationRefs"];
  confidence: ProductAnswerConfidenceSnapshot | null;
  current: boolean;
  superseded: boolean;
  freshness: {
    status: string;
    limitation: string | null;
  };
  limitation: string | null;
};

export type ProductAnswerAbstentionReason =
  | "insufficient-evidence"
  | "insufficient-discrimination"
  | "unresolved-contradiction"
  | "relevance-threshold-not-met"
  | "authorization-limited"
  | "freshness-insufficient"
  | "unsupported-conclusion";

export type ProductAnswerOperationResult =
  | {
      kind: "answer";
      answer: ProductAnswerProjection;
    }
  | {
      kind: "targeted-abstention";
      reason: ProductAnswerAbstentionReason;
      limitation: string;
      confidence: null;
      answerVersionId: null;
      candidateUnknowns: ProductUnknownCandidate[];
    };

export type ProductAnswerOperationReceipt = {
  operationId: string;
  organizationId: string;
  questionId: string;
  result:
    | "answer-created"
    | "answer-unchanged"
    | "answer-superseded"
    | "targeted-abstention"
    | "blocked";
  answerVersionId: string | null;
  priorAnswerVersionId: string | null;
  evidenceConsidered: number;
  evidenceAdmitted: number;
  changeProduced: boolean;
  limitationCode: ProductAnswerAbstentionReason | "blocked" | null;
  limitation: string | null;
  occurredAt: string;
};

type ProductAnswerEventBase = {
  kind: typeof PRODUCT_ANSWER_EVENT_KIND;
  schemaVersion: typeof PRODUCT_ANSWER_EVENT_SCHEMA_VERSION;
  eventId: string;
  operationId: string;
  organizationId: string;
  questionId: string;
  occurredAt: string;
};

export type ProductAnswerVersionRecordedEvent = ProductAnswerEventBase & {
  eventType: "answer-version-recorded";
  answerVersion: ProductAnswerVersion;
};

export type ProductAnswerOperationRecordedEvent = ProductAnswerEventBase & {
  eventType: "answer-operation-recorded";
  receipt: ProductAnswerOperationReceipt;
};

export type ProductAnswerEvent =
  | ProductAnswerVersionRecordedEvent
  | ProductAnswerOperationRecordedEvent;

export type ProductAnswerHistoryRecord =
  | {
      contractVersion: 1;
      source: "legacy-question-event";
      questionId: string;
      answerVersionId: string;
      revision: number;
      occurredAt: string;
    }
  | {
      contractVersion: 2;
      source: "answer-version-event";
      questionId: string;
      answerVersionId: string;
      revision: null;
      occurredAt: string;
      answerVersion: ProductAnswerVersion;
    };
