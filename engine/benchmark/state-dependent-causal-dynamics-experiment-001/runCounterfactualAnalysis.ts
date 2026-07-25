import { formDynamicEdge } from "./formDynamicEdges";
import type { DynamicObservation } from "./types";

export function runCounterfactualAnalysis(input: {
  familyOpaqueId: string;
  observations: DynamicObservation[];
  warningFlags: string[];
}) {
  const variants = {
    activatingConditionRemoved: {
      ...input,
      observations: input.observations.map((item) => ({ ...item, conditionPresent: false })),
    },
    inhibitingConditionRemoved: {
      ...input,
      observations: input.observations.filter((item) => item.stateLevel < 0.8),
    },
    temporalOrderReversed: {
      ...input,
      observations: input.observations.map((item) => ({
        ...item, period: input.observations.length - item.period,
      })),
    },
    duplicateEvidence: {
      ...input,
      observations: [...input.observations, ...input.observations],
    },
    contradictoryEvidence: {
      ...input,
      warningFlags: [...input.warningFlags, "Audit warning: contradictory dynamic response."],
    },
  };
  return Object.fromEntries(Object.entries(variants).map(([name, value]) => [
    name, formDynamicEdge(value),
  ]));
}
