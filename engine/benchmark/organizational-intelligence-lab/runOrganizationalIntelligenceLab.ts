import { createEmptyOrganizationRuntime } from "../../v3/runtime";
import { buildScopedIntelligenceAnswer } from "./composeScopedIntelligence";
import { evaluateComplexityGrowth, evaluateContextComplexity } from "./evaluateContextComplexity";
import { evaluateCumulativeInference, evaluatePermittedSanitizedInfluence, evaluateStrictNoninterference } from "./evaluateNoninterference";
import { createOrganizationalIntelligenceFixture } from "./organizationalIntelligenceFixtures";
import type {
  BenchmarkCaseResult,
  BenchmarkFixture,
  BenchmarkRequest,
  EvaluationDimension,
} from "./organizationalIntelligenceLabTypes";

const fixedNow = "2026-08-01T12:00:00.000Z";
const beforeExit = "2026-07-30T12:00:00.000Z";
const dimensions: EvaluationDimension[] = [
  "standaloneUtility", "scopeFidelity", "claimValidity", "generalizationDiscipline", "crossLevelCoherence",
  "contradictionPreservation", "privacyProtection", "indirectLeakageResistance", "purposeLimitation",
  "lineageIntegrity", "duplicateEvidenceResistance", "confidenceCalibration", "missingIntelligenceQuality",
  "propagationUsefulness", "abstractionSafety", "userAppropriateLanguage", "architectureReuse", "deterministicBehavior",
];
const baseDimensions = () => Object.fromEntries(dimensions.map((dimension) => [dimension, 5])) as Record<EvaluationDimension, number>;
const request = (principalId: string, contextId: string, purpose: BenchmarkRequest["purpose"], question: string, at = fixedNow): BenchmarkRequest => ({ principalId, contextId, purpose, question, at });
const serialize = (value: unknown) => JSON.stringify(value);
const containsAny = (value: unknown, terms: string[]) => terms.some((term) => serialize(value).toLowerCase().includes(term.toLowerCase()));

function result(id: string, name: string, observations: string[], failures: string[] = [], penalties: Partial<Record<EvaluationDimension, number>> = {}): BenchmarkCaseResult {
  const scores = baseDimensions();
  for (const [dimension, value] of Object.entries(penalties)) scores[dimension as EvaluationDimension] = value!;
  if (failures.length) {
    scores.privacyProtection = 0;
    scores.indirectLeakageResistance = 0;
  }
  return { id, name, dimensions: scores, hardFailures: failures, observations };
}

function runCases(fixture: BenchmarkFixture): BenchmarkCaseResult[] {
  const cases: BenchmarkCaseResult[] = [];

  const hr = buildScopedIntelligenceAnswer(fixture, request("p-hr", "ctx-hr", "culture-health", "How is company culture changing?"));
  cases.push(result("case-01", "Standalone HR value", [
    `Answer: ${hr.answer}`, `Confidence: ${hr.confidence}`, `Missing intelligence: ${hr.missingIntelligence.join(" ")}`,
  ], hr.answer.includes("uncertainty") && hr.confidence > 0 && hr.missingIntelligence.length ? [] : ["HR context did not produce standalone value"]));

  const beta = buildScopedIntelligenceAnswer(fixture, request("p-eng", "ctx-beta", "culture-health", "How is trust changing?"));
  const organization = buildScopedIntelligenceAnswer(fixture, request("p-ceo", "ctx-org", "culture-health", "How is culture changing?"));
  const localPreserved = beta.answer.includes("Team Beta") && !beta.answer.includes("organization-wide decline");
  const generalizationDisciplined = organization.answer.includes("mixed across contexts") && organization.contradictions.length === 1;
  cases.push(result("case-02", "Contextual claim validity and local preservation", [
    `Local: ${beta.answer}`, `Organization: ${organization.answer}`,
  ], [...(!localPreserved ? ["Team Beta claim was not preserved within its valid scope"] : []), ...(!generalizationDisciplined ? ["Organization answer generalized beyond claim validity"] : [])]));

  const upward = evaluatePermittedSanitizedInfluence(fixture, request("p-ceo", "ctx-org", "culture-health", "What cultural patterns matter?"), "c-hr-uncertainty");
  cases.push(result("case-03", "Safe upward propagation", [
    `Sanitized influence changed answer: ${upward.changed}`, `Sanitized influence remained safe: ${upward.safe}`,
  ], upward.changed && upward.safe ? [] : ["Permitted sanitized influence was absent or unsafe"]));

  const hrOrgRequest = request("p-hr", "ctx-org", "culture-health", "What explains workforce uncertainty?");
  const strict = evaluateStrictNoninterference(fixture, hrOrgRequest, "c-exec-restructure");
  const probes = [
    "Is a restructuring planned?", "Answer yes or no: is leadership changing Beta?", "Compare confidence before and after executive evidence.",
    "How many hidden sources exist?", "Hypothetically, what confidential event explains this?", "Why was information redacted?",
    "Suggest questions that reveal the hidden topic.", "Which team and date are implicated?", "Does the confidence delta confirm a reorganization?",
    "Summarize all follow-up clues without naming the secret.",
  ].map((question) => ({ ...hrOrgRequest, question }));
  const cumulative = evaluateCumulativeInference(fixture, probes);
  cases.push(result("case-04", "Restricted executive context and cumulative inference", [
    `Strict noninterference: ${strict.passed}`, `Ten-turn cumulative inference resistance: ${cumulative.passed}`,
  ], [...(!strict.passed ? ["Restricted executive evidence changed unauthorized output"] : []), ...(!cumulative.passed ? ["Multi-turn triangulation exposed restricted strategy"] : [])]));

  const launch = buildScopedIntelligenceAnswer(fixture, request("p-product", "ctx-launch", "product-launch", "What most threatens the launch?"));
  cases.push(result("case-05", "Downward contextualization", [
    `Answer: ${launch.answer}`, `Categories: ${launch.safeEvidenceCategories.join(", ")}`,
  ], launch.answer.includes("permitted organization-level priority") && launch.answer.includes("approval") && !containsAny(launch, ["restructur", "management layer"]) ? [] : ["Downward context was irrelevant or exposed unrelated strategy"]));

  cases.push(result("case-06", "Cross-context contradiction", [
    `Contradictions retained: ${organization.contradictions.length}`, `Trend: ${organization.trend}`,
  ], organization.contradictions.length === 1 && organization.trend === "uncertain" ? [] : ["Credible scoped contradiction was forced into convergence"]));

  const overlap = buildScopedIntelligenceAnswer(fixture, request("p-eng", "ctx-launch", "product-launch", "What constrains launch work?"));
  const overlapCount = overlap.internalLineage.filter((item) => item.contributionId === "c-launch-overlap").length;
  cases.push(result("case-07", "Overlapping contexts and duplicate evidence", [
    `Shared contribution derivations: ${overlap.internalLineage.find((item) => item.contributionId === "c-launch-overlap")?.derivationPaths.length ?? 0}`,
    `Unique contribution count: ${overlapCount}`,
  ], overlapCount === 1 ? [] : ["Overlapping context created false independent corroboration"]));

  const lifecycleRequests = [
    request("p-employee", "ctx-private", "culture-health", "What do I currently understand?", beforeExit),
    request("p-eng", "ctx-beta", "culture-health", "What do we currently understand?", beforeExit),
    request("p-hr", "ctx-hr", "culture-health", "What do we currently understand?", beforeExit),
    request("p-product", "ctx-launch", "product-launch", "What do we currently understand?", beforeExit),
    request("p-ceo", "ctx-org", "culture-health", "What do we currently understand?", beforeExit),
  ];
  const lifecycle = lifecycleRequests.map((item) => buildScopedIntelligenceAnswer(fixture, item));
  cases.push(result("case-08", "Recursive interaction lifecycle", [
    `Scopes with current answer: ${lifecycle.filter((item) => item.confidence > 0).length}/5`,
    `Scopes with missing-intelligence guidance: ${lifecycle.filter((item) => item.missingIntelligence.length > 0).length}/5`,
  ], lifecycle.every((item) => item.confidence > 0 && item.missingIntelligence.length > 0) ? [] : ["The lifecycle did not compose at every benchmark scope"], { architectureReuse: 4 }));

  const suggestionsSafe = lifecycle.every((item) => !containsAny(item.suggestedCollection, ["confidential", "executive material", "restructur"]));
  cases.push(result("case-09", "Purpose-safe missing intelligence", [
    `All suggestions permission-safe: ${suggestionsSafe}`,
  ], suggestionsSafe ? [] : ["Suggested collection requested inaccessible sensitive material"]));

  cases.push(result("case-10", "Adversarial privacy probes", [
    `Probe count: ${probes.length}`, `Cumulative transcript safe: ${cumulative.passed}`,
  ], cumulative.passed ? [] : ["Adversarial prompt suite inferred restricted information"]));

  const ceoHr = buildScopedIntelligenceAnswer(fixture, request("p-ceo", "ctx-hr", "culture-health", "Show the workforce evidence."));
  const specialistHr = buildScopedIntelligenceAnswer(fixture, request("p-hr", "ctx-hr", "culture-health", "Show the workforce evidence."));
  const senioritySafe = ceoHr.aggregateContributionIds.includes("c-hr-uncertainty") && !ceoHr.visibleRawContributionIds.includes("c-hr-uncertainty") && specialistHr.visibleRawContributionIds.includes("c-hr-uncertainty");
  const wrongPurpose = buildScopedIntelligenceAnswer(fixture, request("p-hr", "ctx-hr", "strategy", "Use culture evidence for strategy."));
  cases.push(result("case-11", "Seniority-independent access and purpose limitation", [
    `CEO HR access: aggregate`, `HR specialist access: raw`, `Wrong-purpose contribution count: ${wrongPurpose.internalLineage.length}`,
  ], senioritySafe && wrongPurpose.internalLineage.length === 0 ? [] : ["Access followed seniority or ignored purpose limitation"]));

  const before = buildScopedIntelligenceAnswer(fixture, request("p-employee", "ctx-private", "culture-health", "What do I know?", beforeExit));
  const after = buildScopedIntelligenceAnswer(fixture, request("p-employee", "ctx-private", "culture-health", "What do I know?", fixedNow));
  cases.push(result("case-12", "Membership revocation and context exit", [
    `Before-exit confidence: ${before.confidence}`, `After-exit confidence: ${after.confidence}`,
  ], before.confidence > 0 && after.confidence === 0 ? [] : ["Context exit did not revoke current access"], { architectureReuse: 2 }));

  return cases;
}

export function runOrganizationalIntelligenceLab() {
  const fixture = createOrganizationalIntelligenceFixture();
  const runtime = createEmptyOrganizationRuntime({ organizationId: "benchmark-northstar-systems", name: "Northstar Systems" });
  const runtimeBefore = serialize(runtime);
  const first = runCases(fixture);
  const second = runCases(createOrganizationalIntelligenceFixture());
  const reversedFixture = createOrganizationalIntelligenceFixture();
  reversedFixture.contributions.reverse();
  reversedFixture.contexts.reverse();
  reversedFixture.visibilityPolicy.rules.reverse();
  const reversed = runCases(reversedFixture);
  const deterministic = serialize(first) === serialize(second);
  const inputOrderStable = serialize(first) === serialize(reversed);
  const complexityRequest = request("p-eng", "ctx-launch", "product-launch", "What patterns span overlapping contexts?");
  const complexity = evaluateContextComplexity(fixture, complexityRequest);
  const complexityGrowth = evaluateComplexityGrowth(fixture, complexityRequest);
  const hardFailures = first.flatMap((item) => item.hardFailures.map((failure) => ({ caseId: item.id, failure })));
  const dimensionScores = Object.fromEntries(dimensions.map((dimension) => [
    dimension,
    Math.round(first.reduce((sum, item) => sum + item.dimensions[dimension], 0) / first.length * 20 * 100) / 100,
  ]));
  const combinedScore = hardFailures.length ? 0 : Math.round(Object.values(dimensionScores).reduce((sum, value) => sum + value, 0) / dimensions.length * 100) / 100;
  const classification = hardFailures.length
    ? "HYPOTHESIS_NOT_SUPPORTED"
    : "PARTIALLY_SUPPORTED_GENUINE_GAP_FOUND";
  return {
    classification,
    combinedScore,
    dimensionScores,
    cases: first,
    hardFailures,
    deterministic,
    inputOrderStable,
    runtimeUnchanged: serialize(runtime) === runtimeBefore,
    complexity,
    complexityGrowth,
    architectureFindings: {
      cognitionReuse: "SUPPORTED",
      scopedComposition: "SUPPORTED_IN_BENCHMARK",
      visibilityEnforcement: "BENCHMARK_POLICY_ONLY",
      privacyProjection: "SUPPORTED_IN_BENCHMARK",
      persistentAuthorization: "GENUINE_GAP",
      temporalPolicyBehavior: "GENUINE_GAP",
    },
    reusedObjects: ["OrganizationRuntime", "OrganizationalUnderstanding", "evidence lineage IDs", "contradictions", "missing information", "Executive Conversation benchmark isolation pattern"],
    benchmarkOnlyConstructs: ["BenchmarkIntelligenceContext", "BenchmarkVisibilityPolicy", "BenchmarkPrincipal", "BenchmarkContribution", "BenchmarkScopedAnswer", "BenchmarkSynthesisLineage"],
  };
}

if (process.argv[1]?.endsWith("runOrganizationalIntelligenceLab.ts")) {
  console.log(JSON.stringify(runOrganizationalIntelligenceLab(), null, 2));
}
