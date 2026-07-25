import type { CandidateFailure, CandidateMetrics, CandidatePolicyTrace, CandidateRunResult, CandidateWorld } from "./candidateEcologyTypes";

const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : 1;
const rate = (numerator: number, denominator: number) => denominator ? numerator / denominator : 0;
const unique = <T>(values: T[]) => [...new Set(values)];

export function scoreCandidateEcology(world: CandidateWorld, trace: CandidatePolicyTrace): CandidateRunResult {
  const everAuthoritative = new Set(trace.snapshots.filter((item) => item.authoritative).map((item) => item.candidateId));
  const finallyAuthoritative = new Set(trace.finalCandidates.filter((item) => item.authoritative).map((item) => item.candidateId));
  const expectedValid = new Set(world.expected.eventuallyPromoted);
  const neverPromoted = new Set(world.expected.neverPromoted);
  const validPromoted = [...expectedValid].filter((id) => everAuthoritative.has(id));
  const falsePromoted = [...everAuthoritative].filter((id) => neverPromoted.has(id));
  const suppressed = [...expectedValid].filter((id) => !everAuthoritative.has(id));
  const expectedFinal = new Set(world.expected.correctFinalAuthority);
  const finalTrue = [...finallyAuthoritative].filter((id) => expectedFinal.has(id));
  const finalFalse = [...finallyAuthoritative].filter((id) => !expectedFinal.has(id));
  const candidatesById = new Map(world.candidates.map((item) => [item.id, item]));
  const snapshotsWithDuplicates = trace.snapshots.filter((item) => item.authoritative && item.supportRootIds.length > 0)
    .filter((item) => {
      const supportEvents = world.events.filter((event) => event.candidateId === item.candidateId && event.kind === "support" && ["T1", "T2", "T3", "T4", "T5", "T6"].indexOf(event.at) <= ["T1", "T2", "T3", "T4", "T5", "T6"].indexOf(item.at));
      return supportEvents.length > unique(supportEvents.flatMap((event) => event.rootSourceIds)).length;
    });
  const aiAuthoritative = trace.snapshots.filter((item) => item.authoritative && candidatesById.get(item.candidateId)?.aiGenerated).length;
  const localCorrect = world.expected.localExceptions.every((id) => trace.snapshots.some((item) => item.candidateId === id && item.authoritative && item.localOnly));
  const alternatives = world.expected.viableAlternatives;
  const prematureConvergence = alternatives.length > 1 && trace.snapshots.some((snapshot) => {
    const sameTime = trace.snapshots.filter((item) => item.at === snapshot.at && item.authoritative && alternatives.includes(item.candidateId));
    return sameTime.length === 1;
  }) ? 1 : 0;
  const emergence = world.expected.emergentCandidates.filter((id) => everAuthoritative.has(id));
  const ancestryComplete = trace.snapshots.filter((item) => item.authoritative).filter((item) => item.ancestryEventIds.length > 0).length;
  const authoritativeSnapshots = trace.snapshots.filter((item) => item.authoritative);
  const promotedSteps = validPromoted.map((id) => {
    const first = trace.snapshots.find((item) => item.candidateId === id && item.authoritative);
    return first ? ["T1", "T2", "T3", "T4", "T5", "T6"].indexOf(first.at) + 1 : 6;
  });
  const restricted = world.candidates.find((item) => item.restricted);
  const employeeProjections = trace.projections.filter((item) => item.principalId === "employee");
  const managerProjections = trace.projections.filter((item) => item.principalId === "manager");
  const specialistProjections = trace.projections.filter((item) => item.principalId === "specialist");
  const directDisclosure = restricted && employeeProjections.some((item) => item.visibleCandidateIds.includes(restricted.id)) ? 1 : 0;
  const indirectInfluence = restricted && employeeProjections.some((item) => item.aggregateCandidateIds.includes(restricted.id) || restricted.id in item.confidenceByCandidateId) ? 1 : 0;
  const sanitizedCorrect = !restricted || managerProjections.some((item) => item.aggregateCandidateIds.includes(restricted.id));
  const revokedClean = !restricted || specialistProjections.filter((item) => ["T5", "T6"].includes(item.at)).every((item) => !item.visibleCandidateIds.includes(restricted.id));

  const metrics: CandidateMetrics = {
    creativeYield: {
      validNovelInsightRecall: ratio(validPromoted.length, expectedValid.size),
      validCandidatesPromoted: validPromoted.length,
      emergentInsightsDiscovered: emergence.length,
      contrarianTruthsPreserved: world.id === "contrarian-correct" ? Number(everAuthoritative.has("candidate-w8-contrarian")) : 1,
      weakSignalsRecovered: world.id === "weak-later-validated" ? Number(everAuthoritative.has("candidate-w1")) : 1,
      timeToValidPromotion: promotedSteps.length ? promotedSteps.reduce((sum, value) => sum + value, 0) / promotedSteps.length : 6,
    },
    contamination: {
      falsePromotionRate: rate(falsePromoted.length, everAuthoritative.size),
      falseCandidatesPromoted: falsePromoted.length,
      duplicateInducedSupport: snapshotsWithDuplicates.length,
      aiHallucinationsAuthoritative: aiAuthoritative,
      prohibitedInfluence: directDisclosure + indirectInfluence,
    },
    diversity: {
      prematureSuppressionRate: rate(suppressed.length, expectedValid.size),
      prematureConvergenceRate: prematureConvergence,
      viableAlternativesPreserved: alternatives.filter((id) => trace.snapshots.some((item) => item.candidateId === id)).length,
      unresolvedCandidatesPreserved: world.id === "never-resolves" ? Number(trace.finalCandidates.some((item) => item.candidateId === "candidate-w7" && ["expired", "historically-retained", "requires-corroboration"].includes(item.state))) : 1,
      candidateRedundancy: trace.finalCandidates.length - unique(trace.finalCandidates.map((item) => item.semanticId)).length,
    },
    epistemic: {
      ancestryCompleteness: ratio(ancestryComplete, authoritativeSnapshots.length),
      independenceAccuracy: snapshotsWithDuplicates.length ? 0 : 1,
      contradictionPreservation: world.events.some((item) => item.kind === "contradict")
        ? Number(trace.snapshots.some((item) => item.contradictionRootIds.length > 0)) : 1,
      scopeAccuracy: Number(localCorrect),
      authorityStateAccuracy: ratio(finalTrue.length, expectedFinal.size) * ratio(finalTrue.length, finalTrue.length + finalFalse.length),
      historicalLineage: Number(trace.transitions.every((item) => Boolean(item.eventId && item.at))),
      abstentionCorrectness: ratio([...neverPromoted].filter((id) => !finallyAuthoritative.has(id)).length, neverPromoted.size),
    },
    permission: {
      directDisclosure,
      indirectInfluence,
      confidenceLeakage: indirectInfluence,
      sanitizedInfluenceCorrect: Number(sanitizedCorrect),
      strictNoninterferenceEqual: Number(!directDisclosure && !indirectInfluence),
      revocationResidualInfluence: Number(!revokedClean),
    },
    operational: {
      candidateObjectCount: trace.finalCandidates.length,
      authoritativeObjectCount: trace.finalCandidates.filter((item) => item.authoritative).length,
      duplicateRatio: ratio(trace.finalCandidates.length - unique(trace.finalCandidates.map((item) => item.semanticId)).length, trace.finalCandidates.length),
      recomputationFanOut: trace.recomputationFanOut,
      transitionCount: trace.transitions.length,
      dormantCandidateCount: trace.finalCandidates.filter((item) => ["expired", "historically-retained", "requires-corroboration", "contested"].includes(item.state)).length,
      debuggingTraceSize: trace.transitions.length + trace.snapshots.length + trace.projections.length,
      candidateEfficiency: ratio(validPromoted.length, trace.finalCandidates.length),
    },
  };

  const failures: CandidateFailure[] = [];
  if (directDisclosure) failures.push({ severity: "critical", code: "UNAUTHORIZED_DISCLOSURE", detail: "Restricted candidate was directly disclosed." });
  if (indirectInfluence) failures.push({ severity: "critical", code: "STRICT_NONINTERFERENCE_FAILURE", detail: "Restricted candidate influenced a prohibited projection." });
  if (snapshotsWithDuplicates.length) failures.push({ severity: "critical", code: "FALSE_CORROBORATION", detail: "Repeated ancestry affected authoritative support." });
  if (aiAuthoritative) failures.push({ severity: "critical", code: "UNSUPPORTED_AI_AUTHORITY", detail: "Unsupported AI cognition became authoritative." });
  if (!revokedClean) failures.push({ severity: "critical", code: "FAILED_REVOCATION", detail: "Revoked restricted cognition remained visible." });
  if (suppressed.length) failures.push({ severity: "major", code: "VALID_NOVELTY_SUPPRESSED", detail: `${suppressed.length} valid candidates never became authoritative.` });
  if (falsePromoted.length) failures.push({ severity: "major", code: "FALSE_CANDIDATE_PROMOTED", detail: `${falsePromoted.length} false or incomplete candidates became authoritative.` });
  if (!localCorrect) failures.push({ severity: "major", code: "LOCAL_EXCEPTION_LOST", detail: "The supported local exception was not preserved as local." });
  if (prematureConvergence) failures.push({ severity: "major", code: "PREMATURE_CONVERGENCE", detail: "A single leader emerged while multiple alternatives remained viable." });
  if (world.id === "never-resolves" && !metrics.diversity.unresolvedCandidatesPreserved) failures.push({ severity: "major", code: "UNRESOLVED_HISTORY_LOST", detail: "The unresolved candidate was neither retained nor archived." });

  return { policyId: trace.policyId, worldId: world.id, partition: world.partition, trace, metrics, failures };
}
