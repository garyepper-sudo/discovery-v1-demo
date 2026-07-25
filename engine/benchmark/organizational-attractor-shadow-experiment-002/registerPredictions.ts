import { createHash } from "node:crypto";

import { inferCandidateAttractor } from "./inferCandidateAttractor";
import {
  predictAttractor,
  predictCombined,
  predictMechanisms,
  predictState,
} from "./predictionModels";
import type {
  InferenceScenario,
  RegisteredPrediction,
} from "./types";

export type PredictionRegistration = {
  registeredBeforeFutureReveal: true;
  inferenceBoundaryHash: string;
  predictions: RegisteredPrediction[];
};

const stable = (value: unknown) => JSON.stringify(value);

export function registerPredictions(
  scenarios: InferenceScenario[],
): PredictionRegistration {
  const ordered = [...scenarios].sort((a, b) => a.id.localeCompare(b.id));
  const predictions = ordered
    .flatMap((scenario) => {
      const candidate = inferCandidateAttractor(scenario);
      return [
        predictState(scenario),
        predictMechanisms(scenario),
        predictCombined(scenario),
        predictAttractor(scenario, candidate),
      ];
    })
    .sort(
      (a, b) =>
        a.scenarioId.localeCompare(b.scenarioId) ||
        a.modelId.localeCompare(b.modelId),
    );

  return {
    registeredBeforeFutureReveal: true,
    inferenceBoundaryHash: createHash("sha256")
      .update(stable(ordered))
      .digest("hex"),
    predictions,
  };
}
