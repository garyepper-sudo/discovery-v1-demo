import assert from "node:assert/strict";

import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import {
  appendProductQuestionEvent,
  archiveProductQuestion,
  buildDurableProductQuestion,
  canTransitionQuestion,
  createDurableProductQuestion,
  persistProductWorkspaceLifecycle,
  productQuestionEvents,
  productQuestionFixtures,
} from "../../product/questions";
import { buildProductQuestionWorkspace } from "../../product/workflow";

const mode = process.argv[2] ?? "all";
const organizationId = "question-lifecycle-organization";
const questionId = "product-question-lifecycle";
const createdAt = "2026-07-30T12:00:00.000Z";
const confidence = {
  level: "moderate" as const,
  score: 0.64,
  meaning: "How strongly the current evidence supports this answer.",
  principalLimiter: "A competing explanation remains unresolved.",
  authoritativeSource: "causal-chain:question-lifecycle",
};

function base() {
  return createDurableProductQuestion({
    runtime: createEmptyOrganizationRuntime({ organizationId }),
    title: "Why are delivery commitments unreliable?",
    questionId,
    createdAt,
  }).runtime;
}

function completeHistory() {
  let runtime = base();
  runtime = appendProductQuestionEvent(runtime, {
    type: "search_completed", questionId, organizationId,
    occurredAt: "2026-07-30T12:01:00.000Z",
    search: {
      id: "search-1", timestamp: "2026-07-30T12:01:00.000Z",
      scope: "Authorized information for this organization and question.",
      sourceIds: ["source-a"], limitations: [], changeProduced: true,
    },
  });
  for (const revision of [1, 2]) {
    runtime = appendProductQuestionEvent(runtime, {
      type: "answer_recorded", questionId, organizationId,
      occurredAt: `2026-07-30T12:0${revision + 1}:00.000Z`,
      answer: {
        answerId: `answer-${revision}`,
        canonicalSource: `causal-chain:${revision}`,
        revision,
        reasonForChange: revision === 1 ? "Initial supported answer." : "New evidence changed the leading explanation.",
        changeReceiptId: `receipt-${revision}`,
        timestamp: `2026-07-30T12:0${revision + 1}:00.000Z`,
        confidence: { ...confidence, score: revision === 1 ? 0.64 : 0.76 },
      },
    });
  }
  runtime = appendProductQuestionEvent(runtime, {
    type: "improvement_recorded", questionId, organizationId,
    occurredAt: "2026-07-30T12:04:00.000Z",
    improvement: {
      actionId: "improvement-1", suggestedAt: "2026-07-30T12:04:00.000Z",
      reason: "Compare approval waiting across delivery types.", completedAt: "2026-07-30T12:05:00.000Z",
      answerChanged: true, confidenceChanged: true,
    },
  });
  runtime = appendProductQuestionEvent(runtime, {
    type: "decision_linked", questionId, organizationId,
    occurredAt: "2026-07-30T12:06:00.000Z",
    decision: { decisionId: "decision-1", answerId: "answer-2", timestamp: "2026-07-30T12:06:00.000Z", status: "in-progress" },
  });
  runtime = appendProductQuestionEvent(runtime, {
    type: "outcome_linked", questionId, organizationId,
    occurredAt: "2026-07-30T12:07:00.000Z",
    outcome: {
      outcomeId: "outcome-1", decisionId: "decision-1",
      timestamp: "2026-07-30T12:07:00.000Z", result: "working", learningId: "learning-1",
    },
  });
  runtime = appendProductQuestionEvent(runtime, {
    type: "learning_applied", questionId, organizationId,
    occurredAt: "2026-07-30T12:08:00.000Z",
    learningId: "learning-1", outcomeId: "outcome-1",
  });
  runtime = appendProductQuestionEvent(runtime, {
    type: "insight_linked", questionId, organizationId,
    occurredAt: "2026-07-30T12:09:00.000Z",
    insight: { insightId: "insight-1", answerId: "answer-2", timestamp: "2026-07-30T12:09:00.000Z" },
  });
  return runtime;
}

function question(runtime = completeHistory()) {
  const value = buildDurableProductQuestion({ runtime, questionId });
  assert.ok(value);
  return value;
}

function validateLifecycle(): void {
  const value = question();
  assert.equal(value.id, questionId);
  assert.equal(value.status, "monitoring");
  assert.equal(value.currentAnswerId, "answer-2");
  assert.equal(value.currentDecisionId, "decision-1");
  assert.equal(value.revision, 2);
  assert.equal(productQuestionFixtures.length, 9);
}

function validateHistory(): void {
  const value = question();
  assert.equal(value.searchHistory.length, 1);
  assert.equal(value.answerHistory.length, 2);
  assert.equal(value.improvementHistory.length, 1);
  assert.equal(value.decisionHistory.length, 1);
  assert.equal(value.outcomeHistory.length, 1);
  assert.equal(value.insightHistory.length, 1);
}

function validateRevision(): void {
  const value = question();
  assert.deepEqual(value.answerHistory.map((item) => item.revision), [1, 2]);
  assert.equal(value.answerHistory[1]?.reasonForChange, "New evidence changed the leading explanation.");
  assert.equal(value.currentConfidence?.score, 0.76);
  assert.equal(value.currentAnswerId, value.answerHistory.at(-1)?.answerId);
}

function validateStatus(): void {
  assert.equal(canTransitionQuestion("created", "searching"), true);
  assert.equal(canTransitionQuestion("answered", "decision_in_progress"), true);
  assert.equal(canTransitionQuestion("archived", "improving"), false);
  const archived = archiveProductQuestion({
    runtime: completeHistory(), questionId, archivedAt: "2026-07-30T12:10:00.000Z",
  });
  assert.equal(question(archived).status, "archived");
  const invalid = appendProductQuestionEvent(base(), {
    type: "status_changed", questionId, organizationId,
    occurredAt: "2026-07-30T12:01:00.000Z", status: "monitoring",
  });
  assert.throws(() => question(invalid), /Invalid durable Question transition/);
}

async function validateRuntime(): Promise<void> {
  const runtime = completeHistory();
  const bytes = JSON.stringify(runtime);
  const reloaded = normalizeOrganizationRuntime(JSON.parse(bytes));
  assert.deepEqual(question(reloaded), question(runtime));
  assert.deepEqual(productQuestionEvents(reloaded), productQuestionEvents(runtime));
  const firstEvent = productQuestionEvents(runtime)[0]!;
  const duplicate = appendProductQuestionEvent(runtime, {
    type: "question_created", questionId, organizationId,
    occurredAt: firstEvent.occurredAt, title: "Why are delivery commitments unreliable?",
  });
  assert.equal(productQuestionEvents(duplicate).length, productQuestionEvents(runtime).length);
  const workspace = buildProductQuestionWorkspace({ runtime });
  let replaces = 0;
  const stored = await persistProductWorkspaceLifecycle({
    storedRuntime: {
      runtime,
      revision: "question-runtime-revision",
      bytes: new TextEncoder().encode(bytes),
    },
    workspace,
    recordedAt: "2026-07-30T12:10:00.000Z",
    operation: { requestId: "question-runtime-test", operatorId: "validator" },
    runtimeRepository: {
      async replace(replacedOrganizationId, nextBytes, expectedRevision) {
        replaces += 1;
        assert.equal(replacedOrganizationId, organizationId);
        assert.equal(expectedRevision, "question-runtime-revision");
        const nextRuntime = normalizeOrganizationRuntime(
          JSON.parse(new TextDecoder().decode(nextBytes)),
        );
        return { runtime: nextRuntime, bytes: nextBytes, revision: "next-revision" };
      },
    },
  });
  assert.equal(replaces, 1);
  assert.equal(stored.revision, "next-revision");
  assert.ok(buildDurableProductQuestion({ runtime: stored.runtime, questionId }));
}

function validateWorkspace(): void {
  const runtime = completeHistory();
  const workspace = buildProductQuestionWorkspace({ runtime });
  assert.equal(workspace.question.id, questionId);
  assert.equal(workspace.question.revision, 2);
  assert.equal(workspace.question.currentAnswerId, "answer-2");
  assert.equal(workspace.question.timeline.length, question(runtime).timeline.length);
  assert.equal("understandingState" in workspace, false);
}

function validateLineage(): void {
  const value = question();
  assert.equal(value.answerHistory[1]?.canonicalSource, "causal-chain:2");
  assert.equal(value.decisionHistory[0]?.answerId, "answer-2");
  assert.equal(value.outcomeHistory[0]?.decisionId, "decision-1");
  assert.equal(value.outcomeHistory[0]?.learningId, "learning-1");
  assert.equal(value.insightHistory[0]?.answerId, "answer-2");
  const foreign = appendProductQuestionEvent(
    createEmptyOrganizationRuntime({ organizationId: "another-organization" }),
    {
      type: "question_created",
      questionId: "foreign-question",
      organizationId: "another-organization",
      occurredAt: createdAt,
      title: "Foreign question",
    },
  );
  assert.equal(buildDurableProductQuestion({ runtime: foreign, questionId }), null);
  assert.throws(() => appendProductQuestionEvent(foreign, {
    type: "question_created", questionId, organizationId,
    occurredAt: createdAt, title: "Wrong organization",
  }), /does not match Runtime/);
}

function validateTimeline(): void {
  const value = question();
  assert.deepEqual(value.timeline.map((item) => item.label), [
    "Question created",
    "Information reviewed",
    "Answer created",
    "Answer revised",
    "Improvement suggested",
    "Decision created",
    "Outcome recorded",
    "Learning applied",
    "Insight generated",
  ]);
  assert.deepEqual(question(), value);
  let sameTimestamp = withAnswerOnly();
  sameTimestamp = appendProductQuestionEvent(sameTimestamp, {
    type: "outcome_linked", questionId, organizationId,
    occurredAt: "2026-07-30T12:06:00.000Z",
    outcome: {
      outcomeId: "same-time-outcome", decisionId: "same-time-decision",
      timestamp: "2026-07-30T12:06:00.000Z", result: "working", learningId: null,
    },
  });
  sameTimestamp = appendProductQuestionEvent(sameTimestamp, {
    type: "decision_linked", questionId, organizationId,
    occurredAt: "2026-07-30T12:06:00.000Z",
    decision: {
      decisionId: "same-time-decision", answerId: "answer-1",
      timestamp: "2026-07-30T12:06:00.000Z", status: "in-progress",
    },
  });
  assert.equal(question(sameTimestamp).status, "monitoring");
}

function withAnswerOnly() {
  let runtime = base();
  runtime = appendProductQuestionEvent(runtime, {
    type: "answer_recorded", questionId, organizationId,
    occurredAt: "2026-07-30T12:02:00.000Z",
    answer: {
      answerId: "answer-1", canonicalSource: "causal-chain:1", revision: 1,
      reasonForChange: "Initial supported answer.", changeReceiptId: "receipt-1",
      timestamp: "2026-07-30T12:02:00.000Z", confidence,
    },
  });
  return runtime;
}

const validators: Record<string, () => void | Promise<void>> = {
  lifecycle: validateLifecycle,
  history: validateHistory,
  revision: validateRevision,
  status: validateStatus,
  runtime: validateRuntime,
  workspace: validateWorkspace,
  lineage: validateLineage,
  timeline: validateTimeline,
};

async function main(): Promise<void> {
if (mode === "all") {
  for (const validate of Object.values(validators)) await validate();
} else {
  const validate = validators[mode];
  assert.ok(validate, `Unknown Question validation mode: ${mode}`);
  await validate();
}

console.log(JSON.stringify({
  validation: mode === "all" ? "durable-question-lifecycle" : `question-${mode}`,
  result: "PASS",
  fixtureCount: productQuestionFixtures.length,
  runtimeStorage: "existing memory.events",
  runtimeSchemaChanged: false,
  frontendChanged: false,
}));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
