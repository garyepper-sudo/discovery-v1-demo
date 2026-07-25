import type { ConfigurationResult, RelationalMetrics } from "./types";

const keys: Array<keyof RelationalMetrics> = [
  "evidenceCount",
  "siloCount",
  "characterVolume",
  "complementarityRatio",
  "connectedComponents",
  "largestComponentRatio",
  "crossSiloEdgeCount",
  "crossSiloEdgeDensity",
  "articulationPointCount",
  "maximumCausalDepth",
  "contradictionCount",
  "mechanismCount",
  "qualifyingMechanismCount",
  "maximumSupportingSilos",
  "mechanismConfidence",
  "lineageCompleteness",
];

function bestRule(rows: ConfigurationResult[], key: keyof RelationalMetrics) {
  const values = [...new Set(rows.map((item) => item.metrics[key]))].sort(
    (a, b) => a - b,
  );
  return values
    .flatMap((threshold) =>
      ([true, false] as const).map((greater) => {
        const correct = rows.filter((item) => {
          const predicted = greater
            ? item.metrics[key] >= threshold
            : item.metrics[key] <= threshold;
          return predicted === item.score.emerged;
        }).length;
        return {
          key,
          threshold,
          direction: greater ? ">=" : "<=",
          accuracy: correct / Math.max(1, rows.length),
        };
      }),
    )
    .sort(
      (a, b) =>
        b.accuracy - a.accuracy ||
        a.threshold - b.threshold ||
        a.direction.localeCompare(b.direction),
    )[0];
}

export function analyzeThresholdPredictors(results: ConfigurationResult[]) {
  const rules = keys
    .map((key) => bestRule(results, key))
    .sort((a, b) => b.accuracy - a.accuracy || a.key.localeCompare(b.key));
  const families = [...new Set(results.map((item) => item.configuration.familyId))];
  const leaveOneFamilyOut = families.map((familyId) => {
    const training = results.filter(
      (item) => item.configuration.familyId !== familyId,
    );
    const heldOut = results.filter(
      (item) => item.configuration.familyId === familyId,
    );
    const rule = keys
      .map((key) => bestRule(training, key))
      .sort((a, b) => b.accuracy - a.accuracy || a.key.localeCompare(b.key))[0];
    const correct = heldOut.filter((item) => {
      const predicted =
        rule.direction === ">="
          ? item.metrics[rule.key] >= rule.threshold
          : item.metrics[rule.key] <= rule.threshold;
      return predicted === item.score.emerged;
    }).length;
    return {
      heldOutFamily: familyId,
      selectedRule: rule,
      heldOutAccuracy: correct / Math.max(1, heldOut.length),
    };
  });
  return {
    rankedSingleMetricRules: rules,
    leaveOneFamilyOut,
    warning:
      "Rules are descriptive one-dimensional threshold scans. Class imbalance and production failures can make abstention-predicting rules look accurate.",
  };
}
