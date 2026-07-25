import type { RegisteredShadow } from "./types";

export function scoreExperiment(items: RegisteredShadow[]) {
  const contracts = Object.keys(items[0]?.qualifications ?? {});
  return Object.fromEntries(
    contracts.map((contract) => {
      const tp = items.filter(
        (item) => item.scenario.kind === "positive" && item.qualifications[contract],
      ).length;
      const fp = items.filter(
        (item) => item.scenario.kind === "negative" && item.qualifications[contract],
      ).length;
      const fn = items.filter(
        (item) => item.scenario.kind === "positive" && !item.qualifications[contract],
      ).length;
      const tn = items.filter(
        (item) => item.scenario.kind === "negative" && !item.qualifications[contract],
      ).length;
      return [contract, {
        precision: tp / Math.max(1, tp + fp),
        recall: tp / Math.max(1, tp + fn),
        falsePositives: fp,
        falseNegatives: fn,
        abstentionQuality: tn / Math.max(1, tn + fp),
        eligible: tp + fp,
      }];
    }),
  );
}

export function fieldAvailability(items: RegisteredShadow[]) {
  const candidates = items.flatMap((item) =>
    item.candidates.filter((candidate) => candidate.strategy === "full-context"),
  );
  const statuses = [
    "explicit",
    "deterministically-derived",
    "supported-but-ambiguous",
  ];
  const fields = {
    upstreamDriver: candidates.map((item) => item.upstreamDriver),
    mediatingRelationships: candidates.flatMap((item) => item.mediatingRelationships),
    downstreamOutcomes: candidates.flatMap((item) => item.downstreamOutcomes),
    activatingConditions: candidates.flatMap((item) => item.activatingConditions),
    persistenceConditions: candidates.flatMap((item) => item.persistenceConditions),
    competingExplanations: candidates.flatMap((item) => item.competingExplanations),
    implications: candidates.flatMap((item) => item.implications),
    falsificationCriteria: candidates.flatMap((item) => item.falsificationCriteria),
  };
  return Object.fromEntries(
    Object.entries(fields).map(([name, values]) => [
      name,
      Object.fromEntries([
        ...statuses.map((status) => [
          status,
          values.filter((item) => item?.derivationStatus === status).length,
        ]),
        ["unavailable", Math.max(0, candidates.length - values.length)],
        ["unsupported", 0],
      ]),
    ]),
  );
}
