import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { ProductQuestionWorkspace } from "../workflow/contracts";
import { stableId } from "../workflow/text";
import {
  appendProductQuestionEvent,
  buildDurableProductQuestion,
  createDurableProductQuestion,
} from "./questionLifecycle";

export function recordProductWorkspaceLifecycle(input: {
  runtime: OrganizationRuntime;
  workspace: ProductQuestionWorkspace;
  recordedAt: string;
}): OrganizationRuntime {
  if (input.workspace.question.organizationId !== input.runtime.metadata.organizationId) {
    throw new Error("Workspace Question organization does not match Runtime.");
  }
  let runtime = input.runtime;
  let durable = buildDurableProductQuestion({
    runtime,
    questionId: input.workspace.question.id,
  });
  if (!durable) {
    runtime = createDurableProductQuestion({
      runtime,
      title: input.workspace.question.title,
      createdAt: input.workspace.question.createdAt,
      questionId: input.workspace.question.id,
    }).runtime;
    durable = buildDurableProductQuestion({
      runtime,
      questionId: input.workspace.question.id,
    });
  }
  const questionId = input.workspace.question.id;
  if (input.workspace.latestSearchReceipt) {
    const receipt = input.workspace.latestSearchReceipt;
    const searchId = stableId("product-search", questionId, receipt.searchedAt);
    runtime = appendProductQuestionEvent(runtime, {
      type: "search_completed",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: receipt.searchedAt,
      search: {
        id: searchId,
        timestamp: receipt.searchedAt,
        scope: "Authorized information for this organization and question.",
        sourceIds: receipt.sourceScopes.map((source) => source.sourceId).sort(),
        limitations: [...receipt.limitations],
        changeProduced: input.workspace.latestChange?.primaryChange !== "no_material_change",
      },
    });
  }
  const answer = input.workspace.answer?.kind === "answer" ? input.workspace.answer : null;
  if (answer && !durable?.answerHistory.some((item) => item.answerId === answer.id)) {
    const questionRevision = (durable?.revision ?? 0) + 1;
    const receiptId = stableId(
      "product-change-receipt",
      questionId,
      input.workspace.latestChange?.occurredAt ?? answer.generatedAt,
    );
    runtime = appendProductQuestionEvent(runtime, {
      type: "answer_recorded",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: answer.generatedAt,
      answer: {
        answerId: answer.id,
        canonicalSource: answer.confidence.authoritativeSource,
        revision: questionRevision,
        reasonForChange: input.workspace.latestChange?.summary ?? "Authorized evidence changed the current answer.",
        changeReceiptId: receiptId,
        timestamp: answer.generatedAt,
        confidence: answer.confidence,
      },
    });
  }
  const improvement = input.workspace.improvementPlan?.bestNextAction
    ?? input.workspace.answer?.bestNextImprovement;
  if (improvement) {
    runtime = appendProductQuestionEvent(runtime, {
      type: "improvement_recorded",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: input.recordedAt,
      improvement: {
        actionId: improvement.id,
        suggestedAt: input.recordedAt,
        reason: improvement.reason,
        completedAt: null,
        answerChanged: null,
        confidenceChanged: null,
      },
    });
  }
  const decision = input.workspace.activeDecision;
  if (decision) {
    runtime = appendProductQuestionEvent(runtime, {
      type: "decision_linked",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: input.recordedAt,
      decision: {
        decisionId: decision.id,
        answerId: decision.sourceAnswerId,
        timestamp: input.recordedAt,
        status: decision.status,
      },
    });
  }
  const outcome = input.workspace.latestOutcomeReview;
  if (outcome && decision) {
    const review = runtime.memory.executiveReviews.find(
      (item) => item.decisionRecordId === decision.decisionRecordId,
    );
    const learning = review
      ? runtime.memory.executiveLearning.find((item) => item.executiveReviewId === review.id)
      : null;
    const outcomeId = review?.id ?? stableId("product-outcome", decision.id, outcome.status);
    runtime = appendProductQuestionEvent(runtime, {
      type: "outcome_linked",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: input.recordedAt,
      outcome: {
        outcomeId,
        decisionId: decision.id,
        timestamp: input.recordedAt,
        result: outcome.status,
        learningId: learning?.id ?? null,
      },
    });
    if (learning) {
      runtime = appendProductQuestionEvent(runtime, {
        type: "learning_applied",
        questionId,
        organizationId: input.runtime.metadata.organizationId,
        occurredAt: input.recordedAt,
        learningId: learning.id,
        outcomeId,
      });
    }
  }
  for (const insight of input.workspace.proactiveInsights) {
    runtime = appendProductQuestionEvent(runtime, {
      type: "insight_linked",
      questionId,
      organizationId: input.runtime.metadata.organizationId,
      occurredAt: insight.emittedAt,
      insight: {
        insightId: insight.id,
        answerId: answer?.id ?? null,
        timestamp: insight.emittedAt,
      },
    });
  }
  return runtime;
}

export function archiveProductQuestion(input: {
  runtime: OrganizationRuntime;
  questionId: string;
  archivedAt: string;
}): OrganizationRuntime {
  return appendProductQuestionEvent(input.runtime, {
    type: "status_changed",
    questionId: input.questionId,
    organizationId: input.runtime.metadata.organizationId,
    occurredAt: input.archivedAt,
    status: "archived",
  });
}

export async function persistProductWorkspaceLifecycle(input: {
  storedRuntime: StoredOrganizationRuntime;
  workspace: ProductQuestionWorkspace;
  recordedAt: string;
  runtimeRepository: Pick<OrganizationRuntimeRepository, "replace">;
  operation: RuntimeStorageOperationMetadata;
}): Promise<StoredOrganizationRuntime> {
  const runtime = recordProductWorkspaceLifecycle({
    runtime: input.storedRuntime.runtime,
    workspace: input.workspace,
    recordedAt: input.recordedAt,
  });
  const bytes = new TextEncoder().encode(JSON.stringify(runtime, null, 2));
  return input.runtimeRepository.replace(
    runtime.metadata.organizationId,
    bytes,
    input.storedRuntime.revision,
    input.operation,
  );
}
