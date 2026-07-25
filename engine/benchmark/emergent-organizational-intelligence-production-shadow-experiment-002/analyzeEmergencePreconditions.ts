import type {
  GeneratedCognition,
  InferenceScenario,
  RegisteredOrganizationalPrediction,
  ScoringTruth,
} from "./types";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function words(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function average(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

function timestamp(value: unknown) {
  const parsed = typeof value === "string" ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function analyzeEmergencePreconditions(input: {
  scenarios: InferenceScenario[];
  cognitionByScenario: Map<string, GeneratedCognition>;
  combinedPredictions: RegisteredOrganizationalPrediction[];
  truth: ScoringTruth[];
}) {
  const truthById = new Map(input.truth.map((item) => [item.scenarioId, item]));
  const rows = input.scenarios.map((scenario) => {
    const cognition = input.cognitionByScenario.get(scenario.id)!;
    const prediction = input.combinedPredictions.find(
      (item) => item.scenarioId === scenario.id,
    )!;
    const counts = new Map<string, number>();
    for (const item of scenario.evidence) {
      counts.set(item.silo, (counts.get(item.silo) ?? 0) + 1);
    }
    const times = scenario.evidence
      .map((item) => timestamp(item.observedAt))
      .filter((item): item is number => item !== null);
    const uniqueContents = new Set(
      scenario.evidence.map((item) => item.content.toLowerCase()),
    ).size;
    const crossSilo = cognition.mechanisms.filter((item) => item.crossSilo);
    const lineageComplete = cognition.mechanisms.filter(
      (item) => item.evidenceIds.length > 0 && item.sourceIds.length > 0,
    ).length;
    return {
      scenarioId: scenario.id,
      evidenceCount: scenario.evidence.length,
      evidenceBySilo: Object.fromEntries([...counts].sort()),
      uniqueSources: new Set(scenario.evidence.map((item) => item.sourceId)).size,
      averageEvidenceWords: round(
        average(scenario.evidence.map((item) => words(item.content).length)),
      ),
      siloDiversity: counts.size,
      siloBalance: round(counts.size / scenario.evidence.length),
      largestSiloConcentration: round(
        Math.max(...counts.values()) / scenario.evidence.length,
      ),
      distinctFactRatio: round(uniqueContents / scenario.evidence.length),
      redundancyRatio: round(
        1 - uniqueContents / scenario.evidence.length,
      ),
      crossSiloRelationshipCount: crossSilo.length,
      connectedComponentsObserved: crossSilo.length ? 1 : counts.size,
      temporalSpanDays:
        times.length > 1
          ? round((Math.max(...times) - Math.min(...times)) / 86_400_000)
          : 0,
      meaningfulPeriods: new Set(
        scenario.evidence.map((item) => item.observedAt?.slice(0, 7)),
      ).size,
      delayedConsequencePresent:
        truthById.get(scenario.id)?.family === "delayed-consequence",
      contradictionCount: cognition.contradictions.length,
      mechanismCount: cognition.mechanisms.length,
      crossSiloMechanismCount: crossSilo.length,
      meanMechanismConfidence: round(
        average(cognition.mechanisms.map((item) => item.confidence)),
      ),
      maximumSupportingSilos: Math.max(
        0,
        ...cognition.mechanisms.map((item) => item.silos.length),
      ),
      alternativeMechanismCount: Math.max(0, cognition.mechanisms.length - 1),
      lineageCompleteness: round(
        lineageComplete / Math.max(1, cognition.mechanisms.length),
      ),
      unsupportedMechanismCount: cognition.mechanisms.length - lineageComplete,
      productionRegisteredMechanism: !prediction.abstained,
      expectedEmergence: truthById.get(scenario.id)?.emergentExpected ?? false,
    };
  });
  const successes = rows.filter(
    (item) => item.expectedEmergence && item.productionRegisteredMechanism,
  );
  const failures = rows.filter(
    (item) => item.expectedEmergence && !item.productionRegisteredMechanism,
  );
  const mean = (key: keyof (typeof rows)[number], values: typeof rows) =>
    round(
      average(
        values
          .map((item) => item[key])
          .filter((value): value is number => typeof value === "number"),
      ),
    );
  return {
    rows,
    groupedComparison: {
      successfulPositiveScenarios: successes.length,
      failedPositiveScenarios: failures.length,
      evidenceCount: {
        successMean: mean("evidenceCount", successes),
        failureMean: mean("evidenceCount", failures),
      },
      siloDiversity: {
        successMean: mean("siloDiversity", successes),
        failureMean: mean("siloDiversity", failures),
      },
      crossSiloMechanisms: {
        successMean: mean("crossSiloMechanismCount", successes),
        failureMean: mean("crossSiloMechanismCount", failures),
      },
    },
    candidateHypotheses: [
      "Raw Evidence volume is not sufficient without a generated relational Mechanism.",
      "Silo diversity is useful only when production lineage actually spans those silos.",
      "Temporal depth may matter specifically for delayed-consequence families.",
      "Contradictions may help only when production can connect them to a discriminating mechanism.",
      "Complete lineage is evidence of groundedness, not by itself evidence of correctness.",
      "Noise can reduce observability even when Evidence count increases.",
    ],
    caveat:
      "These descriptive comparisons are exploratory, non-causal, and too small to establish a universal threshold.",
  };
}
