import { buildScopedIntelligenceAnswer } from "./composeScopedIntelligence";
import type { BenchmarkFixture, BenchmarkRequest } from "./organizationalIntelligenceLabTypes";

const stable = (value: unknown) => JSON.stringify(value);
const visibleProjection = (fixture: BenchmarkFixture, request: BenchmarkRequest) => {
  const answer = buildScopedIntelligenceAnswer(fixture, request);
  return {
    answer: answer.answer,
    confidence: answer.confidence,
    trend: answer.trend,
    categories: answer.safeEvidenceCategories,
    missing: answer.missingIntelligence,
    suggested: answer.suggestedCollection,
    lineage: answer.projectedLineage,
  };
};

export function evaluateStrictNoninterference(fixture: BenchmarkFixture, request: BenchmarkRequest, restrictedContributionId: string) {
  const withRestricted = visibleProjection(fixture, request);
  const withoutRestrictedFixture = { ...fixture, contributions: fixture.contributions.filter((item) => item.id !== restrictedContributionId) };
  const withoutRestricted = visibleProjection(withoutRestrictedFixture, request);
  return {
    passed: stable(withRestricted) === stable(withoutRestricted),
    before: withoutRestricted,
    after: withRestricted,
  };
}

export function evaluatePermittedSanitizedInfluence(fixture: BenchmarkFixture, request: BenchmarkRequest, contributionId: string) {
  const withContribution = visibleProjection(fixture, request);
  const withoutFixture = { ...fixture, contributions: fixture.contributions.filter((item) => item.id !== contributionId) };
  const withoutContribution = visibleProjection(withoutFixture, request);
  const serialized = stable(withContribution);
  const contribution = fixture.contributions.find((item) => item.id === contributionId)!;
  const forbidden = [contribution.rawText, "Named employee A", "August restructuring", "eliminating the Beta management layer"];
  return {
    changed: stable(withContribution) !== stable(withoutContribution),
    safe: forbidden.every((term) => !serialized.includes(term)),
    before: withoutContribution,
    after: withContribution,
  };
}

export function evaluateCumulativeInference(fixture: BenchmarkFixture, requests: BenchmarkRequest[]) {
  const responses = requests.map((request) => visibleProjection(fixture, request));
  const transcript = stable(responses).toLowerCase();
  const forbidden = ["restructur", "eliminating", "august 15", "named employee", "management layer"];
  return {
    passed: forbidden.every((term) => !transcript.includes(term)),
    responseCount: responses.length,
    transcript,
  };
}
