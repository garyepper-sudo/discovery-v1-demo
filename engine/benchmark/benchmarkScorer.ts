import type {
  BenchmarkScore,
  DiscoveryBenchmarkCase,
} from "./benchmarkTypes";

type ActualBenchmarkOutput = {
  mechanisms?: string[];
  capabilities?: string[];
  compressedConcepts?: string[];
  executiveText?: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAny(actual: string[], expected: string[]): number {
  if (expected.length === 0) return 1;

  const normalizedActual = actual.map(normalize);

  const matched = expected.filter((item) => {
    const normalizedExpected = normalize(item);

    return normalizedActual.some(
      (actualItem) =>
        actualItem.includes(normalizedExpected) ||
        normalizedExpected.includes(actualItem),
    );
  });

  return matched.length / expected.length;
}

function avoidPenalty(actual: string[], avoid: string[] = []): number {
  if (avoid.length === 0) return 0;

  const normalizedActualText = actual.map(normalize).join(" ");

  const violations = avoid.filter((item) =>
    normalizedActualText.includes(normalize(item)),
  );

  return Math.min(0.35, violations.length * 0.12);
}

export function scoreBenchmark(
  benchmark: DiscoveryBenchmarkCase,
  actual: ActualBenchmarkOutput,
): BenchmarkScore {
  const mechanisms = actual.mechanisms ?? [];
  const capabilities = actual.capabilities ?? [];
  const compressedConcepts = actual.compressedConcepts ?? [];
  const executiveText = actual.executiveText ? [actual.executiveText] : [];

  const primaryMechanismScore = includesAny(
    mechanisms,
    benchmark.expected.primaryMechanisms,
  );

  const secondaryMechanismScore = includesAny(
    mechanisms,
    benchmark.expected.secondaryMechanisms ?? [],
  );

  const mechanismPenalty = avoidPenalty(
    [...mechanisms, ...executiveText],
    benchmark.expected.avoid,
  );

  const mechanismScore = Math.max(
    0,
    primaryMechanismScore * 0.7 + secondaryMechanismScore * 0.3 - mechanismPenalty,
  );

  const capabilityScore = includesAny(
    capabilities,
    benchmark.expected.affectedCapabilities ?? [],
  );

  const compressionScore = includesAny(
    compressedConcepts,
    benchmark.expected.compressedConcepts ?? [],
  );

  const executiveScore = Math.max(
    0,
    includesAny(executiveText, benchmark.expected.primaryMechanisms) -
      avoidPenalty(executiveText, benchmark.expected.avoid),
  );

  const score =
    mechanismScore * 0.45 +
    capabilityScore * 0.2 +
    compressionScore * 0.15 +
    executiveScore * 0.2;

  const notes: string[] = [];

  if (primaryMechanismScore < 1) {
    notes.push(
      `Primary mechanism missing or weak: expected ${benchmark.expected.primaryMechanisms.join(
        ", ",
      )}`,
    );
  }

  if (mechanismPenalty > 0) {
    notes.push("Avoid-list terms appeared in mechanism or executive output.");
  }

  if (executiveScore < 0.5) {
    notes.push("Executive assessment did not clearly center the expected mechanism.");
  }

  return {
    benchmarkId: benchmark.id,
    title: benchmark.title,
    score: Math.round(score * 100),
    passed: score >= 0.75,
    mechanismScore: Math.round(mechanismScore * 100),
    capabilityScore: Math.round(capabilityScore * 100),
    compressionScore: Math.round(compressionScore * 100),
    executiveScore: Math.round(executiveScore * 100),

    perceptionScore: 100,
    patternScore: Math.round(compressionScore * 100),
    mechanismInferenceScore: Math.round(mechanismScore * 100),
    executiveUnderstandingScore: Math.round(executiveScore * 100),

    notes,
  };
}