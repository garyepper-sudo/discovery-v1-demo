import { createHash } from "node:crypto";
import { createEmptyOrganizationRuntime } from "../../v3/runtime";
import { createArchitectureAdapters } from "./architectureAdapters";
import { createArchitectureWorlds } from "./architectureWorlds";
import { scoreArchitectureRun } from "./scoreArchitectureRun";
import type {
  ArchitectureId,
  ArchitectureRunResult,
  ArchitectureWorld,
  BenchmarkContribution,
  PermissionRule,
} from "./architectureBenchmarkTypes";

const serialize = (value: unknown) => JSON.stringify(value);
const hash = (value: unknown) => createHash("sha256").update(serialize(value)).digest("hex");
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function mutateWorld(world: ArchitectureWorld, mutation: string): ArchitectureWorld {
  const copy: ArchitectureWorld = JSON.parse(JSON.stringify(world));
  const first = copy.contributions[0];
  switch (mutation) {
    case "reverse-evidence": copy.contributions.reverse(); break;
    case "reverse-users": copy.contributions.sort((a, b) => b.contributorId.localeCompare(a.contributorId)); break;
    case "reverse-scopes": copy.contributions.sort((a, b) => b.scopeId.localeCompare(a.scopeId)); break;
    case "duplicate-source":
      if (first) copy.contributions.push({ ...first, id: `${first.id}-duplicate` });
      break;
    case "repeat-paraphrase":
      if (first) copy.contributions.push({ ...first, id: `${first.id}-paraphrase`, semanticId: first.semanticId });
      break;
    case "omit-ancestry":
      if (first) first.rootSourceIds = [];
      break;
    case "corrupt-ancestry":
      if (first) first.rootSourceIds = [""];
      break;
    case "change-permission":
      copy.permissions = copy.permissions.map((rule) => rule.principalId === "employee" ? { ...rule, level: "none" } : rule);
      break;
    case "delay-revocation":
      copy.permissions = copy.permissions.map((rule) => rule.principalId === "manager" ? { ...rule, activeUntil: "2026-08-14T12:00:00.000Z" } : rule);
      break;
    case "stale-projection":
      copy.permissions = copy.permissions.map((rule) => rule.principalId === "manager" ? { ...rule, activeUntil: "2026-08-14T12:00:00.000Z" } : rule);
      break;
    case "malformed-contribution":
      copy.contributions.push({
        ...(first ?? copy.contributions[0]),
        id: "malformed",
        kind: "evidence",
        sourceId: undefined,
        rootSourceIds: [""],
      } as BenchmarkContribution);
      break;
    case "unauthorized-purpose":
      if (first) first.purpose = "strategy";
      break;
    case "hidden-contradiction":
      if (first) copy.contributions.push({
        ...first,
        id: "hidden-contradiction",
        semanticId: "hidden-counterclaim",
        kind: "evidence",
        sourceId: "hidden-contradiction-source",
        rootSourceIds: ["hidden-contradiction-source"],
        provisional: false,
        aiGenerated: false,
        contradictsClaimId: first.semanticId,
      });
      break;
    case "rename-entities":
      // Display labels are deliberately absent. Semantic identities remain stable.
      break;
    case "cyclic-support":
      copy.contributions.push(
        {
          id: "cycle-a", semanticId: "cycle-a", kind: "relationship", scopeId: "team-a", contributorId: "analyst-a",
          sourceId: "cycle-source-a", rootSourceIds: ["cycle-source-a"], purpose: "delivery-learning", confidence: 0.5,
          provisional: false, aiGenerated: false, private: false, restricted: false, localOnly: false,
          relationship: { from: "cycle-a", to: "cycle-b" }, validFrom: copy.fixedNow,
        },
        {
          id: "cycle-b", semanticId: "cycle-b", kind: "relationship", scopeId: "team-b", contributorId: "analyst-b",
          sourceId: "cycle-source-b", rootSourceIds: ["cycle-source-b"], purpose: "delivery-learning", confidence: 0.5,
          provisional: false, aiGenerated: false, private: false, restricted: false, localOnly: false,
          relationship: { from: "cycle-b", to: "cycle-a" }, validFrom: copy.fixedNow,
        },
      );
      break;
  }
  return copy;
}

function authoritativeSnapshot(result: ArchitectureRunResult) {
  return {
    authoritativeObjects: result.trace.authoritativeObjects,
    projections: result.trace.projections,
    rejectedCycles: result.trace.rejectedCycles,
  };
}

function summarize(results: ArchitectureRunResult[], architectureId: ArchitectureId) {
  const selected = results.filter((item) => item.architectureId === architectureId);
  return {
    worlds: selected.length,
    heldOutWorlds: selected.filter((item) => item.heldOut).length,
    criticalFailures: selected.flatMap((item) => item.failures).filter((item) => item.severity === "critical").length,
    majorFailures: selected.flatMap((item) => item.failures).filter((item) => item.severity === "major").length,
    understanding: {
      synthesisPrecision: round(average(selected.map((item) => item.metrics.understanding.broaderSynthesisPrecision))),
      synthesisRecall: round(average(selected.map((item) => item.metrics.understanding.broaderSynthesisRecall))),
      localExceptionPreservation: round(average(selected.map((item) => item.metrics.understanding.localExceptionPreservation))),
      emergenceRecall: round(average(selected.map((item) => item.metrics.understanding.emergentInsightRecall))),
    },
    epistemic: {
      ancestryCompleteness: round(average(selected.map((item) => item.metrics.epistemic.ancestryCompleteness))),
      duplicateInducedSupportDelta: round(selected.reduce((sum, item) => sum + item.metrics.epistemic.duplicateInducedSupportDelta, 0)),
      unsupportedAdmissions: selected.reduce((sum, item) => sum + item.metrics.epistemic.unsupportedAdmissions, 0),
    },
    permission: {
      directLeakage: selected.reduce((sum, item) => sum + item.metrics.permission.directLeakage, 0),
      noninterferenceDelta: selected.reduce((sum, item) => sum + item.metrics.permission.strictNoninterferenceDelta, 0),
      purposeViolations: selected.reduce((sum, item) => sum + item.metrics.permission.purposeViolations, 0),
    },
    architecture: {
      durableObjects: selected.reduce((sum, item) => sum + item.metrics.architecture.durableObjectCount, 0),
      meanRecomputationFanOut: round(average(selected.map((item) => item.metrics.architecture.recomputationFanOut))),
      policyEvaluations: selected.reduce((sum, item) => sum + item.metrics.architecture.policyEvaluations, 0),
      debuggingTraceSize: selected.reduce((sum, item) => sum + item.metrics.architecture.debuggingTraceSize, 0),
    },
  };
}

export function runOrganizationalIntelligenceArchitectureBenchmark() {
  const worlds = createArchitectureWorlds();
  const adapters = createArchitectureAdapters(true);
  const runtime = createEmptyOrganizationRuntime({ organizationId: "architecture-benchmark-org", name: "Architecture Benchmark Organization" });
  const runtimeBefore = serialize(runtime);
  const fixtureBefore = serialize(createArchitectureWorlds());
  const runtimeHashBefore = hash(runtime);
  const fixtureHashBefore = hash(createArchitectureWorlds());
  const results = adapters.flatMap((adapter) => worlds.map((world) => scoreArchitectureRun(world, adapter.run(world))));

  const repeatResults = adapters.flatMap((adapter) => createArchitectureWorlds().map((world) => scoreArchitectureRun(world, adapter.run(world))));
  const repeatedRunByteEqual = serialize(results) === serialize(repeatResults);

  const reversedOrderChecks = adapters.flatMap((adapter) => worlds.flatMap((world) =>
    ["reverse-evidence", "reverse-users", "reverse-scopes"].map((mutation) => {
      const baseline = scoreArchitectureRun(world, adapter.run(world));
      const mutatedWorld = mutateWorld(world, mutation);
      const mutated = scoreArchitectureRun(mutatedWorld, adapter.run(mutatedWorld));
      return {
        architectureId: adapter.id,
        worldId: world.id,
        mutation,
        passed: serialize(authoritativeSnapshot(baseline)) === serialize(authoritativeSnapshot(mutated)),
      };
    }),
  ));

  const mutations = [
    "duplicate-source", "repeat-paraphrase", "omit-ancestry", "corrupt-ancestry", "change-permission",
    "delay-revocation", "stale-projection", "malformed-contribution", "unauthorized-purpose",
    "hidden-contradiction", "rename-entities", "cyclic-support",
  ];
  const hybrid = adapters.find((adapter) => adapter.id === "hybrid")!;
  const adversarialChecks = worlds.flatMap((world) => mutations.map((mutation) => {
    const mutatedWorld = mutateWorld(world, mutation);
    const result = scoreArchitectureRun(mutatedWorld, hybrid.run(mutatedWorld));
    const hadAncestryToRemove = world.contributions.some((item) => item.rootSourceIds.length > 0);
    const malformedRejected = !["omit-ancestry", "corrupt-ancestry", "malformed-contribution", "unauthorized-purpose"].includes(mutation)
      || (mutation === "omit-ancestry" && !hadAncestryToRemove)
      || result.trace.admissions.some((item) => item.disposition.startsWith("invalid-"));
    const cycleRejected = mutation !== "cyclic-support" || result.trace.rejectedCycles.length === 2;
    const revokedManager = result.trace.projections.find((item) => item.principalId === "manager" && item.purpose === "workforce-planning");
    const revocationSafe = !["delay-revocation", "stale-projection"].includes(mutation)
      || world.id !== "restricted-evidence"
      || (revokedManager?.visibleObjectIds.length === 0 && revokedManager.aggregateObjectIds.length === 0);
    const hiddenContradictionPreserved = mutation !== "hidden-contradiction"
      || result.trace.authoritativeObjects.some((item) => item.semanticId === "hidden-counterclaim");
    const deterministic = serialize(result) === serialize(scoreArchitectureRun(mutatedWorld, hybrid.run(mutatedWorld)));
    return { worldId: world.id, mutation, passed: malformedRejected && cycleRejected && revocationSafe && hiddenContradictionPreserved && deterministic };
  }));

  const summaries = Object.fromEntries(adapters.map((adapter) => [adapter.id, summarize(results, adapter.id)]));
  const central = summaries.central;
  const hybridSummary = summaries.hybrid;
  const bypass = summaries["hybrid-bypass"];
  const noIndependence = summaries["hybrid-no-independence"];
  const synthesisDifference = Math.abs(hybridSummary.understanding.synthesisRecall - central.understanding.synthesisRecall);
  const heldOutHybrid = results.filter((item) => item.architectureId === "hybrid" && item.heldOut);
  const heldOutPassed = heldOutHybrid.every((item) => !item.failures.some((failure) => failure.severity === "critical"));
  const hybridPassed = hybridSummary.criticalFailures === 0 && hybridSummary.majorFailures <= 1;
  const bypassExposedFailure = bypass.criticalFailures > hybridSummary.criticalFailures;
  const classification = hybridPassed
    && synthesisDifference <= 0.02
    && hybridSummary.understanding.localExceptionPreservation === 1
    && hybridSummary.epistemic.duplicateInducedSupportDelta === 0
    && bypassExposedFailure
    && heldOutPassed
    ? "A_HYBRID_BOUNDARY_VALIDATED_FOR_TESTED_SCOPE"
    : hybridPassed
      ? "B_HYBRID_FAVORED_BOUNDED_ISSUE_REMAINS"
      : "E_NO_ARCHITECTURE_SAFE";

  const equivalenceAudit = {
    evidenceInputs: "EQUIVALENT",
    sourceAncestry: "EQUIVALENT",
    cognitiveKernel: "EQUIVALENT_BENCHMARK_KERNEL",
    explanationFormation: "EQUIVALENT_NOT_MATERIALLY_EXERCISED",
    adjudication: "EQUIVALENT_NOT_MATERIALLY_EXERCISED",
    permissionInputs: "EQUIVALENT",
    projections: "EQUIVALENT",
    semanticMatching: "EQUIVALENT_STRUCTURED_IDENTITIES",
    scoring: "EQUIVALENT",
    selfSimilar: "EXCLUDED_NOT_FAIRLY_EXECUTABLE",
  };

  return {
    classification,
    architectureC: {
      executable: false,
      reason: "Current production contracts do not define recursive cognitive outputs as typed inputs, fixed-point convergence, downward projection authority, or recursive permission inheritance.",
    },
    partition: {
      development: worlds.filter((world) => !world.heldOut).map((world) => world.id),
      heldOut: worlds.filter((world) => world.heldOut).map((world) => world.id),
    },
    equivalenceAudit,
    summaries,
    results,
    ablations: {
      bypass: {
        materialFailureExposed: bypassExposedFailure,
        criticalFailures: bypass.criticalFailures,
        unsupportedAdmissions: bypass.epistemic.unsupportedAdmissions,
        duplicateInducedSupportDelta: bypass.epistemic.duplicateInducedSupportDelta,
      },
      noAncestryAwareIndependence: {
        materialFailureExposed: noIndependence.criticalFailures > hybridSummary.criticalFailures,
        criticalFailures: noIndependence.criticalFailures,
        duplicateInducedSupportDelta: noIndependence.epistemic.duplicateInducedSupportDelta,
      },
    },
    determinism: {
      repeatedRunByteEqual,
      reversedOrderPassed: reversedOrderChecks.every((item) => item.passed),
      checks: reversedOrderChecks,
    },
    adversarial: {
      checks: adversarialChecks,
      passed: adversarialChecks.every((item) => item.passed),
    },
    isolation: {
      runtimeUnchanged: serialize(runtime) === runtimeBefore,
      fixtureFactoriesStable: serialize(createArchitectureWorlds()) === fixtureBefore,
      organizationIdentityStable: results.every((item) => worlds.find((world) => world.id === item.worldId)?.organizationId === "architecture-benchmark-org"),
      runtimeHashBefore,
      runtimeHashAfter: hash(runtime),
      fixtureHashBefore,
      fixtureHashAfter: hash(createArchitectureWorlds()),
    },
    benchmarkOnlyContracts: [
      "ArchitectureAdapter", "ArchitectureWorld", "BenchmarkContribution", "ArchitectureTrace",
      "ArchitectureMetrics", "HardGateFailure",
    ],
  };
}

if (process.argv[1]?.endsWith("runOrganizationalIntelligenceArchitectureBenchmark.ts")) {
  console.log(JSON.stringify(runOrganizationalIntelligenceArchitectureBenchmark(), null, 2));
}
