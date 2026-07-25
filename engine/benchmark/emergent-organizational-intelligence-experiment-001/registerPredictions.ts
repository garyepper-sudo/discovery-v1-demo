import { createHash } from "node:crypto";

import {
  predictBestSilo,
  predictCanonicalCombined,
  predictEmergent,
  predictMajority,
  predictState,
  predictSummary,
} from "./predictionModels";
import type { InferenceScenario, RegisteredDecision } from "./types";

export function registerPredictions(scenarios: InferenceScenario[]) {
  const ordered = [...scenarios].sort((a, b) => a.id.localeCompare(b.id));
  const predictions: RegisteredDecision[] = ordered
    .flatMap((scenario) => [
      predictBestSilo(scenario),
      predictMajority(scenario),
      predictSummary(scenario),
      predictState(scenario),
      predictCanonicalCombined(scenario),
      predictEmergent(scenario),
    ])
    .sort(
      (a, b) =>
        a.scenarioId.localeCompare(b.scenarioId) ||
        a.modelId.localeCompare(b.modelId),
    );
  return {
    registeredBeforeFutureReveal: true as const,
    inputHash: createHash("sha256")
      .update(JSON.stringify(ordered))
      .digest("hex"),
    predictions,
  };
}
