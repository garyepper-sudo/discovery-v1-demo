import type {
  ProductHistoricalAnswerResolution,
  ProductQuestionSummary,
} from "../integration/contracts";
import type { ProductQuestionWorkspace } from "../workflow/contracts";
import { productWorkspaceFixtures } from "../workflow/fixtures";

export type ProductFrontendFixture = {
  id: string;
  label: string;
  description: string;
  workspace: ProductQuestionWorkspace;
  questions: ProductQuestionSummary[];
  historicalAnswers: ProductHistoricalAnswerResolution[];
  transitions: Record<string, string>;
};

export type ProductFrontendFixtureAdapter = {
  listFixtures(): ProductFrontendFixture[];
  getFixture(id: string): ProductFrontendFixture;
  getInitialFixture(): ProductFrontendFixture;
};

const byId = new Map(productWorkspaceFixtures.map((fixture) => [fixture.id, fixture]));

function workspace(id: string): ProductQuestionWorkspace {
  const fixture = byId.get(id);
  if (!fixture) throw new Error(`Unknown product workspace fixture: ${id}`);
  return structuredClone(fixture.workspace);
}

function answerWorkspace(level: "low" | "moderate" | "high" = "high"): ProductQuestionWorkspace {
  const value = workspace(`${level}-confidence-answer`);
  if (value.answer?.kind === "answer") {
    value.question.status = "answered";
    value.question.currentAnswerId = value.answer.id;
    value.question.currentConfidence = value.answer.confidence;
    value.question.revision = value.answer.revision;
    value.answer.bestNextImprovement = {
      id: "improvement-release-review",
      type: "upload_document",
      title: "Add recent release-review notes",
      reason: "Recent review notes can test where approval waiting begins and whether it precedes missed commitments.",
      expectedGain: "moderate",
      target: { label: "Release-review notes", sourceType: "manual_upload" },
      executable: true,
      limitation: null,
    };
    value.latestChange = {
      questionId: value.question.id,
      previousAnswerRevision: null,
      currentAnswerRevision: value.answer.revision,
      primaryChange: "answer_created",
      summary: "Discovery formed an Answer from the authorized information.",
      changedFields: ["answer", "confidence", "improvementPlan", "modelState"],
      occurredAt: value.answer.generatedAt,
    };
  }
  return value;
}

function label(id: string): string {
  return id
    .split("-")
    .map((part) => part === "no" ? "No" : part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function summary(
  current: ProductQuestionWorkspace,
  overrides: Partial<ProductQuestionSummary> = {},
): ProductQuestionSummary {
  return {
    id: current.question.id,
    organizationId: current.question.organizationId,
    title: current.question.title,
    status: current.question.status,
    updatedAt: current.question.updatedAt,
    currentSupport: current.answer?.kind === "answer"
      ? current.answer.confidence.level
      : "no-answer",
    activeDecisionStatus: current.latestOutcomeReview
      ? "monitoring"
      : current.activeDecision
        ? "committed"
        : current.decisionDraft
          ? "draft"
          : "none",
    hasUnresolvedChange: current.latestChange?.primaryChange === "answer_revised",
    ...overrides,
  };
}

function scenario(input: {
  id: string;
  description: string;
  workspace: ProductQuestionWorkspace;
  transitions?: Record<string, string>;
  questions?: ProductQuestionSummary[];
  historicalAnswers?: ProductHistoricalAnswerResolution[];
}): ProductFrontendFixture {
  return {
    id: input.id,
    label: label(input.id),
    description: input.description,
    workspace: input.workspace,
    questions: input.questions ?? [summary(input.workspace)],
    historicalAnswers: input.historicalAnswers ?? [],
    transitions: input.transitions ?? {},
  };
}

const noAnswer = workspace("question-created");
const searchLimited = workspace("search-completed-limited");
const abstention = workspace("answer-abstained");
const lowAnswer = answerWorkspace("low");
const moderateAnswer = answerWorkspace("moderate");
const highAnswer = answerWorkspace("high");

const alternativeAnswer = answerWorkspace("moderate");
if (alternativeAnswer.answer?.kind === "answer") {
  alternativeAnswer.answer.unresolvedAlternatives = [{
    id: "alternative-approval-capacity",
    explanation: "Release delays may instead be concentrated in specialist capacity constraints.",
    status: "unresolved",
    basis: "Current admitted evidence does not yet separate approval waiting from specialist capacity.",
  }];
}

const noMaterialChange = answerWorkspace("moderate");
noMaterialChange.latestChange = workspace("evidence-no-material-change").latestChange;

const revisedAnswer = answerWorkspace("high");
revisedAnswer.answer = revisedAnswer.answer?.kind === "answer"
  ? { ...revisedAnswer.answer, revision: 2 }
  : revisedAnswer.answer;
revisedAnswer.latestChange = {
  ...workspace("answer-materially-revised").latestChange!,
  summary: "New operating-review evidence shifted the answer from staffing capacity to approval ownership.",
};

const partialBridge = structuredClone(abstention);
if (partialBridge.answer?.kind === "abstention") {
  partialBridge.answer = {
    ...partialBridge.answer,
    reason: "insufficient_specificity",
    explanation: "The evidence describes approval waiting, but does not yet connect it reliably to missed delivery commitments.",
    principalLimiter: "The relationship between approval waiting and delivery reliability remains only partially supported.",
  };
}

function improvement(kind: "upload" | "interview"): ProductQuestionWorkspace {
  const value = answerWorkspace("moderate");
  const source = workspace(`improve-${kind}`);
  if (value.answer?.kind === "answer") {
    value.answer.bestNextImprovement = {
      id: `improvement-${kind}`,
      type: kind === "upload" ? "upload_document" : "ask_person",
      title: kind === "upload" ? "Add recent release-review notes" : "Interview the release approver",
      reason: kind === "upload"
        ? "Recent review notes can show where approval waiting begins."
        : source.searchPlan?.purpose ?? "Ask where approval waiting occurs.",
      expectedGain: "moderate",
      target: {
        label: kind === "upload" ? "Release-review notes" : "Release approver",
        sourceType: kind,
      },
      executable: true,
      limitation: null,
    };
  }
  return value;
}

function withAnswer(id: string): ProductQuestionWorkspace {
  const target = workspace(id);
  const source = answerWorkspace("moderate");
  target.answer = source.answer;
  target.improvementPlan = source.improvementPlan;
  target.question = source.question;
  target.latestChange = source.latestChange;
  if (id.startsWith("decision-")) {
    target.question.status = id === "decision-committed"
      ? "decision_in_progress"
      : "answered";
  }
  if (id.startsWith("outcome-")) {
    target.question.status = "monitoring";
    target.activeDecision = workspace("decision-committed").activeDecision;
  }
  return target;
}

const decisionNotReady = withAnswer("decision-not-ready");
const decisionReady = withAnswer("decision-ready");
const decisionCommitted = withAnswer("decision-committed");
const outcomeTooEarly = withAnswer("outcome-too_early");
const outcomeInconclusive = withAnswer("outcome-inconclusive");
const outcomeWorking = withAnswer("outcome-working");
const outcomeNotWorking = withAnswer("outcome-not_working");
const outcomeRevises = withAnswer("outcome-revises-answer");
const coherent = withAnswer("model-more-coherent");
const lessCoherent = withAnswer("model-less-coherent");
const stale = withAnswer("model-stale");
const freshnessUnknown = answerWorkspace("moderate");
const insight = withAnswer("proactive-insight");
const insightAbstained = withAnswer("proactive-insight-abstained");

const archived = answerWorkspace("moderate");
archived.question.status = "archived";

const unrelated = structuredClone(abstention);
unrelated.question.title = "Should we expand into a new region?";
unrelated.question.text = unrelated.question.title;
if (unrelated.answer?.kind === "abstention") {
  unrelated.answer = {
    ...unrelated.answer,
    reason: "insufficient_discrimination",
    explanation: "The available delivery evidence does not answer whether regional expansion is warranted.",
    principalLimiter: "No admitted evidence connects market demand, operating capacity, and the proposed region.",
  };
}

const multiQuestions = [
  summary(highAnswer, { id: "question-delivery", title: "What is preventing reliable delivery?", status: "answered", currentSupport: "high" }),
  summary(abstention, { id: "question-retention", title: "Why is customer retention declining?", status: "searching", currentSupport: "no-answer" }),
  summary(decisionCommitted, { id: "question-approval", title: "Where should release authority sit?", status: "decision_in_progress", activeDecisionStatus: "committed" }),
  summary(outcomeWorking, { id: "question-cycle-time", title: "Did delegated approval improve cycle time?", status: "monitoring", activeDecisionStatus: "monitoring" }),
  summary(archived, { id: "question-archived", title: "Was the prior launch policy effective?", status: "archived" }),
];

const resolvedHistory: ProductHistoricalAnswerResolution = {
  status: "resolved",
  answerId: "historical-answer-1",
  questionRevision: 1,
  conclusion: "Specialist capacity was the primary delivery constraint.",
  confidence: {
    level: "moderate",
    score: 0.61,
    meaning: "Confidence in this exact historical answer.",
    principalLimiter: "Approval-wait evidence had not yet been admitted.",
    authoritativeSource: "fixture:historical-completed-explanation",
  },
  principalLimiter: "Approval-wait evidence had not yet been admitted.",
  generatedAt: "2026-07-22T12:00:00.000Z",
  sourceReference: { type: "product-answer", id: "historical-answer-1" },
};

const unavailableHistory: ProductHistoricalAnswerResolution = {
  status: "unavailable",
  answerId: "historical-answer-missing",
  questionRevision: 1,
  reason: "source-missing",
};

const fixtures: ProductFrontendFixture[] = [
  scenario({ id: "new-question", description: "A durable Question before evidence supports an Answer.", workspace: noAnswer, transitions: { add_information: "moderate-confidence-answer" } }),
  scenario({ id: "search-limitation", description: "Manual evidence is available while connected retrieval remains limited.", workspace: searchLimited }),
  scenario({ id: "answer-abstention", description: "Discovery truthfully abstains and offers a bounded next step.", workspace: abstention, transitions: { add_information: "moderate-confidence-answer" } }),
  scenario({ id: "low-confidence-answer", description: "An eligible Answer with low support.", workspace: lowAnswer }),
  scenario({ id: "moderate-confidence-answer", description: "An eligible Answer with moderate support.", workspace: moderateAnswer, transitions: { add_information: "answer-revised" } }),
  scenario({ id: "high-confidence-answer", description: "An eligible Answer with high support.", workspace: highAnswer, transitions: { add_information: "answer-no-material-change", create_decision: "decision-draft-ready" } }),
  scenario({ id: "answer-with-alternative", description: "A direct Answer with an unresolved alternative.", workspace: alternativeAnswer }),
  scenario({ id: "answer-no-material-change", description: "Evidence was admitted without materially changing the Answer.", workspace: noMaterialChange }),
  scenario({ id: "answer-revised", description: "A material Answer revision with a bounded change receipt.", workspace: revisedAnswer, historicalAnswers: [resolvedHistory] }),
  scenario({ id: "partially-supported-bridge", description: "Evidence is adjacent but the requested relationship is incomplete.", workspace: partialBridge }),
  scenario({ id: "improve-by-upload", description: "The best next improvement is a manual upload.", workspace: improvement("upload"), transitions: { add_information: "answer-revised" } }),
  scenario({ id: "improve-by-interview", description: "The best next improvement is a bounded interview.", workspace: improvement("interview"), transitions: { add_information: "answer-revised" } }),
  scenario({ id: "decision-draft-not-ready", description: "A draft truthfully names its readiness limiter.", workspace: decisionNotReady }),
  scenario({ id: "decision-draft-ready", description: "A complete draft is ready for review.", workspace: decisionReady, transitions: { create_decision: "decision-committed" } }),
  scenario({ id: "decision-committed", description: "A committed Decision retains Answer ancestry.", workspace: decisionCommitted, transitions: { review_outcome: "outcome-too-early" } }),
  scenario({ id: "outcome-too-early", description: "The Decision cannot yet be evaluated.", workspace: outcomeTooEarly, transitions: { review_outcome: "outcome-inconclusive" } }),
  scenario({ id: "outcome-inconclusive", description: "Observed evidence remains inconclusive.", workspace: outcomeInconclusive }),
  scenario({ id: "outcome-working", description: "The backend reports that the Decision is working.", workspace: outcomeWorking }),
  scenario({ id: "outcome-not-working", description: "The backend reports that the Decision is not working.", workspace: outcomeNotWorking }),
  scenario({ id: "outcome-revises-answer", description: "Outcome learning revises the Answer.", workspace: outcomeRevises }),
  scenario({ id: "model-coherence-increased", description: "The Organizational Model becomes more coherent.", workspace: coherent }),
  scenario({ id: "model-coherence-decreased", description: "A contradiction truthfully reduces coherence.", workspace: lessCoherent }),
  scenario({ id: "model-freshness-stale", description: "Governed freshness evidence indicates staleness.", workspace: stale }),
  scenario({ id: "model-freshness-unknown", description: "Freshness remains unknown without a governed source clock.", workspace: freshnessUnknown }),
  scenario({ id: "proactive-insight", description: "A quality-gated proactive Insight is available.", workspace: insight }),
  scenario({ id: "proactive-insight-abstention", description: "No proactive Insight clears the quality gate.", workspace: insightAbstained }),
  scenario({ id: "archived-question", description: "An archived Question remains retrievable.", workspace: archived, questions: [summary(archived)] }),
  scenario({ id: "multiple-questions", description: "Backend-owned Question summaries populate the sidebar.", workspace: highAnswer, questions: multiQuestions }),
  scenario({ id: "historical-answer-resolved", description: "A customer-safe historical revision resolves exactly.", workspace: revisedAnswer, historicalAnswers: [resolvedHistory] }),
  scenario({ id: "historical-answer-fail-closed", description: "Missing historical content remains a bounded timeline event.", workspace: revisedAnswer, historicalAnswers: [unavailableHistory] }),
  scenario({ id: "unrelated-question-abstention", description: "Relevant delivery evidence does not answer an unrelated expansion Question.", workspace: unrelated }),
];

const fixtureMap = new Map(fixtures.map((fixture) => [fixture.id, fixture]));

export const fixtureProductWorkspaceAdapter: ProductFrontendFixtureAdapter = {
  listFixtures: () => structuredClone(fixtures),
  getFixture: (id) => {
    const fixture = fixtureMap.get(id);
    if (!fixture) throw new Error(`Unknown frontend fixture: ${id}`);
    return structuredClone(fixture);
  },
  getInitialFixture: () => structuredClone(fixtureMap.get("high-confidence-answer")!),
};
