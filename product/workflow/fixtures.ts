import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { ProductQuestionWorkspace } from "./contracts";
import { buildProductQuestionWorkspace } from "./buildProductQuestionWorkspace";
import { renderProductQuestionWorkspace } from "./renderProductQuestionWorkspace";

export type ProductWorkspaceFixture = {
  id: string;
  description: string;
  workspace: ProductQuestionWorkspace;
  rendering: string;
  traceability: string[];
};

const NOW = "2026-07-29T12:00:00.000Z";

function baseWorkspace(): ProductQuestionWorkspace {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: "product-fixture-organization",
    name: "Product Fixture Organization",
    industry: "Cross-industry",
  });
  runtime.metadata.createdAt = NOW;
  runtime.metadata.updatedAt = NOW;
  return buildProductQuestionWorkspace({
    runtime,
    question: "What is preventing reliable delivery?",
  });
}

function fixture(
  id: string,
  description: string,
  mutate: (workspace: ProductQuestionWorkspace) => void,
  traceability: string[],
): ProductWorkspaceFixture {
  const workspace = structuredClone(baseWorkspace());
  mutate(workspace);
  return {
    id,
    description,
    workspace,
    rendering: renderProductQuestionWorkspace(workspace),
    traceability,
  };
}

const noChange = () => undefined;

export const productWorkspaceFixtures: ProductWorkspaceFixture[] = [
  fixture("question-created", "Question created, no evidence.", noChange, ["ProductQuestion", "OrganizationRuntime.metadata"]),
  fixture("search-authorization-required", "Connected search requires authorization.", (w) => { w.searchPlan!.status = "authorization_required"; }, ["ProductSearchPlan"]),
  fixture("search-ready", "Manual acquisition is ready.", (w) => { w.searchPlan!.status = "ready"; }, ["ProductSearchPlan"]),
  fixture("search-completed-limited", "Manual evidence search completed with limitations.", (w) => { w.searchPlan!.status = "completed"; w.searchPlan!.limitations = ["Connected retrieval was not executed."]; }, ["ProductSearchPlan", "ProductSearchReceipt"]),
  fixture("answer-abstained", "No product-quality answer yet.", noChange, ["ProductAnswerAbstention"]),
  ...(["low", "moderate", "high"] as const).map((level, index) =>
    fixture(`${level}-confidence-answer`, `${level} confidence answer.`, (w) => {
      w.answer = {
        kind: "answer", id: `answer-${level}`, questionId: w.question.id, revision: 1,
        conclusion: "Approval handoffs are delaying release commitments.",
        whyItMatters: "Delivery dates remain unreliable until decision ownership is explicit.",
        confidence: {
          level,
          score: [0.4, 0.62, 0.82][index]!,
          meaning: "Confidence in this exact answer.",
          principalLimiter: "Independent outcome evidence remains limited.",
          authoritativeSource: "fixture:completed-explanation",
        },
        discriminatingEvidence: [{ id: "e-1", statement: "Release decisions waited for cross-functional approval.", sourceLabel: "Operating review", role: "discriminates" }],
        weakenedAlternatives: [], unresolvedAlternatives: [],
        principalLimiter: "Independent outcome evidence remains limited.",
        bestNextImprovement: null, decisionImplication: null, generatedAt: NOW,
      };
    }, ["ProductAnswer", "completed OrganizationalExplanation", "admitted Evidence"]),
  ),
  fixture("improve-authorized-search", "Improvement through authorized search.", (w) => { w.searchPlan!.status = "ready"; w.searchPlan!.requestedSources[2]!.authorized = true; w.searchPlan!.requestedSources[2]!.executable = true; }, ["ProductSearchPlan", "Governance decision"]),
  fixture("improve-upload", "Improvement through upload.", (w) => { w.searchPlan!.requestedSources = w.searchPlan!.requestedSources.slice(0, 1); }, ["ProductImprovementAction", "Evidence admission"]),
  fixture("improve-interview", "Improvement through interview request.", (w) => { w.searchPlan!.purpose = "Ask the accountable owner where approval waits occur."; }, ["InvestigationOpportunity"]),
  fixture("evidence-no-material-change", "Evidence incorporated without answer revision.", (w) => { w.latestChange!.primaryChange = "no_material_change"; w.latestChange!.summary = "Evidence was incorporated without materially changing the answer."; }, ["ProductChangeReceipt"]),
  fixture("answer-materially-revised", "Answer materially revised.", (w) => { w.latestChange!.primaryChange = "answer_revised"; w.latestChange!.previousAnswerRevision = 1; w.latestChange!.currentAnswerRevision = 2; }, ["ProductChangeReceipt", "understanding revision"]),
  fixture("alternatives-unresolved", "Competing explanations remain unresolved.", (w) => {
    const answer = w.answer;
    if (answer?.kind === "abstention") answer.explanation = "Evidence supports several explanations, but none yet discriminates among them.";
  }, ["ProductAnswerAbstention", "OrganizationalExplanation"]),
  ...(["not-ready", "ready", "committed"] as const).map((state) =>
    fixture(`decision-${state}`, `Decision ${state}.`, (w) => {
      if (state === "committed") {
        w.activeDecision = {
          id: "decision-1", organizationId: w.question.organizationId,
          sourceQuestionId: w.question.id, sourceAnswerId: "answer-1",
          intervention: "Assign one owner for release approval.", assumptions: [],
          expectedOutcomes: [{ id: "outcome-1", description: "Approval cycle time declines.", timeHorizon: "30 days" }],
          successCriteria: [{ id: "measure-1", name: "Approval cycle time", baseline: 9, target: 4, unit: "days" }],
          owner: { id: null, label: "COO" }, reviewDate: "2026-08-29T12:00:00.000Z",
          status: "not-started", decisionRecordId: "record-1", workId: "work-1",
        };
      } else {
        w.decisionDraft = {
          id: "draft-1", organizationId: w.question.organizationId,
          sourceQuestionId: w.question.id, sourceAnswerId: "answer-1",
          title: "Clarify release authority", intervention: "Assign one owner for release approval.",
          rationale: "Approval waiting is delaying releases.", assumptions: [], risks: [],
          expectedOutcomes: state === "ready" ? [{ id: "outcome-1", description: "Cycle time declines.", timeHorizon: "30 days" }] : [],
          measures: state === "ready" ? [{ id: "measure-1", name: "Cycle time", baseline: 9, target: 4, unit: "days" }] : [],
          owner: state === "ready" ? { id: null, label: "COO" } : null,
          proposedReviewDate: state === "ready" ? "2026-08-29T12:00:00.000Z" : null,
          readiness: state === "ready" ? "ready_to_commit" : "not_ready",
          readinessLimiter: state === "ready" ? null : "Expected outcomes, measures, owner, and review date are required.",
        };
      }
    }, ["ProductDecisionDraft", "ExecutiveDecisionRecord", "ExecutiveWork"]),
  ),
  ...(["too_early", "inconclusive", "working", "not_working", "mixed"] as const).map((status) =>
    fixture(`outcome-${status}`, `Outcome ${status}.`, (w) => {
      w.latestOutcomeReview = {
        decisionId: "decision-1", status, comparisons: [],
        interpretation: status === "too_early" ? "No completed review exists." : `The observed outcome is ${status.replace("_", " ")}.`,
        modelEffect: { answerRevised: false, confidenceChanged: status !== "too_early" && status !== "inconclusive", assumptionsValidated: [], assumptionsWeakened: [], newEvidenceAdmitted: false },
        nextReviewDate: status === "too_early" ? "2026-08-29T12:00:00.000Z" : null,
      };
    }, ["ExecutiveReview", "ExecutiveLearning", "ProductOutcomeReview"]),
  ),
  fixture("outcome-revises-answer", "Outcome evidence revises understanding.", (w) => { w.latestChange!.primaryChange = "outcome_recorded"; w.latestChange!.changedFields = ["outcomeReview", "answer", "confidence", "modelState"]; }, ["ExecutiveReview", "ExecutiveLearning", "OperatingModelImprovement"]),
  fixture("model-more-coherent", "Model becomes more coherent.", (w) => { w.modelState.dimensions.coherence.value = 0.82; w.modelState.dimensions.coherence.status = "strong"; }, ["OrganizationalUnderstandingState.health"]),
  fixture("model-less-coherent", "Contradiction reduces coherence.", (w) => { w.modelState.dimensions.coherence.value = 0.42; w.modelState.dimensions.coherence.status = "developing"; w.modelState.tensions = [{ id: "tension-1", statement: "Two authorized sources disagree about the primary driver.", effect: "reduces_coherence" }]; }, ["OrganizationalUncertainty", "V3Contradiction"]),
  fixture("model-stale", "Freshness remains unknown or becomes stale only with source evidence.", (w) => { w.modelState.dimensions.freshness = { value: 0.2, status: "weak", meaning: "Supporting evidence is outside its governed freshness window.", limiter: "Current source observations are aging." }; }, ["governed source freshness"]),
  fixture("proactive-insight", "Product-quality proactive insight.", (w) => { w.proactiveInsights = [{
    id: "insight-1", organizationId: w.question.organizationId,
    title: "Escalation adds delay without measured quality gain",
    conclusion: "Routine escalations are slower without producing higher measured decision quality.",
    whyItMatters: "The current approval policy may add cost without delivering its intended control benefit.",
    confidence: { level: "high", score: 0.81, meaning: "Confidence in this exact insight.", principalLimiter: "The sample covers one decision class.", authoritativeSource: "fixture:completed-explanation" },
    discriminatingEvidence: [{ id: "e-1", statement: "Escalated decisions were four times slower and quality was not higher.", sourceLabel: "Decision log", role: "discriminates" }],
    affectedQuestionIds: [w.question.id], affectedDecisionIds: [], suggestedQuestion: null, suggestedAction: "Test bounded delegation.", emittedAt: NOW,
  }]; }, ["ProductInsight", "completed OrganizationalExplanation", "admitted Evidence"]),
  fixture("proactive-insight-abstained", "No proactive insight clears the quality gate.", (w) => { w.proactiveInsights = []; }, ["ProductInsight quality gate"]),
];
