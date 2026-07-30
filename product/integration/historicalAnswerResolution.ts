import type { ProductQuestionAnswerHistoryEntry } from "../questions/contracts";
import type {
  HistoricalAnswerSource,
  ProductHistoricalAnswerResolution,
} from "./contracts";

export function resolveHistoricalProductAnswer(input: {
  authorized: boolean;
  relevanceProven: boolean;
  history: ProductQuestionAnswerHistoryEntry;
  source: HistoricalAnswerSource | null;
}): ProductHistoricalAnswerResolution {
  if (!input.authorized) {
    return {
      status: "unavailable",
      answerId: input.history.answerId,
      questionRevision: input.history.revision,
      reason: "authorization-denied",
    };
  }
  if (!input.source) {
    return {
      status: "unavailable",
      answerId: input.history.answerId,
      questionRevision: input.history.revision,
      reason: "source-missing",
    };
  }
  if (!input.relevanceProven) {
    return {
      status: "unavailable",
      answerId: input.history.answerId,
      questionRevision: input.history.revision,
      reason: "relevance-not-proven",
    };
  }
  if (
    input.source.id !== input.history.answerId
    || input.source.revision !== input.history.revision
    || input.source.confidence.authoritativeSource !== input.history.canonicalSource
  ) {
    return {
      status: "unavailable",
      answerId: input.history.answerId,
      questionRevision: input.history.revision,
      reason: "source-incompatible",
    };
  }
  if (!input.source.conclusion.trim()) {
    return {
      status: "unavailable",
      answerId: input.history.answerId,
      questionRevision: input.history.revision,
      reason: "not-customer-safe",
    };
  }
  return {
    status: "resolved",
    answerId: input.history.answerId,
    questionRevision: input.history.revision,
    conclusion: input.source.conclusion,
    confidence: input.source.confidence,
    principalLimiter: input.source.principalLimiter,
    generatedAt: input.source.generatedAt,
    sourceReference: { type: "product-answer", id: input.source.id },
  };
}
