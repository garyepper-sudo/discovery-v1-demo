import type { CandidateCausalMechanism, ScoringTruth } from "./types";

type Registered = {
  scenarioId: string;
  candidates: CandidateCausalMechanism[];
};

const termsMatch = (candidate: CandidateCausalMechanism, terms: string[]) => {
  const text = JSON.stringify(candidate).toLowerCase();
  return terms.length === 0 || terms.every((term) => text.includes(term.toLowerCase()));
};

export function scoreExperiment(registered: Registered[], truth: ScoringTruth[]) {
  const scoreStrategy = (strategy: CandidateCausalMechanism["strategy"]) => {
    let tp = 0, fp = 0, fn = 0, tn = 0;
    const perScenario = truth.map((expected) => {
      const candidates = registered.find((item) => item.scenarioId === expected.scenarioId)
        ?.candidates.filter((candidate) => candidate.strategy === strategy) ?? [];
      const qualified = candidates.some((candidate) =>
        candidate.classification === "qualified-causal-mechanism");
      const correct = candidates.some((candidate) => termsMatch(candidate, expected.expectedTerms));
      if (expected.shouldQualify && qualified && correct) tp += 1;
      else if (expected.shouldQualify) fn += 1;
      else if (qualified) fp += 1;
      else tn += 1;
      return { scenarioId: expected.scenarioId, qualified, correct };
    });
    return {
      precision: tp + fp ? tp / (tp + fp) : 0,
      recall: tp + fn ? tp / (tp + fn) : 0,
      falsePositives: fp,
      falseNegatives: fn,
      truePositives: tp,
      trueNegatives: tn,
      perScenario,
    };
  };
  return {
    production: scoreStrategy("production"),
    pairwise: scoreStrategy("pairwise"),
    alternativeAware: scoreStrategy("alternative-aware"),
    conservative: scoreStrategy("conservative"),
  };
}

export function fieldAvailability(candidates: CandidateCausalMechanism[]) {
  const conservative = candidates.filter((item) => item.strategy === "conservative");
  const fields = [
    "upstreamDrivers", "mediatingRelationships", "downstreamOutcomes",
    "activatingConditions", "persistenceConditions", "competingExplanations",
    "implications", "falsificationCriteria",
  ] as const;
  return Object.fromEntries(fields.map((field) => [
    field,
    {
      available: conservative.filter((candidate) => candidate[field].length > 0).length,
      unavailable: conservative.filter((candidate) => candidate[field].length === 0).length,
    },
  ]));
}
