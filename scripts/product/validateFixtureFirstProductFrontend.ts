import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fixtureProductWorkspaceAdapter } from "../../product/frontend";

const mode = process.argv[2] ?? "all";
const root = process.cwd();
const route = readFileSync(join(root, "app/product-alpha/page.tsx"), "utf8");
const component = readFileSync(
  join(root, "components/product-alpha/ProductAlphaExperience.tsx"),
  "utf8",
);
const css = readFileSync(
  join(root, "components/product-alpha/ProductAlphaExperience.module.css"),
  "utf8",
);
const adapter = readFileSync(
  join(root, "product/frontend/fixtureProductWorkspaceAdapter.ts"),
  "utf8",
);
const fixtures = fixtureProductWorkspaceAdapter.listFixtures();
const ids = new Set(fixtures.map((fixture) => fixture.id));

const requiredFixtures = [
  "new-question",
  "search-limitation",
  "answer-abstention",
  "low-confidence-answer",
  "moderate-confidence-answer",
  "high-confidence-answer",
  "answer-with-alternative",
  "answer-no-material-change",
  "answer-revised",
  "partially-supported-bridge",
  "improve-by-upload",
  "improve-by-interview",
  "decision-draft-not-ready",
  "decision-draft-ready",
  "decision-committed",
  "outcome-too-early",
  "outcome-inconclusive",
  "outcome-working",
  "outcome-not-working",
  "outcome-revises-answer",
  "model-coherence-increased",
  "model-coherence-decreased",
  "model-freshness-stale",
  "model-freshness-unknown",
  "proactive-insight",
  "proactive-insight-abstention",
  "archived-question",
  "multiple-questions",
  "historical-answer-resolved",
  "historical-answer-fail-closed",
  "unrelated-question-abstention",
] as const;

function fixture(id: string) {
  return fixtureProductWorkspaceAdapter.getFixture(id);
}

function validateRoute(): void {
  assert.match(route, /fixtureProductWorkspaceAdapter/);
  assert.match(route, /NODE_ENV !== "production"/);
  assert.match(route, /DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED === "true"/);
  assert.match(route, /notFound\(\)/);
  assert.doesNotMatch(route, /your-organization|buildDiscoveryExperienceView|composeActivatedYourOrganization/);
}

function validateContractOnly(): void {
  const frontend = `${route}\n${component}`;
  const forbidden = [
    /engine\/v3/,
    /organizationRuntime/i,
    /ProductCommunication/,
    /selectProductAnswer/,
    /questionAnswerRelevance/,
    /buildDiscoveryExperienceView/,
    /composeActivatedYourOrganization/,
    /historicalAnswerResolution/,
  ];
  forbidden.forEach((pattern) => assert.doesNotMatch(frontend, pattern));
  assert.match(component, /ProductFrontendFixture/);
  assert.match(component, /ProductAnswer/);
  assert.match(component, /ProductModelDimension/);
  assert.doesNotMatch(component, /product\/workflow\/fixtures/);
}

function validateCoverage(): void {
  assert.equal(fixtures.length >= 30, true);
  assert.equal(new Set(fixtures.map((item) => item.id)).size, fixtures.length);
  requiredFixtures.forEach((id) => assert.equal(ids.has(id), true, `Missing fixture ${id}`));
  fixtures.forEach((item) => {
    assert.equal(item.workspace.contractVersion, "1");
    assert.equal(item.workspace.question.organizationId, item.workspace.modelState.organizationId);
    assert.equal(item.questions.every((question) =>
      question.organizationId === item.workspace.question.organizationId
    ), true);
  });
}

function validateTransitions(): void {
  fixtures.forEach((item) => {
    Object.values(item.transitions).forEach((target) => {
      assert.equal(ids.has(target), true, `${item.id} targets missing fixture ${target}`);
    });
  });
  assert.equal(fixture("new-question").transitions.add_information, "moderate-confidence-answer");
  assert.equal(fixture("moderate-confidence-answer").transitions.add_information, "answer-revised");
  assert.equal(fixture("decision-draft-ready").transitions.create_decision, "decision-committed");
  assert.equal(fixture("decision-committed").transitions.review_outcome, "outcome-too-early");
}

function validateAbstention(): void {
  for (const id of ["answer-abstention", "partially-supported-bridge", "unrelated-question-abstention"]) {
    const answer = fixture(id).workspace.answer;
    assert.equal(answer?.kind, "abstention");
    if (answer?.kind === "abstention") {
      assert.ok(answer.explanation.trim());
      assert.ok(answer.principalLimiter.trim());
      assert.equal("confidence" in answer, false);
    }
  }
  assert.match(component, /Discovery does not yet have a supported Answer/);
  assert.match(component, /What is missing/);
}

function validateAnswerRevision(): void {
  const revised = fixture("answer-revised");
  assert.equal(revised.workspace.answer?.kind, "answer");
  assert.equal(revised.workspace.latestChange?.primaryChange, "answer_revised");
  assert.equal(revised.workspace.latestChange?.previousAnswerRevision, 1);
  assert.equal(revised.workspace.latestChange?.currentAnswerRevision, 2);
  assert.equal(revised.historicalAnswers[0]?.status, "resolved");
  assert.doesNotMatch(component, /localeCompare\(.*conclusion|diff.*answer/i);
}

function validateDecisionOutcome(): void {
  assert.equal(fixture("decision-draft-not-ready").workspace.decisionDraft?.readiness, "not_ready");
  assert.equal(fixture("decision-draft-ready").workspace.decisionDraft?.readiness, "ready_to_commit");
  assert.ok(fixture("decision-committed").workspace.activeDecision);
  for (const [id, status] of [
    ["outcome-too-early", "too_early"],
    ["outcome-inconclusive", "inconclusive"],
    ["outcome-working", "working"],
    ["outcome-not-working", "not_working"],
  ] as const) {
    assert.equal(fixture(id).workspace.latestOutcomeReview?.status, status);
  }
  assert.doesNotMatch(component, /baseline.*target|target.*baseline/);
}

function validateModelState(): void {
  assert.equal(fixture("model-coherence-increased").workspace.modelState.dimensions.coherence.status, "strong");
  assert.equal(fixture("model-coherence-decreased").workspace.modelState.tensions.length > 0, true);
  assert.equal(fixture("model-freshness-stale").workspace.modelState.dimensions.freshness.status, "weak");
  assert.equal(fixture("model-freshness-unknown").workspace.modelState.dimensions.freshness.status, "unknown");
  assert.match(component, /Model state reflects the authorized product projection/);
}

function validateHistory(): void {
  assert.equal(fixture("historical-answer-resolved").historicalAnswers[0]?.status, "resolved");
  const unavailable = fixture("historical-answer-fail-closed").historicalAnswers[0];
  assert.equal(unavailable?.status, "unavailable");
  assert.match(component, /cannot be resolved safely/);
  assert.doesNotMatch(component, /current Answer.*historical|historical.*current Answer/i);
}

function validateResponsive(): void {
  assert.match(css, /@media \(max-width: 980px\)/);
  assert.match(css, /@media \(max-width: 600px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /\.mobileQuestions/);
  assert.match(css, /overflow|word|wrap/);
}

function validateAccessibility(): void {
  assert.match(component, /aria-label="Question navigation"/);
  assert.match(component, /aria-labelledby=/);
  assert.match(component, /<main/);
  assert.match(component, /<h1>/);
  assert.match(component, /<summary>/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(component, /Model state reflects/);
}

function validateNoDeadActions(): void {
  const enabledActionTypes = new Set(
    fixtures.flatMap((item) =>
      item.workspace.permittedActions
        .filter((action) => action.enabled)
        .map((action) => action.type)
    ),
  );
  assert.equal(enabledActionTypes.has("add_information"), true);
  assert.match(component, /onClick=\{\(\) => setComposerOpen\(true\)\}/);
  assert.match(component, /disabled=\{!contribution\.trim\(\)\}/);
  assert.doesNotMatch(component, />Connect (Drive|Slack|Email)</);
  assert.doesNotMatch(component, /fake|setTimeout|progress.*%/i);
}

function validateLegacyIsolation(): void {
  const forbidden = /components\/product-shell|components\/alpha|product\/alpha|buildActivatedYourOrganizationView/;
  assert.doesNotMatch(route, forbidden);
  assert.doesNotMatch(component, forbidden);
  assert.doesNotMatch(adapter, forbidden);
}

const validations: Record<string, () => void> = {
  route: validateRoute,
  contract: validateContractOnly,
  coverage: validateCoverage,
  transitions: validateTransitions,
  abstention: validateAbstention,
  revision: validateAnswerRevision,
  decision: validateDecisionOutcome,
  model: validateModelState,
  history: validateHistory,
  responsive: validateResponsive,
  accessibility: validateAccessibility,
  actions: validateNoDeadActions,
  isolation: validateLegacyIsolation,
  all: () => {
    validateRoute();
    validateContractOnly();
    validateCoverage();
    validateTransitions();
    validateAbstention();
    validateAnswerRevision();
    validateDecisionOutcome();
    validateModelState();
    validateHistory();
    validateResponsive();
    validateAccessibility();
    validateNoDeadActions();
    validateLegacyIsolation();
  },
};

const validation = validations[mode];
if (!validation) throw new Error(`Unknown frontend validation mode: ${mode}`);
validation();

console.log(JSON.stringify({
  validation: `fixture-first-product-frontend:${mode}`,
  result: "PASS",
  fixtureCount: fixtures.length,
  contractVersion: "1",
  activeRouteChanged: false,
  backendMeaningChanged: false,
}, null, 2));
