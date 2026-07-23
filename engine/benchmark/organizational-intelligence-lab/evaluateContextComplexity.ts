import { measureScopedComposition } from "./composeScopedIntelligence";
import type { BenchmarkFixture, BenchmarkRequest, ContextComplexityMeasurement } from "./organizationalIntelligenceLabTypes";

export function evaluateContextComplexity(fixture: BenchmarkFixture, request: BenchmarkRequest): ContextComplexityMeasurement {
  const measurement = measureScopedComposition(fixture, request);
  const depths = fixture.contexts.map((context) => context.parentIds.length + 1);
  return {
    contextCount: fixture.contexts.length,
    contributionCount: fixture.contributions.length,
    uniqueDerivations: measurement.uniqueDerivations,
    rawDerivationPaths: measurement.rawDerivationPaths,
    duplicateDerivationsRemoved: measurement.duplicateDerivationsRemoved,
    contradictionsPreserved: measurement.answer.contradictions.length,
    processingSteps: fixture.contributions.length + measurement.rawDerivationPaths + measurement.uniqueDerivations,
    maximumPathDepth: Math.max(...depths),
  };
}

export function evaluateComplexityGrowth(base: BenchmarkFixture, request: BenchmarkRequest) {
  const baseMeasurement = evaluateContextComplexity(base, request);
  const expanded: BenchmarkFixture = {
    ...base,
    contexts: [...base.contexts, ...base.contexts.map((item) => ({ ...item, id: `${item.id}-shadow`, parentIds: [] }))],
    contributions: [...base.contributions, ...base.contributions.map((item) => ({ ...item, id: `${item.id}-shadow`, contextIds: item.contextIds.map((id) => `${id}-shadow`), validScopeIds: item.validScopeIds.map((id) => `${id}-shadow`), generalizableToContextIds: item.generalizableToContextIds }))],
  };
  const expandedMeasurement = evaluateContextComplexity(expanded, request);
  return {
    base: baseMeasurement,
    expanded: expandedMeasurement,
    processingGrowth: expandedMeasurement.processingSteps / baseMeasurement.processingSteps,
    contextGrowth: expandedMeasurement.contextCount / baseMeasurement.contextCount,
    bounded: expandedMeasurement.processingSteps / baseMeasurement.processingSteps <= 2.5,
  };
}
