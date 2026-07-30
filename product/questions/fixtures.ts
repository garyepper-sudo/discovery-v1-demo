import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  ProductQuestion,
  ProductQuestionEventInput,
} from "./contracts";
import {
  appendProductQuestionEvent,
  buildDurableProductQuestion,
  createDurableProductQuestion,
} from "./questionLifecycle";

const ORGANIZATION_ID = "product-question-fixture-organization";
const QUESTION_ID = "product-question-fixture";
const START = "2026-07-30T12:00:00.000Z";
const confidence = {
  level: "moderate" as const,
  score: 0.62,
  meaning: "How strongly the current evidence supports this answer.",
  principalLimiter: "One plausible alternative remains unresolved.",
  authoritativeSource: "causal-chain:fixture",
};

function initial(): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
    name: "Question Fixture Organization",
  });
  return createDurableProductQuestion({
    runtime,
    title: "Why are delivery commitments unreliable?",
    createdAt: START,
    questionId: QUESTION_ID,
  }).runtime;
}

type FixtureEventInput<Event = ProductQuestionEventInput> =
  Event extends ProductQuestionEventInput
    ? Omit<Event, "questionId" | "organizationId">
    : never;

function add(
  runtime: OrganizationRuntime,
  input: FixtureEventInput,
): OrganizationRuntime {
  return appendProductQuestionEvent(runtime, {
    ...input,
    questionId: QUESTION_ID,
    organizationId: ORGANIZATION_ID,
  } as ProductQuestionEventInput);
}

function question(runtime: OrganizationRuntime): ProductQuestion {
  const value = buildDurableProductQuestion({ runtime, questionId: QUESTION_ID });
  if (!value) throw new Error("Fixture Question is missing.");
  return value;
}

function withSearch(runtime = initial()): OrganizationRuntime {
  return add(runtime, {
    type: "search_completed",
    occurredAt: "2026-07-30T12:01:00.000Z",
    search: {
      id: "search-1",
      timestamp: "2026-07-30T12:01:00.000Z",
      scope: "Authorized information for this organization and question.",
      sourceIds: ["source-1"],
      limitations: [],
      changeProduced: false,
    },
  });
}

function withAnswer(runtime = withSearch(), revision = 1): OrganizationRuntime {
  return add(runtime, {
    type: "answer_recorded",
    occurredAt: `2026-07-30T12:0${revision + 1}:00.000Z`,
    answer: {
      answerId: `answer-${revision}`,
      canonicalSource: `causal-chain:fixture-${revision}`,
      revision,
      reasonForChange: revision === 1 ? "The first supported answer was formed." : "New evidence changed the leading explanation.",
      changeReceiptId: `change-${revision}`,
      timestamp: `2026-07-30T12:0${revision + 1}:00.000Z`,
      confidence: { ...confidence, score: revision === 1 ? 0.62 : 0.78 },
    },
  });
}

function withDecision(runtime = withAnswer()): OrganizationRuntime {
  return add(runtime, {
    type: "decision_linked",
    occurredAt: "2026-07-30T12:04:00.000Z",
    decision: {
      decisionId: "decision-1",
      answerId: "answer-1",
      timestamp: "2026-07-30T12:04:00.000Z",
      status: "in-progress",
    },
  });
}

function withOutcome(result: "working" | "not_working"): OrganizationRuntime {
  return add(withDecision(), {
    type: "outcome_linked",
    occurredAt: "2026-07-30T12:05:00.000Z",
    outcome: {
      outcomeId: `outcome-${result}`,
      decisionId: "decision-1",
      timestamp: "2026-07-30T12:05:00.000Z",
      result,
      learningId: `learning-${result}`,
    },
  });
}

export const productQuestionFixtures: Array<{
  id: string;
  question: ProductQuestion;
}> = [
  { id: "new-question", question: question(initial()) },
  { id: "question-with-multiple-revisions", question: question(withAnswer(withAnswer(), 2)) },
  { id: "question-with-no-answer", question: question(withSearch()) },
  { id: "question-with-abstention", question: question(withSearch()) },
  { id: "question-with-active-decision", question: question(withDecision()) },
  { id: "question-after-successful-outcome", question: question(withOutcome("working")) },
  { id: "question-after-failed-outcome", question: question(withOutcome("not_working")) },
  {
    id: "question-with-generated-insight",
    question: question(add(withAnswer(), {
      type: "insight_linked",
      occurredAt: "2026-07-30T12:04:00.000Z",
      insight: { insightId: "insight-1", answerId: "answer-1", timestamp: "2026-07-30T12:04:00.000Z" },
    })),
  },
  {
    id: "question-archived",
    question: question(add(withAnswer(), {
      type: "status_changed",
      occurredAt: "2026-07-30T12:05:00.000Z",
      status: "archived",
    })),
  },
];
