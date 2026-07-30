import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { DiscoveryV3Result } from "../../engine/v3/types";
import type { InvestigationOpportunity } from "../../engine/v3/model/investigation/buildInvestigationOpportunities";
import type {
  ProductAction,
  ProductAnswer,
  ProductDecision,
  ProductDecisionDraft,
  ProductInsight,
  ProductModelDimension,
  ProductModelState,
  ProductOutcomeReview,
  ProductQuestion,
  ProductQuestionWorkspace,
  ProductSearchPlan,
  ProductSearchReceipt,
} from "./contracts";
import { PRODUCT_CONTRACT_VERSION } from "./contracts";
import { selectProductAnswer } from "./selectProductAnswer";
import { dimensionStatus, limitWords, stableId } from "./text";
import {
  customerConfidenceLimiter,
  customerModelGrowth,
  customerOutcomeInterpretation,
  customerSearchLimitation,
} from "./customerLanguage";
import {
  buildDurableProductQuestion,
  productQuestionEvents,
} from "../questions/questionLifecycle";

type ProductRuntimeMemory = OrganizationRuntime["memory"] & {
  investigationOpportunities?: InvestigationOpportunity[];
  organizationalUncertainty?: {
    overallUncertainty: number;
    contradictionDensity: number;
    confidenceLimiters: string[];
  };
  learningEvents?: Array<{ reason?: string; timestamp?: string }>;
};

function investigationEvents(runtime: OrganizationRuntime): Array<{
  question?: string;
  timestamp?: string;
  evidenceCount?: number;
}> {
  return runtime.memory.events.filter(
    (event): event is { question?: string; timestamp?: string; evidenceCount?: number } =>
      Boolean(event && typeof event === "object"),
  );
}

function questionFrom(
  runtime: OrganizationRuntime,
  explicit?: string,
  explicitQuestionId?: string,
): ProductQuestion {
  const durableEvents = productQuestionEvents(runtime);
  const durableQuestionIds = [...new Set(durableEvents.map((event) => event.questionId))];
  const durableQuestions = durableQuestionIds
    .map((questionId) => buildDurableProductQuestion({ runtime, questionId }))
    .filter((question): question is ProductQuestion => Boolean(question));
  const explicitTitle = explicit?.trim();
  const durable = explicitQuestionId
    ? durableQuestions.find((question) => question.id === explicitQuestionId)
    : explicitTitle
    ? durableQuestions.find((question) => question.title === explicitTitle)
    : [...durableQuestions]
      .filter((question) => question.status !== "archived")
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
  if (durable) return durable;
  const events = investigationEvents(runtime);
  const first = events.find((event) => typeof event.question === "string" && event.question.trim());
  const latest = [...events].reverse().find((event) => typeof event.question === "string" && event.question.trim());
  const text = explicitTitle || first?.question?.trim() || latest?.question?.trim() || "What should Discovery understand?";
  const createdAt = first?.timestamp ?? runtime.metadata.createdAt;
  const updatedAt = latest?.timestamp ?? runtime.metadata.updatedAt;
  const id = stableId("product-question", runtime.metadata.organizationId, text);
  const hasDecision = runtime.memory.executiveDecisionRecords.length > 0;
  return {
    id,
    organizationId: runtime.metadata.organizationId,
    text,
    title: text,
    status: hasDecision ? "decision_in_progress" : runtime.metadata.investigationCount > 0 ? "answered" : "created",
    createdAt,
    updatedAt,
    currentAnswerId: null,
    currentDecisionId: runtime.memory.executiveDecisionRecords.at(-1)?.id ?? null,
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
}

function result(runtime: OrganizationRuntime): DiscoveryV3Result | null {
  const value = runtime.memory.understandingState;
  return value && typeof value === "object" && "evidence" in value
    ? value as DiscoveryV3Result
    : null;
}

function searchProjection(
  runtime: OrganizationRuntime,
  question: ProductQuestion,
): { plan: ProductSearchPlan; receipt: ProductSearchReceipt | null } {
  const current = result(runtime);
  const sources = current?.evidence ?? [];
  const sourceScopes = [...new Map(sources
    .filter((item) => item.sourceId)
    .map((item) => [item.sourceId!, {
      sourceId: item.sourceId!,
      sourceType: item.sourceType ?? item.ingestionMethod ?? "manual",
      organizationId: question.organizationId,
    }])).values()];
  const manualOnly = sources.every((item) =>
    !item.ingestionMethod || ["onboarding-form", "file", "paste"].includes(item.ingestionMethod)
  );
  const limitations = manualOnly
    ? [customerSearchLimitation()]
    : [];
  return {
    plan: {
      questionId: question.id,
      purpose: `Acquire evidence that can answer: ${question.text}`,
      status: sources.length > 0 ? "completed" : "ready",
      requestedSources: [
        { id: "manual-upload", type: "manual_upload", label: "Authorized uploaded documents", authorized: true, executable: true },
        { id: "paste", type: "paste", label: "Authorized pasted observations", authorized: true, executable: true },
        { id: "authorized-records", type: "authorized_records", label: "Connected organizational records", authorized: false, executable: false },
      ],
      limitations,
    },
    receipt: sources.length === 0 ? null : {
      questionId: question.id,
      searchedAt: runtime.metadata.updatedAt,
      sourceScopes,
      recordsConsidered: sourceScopes.length || null,
      evidenceAdmitted: sources.length,
      limitations,
    },
  };
}

function modelDimension(value: number | null, meaning: string, limiter: string | null): ProductModelDimension {
  return { value, status: dimensionStatus(value), meaning, limiter };
}

function modelState(runtime: OrganizationRuntime): ProductModelState {
  const memory = runtime.memory as ProductRuntimeMemory;
  const state = runtime.memory.organizationalUnderstandingState;
  const coverage = Number.isFinite(state.score.coverage) ? state.score.coverage / 100 : null;
  const baseCoherence = Number.isFinite(state.health.coherence) ? state.health.coherence : null;
  const contradictionDensity = memory.organizationalUncertainty?.contradictionDensity ?? 0;
  const coherence = baseCoherence === null ? null : Math.max(0, Math.min(baseCoherence, 1 - contradictionDensity));
  const trustworthiness = memory.organizationalUncertainty
    ? Math.max(0, 1 - memory.organizationalUncertainty.overallUncertainty)
    : null;
  const tensions = (result(runtime)?.contradictions ?? []).slice(0, 3).map((item) => ({
    id: item.id,
    statement: limitWords(item.explanation || item.title, 35),
    effect: "reduces_coherence" as const,
  }));
  const composite = [coverage, coherence, trustworthiness].filter((value): value is number => value !== null);
  const average = composite.length ? composite.reduce((sum, value) => sum + value, 0) / composite.length : 0;
  const developmentalState: ProductModelState["developmentalState"] =
    average >= 0.8 ? "maturing" : average >= 0.65 ? "coherent" : average >= 0.35 ? "forming" : "fragmented";
  return {
    organizationId: runtime.metadata.organizationId,
    revision: runtime.metadata.investigationCount,
    developmentalState,
    dimensions: {
      coverage: modelDimension(coverage, "How much of this question is supported by current evidence.", null),
      coherence: modelDimension(coherence, "How consistently the current evidence fits together.", coherence === null ? null : tensions.length ? "Conflicting evidence reduces consistency." : null),
      freshness: modelDimension(null, "Whether the supporting evidence is current enough for this question.", null),
      trustworthiness: modelDimension(trustworthiness, "How much the answer is limited by disagreement and uncertainty.", trustworthiness === null ? null : customerConfidenceLimiter(memory.organizationalUncertainty?.confidenceLimiters[0])),
    },
    tensions,
    latestMeaningfulGrowth: (memory.learningEvents ?? [])
      .slice(-3)
      .map((item) => customerModelGrowth(item.reason))
      .filter((item): item is string => Boolean(item)),
    projectedAt: runtime.metadata.updatedAt,
  };
}

function projectDecision(
  runtime: OrganizationRuntime,
  question: ProductQuestion,
  answer: ProductAnswer | null,
): { draft: ProductDecisionDraft | null; active: ProductDecision | null } {
  if (!answer) return { draft: null, active: null };
  const record = runtime.memory.executiveDecisionRecords.at(-1);
  if (!record) {
    if (!answer.decisionImplication) return { draft: null, active: null };
    return {
      draft: {
        id: stableId("product-decision-draft", question.id, answer.id),
        organizationId: question.organizationId,
        sourceQuestionId: question.id,
        sourceAnswerId: answer.id,
        title: answer.decisionImplication,
        intervention: answer.decisionImplication,
        rationale: answer.whyItMatters,
        assumptions: [],
        risks: [],
        expectedOutcomes: [],
        measures: [],
        owner: null,
        proposedReviewDate: null,
        readiness: "not_ready",
        readinessLimiter: "Expected outcomes, measures, owner, and review date are required before commitment.",
      },
      active: null,
    };
  }
  const work = runtime.memory.executiveWork.find((item) => item.decisionRecordId === record.id);
  return {
    draft: null,
    active: {
      id: stableId("product-decision", question.id, answer.id, record.id),
      organizationId: question.organizationId,
      sourceQuestionId: question.id,
      sourceAnswerId: answer.id,
      intervention: record.decision,
      assumptions: [...record.acceptedAssumptions],
      expectedOutcomes: record.expectedOutcomes.map((item) => ({ id: item.id, description: item.description, timeHorizon: item.timeHorizon ?? null })),
      successCriteria: record.successCriteria.map((item) => ({ id: item.id, name: item.name, baseline: item.baseline ?? null, target: item.target ?? null, unit: item.unit ?? null })),
      owner: record.owner ? { id: null, label: record.owner } : null,
      reviewDate: record.reviewAt ?? null,
      status: work?.status ?? record.status,
      decisionRecordId: record.id,
      workId: work?.id ?? null,
    },
  };
}

function projectOutcome(runtime: OrganizationRuntime, decision: ProductDecision | null): ProductOutcomeReview | null {
  if (!decision) return null;
  const review = runtime.memory.executiveReviews.find((item) => item.decisionRecordId === decision.decisionRecordId);
  if (!review) {
    return {
      decisionId: decision.id,
      status: "too_early",
      comparisons: [],
      interpretation: "No completed review has compared observed outcomes with the decision's expected outcomes.",
      modelEffect: { answerRevised: false, confidenceChanged: false, assumptionsValidated: [], assumptionsWeakened: [], newEvidenceAdmitted: false },
      nextReviewDate: decision.reviewDate,
    };
  }
  const expected = new Map(decision.expectedOutcomes.map((item) => [item.id, item.description]));
  const comparisons = review.observedOutcomes.map((item) => ({
    expectedOutcomeId: item.expectedOutcomeId,
    expected: expected.get(item.expectedOutcomeId) ?? "Expected outcome recorded with the decision.",
    observed: item.observation,
    result: item.achieved === true ? "working" as const : item.achieved === false ? "not_working" as const : "inconclusive" as const,
  }));
  const learning = runtime.memory.executiveLearning.find((item) => item.executiveReviewId === review.id);
  const status: ProductOutcomeReview["status"] =
    review.status === "successful" ? "working"
      : review.status === "unsuccessful" ? "not_working"
        : review.status === "partially-successful" ? "mixed" : "inconclusive";
  return {
    decisionId: decision.id,
    status,
    comparisons,
    interpretation: customerOutcomeInterpretation(status),
    modelEffect: {
      answerRevised: false,
      confidenceChanged: Boolean(learning && learning.confidenceAdjustment !== 0),
      assumptionsValidated: [],
      assumptionsWeakened: [],
      newEvidenceAdmitted: false,
    },
    nextReviewDate: null,
  };
}

function insights(
  runtime: OrganizationRuntime,
  question: ProductQuestion,
  answer: ProductAnswer | null,
): ProductInsight[] {
  if (!answer || answer.confidence.score === null || answer.confidence.score < 0.65 || answer.discriminatingEvidence.length < 2) return [];
  if (!/\d/.test(answer.discriminatingEvidence.map((item) => item.statement).join(" "))) return [];
  return [{
    id: stableId("product-insight", question.id, answer.id),
    organizationId: question.organizationId,
    title: limitWords(answer.conclusion, 14),
    conclusion: answer.conclusion,
    whyItMatters: answer.whyItMatters,
    confidence: answer.confidence,
    discriminatingEvidence: answer.discriminatingEvidence,
    affectedQuestionIds: [question.id],
    affectedDecisionIds: [],
    suggestedQuestion: answer.bestNextImprovement?.title ?? null,
    suggestedAction: answer.decisionImplication,
    emittedAt: answer.generatedAt,
  }];
}

function actions(
  answer: ProductQuestionWorkspace["answer"],
  decision: ProductDecision | null,
): ProductAction[] {
  return [
    { type: "search_records", label: "Search connected records", enabled: false, reason: "Connected record search is not available." },
    { type: "add_information", label: "Add information", enabled: true, reason: null },
    { type: "create_decision", label: "Create decision", enabled: answer?.kind === "answer" && Boolean(answer.decisionImplication), reason: answer?.kind === "answer" && answer.decisionImplication ? null : "No intervention-specific decision implication clears the evidence gate." },
    { type: "review_outcome", label: "Review outcome", enabled: Boolean(decision), reason: decision ? null : "No committed decision is active." },
    { type: "ask_followup", label: "Ask a follow-up", enabled: true, reason: null },
  ];
}

export function buildProductQuestionWorkspace(input: {
  runtime: OrganizationRuntime;
  question?: string;
  questionId?: string;
}): ProductQuestionWorkspace {
  const question = questionFrom(input.runtime, input.question, input.questionId);
  const search = searchProjection(input.runtime, question);
  const answer = selectProductAnswer({
    runtime: input.runtime,
    questionId: question.id,
    question: question.text,
    revision: Math.max(1, input.runtime.metadata.investigationCount),
    generatedAt: input.runtime.metadata.updatedAt,
  });
  const answered = answer.kind === "answer" ? answer : null;
  const decision = projectDecision(input.runtime, question, answered);
  const outcome = projectOutcome(input.runtime, decision.active);
  return {
    contractVersion: PRODUCT_CONTRACT_VERSION,
    question,
    searchPlan: search.plan,
    latestSearchReceipt: search.receipt,
    answer,
    improvementPlan: answered ? {
      questionId: question.id,
      currentConfidence: answered.confidence,
      bestNextAction: answered.bestNextImprovement,
      alternatives: [],
    } : null,
    decisionDraft: decision.draft,
    activeDecision: decision.active,
    latestOutcomeReview: outcome,
    modelState: modelState(input.runtime),
    latestChange: {
      questionId: question.id,
      previousAnswerRevision: input.runtime.metadata.investigationCount > 1 ? input.runtime.metadata.investigationCount - 1 : null,
      currentAnswerRevision: answered?.revision ?? null,
      primaryChange: answered ? input.runtime.metadata.investigationCount > 1 ? "answer_revised" : "answer_created" : "underdetermined",
      summary: answered ? "Discovery formed an answer from the latest authorized evidence." : "The current evidence does not support a sufficiently specific answer.",
      changedFields: answered ? ["answer", "confidence", "improvementPlan", "modelState"] : ["modelState"],
      occurredAt: input.runtime.metadata.updatedAt,
    },
    proactiveInsights: insights(input.runtime, question, answered),
    permittedActions: actions(answer, decision.active),
  };
}
