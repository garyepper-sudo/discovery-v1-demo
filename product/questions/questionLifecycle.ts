import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { stableId } from "../workflow/text";
import {
  PRODUCT_QUESTION_EVENT_KIND,
  PRODUCT_QUESTION_SCHEMA_VERSION,
  type ProductQuestion,
  type ProductQuestionEvent,
  type ProductQuestionEventInput,
  type ProductQuestionStatus,
  type ProductQuestionTimelineEntry,
} from "./contracts";

const STATUS_TRANSITIONS: Record<ProductQuestionStatus, ProductQuestionStatus[]> = {
  created: ["searching", "answered", "archived"],
  searching: ["answered", "improving", "archived"],
  answered: ["improving", "decision_in_progress", "monitoring", "archived"],
  improving: ["searching", "answered", "decision_in_progress", "archived"],
  decision_in_progress: ["monitoring", "improving", "archived"],
  monitoring: ["improving", "decision_in_progress", "archived"],
  archived: [],
};

const EVENT_ORDER: Record<ProductQuestionEvent["type"], number> = {
  question_created: 0,
  search_completed: 1,
  answer_recorded: 2,
  improvement_recorded: 3,
  decision_linked: 4,
  outcome_linked: 5,
  learning_applied: 6,
  insight_linked: 7,
  status_changed: 8,
};

export function canTransitionQuestion(
  from: ProductQuestionStatus,
  to: ProductQuestionStatus,
): boolean {
  return from === to || STATUS_TRANSITIONS[from].includes(to);
}

export function productQuestionEvents(runtime: OrganizationRuntime): ProductQuestionEvent[] {
  return runtime.memory.events
    .filter((event): event is ProductQuestionEvent =>
      Boolean(
        event
        && typeof event === "object"
        && (event as { kind?: unknown }).kind === PRODUCT_QUESTION_EVENT_KIND
        && (event as { schemaVersion?: unknown }).schemaVersion === PRODUCT_QUESTION_SCHEMA_VERSION,
      )
    )
    .filter((event) => event.organizationId === runtime.metadata.organizationId)
    .sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt)
      || EVENT_ORDER[left.type] - EVENT_ORDER[right.type]
      || left.id.localeCompare(right.id)
    );
}

function timeline(event: ProductQuestionEvent): ProductQuestionTimelineEntry {
  if (event.type === "question_created") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Question created", referenceId: event.questionId };
  }
  if (event.type === "search_completed") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Information reviewed", referenceId: event.search.id };
  }
  if (event.type === "answer_recorded") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: event.answer.revision === 1 ? "Answer created" : "Answer revised", referenceId: event.answer.answerId };
  }
  if (event.type === "improvement_recorded") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Improvement suggested", referenceId: event.improvement.actionId };
  }
  if (event.type === "decision_linked") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Decision created", referenceId: event.decision.decisionId };
  }
  if (event.type === "outcome_linked") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Outcome recorded", referenceId: event.outcome.outcomeId };
  }
  if (event.type === "learning_applied") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Learning applied", referenceId: event.learningId };
  }
  if (event.type === "insight_linked") {
    return { id: event.id, type: event.type, timestamp: event.occurredAt, label: "Insight generated", referenceId: event.insight.insightId };
  }
  return { id: event.id, type: event.type, timestamp: event.occurredAt, label: event.status === "archived" ? "Question archived" : "Question status changed", referenceId: null };
}

export function buildDurableProductQuestion(input: {
  runtime: OrganizationRuntime;
  questionId: string;
}): ProductQuestion | null {
  const events = productQuestionEvents(input.runtime)
    .filter((event) => event.questionId === input.questionId);
  const created = events.find((event) => event.type === "question_created");
  if (!created || created.type !== "question_created") return null;
  const question: ProductQuestion = {
    id: input.questionId,
    organizationId: input.runtime.metadata.organizationId,
    title: created.title,
    text: created.title,
    status: "created",
    createdAt: created.occurredAt,
    updatedAt: created.occurredAt,
    currentAnswerId: null,
    currentDecisionId: null,
    currentConfidence: null,
    revision: 0,
    searchHistory: [],
    answerHistory: [],
    decisionHistory: [],
    outcomeHistory: [],
    insightHistory: [],
    improvementHistory: [],
    timeline: [],
  };
  for (const event of events) {
    question.updatedAt = event.occurredAt;
    question.timeline.push(timeline(event));
    if (event.type === "search_completed") question.searchHistory.push(event.search);
    if (event.type === "answer_recorded") {
      question.answerHistory.push(event.answer);
      question.currentAnswerId = event.answer.answerId;
      question.currentConfidence = event.answer.confidence;
      question.revision = event.answer.revision;
      question.status = "answered";
    }
    if (event.type === "improvement_recorded") question.improvementHistory.push(event.improvement);
    if (event.type === "decision_linked") {
      question.decisionHistory.push(event.decision);
      question.currentDecisionId = event.decision.decisionId;
      question.status = "decision_in_progress";
    }
    if (event.type === "outcome_linked") {
      question.outcomeHistory.push(event.outcome);
      question.status = "monitoring";
    }
    if (event.type === "insight_linked") question.insightHistory.push(event.insight);
    if (event.type === "status_changed") {
      if (!canTransitionQuestion(question.status, event.status)) {
        throw new Error(`Invalid durable Question transition: ${question.status} -> ${event.status}`);
      }
      question.status = event.status;
    }
  }
  return question;
}

export function appendProductQuestionEvent(
  runtime: OrganizationRuntime,
  input: ProductQuestionEventInput,
): OrganizationRuntime {
  if (input.organizationId !== runtime.metadata.organizationId) {
    throw new Error("Question event organization does not match Runtime.");
  }
  const id = stableId(
    "product-question-event",
    input.organizationId,
    input.questionId,
    input.type,
    input.occurredAt,
    JSON.stringify(input),
  );
  if (productQuestionEvents(runtime).some((event) => event.id === id)) return runtime;
  const event = {
    ...input,
    kind: PRODUCT_QUESTION_EVENT_KIND,
    schemaVersion: PRODUCT_QUESTION_SCHEMA_VERSION,
    id,
  } as ProductQuestionEvent;
  return {
    ...runtime,
    metadata: { ...runtime.metadata, updatedAt: input.occurredAt },
    memory: { ...runtime.memory, events: [...runtime.memory.events, event] },
  };
}

export function createDurableProductQuestion(input: {
  runtime: OrganizationRuntime;
  title: string;
  createdAt: string;
  questionId?: string;
}): { runtime: OrganizationRuntime; question: ProductQuestion } {
  const title = input.title.trim();
  if (!title) throw new Error("Question title is required.");
  const questionId = input.questionId
    ?? stableId(
      "product-question",
      input.runtime.metadata.organizationId,
      title,
      input.createdAt,
    );
  const runtime = appendProductQuestionEvent(input.runtime, {
    type: "question_created",
    questionId,
    organizationId: input.runtime.metadata.organizationId,
    occurredAt: input.createdAt,
    title,
  });
  const question = buildDurableProductQuestion({ runtime, questionId });
  if (!question) throw new Error("Durable Question could not be reconstructed.");
  return { runtime, question };
}
