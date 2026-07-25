import { validatePerformanceReport } from "./validatePerformanceReport.mjs";

const stateSymbols = {
  Improved: "▲",
  Regressed: "▼",
  Unchanged: "▬",
  "Not Measured": "?",
};

function keyed(items, key) {
  return new Map(items.map((item) => [item[key], item]));
}

export function comparePerformanceReports(options = {}) {
  const validation = validatePerformanceReport(options);
  const { manifest, predecessor } = validation;

  if (!predecessor) {
    return {
      ...validation,
      comparison: null,
    };
  }

  const previousScorecard = keyed(predecessor.scorecard, "metric");
  const previousArchitecture = keyed(predecessor.architecture, "area");

  const comparison = {
    predecessor: {
      reportId: predecessor.reportId,
      title: predecessor.title,
      reportVersion: predecessor.reportVersion,
      generationTimestamp: predecessor.generationTimestamp,
    },
    current: {
      reportId: manifest.reportId,
      title: manifest.title,
      reportVersion: manifest.reportVersion,
      generationTimestamp: manifest.generationTimestamp,
    },
    comparability: {
      compatible: true,
      schemaVersion: manifest.schemaVersion,
      cohort: manifest.trend.comparabilityCohort,
    },
    scorecard: manifest.scorecard.map((entry) => ({
      ...entry,
      symbol: stateSymbols[entry.state],
      predecessorState: previousScorecard.get(entry.metric)?.state ?? null,
    })),
    architecture: manifest.architecture.map((entry) => ({
      ...entry,
      symbol: stateSymbols[entry.state],
      predecessorState: previousArchitecture.get(entry.area)?.state ?? null,
    })),
    benchmarks: manifest.benchmarks.map((entry) => ({
      ...entry,
      symbol: stateSymbols[entry.movement],
    })),
    complexity: manifest.complexity,
    regressions: manifest.regressions,
    unknownsAndUnmeasured: manifest.unknownsAndUnmeasured,
    remainingRisks: manifest.remainingRisks,
    engineeringDecision: manifest.engineeringDecision,
  };

  return {
    ...validation,
    comparison,
  };
}
