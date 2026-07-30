import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  buildDurableProductQuestion,
  createDurableProductQuestion,
  productQuestionEvents,
} from "../questions/questionLifecycle";
import { stableId } from "../workflow/text";
import type { ProductQuestionAdoptionReceipt } from "./contracts";

type LegacyQuestionRecord = {
  sourceType: "legacy-investigation" | "legacy-product-record";
  sourceId: string;
  question: string;
  occurredAt: string;
};

function legacyQuestionRecords(runtime: OrganizationRuntime): LegacyQuestionRecord[] {
  return runtime.memory.events
    .map((event, index): LegacyQuestionRecord | null => {
      if (
        !event
        || typeof event !== "object"
        || (event as { kind?: unknown }).kind === "product-question-event"
      ) return null;
      const value = event as { question?: unknown; timestamp?: unknown; id?: unknown };
      if (typeof value.question !== "string" || !value.question.trim()) return null;
      const occurredAt = typeof value.timestamp === "string"
        ? value.timestamp
        : runtime.metadata.createdAt;
      return {
        sourceType: "legacy-investigation",
        sourceId: typeof value.id === "string"
          ? value.id
          : stableId("legacy-investigation", runtime.metadata.organizationId, occurredAt, String(index)),
        question: value.question.trim(),
        occurredAt,
      };
    })
    .filter((item): item is LegacyQuestionRecord => Boolean(item))
    .sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt)
      || left.sourceId.localeCompare(right.sourceId)
    );
}

export function adoptLegacyProductQuestions(input: {
  runtime: OrganizationRuntime;
}): {
  runtime: OrganizationRuntime;
  receipts: ProductQuestionAdoptionReceipt[];
} {
  let runtime = input.runtime;
  const receipts: ProductQuestionAdoptionReceipt[] = [];
  for (const source of legacyQuestionRecords(runtime)) {
    const questionId = stableId(
      "product-question-adopted",
      runtime.metadata.organizationId,
      source.sourceType,
      source.sourceId,
      source.question,
    );
    const existing = buildDurableProductQuestion({ runtime, questionId });
    if (existing) {
      receipts.push({
        organizationId: runtime.metadata.organizationId,
        questionId,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        status: "already-adopted",
        adoptedReferences: [source.sourceId],
        unresolvedReferences: [],
        reason: null,
      });
      continue;
    }
    runtime = createDurableProductQuestion({
      runtime,
      title: source.question,
      createdAt: source.occurredAt,
      questionId,
    }).runtime;
    const unresolvedReferences = runtime.memory.understandingState
      ? ["historical-answer-content"]
      : [];
    receipts.push({
      organizationId: runtime.metadata.organizationId,
      questionId,
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      status: unresolvedReferences.length ? "partially-adopted" : "adopted",
      adoptedReferences: [source.sourceId],
      unresolvedReferences,
      reason: unresolvedReferences.length
        ? "The legacy Question was adopted; historical Answer content requires an exact retained source."
        : null,
    });
  }
  const questionIds = new Set(productQuestionEvents(runtime).map((event) => event.questionId));
  if (questionIds.size < receipts.length) {
    throw new Error("Legacy Question adoption produced duplicate durable identity.");
  }
  return { runtime, receipts };
}
