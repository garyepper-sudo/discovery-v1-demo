import type {
  BenchmarkCategory,
  JudgmentFailure,
  JudgmentFailureMemory,
  JudgmentLabRunResult,
} from "./contracts";

function stableHash(value: string): string {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildFailureMemory(params: {
  failures: JudgmentFailure[];
  run: JudgmentLabRunResult;
  benchmarkCategory: BenchmarkCategory;
  benchmarkCaseId: string;
}): JudgmentFailureMemory[] {
  return params.failures
    .filter((failure): failure is JudgmentFailure & { type: Exclude<JudgmentFailure["type"], "none"> } => failure.type !== "none")
    .map((failure) => {
      const identity = [params.benchmarkCaseId, params.run.organizationId, params.run.perspectiveId, failure.type, failure.likelyProducerArea ?? "unknown"].join("|");
      return {
        regressionId: `jl-${stableHash(identity)}`,
        failureType: failure.type,
        severity: failure.severity,
        producerBoundary: failure.likelyProducerArea ?? "Unknown producer boundary",
        benchmarkCategory: params.benchmarkCategory,
        benchmarkCaseId: params.benchmarkCaseId,
        organizationId: params.run.organizationId,
        perspectiveId: params.run.perspectiveId,
        supportingEvidence: [...failure.supportingEvidence],
      };
    })
    .sort((left, right) => left.regressionId.localeCompare(right.regressionId));
}
