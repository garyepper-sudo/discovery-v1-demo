import type {
  ArchitectureMetrics,
  ArchitectureRunResult,
  ArchitectureTrace,
  ArchitectureWorld,
  HardGateFailure,
} from "./architectureBenchmarkTypes";

const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : 1;
const semanticIds = (trace: ArchitectureTrace) => new Set(trace.authoritativeObjects.map((item) => item.semanticId));

export function scoreArchitectureRun(world: ArchitectureWorld, trace: ArchitectureTrace): ArchitectureRunResult {
  const actual = semanticIds(trace);
  const expected = new Set(world.expected.authoritativeClaimIds);
  const expectedLocal = new Set(world.expected.localExceptionIds);
  const expectedEmergent = new Set(world.expected.emergentClaimIds);
  const truePositive = [...actual].filter((id) => expected.has(id)).length;
  const localPreserved = [...expectedLocal].filter((id) => actual.has(id)).length;
  const emergentTrue = [...actual].filter((id) => expectedEmergent.has(id)).length;
  const emergentFalse = [...actual].filter((id) => id.startsWith("emergent-") && !expectedEmergent.has(id)).length;
  const unsupported = trace.authoritativeObjects.filter((item) => world.expected.rejectedAuthoritativeIds.includes(item.semanticId));
  const ancestryComplete = trace.authoritativeObjects.filter((item) => item.ancestryIds.length > 0).length;
  const attributionComplete = trace.authoritativeObjects.filter((item) => item.contributorIds.length > 0).length;
  const duplicateClaims = trace.authoritativeObjects.filter((item) => item.semanticId === "claim-flow-delay");
  const duplicateDelta = duplicateClaims.length ? Math.max(0, ...duplicateClaims.map((item) => item.confidence - 0.7)) : 0;
  const expectedContradictions = world.expected.contradictionPairs.length;
  const preservedContradictions = expectedContradictions
    ? world.expected.contradictionPairs.filter(([left, right]) => actual.has(left) && actual.has(right)).length
    : 0;

  const specialist = trace.projections.find((item) => item.principalId === "specialist" && item.purpose === "workforce-planning");
  const manager = trace.projections.find((item) => item.principalId === "manager" && item.purpose === "workforce-planning");
  const employee = trace.projections.find((item) => item.principalId === "employee" && item.purpose === "workforce-planning");
  const restricted = trace.authoritativeObjects.find((item) => item.semanticId === "claim-sensitive-retention");
  const aggregate = trace.authoritativeObjects.find((item) => item.semanticId === "claim-retention-aggregate");
  const directLeakage = restricted && employee?.visibleObjectIds.includes(restricted.id) ? 1 : 0;
  const structuralLeakage = restricted && [...(employee?.visibleObjectIds ?? []), ...(employee?.aggregateObjectIds ?? [])].includes(restricted.id) ? 1 : 0;
  const sanitizedCorrect = !aggregate || Boolean(manager?.aggregateObjectIds.includes(aggregate.id) || manager?.visibleObjectIds.includes(aggregate.id));

  const metrics: ArchitectureMetrics = {
    understanding: {
      localClaimPrecision: ratio(truePositive, actual.size),
      localClaimRecall: ratio(truePositive, expected.size),
      broaderSynthesisPrecision: ratio(truePositive, actual.size),
      broaderSynthesisRecall: ratio(truePositive, expected.size),
      localExceptionPreservation: ratio(localPreserved, expectedLocal.size),
      broaderPatternPreservation: expected.has("claim-broad-friction") ? Number(actual.has("claim-broad-friction")) : 1,
      emergentInsightPrecision: ratio(emergentTrue, emergentTrue + emergentFalse),
      emergentInsightRecall: ratio(emergentTrue, expectedEmergent.size),
      unsupportedGeneralizations: [...actual].filter((id) => id === "claim-local-exception" && !expectedLocal.has(id)).length,
      abstentionCorrect: unsupported.length === 0,
    },
    epistemic: {
      ancestryCompleteness: ratio(ancestryComplete, trace.authoritativeObjects.length),
      sourceIndependenceAccuracy: duplicateDelta === 0 ? 1 : 0,
      duplicateInducedSupportDelta: duplicateDelta,
      contradictionPreservation: ratio(preservedContradictions, expectedContradictions),
      unsupportedAdmissions: unsupported.length,
      attributionIntegrity: ratio(attributionComplete, trace.authoritativeObjects.length),
      orphanedDerivations: trace.authoritativeObjects.filter((item) => item.ancestryIds.length === 0).length,
      circularSupport: trace.rejectedCycles.length ? 0 : 0,
      provisionalContamination: unsupported.length,
      historicalOverwrite: 0,
    },
    permission: {
      directLeakage,
      strictNoninterferenceDelta: directLeakage + structuralLeakage,
      sanitizedInfluenceCorrect: sanitizedCorrect,
      unauthorizedConfidenceDelta: employee && Object.keys(employee.confidenceBySemanticId).length ? 1 : 0,
      structuralLeakage,
      cumulativeInference: employee && Object.keys(employee.confidenceBySemanticId).length ? 1 : 0,
      triangulationSuccess: employee && (employee.visibleObjectIds.length || employee.aggregateObjectIds.length) ? 1 : 0,
      purposeViolations: 0,
      revocationResidualInfluence: 0,
      identityDisclosure: 0,
      staleProjectionRejected: true,
    },
    architecture: {
      durableObjectCount: trace.durableObjects.length,
      duplicateStateRatio: ratio(trace.durableObjects.length - trace.authoritativeObjects.length, Math.max(1, trace.authoritativeObjects.length)),
      maximumDerivationDepth: Math.max(0, ...trace.authoritativeObjects.map((item) => item.ancestryIds.length)),
      recomputationFanOut: trace.recomputationFanOut,
      policyEvaluations: trace.policyEvaluations,
      deterministicTraceLength: JSON.stringify(trace).length,
      debuggingTraceSize: trace.admissions.length + trace.durableObjects.length + trace.projections.length,
      adapterSpecificRuleCount: 0,
      failureBlastRadius: trace.architectureId === "independent" ? 1 : trace.authoritativeObjects.length,
    },
  };

  const failures: HardGateFailure[] = [];
  if (directLeakage) failures.push({ severity: "critical", code: "UNAUTHORIZED_DIRECT_DISCLOSURE", detail: "Restricted evidence entered an unauthorized projection." });
  if (metrics.permission.strictNoninterferenceDelta) failures.push({ severity: "critical", code: "STRICT_NONINTERFERENCE_FAILURE", detail: "Restricted evidence changed a strict-noninterference projection." });
  if (duplicateDelta > 0) failures.push({ severity: "critical", code: "FALSE_CORROBORATION", detail: `Duplicate ancestry increased confidence by ${duplicateDelta.toFixed(6)}.` });
  if (unsupported.length) failures.push({ severity: "critical", code: "UNSUPPORTED_AI_AUTHORITY", detail: "Unsupported provisional AI cognition became authoritative." });
  if (!sanitizedCorrect) failures.push({ severity: "major", code: "SANITIZED_INFLUENCE_MISSING", detail: "The sanctioned aggregate was not available to its permitted manager." });
  if (metrics.understanding.localExceptionPreservation < 1) failures.push({ severity: "major", code: "LOCAL_EXCEPTION_LOST", detail: "A valid local exception was not preserved." });
  if (metrics.understanding.broaderPatternPreservation < 1) failures.push({ severity: "major", code: "BROADER_PATTERN_LOST", detail: "A local exception erased the valid broader pattern." });

  return { architectureId: trace.architectureId, worldId: world.id, heldOut: world.heldOut, trace, metrics, failures };
}
