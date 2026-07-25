import type { ConfigurationResult, FamilyId } from "./types";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function analyzePhaseTransition(results: ConfigurationResult[]) {
  const families = [...new Set(results.map((item) => item.configuration.familyId))];
  const byFamily = Object.fromEntries(
    families.map((familyId) => {
      const reveal = results
        .filter(
          (item) =>
            item.configuration.familyId === familyId &&
            item.configuration.kind === "reveal",
        )
        .sort((a, b) => a.configuration.stage - b.configuration.stage);
      const first = reveal.find((item) => item.score.emerged);
      const deltas = reveal.slice(1).map((item, index) => ({
        stage: item.configuration.stage,
        delta:
          item.score.passedCriteria - reveal[index].score.passedCriteria,
      }));
      const largest = deltas.sort((a, b) => b.delta - a.delta)[0];
      const connected = results.find(
        (item) =>
          item.configuration.familyId === familyId &&
          item.configuration.kind === "topology-connected",
      )!;
      const disconnected = results.find(
        (item) =>
          item.configuration.familyId === familyId &&
          item.configuration.kind === "topology-disconnected",
      )!;
      const bridge = results.find(
        (item) =>
          item.configuration.familyId === familyId &&
          item.configuration.kind === "bridge-removal",
      )!;
      const peripheral = results.find(
        (item) =>
          item.configuration.familyId === familyId &&
          item.configuration.kind === "peripheral-removal",
      )!;
      return [
        familyId,
        {
          firstPassageStage: first?.configuration.stage ?? null,
          incrementalCurve: reveal.map((item) => ({
            stage: item.configuration.stage,
            evidenceCount: item.metrics.evidenceCount,
            passedCriteria: item.score.passedCriteria,
            emerged: item.score.emerged,
          })),
          largestIncrement: largest ?? null,
          discontinuityObserved:
            Boolean(first) &&
            Boolean(largest) &&
            largest.stage === first?.configuration.stage &&
            largest.delta >= 2,
          constantQuantityTopologyEffect:
            connected.score.passedCriteria -
            disconnected.score.passedCriteria,
          criticalBridgeEffect:
            peripheral.score.passedCriteria - bridge.score.passedCriteria,
        },
      ];
    }),
  ) as Record<FamilyId, unknown>;
  const firstPassages = Object.values(byFamily).filter(
    (item) =>
      (item as { firstPassageStage: number | null }).firstPassageStage !== null,
  );
  return {
    byFamily,
    replicatedFirstPassageFamilies: firstPassages.length,
    meanTopologyEffect: round(
      families.reduce(
        (sum, family) =>
          sum +
          ((byFamily[family] as { constantQuantityTopologyEffect: number })
            .constantQuantityTopologyEffect ?? 0),
        0,
      ) / families.length,
    ),
    meanCriticalBridgeEffect: round(
      families.reduce(
        (sum, family) =>
          sum +
          ((byFamily[family] as { criticalBridgeEffect: number })
            .criticalBridgeEffect ?? 0),
        0,
      ) / families.length,
    ),
  };
}
