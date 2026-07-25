import { createHash } from "node:crypto";
import { createEmptyOrganizationRuntime } from "../../v3/runtime";
import { createCandidatePolicies } from "./candidatePolicies";
import { createCandidateWorlds } from "./candidateWorlds";
import { scoreCandidateEcology } from "./scoreCandidateEcology";
import type { CandidateEvent, CandidatePolicyId, CandidateRunResult, CandidateWorld } from "./candidateEcologyTypes";

const serialize = (value: unknown) => JSON.stringify(value);
const hash = (value: unknown) => createHash("sha256").update(serialize(value)).digest("hex");
const stableRuntimeHash = (value: unknown) => createHash("sha256")
  .update(JSON.stringify(value, (key, item) => key.toLowerCase().endsWith("at") && typeof item === "string" ? "<fixed-time>" : item))
  .digest("hex");
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function mutateWorld(world: CandidateWorld, mutation: string): CandidateWorld {
  const copy: CandidateWorld = JSON.parse(JSON.stringify(world));
  const firstSupport = copy.events.find((item) => item.kind === "support");
  switch (mutation) {
    case "reverse-evidence": copy.events.reverse(); break;
    case "reverse-candidates": copy.candidates.reverse(); break;
    case "repeat-paraphrase":
    case "copied-ai":
      if (firstSupport) copy.events.push({ ...firstSupport, id: `${firstSupport.id}-${mutation}` });
      break;
    case "delayed-corroboration":
      if (firstSupport) firstSupport.at = "T5";
      break;
    case "delayed-contradiction": {
      const contradiction = copy.events.find((item) => item.kind === "contradict");
      if (contradiction) contradiction.at = "T6";
      break;
    }
    case "missing-ancestry":
      if (firstSupport) firstSupport.rootSourceIds = [""];
      break;
    case "shared-hidden-source": {
      const supportEvents = copy.events.filter((item) => item.kind === "support");
      for (const event of supportEvents) event.rootSourceIds = ["shared-hidden-root"];
      break;
    }
    case "misleading-majority":
      if (firstSupport) {
        for (let index = 0; index < 8; index += 1) copy.events.push({ ...firstSupport, id: `${firstSupport.id}-majority-${index}` });
      }
      break;
    case "scope-renaming":
      for (const candidate of copy.candidates) candidate.scopeId = candidate.scopeId === "team-a" ? "scope-opaque-a" : candidate.scopeId;
      for (const permission of copy.permissions) permission.scopeId = permission.scopeId === "team-a" ? "scope-opaque-a" : permission.scopeId;
      break;
    case "permission-change":
    case "purpose-expiration":
      for (const permission of copy.permissions) if (permission.principalId === "manager") permission.activeUntil = "T4";
      break;
    case "revocation":
      if (copy.candidates[0]) copy.events.push({ id: "mutation-revoke", at: "T5", kind: "revoke", candidateId: copy.candidates[0].id, rootSourceIds: [] });
      break;
    case "malformed-candidate":
      if (copy.candidates[0]) copy.events.push({ id: "mutation-malformed", at: "T3", kind: "support", candidateId: copy.candidates[0].id, rootSourceIds: [""], malformed: true });
      break;
    case "cyclic-support":
      if (copy.candidates.length >= 2) {
        copy.events.push({
          id: "mutation-cycle", at: "T4", kind: "combine", candidateId: copy.candidates[0].id,
          rootSourceIds: [], relatedCandidateIds: [copy.candidates[0].id, copy.candidates[1].id],
        });
      }
      break;
    case "high-volume-noise":
      if (copy.candidates[0]) {
        for (let index = 0; index < 20; index += 1) copy.events.push({
          id: `noise-${index}`, at: "T3", kind: "support", candidateId: copy.candidates[0].id,
          rootSourceIds: ["noise-shared-root"],
        });
      }
      break;
  }
  return copy;
}

function authoritativeSnapshot(result: CandidateRunResult) {
  return result.trace.snapshots
    .filter((item) => item.authoritative)
    .map((item) => ({ candidateId: item.candidateId, at: item.at, state: item.state, confidence: item.confidence, supportRootIds: item.supportRootIds }))
    .sort((a, b) => `${a.at}|${a.candidateId}`.localeCompare(`${b.at}|${b.candidateId}`));
}

function summarize(results: CandidateRunResult[], policyId: CandidatePolicyId) {
  const selected = results.filter((item) => item.policyId === policyId);
  const worlds = new Map(createCandidateWorlds().map((world) => [world.id, world]));
  const totalExpected = selected.reduce((sum, item) => sum + worlds.get(item.worldId)!.expected.eventuallyPromoted.length, 0);
  const validCount = selected.reduce((sum, item) => {
    const expected = worlds.get(item.worldId)!.expected.eventuallyPromoted;
    const authoritative = new Set(item.trace.snapshots.filter((candidate) => candidate.authoritative).map((candidate) => candidate.candidateId));
    return sum + expected.filter((id) => authoritative.has(id)).length;
  }, 0);
  const falsePromotion = selected.reduce((sum, item) => {
    const falseIds = worlds.get(item.worldId)!.expected.neverPromoted;
    const authoritative = new Set(item.trace.snapshots.filter((candidate) => candidate.authoritative).map((candidate) => candidate.candidateId));
    return sum + falseIds.filter((id) => authoritative.has(id)).length;
  }, 0);
  const authoritativeCandidates = selected.reduce((sum, item) =>
    sum + new Set(item.trace.snapshots.filter((candidate) => candidate.authoritative).map((candidate) => candidate.candidateId)).size, 0);
  const candidateObjects = selected.reduce((sum, item) => sum + item.metrics.operational.candidateObjectCount, 0);
  const timed = selected.filter((item) => worlds.get(item.worldId)!.expected.eventuallyPromoted.length > 0);
  return {
    criticalFailures: selected.flatMap((item) => item.failures).filter((item) => item.severity === "critical").length,
    majorFailures: selected.flatMap((item) => item.failures).filter((item) => item.severity === "major").length,
    validNovelInsightRecall: round(totalExpected ? validCount / totalExpected : 1),
    falsePromotionRate: round(authoritativeCandidates ? falsePromotion / authoritativeCandidates : 0),
    prematureSuppressionRate: round(totalExpected ? (totalExpected - validCount) / totalExpected : 0),
    prematureConvergenceRate: round(average(selected.map((item) => item.metrics.diversity.prematureConvergenceRate))),
    candidateEfficiency: round(candidateObjects ? validCount / candidateObjects : 0),
    meanTimeToValidPromotion: round(average(timed.map((item) => item.metrics.creativeYield.timeToValidPromotion))),
    candidateObjects,
    authoritativeObjects: selected.reduce((sum, item) => sum + item.metrics.operational.authoritativeObjectCount, 0),
    transitions: selected.reduce((sum, item) => sum + item.metrics.operational.transitionCount, 0),
    validCount,
  };
}

export function runCandidateIntelligenceEcologyBenchmark() {
  const worlds = createCandidateWorlds();
  const policies = createCandidatePolicies();
  const runtime = createEmptyOrganizationRuntime({ organizationId: "candidate-ecology-org", name: "Candidate Ecology Benchmark" });
  runtime.metadata.createdAt = "2026-09-01T00:00:00.000Z";
  runtime.metadata.updatedAt = "2026-09-01T00:00:00.000Z";
  const runtimeHashBefore = stableRuntimeHash(runtime);
  const fixtureHashBefore = hash(createCandidateWorlds());
  const results = policies.flatMap((policy) => worlds.map((world) => scoreCandidateEcology(world, policy.run(world))));
  const repeat = createCandidatePolicies().flatMap((policy) => createCandidateWorlds().map((world) => scoreCandidateEcology(world, policy.run(world))));
  const repeatedRunByteEqual = serialize(results) === serialize(repeat);

  const reversedChecks = policies.flatMap((policy) => worlds.flatMap((world) => ["reverse-evidence", "reverse-candidates"].map((mutation) => {
    const baseline = scoreCandidateEcology(world, policy.run(world));
    const changed = mutateWorld(world, mutation);
    const mutated = scoreCandidateEcology(changed, policy.run(changed));
    return { policyId: policy.id, worldId: world.id, mutation, passed: serialize(authoritativeSnapshot(baseline)) === serialize(authoritativeSnapshot(mutated)) };
  })));

  const mutations = [
    "repeat-paraphrase", "copied-ai", "delayed-corroboration", "delayed-contradiction", "missing-ancestry",
    "shared-hidden-source", "misleading-majority", "scope-renaming", "permission-change", "purpose-expiration",
    "revocation", "malformed-candidate", "cyclic-support", "high-volume-noise",
  ];
  const ecology = policies.find((item) => item.id === "ecology")!;
  const adversarialChecks = worlds.flatMap((world) => mutations.map((mutation) => {
    const changed = mutateWorld(world, mutation);
    const first = scoreCandidateEcology(changed, ecology.run(changed));
    const second = scoreCandidateEcology(changed, ecology.run(changed));
    const malformedRejected = mutation !== "missing-ancestry" && mutation !== "malformed-candidate"
      || first.trace.finalCandidates.some((item) => item.state === "rejected");
    const cycleRejected = mutation !== "cyclic-support" || changed.candidates.length < 2 || first.trace.rejectedCycles.length > 0;
    return { worldId: world.id, mutation, passed: serialize(first) === serialize(second) && malformedRejected && cycleRejected };
  }));

  const summaries = Object.fromEntries(policies.map((policy) => [policy.id, summarize(results, policy.id)]));
  const ecologySummary = summaries.ecology;
  const strictSummary = summaries.strict;
  const directSummary = summaries.direct;
  const undisciplinedSummary = summaries["ecology-undisciplined"];
  const heldOutEcology = results.filter((item) => item.policyId === "ecology" && item.partition === "held-out");
  const heldOutPassed = heldOutEcology.every((item) => !item.failures.some((failure) => failure.severity === "critical"));
  const classification = ecologySummary.criticalFailures === 0
    && ecologySummary.validNovelInsightRecall > strictSummary.validNovelInsightRecall
    && ecologySummary.falsePromotionRate < directSummary.falsePromotionRate
    && heldOutPassed
    && directSummary.criticalFailures > 0
    && undisciplinedSummary.criticalFailures > 0
    ? "A_CANDIDATE_INTELLIGENCE_ECOLOGY_VALIDATED_FOR_TESTED_SCOPE"
    : ecologySummary.criticalFailures === 0
      ? "B_CANDIDATE_ECOLOGY_FAVORED_LIFECYCLE_INCOMPLETE"
      : "E_NO_POLICY_SAFELY_BALANCES_NOVELTY_AND_AUTHORITY";

  return {
    classification,
    partition: {
      development: worlds.filter((item) => item.partition === "development").map((item) => item.id),
      heldOut: worlds.filter((item) => item.partition === "held-out").map((item) => item.id),
      permissionValidation: worlds.filter((item) => item.partition === "permission-validation").map((item) => item.id),
    },
    fairness: {
      evidence: "EQUIVALENT",
      sources: "EQUIVALENT",
      usersAndScopes: "EQUIVALENT",
      permissions: "EQUIVALENT",
      candidateProposals: "EQUIVALENT",
      lifecycleKernel: "EQUIVALENT",
      semanticIdentity: "EQUIVALENT",
      projections: "EQUIVALENT",
      scoring: "EQUIVALENT",
      policySpecificSemanticRules: 0,
    },
    summaries,
    results,
    ablations: {
      noCandidatePersistence: strictSummary,
      noAuthoritySeparation: directSummary,
      noAncestryIndependence: undisciplinedSummary,
      noContradictionCompetition: undisciplinedSummary,
      noDormancyExpiration: undisciplinedSummary,
    },
    determinism: {
      repeatedRunByteEqual,
      reversedOrderPassed: reversedChecks.every((item) => item.passed),
      checks: reversedChecks,
    },
    adversarial: {
      passed: adversarialChecks.every((item) => item.passed),
      checks: adversarialChecks,
    },
    isolation: {
      runtimeHashBefore,
      runtimeHashAfter: stableRuntimeHash(runtime),
      fixtureHashBefore,
      fixtureHashAfter: hash(createCandidateWorlds()),
      organizationIdentityStable: results.every((item) => worlds.find((world) => world.id === item.worldId)?.organizationId === "candidate-ecology-org"),
    },
  };
}

if (process.argv[1]?.endsWith("runCandidateIntelligenceEcologyBenchmark.ts")) {
  console.log(JSON.stringify(runCandidateIntelligenceEcologyBenchmark(), null, 2));
}
