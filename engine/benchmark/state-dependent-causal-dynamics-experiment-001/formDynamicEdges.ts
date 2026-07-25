import type { DynamicClass, DynamicEdge, DynamicObservation } from "./types";

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const unique = (values: string[]) => [...new Set(values)].sort();

export function formDynamicEdge(input: {
  familyOpaqueId: string;
  observations: DynamicObservation[];
  warningFlags: string[];
}): DynamicEdge {
  const observations = [...new Map(input.observations.map((item) =>
    [item.observationId, item])).values()].sort((a, b) =>
    a.stateLevel - b.stateLevel || a.period - b.period);
  const sourceNode = observations[0]?.sourceNode ?? "unknown";
  const targetNode = observations[0]?.targetNode ?? "unknown";
  const stateVariable = observations[0]?.stateVariable ?? "unknown";
  const classes: DynamicClass[] = [];
  const temporalValid = observations.every((item, index) =>
    index === 0 || item.period >= observations[index - 1].period);
  const invalid = !temporalValid || input.warningFlags.some((warning) =>
    /common cause|precedes|no supported direction/.test(warning));
  const contradictory = input.warningFlags.some((warning) =>
    /contradictory/.test(warning));
  if (observations.length >= 4 && !invalid) {
    const inactive = observations.filter((item) => !item.conditionPresent);
    const active = observations.filter((item) => item.conditionPresent);
    if (inactive.length >= 2 && active.length >= 2 &&
        mean(active.map((item) => item.outcomeLevel)) -
        mean(inactive.map((item) => item.outcomeLevel)) >= 0.25) {
      classes.push("activated");
    }
    const deltas = observations.slice(1).map((item, index) =>
      item.outcomeLevel - observations[index].outcomeLevel);
    if (Math.max(...deltas) >= 0.25) classes.push("threshold");
    const equalUpstreamPairs = observations.flatMap((left, index) =>
      observations.slice(index + 1).filter((right) =>
        Math.abs(left.upstreamLevel - right.upstreamLevel) < 0.01 &&
        right.outcomeLevel - left.outcomeLevel >= 0.25));
    if (equalUpstreamPairs.length > 0) classes.push("amplified");
    if (observations[0].outcomeLevel - observations.at(-1)!.outcomeLevel >= 0.4)
      classes.push("suppressed");
    if (deltas.length >= 2 &&
        deltas.at(-1)! >= 0 &&
        deltas.at(-1)! <= Math.max(...deltas.slice(0, -1)) * 0.25 &&
        observations.at(-1)!.upstreamLevel > observations.at(-2)!.upstreamLevel)
      classes.push("saturated");
    if (observations.some((item) =>
      !item.conditionPresent && item.historicalExposure >= 0.8 &&
      item.upstreamLevel <= 0.25 && item.outcomeLevel >= 0.6))
      classes.push("persistent");
  }
  const dynamicClasses = unique(classes) as DynamicClass[];
  const classification = invalid ? "rejected"
    : observations.length < 4 ? "unresolved"
      : dynamicClasses.length ? "dynamic"
        : Math.max(...observations.map((item) => item.outcomeLevel)) -
          Math.min(...observations.map((item) => item.outcomeLevel)) <= 0.08
          ? "static" : "unresolved";
  const nearestHigh = [...observations].sort((a, b) => b.stateLevel - a.stateLevel)[0];
  return {
    id: `dynamic-edge:${input.familyOpaqueId}`,
    sourceNode, targetNode, dynamicClasses,
    activationConditions: dynamicClasses.includes("activated") ? [`high ${stateVariable}`] : [],
    inhibitionConditions: dynamicClasses.includes("suppressed") ? [`high ${stateVariable}`] : [],
    amplificationConditions: dynamicClasses.includes("amplified") ? [`high ${stateVariable}`] : [],
    saturationConditions: dynamicClasses.includes("saturated") ? [`extreme ${stateVariable}`] : [],
    adaptationConditions: dynamicClasses.includes("persistent") ? ["high historical exposure"] : [],
    supportedState: stateVariable,
    confidence: Math.max(0, (classification === "dynamic" ? 0.8
      : classification === "static" ? 0.65 : 0.3) - (contradictory ? 0.2 : 0)),
    evidenceIds: unique(observations.flatMap((item) => item.evidenceIds)),
    artifactIds: unique(observations.flatMap((item) => item.artifactIds)),
    siloIds: unique(observations.flatMap((item) => item.siloIds)),
    observations,
    implications: nearestHigh ? [{
      condition: `state ${stateVariable} remains near ${nearestHigh.stateLevel.toFixed(2)}`,
      predictedOutcomeLevel: nearestHigh.outcomeLevel,
      evidenceIds: nearestHigh.evidenceIds,
    }] : [],
    falsification: dynamicClasses.map((dynamicClass) =>
      `${dynamicClass} weakens if outcome does not change when ${stateVariable} changes as registered`),
    classification,
  };
}
