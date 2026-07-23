import type {
  AccessLevel,
  BenchmarkContribution,
  BenchmarkFixture,
  BenchmarkRequest,
  BenchmarkScopedAnswer,
  BenchmarkVisibilityRule,
  ClaimTrend,
} from "./organizationalIntelligenceLabTypes";

const compare = (a: string, b: string) => a.localeCompare(b);
const unique = <T>(values: T[]) => Array.from(new Set(values));

function active(rule: BenchmarkVisibilityRule, at: string): boolean {
  return rule.activeFrom <= at && (!rule.activeUntil || at <= rule.activeUntil);
}

function accessLevel(fixture: BenchmarkFixture, request: BenchmarkRequest, contribution: BenchmarkContribution): AccessLevel {
  const matching = fixture.visibilityPolicy.rules.filter((rule) =>
    rule.principalId === request.principalId &&
    rule.purpose === request.purpose &&
    active(rule, request.at) &&
    contribution.contextIds.includes(rule.contextId),
  );
  if (matching.some((rule) => rule.level === "raw")) return "raw";
  if (matching.some((rule) => rule.level === "aggregate")) return "aggregate";
  return "none";
}

function relevant(contribution: BenchmarkContribution, request: BenchmarkRequest): boolean {
  if (!contribution.purposes.includes(request.purpose)) return false;
  return contribution.validScopeIds.includes(request.contextId) || contribution.generalizableToContextIds.includes(request.contextId);
}

function trend(contributions: BenchmarkContribution[]): ClaimTrend {
  const trends = unique(contributions.map((item) => item.trend));
  if (trends.length === 0) return "uncertain";
  if (trends.length === 1) return trends[0];
  if (trends.includes("declining") && trends.includes("stable")) return "uncertain";
  return trends.includes("declining") ? "declining" : "uncertain";
}

function missingFor(request: BenchmarkRequest, selected: BenchmarkContribution[]): string[] {
  if (request.purpose === "culture-health") {
    if (selected.length < 2) return ["A second permission-safe pulse or behavioral indicator from this context."];
    if (selected.every((item) => item.category.includes("pulse"))) return ["Permission-safe behavioral evidence that tests whether reported sentiment affects work."];
  }
  if (request.purpose === "product-launch" && !selected.some((item) => item.category.includes("delivery") || item.category.includes("approval"))) {
    return ["Current decision-latency and dependency evidence available to the launch team."];
  }
  return ["A relevant, permission-safe observation that could confirm or falsify the current interpretation."];
}

export function buildScopedIntelligenceAnswer(fixture: BenchmarkFixture, request: BenchmarkRequest): BenchmarkScopedAnswer {
  const seen = new Map<string, BenchmarkContribution>();
  let rawDerivations = 0;
  for (const contribution of fixture.contributions) {
    if (!relevant(contribution, request)) continue;
    for (const _contextId of contribution.contextIds) rawDerivations += 1;
    seen.set(contribution.id, contribution);
  }
  const candidates = Array.from(seen.values()).sort((a, b) => compare(a.id, b.id));
  const selected = candidates.map((contribution) => ({ contribution, access: accessLevel(fixture, request, contribution) })).filter((item) => item.access !== "none");
  const raw = selected.filter((item) => item.access === "raw").map((item) => item.contribution);
  const aggregate = selected.filter((item) => item.access === "aggregate").map((item) => item.contribution);
  const usable = [...raw, ...aggregate].sort((a, b) => compare(a.id, b.id));
  const selectedTrend = trend(usable);
  const contradictory = usable.some((item) => item.trend === "stable") && usable.some((item) => item.trend === "declining");
  const answer = usable.length === 0
    ? "Discovery does not yet have permission-safe evidence for this question."
    : contradictory
      ? `Available evidence is mixed across contexts: broader conditions appear stable while a bounded local decline remains material. ${usable.map((item) => item.sanitizedClaim).join(" ")}`
      : usable.map((item) => item.sanitizedClaim).join(" ");
  const lineage = usable.map((item) => ({
    contributionId: item.id,
    sourceContextIds: [...item.contextIds].sort(compare),
    derivationPaths: item.contextIds.map((contextId) => `${contextId}->${request.contextId}`).sort(compare),
  }));
  const categories = unique(usable.map((item) => item.category)).sort(compare);
  const confidence = usable.length === 0 ? 0 : Math.round((usable.reduce((sum, item) => sum + item.confidence, 0) / usable.length - (contradictory ? .12 : 0)) * 100) / 100;
  return {
    request,
    answer,
    confidence,
    trend: selectedTrend,
    safeEvidenceCategories: categories,
    missingIntelligence: missingFor(request, usable),
    suggestedCollection: missingFor(request, usable).map((item) => `Collect: ${item}`),
    visibleRawContributionIds: raw.map((item) => item.id).sort(compare),
    aggregateContributionIds: aggregate.map((item) => item.id).sort(compare),
    internalLineage: lineage,
    projectedLineage: categories.map((category) => ({ category, sourceCount: 1 })),
    contradictions: contradictory ? [{ localClaimId: usable.find((item) => item.trend === "declining")!.id, broaderClaimId: usable.find((item) => item.trend === "stable")!.id }] : [],
    rejectedContributionIds: candidates.filter((candidate) => !usable.some((item) => item.id === candidate.id)).map((item) => item.id).sort(compare),
  };
}

export function measureScopedComposition(fixture: BenchmarkFixture, request: BenchmarkRequest) {
  const answer = buildScopedIntelligenceAnswer(fixture, request);
  const rawDerivationPaths = answer.internalLineage.reduce((sum, item) => sum + item.derivationPaths.length, 0);
  return {
    answer,
    rawDerivationPaths,
    uniqueDerivations: answer.internalLineage.length,
    duplicateDerivationsRemoved: Math.max(0, rawDerivationPaths - answer.internalLineage.length),
  };
}
