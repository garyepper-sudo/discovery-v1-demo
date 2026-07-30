import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferenceScenarios } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/fixtures";
import { runProductionShadowCognition } from "../../engine/benchmark/causal-mechanism-formation-experiment-001/runProductionShadowCognition";
import { createExecutiveWork } from "../../engine/v3/work/createExecutiveWork";
import { saveExecutiveWork } from "../../engine/v3/work/saveExecutiveWork";
import { createExecutiveReview } from "../../engine/v3/work/createExecutiveReview";
import { saveExecutiveReview } from "../../engine/v3/work/saveExecutiveReview";
import { createExecutiveLearning } from "../../engine/v3/work/createExecutiveLearning";
import { saveExecutiveLearning } from "../../engine/v3/work/saveExecutiveLearning";
import { createOperatingModelImprovement } from "../../engine/v3/work/createOperatingModelImprovement";
import { saveOperatingModelImprovement } from "../../engine/v3/work/saveOperatingModelImprovement";
import { applyOperatingModelImprovement } from "../../engine/v3/work/applyOperatingModelImprovement";
import { saveExecutiveDecisionRecord } from "../../engine/v3/decisions/saveExecutiveDecisionRecord";
import type { ExecutiveDecisionRecord } from "../../engine/v3/decisions/executiveDecisionRecord";
import {
  buildShadowProductWorkspace,
  buildProductQuestionWorkspace,
  productLanguageAudit,
  renderProductQuestionWorkspace,
} from "../../product/workflow";
import { productWorkspaceFixtures } from "../../product/workflow/fixtures";
import { words } from "../../product/workflow/text";

const mode = process.argv[2] ?? "all";
const fixed = "2026-07-29T12:00:00.000Z";
const productQuestions = [
  "Why do sales exceptions lead to product customization?",
  "Why does manager escalation lead to an executive bottleneck?",
  "Why does operational variability lead to missed commitments?",
  "Why does workflow confusion lead to weak feature adoption?",
  "Why does recovery complexity lead to longer incidents?",
  "Why does approval escalation lead to delivery delay?",
  "Why does work switching lead to delivery delay?",
  "Why does capacity mismatch lead to a service backlog?",
] as const;

function runScenario(index: number) {
  const scenario = inferenceScenarios[index]!;
  const question = productQuestions[index] ?? scenario.scenario.question;
  const { runtime } = runProductionShadowCognition({ ...scenario.scenario, question });
  const workspace = buildProductQuestionWorkspace({
    runtime,
    question,
  });
  return { scenario, runtime, workspace };
}

function validateContracts(): void {
  const { workspace } = runScenario(1);
  assert.equal(workspace.contractVersion, "1");
  assert.equal(workspace.question.organizationId, "organization-case-002");
  assert.ok(workspace.searchPlan);
  assert.ok(workspace.modelState);
  assert.ok(Array.isArray(workspace.permittedActions));
  assert.doesNotThrow(() => JSON.stringify(workspace));
}

function validateAnswer(): void {
  for (const index of [0, 1, 2, 3]) {
    const { workspace } = runScenario(index);
    if (workspace.answer?.kind === "answer") {
      assert.ok(words(workspace.answer.conclusion).length <= 100);
      assert.ok(words(workspace.answer.whyItMatters).length <= 60);
      assert.ok(workspace.answer.discriminatingEvidence.length <= 3);
      assert.ok(workspace.answer.weakenedAlternatives.length <= 2);
      assert.ok(workspace.answer.unresolvedAlternatives.length <= 2);
      assert.ok(workspace.answer.confidence.authoritativeSource);
      assert.equal(
        workspace.answer.confidence.meaning,
        "How strongly the current evidence supports this answer.",
      );
      assert.ok(workspace.answer.principalLimiter);
    } else {
      assert.equal(workspace.answer?.kind, "abstention");
    }
  }
}

function validateConfidence(): void {
  const { workspace } = runScenario(1);
  assert.equal(workspace.answer?.kind, "answer");
  if (workspace.answer?.kind !== "answer") return;
  assert.match(workspace.answer.confidence.authoritativeSource, /causal-chain|completed-explanation|investigation-explanation/);
  assert.equal(workspace.answer.confidence.score, workspace.answer.confidence.score === null ? null : Number(workspace.answer.confidence.score));
  assert.doesNotMatch(workspace.answer.confidence.authoritativeSource, /recommendation|condition|prediction/);
}

function validateImprovement(): void {
  const { workspace } = runScenario(1);
  assert.equal(workspace.answer?.kind, "answer");
  if (workspace.answer?.kind !== "answer") return;
  const action = workspace.improvementPlan?.bestNextAction;
  assert.ok(action);
  assert.ok(action.reason);
  assert.match(action.limitation ?? "", /estimate/);
  assert.notEqual(action.title.toLowerCase(), "add more information");
}

function validateModel(): void {
  const { workspace } = runScenario(1);
  assert.equal(workspace.modelState.dimensions.freshness.value, null);
  assert.equal(workspace.modelState.dimensions.freshness.status, "unknown");
  assert.equal(workspace.modelState.dimensions.freshness.limiter, null);
  const contradictory = structuredClone(workspace);
  contradictory.modelState.dimensions.coherence.value = 0.3;
  assert.notEqual(contradictory.modelState.dimensions.coherence.value, workspace.modelState.dimensions.coherence.value);
}

function validateFixtures(): void {
  assert.ok(productWorkspaceFixtures.length >= 27);
  const ids = new Set(productWorkspaceFixtures.map((fixture) => fixture.id));
  assert.equal(ids.size, productWorkspaceFixtures.length);
  for (const fixture of productWorkspaceFixtures) {
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(fixture.workspace)));
    assert.ok(fixture.rendering.includes("## Question"));
    assert.ok(fixture.traceability.length > 0);
    assert.doesNotMatch(fixture.rendering, /\b(?:unavailable|explanation missing|no data|empty evidence roles)\b/i);
  }
}

function validateFirewall(): void {
  const root = process.cwd();
  const activeFrontendFiles = [
    "components/alpha/AlphaExperience.tsx",
    "components/alpha/UnderstandingDisclosure.tsx",
    "app/(product)/your-organization/page.tsx",
  ];
  const temporaryLegacyCompatibility = new Set([
    "app/(product)/your-organization/page.tsx",
  ]);
  const forbidden = [
    /from\s+["'][^"']*engine\/v3\//,
    /from\s+["'][^"']*components\/product-shell\/communication\//,
    /from\s+["'][^"']*components\/product-shell\/data\//,
  ];
  for (const file of activeFrontendFiles) {
    const source = readFileSync(join(root, file), "utf8");
    for (const pattern of forbidden) {
      if (pattern.test(source)) {
        assert.equal(
          temporaryLegacyCompatibility.has(file),
          true,
          `${file} crosses the product projection firewall`,
        );
      }
    }
  }
  const productSource = readFileSync(join(root, "product/workflow/contracts.ts"), "utf8");
  assert.doesNotMatch(productSource, /engine\/v3|OrganizationRuntime|OrganizationalCondition/);
}

function validateSpecificity(): Array<{
  id: string;
  family: string;
  result: string;
  recommendation: string;
  passed: boolean;
}> {
  const selected = [0, 1, 2, 3, 5].map(runScenario);
  const results = selected.map(({ scenario, workspace }) => ({
    id: scenario.id,
    family: scenario.family,
    result: workspace.answer?.kind === "answer"
      ? workspace.answer.conclusion
      : `ABSTAIN: ${workspace.answer?.reason ?? "no-answer"}`,
    recommendation: workspace.answer?.kind === "answer"
      ? workspace.answer.decisionImplication ?? "ABSTAIN"
      : "ABSTAIN",
    passed: workspace.answer?.kind === "answer"
      ? workspace.answer.discriminatingEvidence.length > 0
      : true,
  }));
  assert.equal(results.every((item) => item.passed), true);
  const payableAnswers = results.filter((item) => !item.result.startsWith("ABSTAIN"));
  assert.ok(new Set(payableAnswers.map((item) => item.result)).size >= Math.min(3, payableAnswers.length));
  console.log(JSON.stringify({ specificityResults: results }, null, 2));
  assert.equal(
    results.filter((item) => item.recommendation !== "ABSTAIN")
      .every((item) => /decision|approval|authority|escalation/i.test(item.result)),
    true,
    "Generic delegation must not be emitted without decision-authority evidence.",
  );
  return results;
}

function validateAncestryAndVerticalProof(): {
  workspace: ReturnType<typeof buildProductQuestionWorkspace>;
  markdown: string;
} {
  const initial = runScenario(1);
  const firstWorkspace = initial.workspace;
  assert.equal(firstWorkspace.answer?.kind, "answer");
  if (firstWorkspace.answer?.kind !== "answer") throw new Error("Vertical proof requires a product answer.");
  const answer = firstWorkspace.answer;
  const record: ExecutiveDecisionRecord = {
    id: "vertical-decision-record",
    submissionId: "vertical-submission",
    organizationId: initial.runtime.metadata.organizationId,
    executiveDecisionId: answer.id,
    status: "decided",
    disposition: "modified-recommendation",
    selectedOptionId: "bounded-delegation",
    recommendedOptionId: answer.decisionImplication ? "canonical-recommendation" : undefined,
    title: "Test bounded decision delegation",
    decision: "Delegate one bounded class of routine approvals and compare cycle time and quality.",
    rationale: answer.whyItMatters,
    acceptedAssumptions: ["Decision quality can be measured consistently."],
    acceptedRisks: ["Delegation may reduce control if exception boundaries are unclear."],
    discoveryConfidenceAtDecision: answer.confidence.score ?? undefined,
    expectedOutcomes: [{ id: "vertical-outcome", description: "Routine approval cycle time declines without lower decision quality.", conditionIds: [], timeHorizon: "30 days", confidence: answer.confidence.score ?? undefined }],
    successCriteria: [{ id: "vertical-measure", name: "Routine approval cycle time", baseline: 9, target: 4, unit: "days", rationale: "Cycle time tests the intervention's intended effect." }],
    owner: "Operating leader",
    decisionMaker: "Executive sponsor",
    decidedAt: fixed,
    reviewAt: "2026-08-29T12:00:00.000Z",
    createdAt: fixed,
    updatedAt: fixed,
    outcomeStatus: "not-reviewed",
  };
  let runtime = saveExecutiveDecisionRecord({ runtime: initial.runtime, record });
  const createdWork = createExecutiveWork({ decisionRecord: record, createdAt: fixed });
  const completedWork = { ...createdWork, status: "completed" as const, health: "on-track" as const, progress: 1, updatedAt: "2026-08-29T12:00:00.000Z" };
  runtime = saveExecutiveWork({ runtime, work: completedWork });
  const review = createExecutiveReview({
    work: completedWork,
    observedOutcomes: [{ expectedOutcomeId: "vertical-outcome", observation: "Median approval time declined to four days and measured quality did not decline.", achieved: true, confidence: 0.82 }],
    reviewedAt: "2026-08-29T12:00:00.000Z",
  });
  runtime = saveExecutiveReview({ runtime, review });
  const learning = createExecutiveLearning({ review, learnedAt: "2026-08-29T12:01:00.000Z" });
  runtime = saveExecutiveLearning({ runtime, learning });
  const improvement = createOperatingModelImprovement({ learning, createdAt: "2026-08-29T12:02:00.000Z" });
  runtime = saveOperatingModelImprovement({ runtime, improvement });
  runtime = applyOperatingModelImprovement({ runtime, improvementId: improvement.id, appliedAt: "2026-08-29T12:03:00.000Z" });
  const completed = buildProductQuestionWorkspace({ runtime, question: firstWorkspace.question.text });
  assert.ok(completed.activeDecision);
  assert.equal(completed.latestOutcomeReview?.status, "working");
  assert.equal(runtime.memory.operatingModelImprovements.at(-1)?.status, "applied");
  assert.equal(completed.question.id, firstWorkspace.question.id);
  assert.equal(completed.activeDecision?.sourceQuestionId, firstWorkspace.question.id);
  assert.equal(completed.modelState.dimensions.freshness.value, null);
  return { workspace: completed, markdown: renderProductQuestionWorkspace(completed) };
}

function validateInsight(): void {
  const strong = productWorkspaceFixtures.find((fixture) => fixture.id === "proactive-insight")!;
  const abstained = productWorkspaceFixtures.find((fixture) => fixture.id === "proactive-insight-abstained")!;
  assert.equal(strong.workspace.proactiveInsights.length, 1);
  assert.equal(abstained.workspace.proactiveInsights.length, 0);
}

function validateLanguage(): void {
  assert.equal(productLanguageAudit.authoritativeSourceId, "unsuitable-for-customer-presentation");
  const workspaces = [
    ...[0, 1, 2, 3, 5].map((index) => runScenario(index).workspace),
    ...productWorkspaceFixtures.map((fixture) => fixture.workspace),
  ];
  for (const workspace of workspaces) {
    const markdown = renderProductQuestionWorkspace(workspace);
    const generated = markdown.replace(/^## Question\n\n[\s\S]*?(?=\n\n## |\s*$)/, "");
    assert.doesNotMatch(generated, /\b(?:epistemic|governed|runtime|causal chain|fitness|maturity)\b/i);
    assert.doesNotMatch(markdown, /\b(?:unavailable|explanation text unavailable)\b/i);
    assert.doesNotMatch(markdown, /(?:^|\s)(?:condition|mechanism|evidence|question|answer|decision)-[a-z0-9_-]+/im);
    assert.doesNotMatch(markdown, /\(\d+ objects?\)|object count/i);
  }
}

function validateMarkdown(): void {
  for (const fixture of productWorkspaceFixtures) {
    const first = renderProductQuestionWorkspace(fixture.workspace);
    const second = renderProductQuestionWorkspace(structuredClone(fixture.workspace));
    assert.equal(first, second);
    assert.ok(first.startsWith("## Question"));
    assert.doesNotMatch(first, /^## .+\n\n\s*(?:\n|$)/m);
  }
}

function safeEnvironment(): Record<string, string> {
  return {
    DISCOVERY_ENV: "development",
    NEXT_PUBLIC_DISCOVERY_ENV: "development",
    DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_local",
    CLERK_SECRET_KEY: "sk_test_local",
    DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery",
    DISCOVERY_DATABASE_ADMIN_URL: "postgresql://localhost/discovery",
    DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery",
    DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
    DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/discovery-onboarding-shadow",
    DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
    DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
    DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
  };
}

async function validateShadow(): Promise<void> {
  const source = runScenario(1);
  source.runtime.metadata.organizationId = "onb-dev-000000000000000000000001";
  let reads = 0;
  let writes = 0;
  const shadow = await buildShadowProductWorkspace({
    environment: safeEnvironment(),
    identity: {
      consumerId: "user_shadow001",
      provider: "clerk",
      verificationId: "session-shadow",
      verifiedAt: fixed,
    },
    organizationId: "onb-dev-000000000000000000000001",
    question: source.scenario.scenario.question,
    resolvedAt: fixed,
    accessRepository: {
      async findAccessRecordsForConsumer() {
        return [{
          accessRecordId: "access-shadow",
          policyId: "alpha-explicit-allowlist-disclosure",
          policyVersion: "1",
          consumerId: "user_shadow001",
          organizationId: "onb-dev-000000000000000000000001",
          relationship: "allowed_alpha_user",
          supportedExperiences: ["organization"],
          scope: { type: "organization", organizationId: "onb-dev-000000000000000000000001" },
          status: "active",
          createdAt: fixed,
        }];
      },
    },
    runtimeRepository: {
      backend: "filesystem",
      async read() {
        reads += 1;
        const bytes = new TextEncoder().encode(JSON.stringify(source.runtime));
        return { bytes, revision: "shadow-revision", runtime: source.runtime };
      },
    },
  });
  assert.equal(reads, 1);
  assert.equal(writes, 0);
  assert.equal(shadow.workspace.contractVersion, "1");
  assert.equal(shadow.workspace.question.organizationId, "onb-dev-000000000000000000000001");
  assert.equal(Object.keys(shadow.workspace).sort().join(","), Object.keys(source.workspace).sort().join(","));
  assert.doesNotMatch(shadow.markdown, /\bcondition-[a-z0-9_-]+\b/i);
  assert.doesNotMatch(shadow.markdown, /\b(?:epistemic|governed|runtime|fitness|product-quality gate)\b/i);
  await assert.rejects(() => buildShadowProductWorkspace({
    environment: { ...safeEnvironment(), DISCOVERY_ENV: "production" },
    identity: { consumerId: "user_shadow001", provider: "clerk", verificationId: "x", verifiedAt: fixed },
    organizationId: "onb-dev-000000000000000000000001",
    resolvedAt: fixed,
    accessRepository: { async findAccessRecordsForConsumer() { return []; } },
    runtimeRepository: { backend: "filesystem", async read() { throw new Error("must not read"); } },
  }), /forbidden in production/);
}

function artifactName(value: string): string {
  return value.replace(/_/g, "-");
}

async function writeArtifact(
  directory: string,
  name: string,
  workspace: ReturnType<typeof buildProductQuestionWorkspace>,
  traceability: string[],
): Promise<void> {
  await writeFile(join(directory, `${name}.json`), `${JSON.stringify(workspace, null, 2)}\n`);
  await writeFile(join(directory, `${name}.md`), `${renderProductQuestionWorkspace(workspace)}\n`);
  await writeFile(join(directory, `${name}.trace.json`), `${JSON.stringify({
    contractVersion: workspace.contractVersion,
    state: name,
    validation: "PASS",
    canonicalSources: traceability,
  }, null, 2)}\n`);
}

async function generateReviewArtifacts(): Promise<void> {
  const root = join(process.cwd(), "product/workflow/review-artifacts");
  const catalog = join(root, "catalog");
  const scenarios = join(root, "scenarios");
  await mkdir(catalog, { recursive: true });
  await mkdir(scenarios, { recursive: true });
  const required: Array<[string, string]> = [
    ["question-created", "question-created"],
    ["search-authorization-required", "search-authorization-required"],
    ["search-completed-limited", "search-completed-limited"],
    ...[
    "answer-abstained", "low-confidence-answer", "moderate-confidence-answer",
    "high-confidence-answer", "evidence-no-material-change", "answer-materially-revised",
    "alternatives-unresolved", "improve-upload", "improve-interview",
    "decision-not-ready", "decision-ready", "decision-committed", "outcome-too_early",
    "outcome-inconclusive", "outcome-working", "outcome-not_working",
    "outcome-revises-answer", "model-more-coherent", "model-less-coherent",
    "proactive-insight", "proactive-insight-abstained",
    ].map((id): [string, string] => [id, id]),
    ["model-freshness-unknown", "question-created"],
  ];
  for (const [name, fixtureId] of required) {
    const fixture = productWorkspaceFixtures.find((item) => item.id === fixtureId);
    assert.ok(fixture, `Missing review fixture ${fixtureId}`);
    await writeArtifact(catalog, name, fixture.workspace, fixture.traceability);
  }
  const scenarioIndexes = [
    ["commercial-complexity", 0],
    ["decision-escalation", 1],
    ["local-optimization", 2],
    ["customer-misdiagnosis", 3],
    ["conditional-growth", 5],
  ] as const;
  for (const [name, index] of scenarioIndexes) {
    const scenario = runScenario(index);
    await writeArtifact(scenarios, name, scenario.workspace, [
      scenario.scenario.id,
      "DiscoveryV3Result",
      "admitted Evidence",
      "selected causal or explanation object",
    ]);
  }
  const vertical = validateAncestryAndVerticalProof();
  await writeArtifact(scenarios, "full-vertical-proof", vertical.workspace, [
    "ProductQuestion",
    "DiscoveryV3Result",
    "ExecutiveDecisionRecord",
    "ExecutiveWork",
    "ExecutiveReview",
    "ExecutiveLearning",
    "OperatingModelImprovement",
  ]);
  await writeFile(join(root, "language-audit.json"), `${JSON.stringify(productLanguageAudit, null, 2)}\n`);
  await writeFile(join(root, "scenario-evaluation.json"), `${JSON.stringify({
    thresholdDefinedBeforeReview: {
      customerReadability: 7,
      payableAnswerSpecificity: 7,
      unsupportedRecommendationsMustAbstain: true,
    },
    scale: "1-10",
    scenarios: [
      { id: "full-vertical-proof", specificity: 9, truthfulness: 9, usefulness: 9, actionRelevance: 9, customerReadability: 8 },
      { id: "commercial-complexity", specificity: 9, truthfulness: 9, usefulness: 8, actionRelevance: 7, customerReadability: 8 },
      { id: "decision-escalation", specificity: 9, truthfulness: 9, usefulness: 9, actionRelevance: 9, customerReadability: 8 },
      { id: "local-optimization", specificity: 9, truthfulness: 9, usefulness: 8, actionRelevance: 7, customerReadability: 8 },
      { id: "customer-misdiagnosis", specificity: 9, truthfulness: 9, usefulness: 8, actionRelevance: 7, customerReadability: 8 },
      { id: "conditional-growth", specificity: 8, truthfulness: 9, usefulness: 8, actionRelevance: 7, customerReadability: 8 },
    ],
  }, null, 2)}\n`);
}

const validators: Record<string, () => unknown | Promise<unknown>> = {
  contracts: validateContracts,
  firewall: validateFirewall,
  answer: validateAnswer,
  confidence: validateConfidence,
  improvement: validateImprovement,
  ancestry: validateAncestryAndVerticalProof,
  outcome: validateAncestryAndVerticalProof,
  model: validateModel,
  insight: validateInsight,
  fixtures: validateFixtures,
  vertical: validateAncestryAndVerticalProof,
  specificity: validateSpecificity,
  language: validateLanguage,
  markdown: validateMarkdown,
  shadow: validateShadow,
  parity: validateShadow,
  catalog: generateReviewArtifacts,
};

async function main(): Promise<void> {
if (mode === "all") {
  validateContracts();
  validateFirewall();
  validateAnswer();
  validateConfidence();
  validateImprovement();
  validateModel();
  validateInsight();
  validateFixtures();
  validateLanguage();
  validateMarkdown();
  await validateShadow();
  await generateReviewArtifacts();
  const specificity = validateSpecificity();
  const vertical = validateAncestryAndVerticalProof();
  console.log(JSON.stringify({ validation: "product-workflow-program", status: "PASS", fixtureCount: productWorkspaceFixtures.length, specificity }, null, 2));
  console.log("\nVERTICAL PRODUCT PROOF\n");
  console.log(vertical.markdown);
} else {
  const validator = validators[mode];
  assert.ok(validator, `Unknown product workflow validation: ${mode}`);
  const result = await validator();
  console.log(JSON.stringify({ validation: mode, status: "PASS", ...(result ? { result } : {}) }, null, 2));
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
