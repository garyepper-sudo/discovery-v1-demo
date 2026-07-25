import { createHash } from "node:crypto";

import { extractGeneratedCognition } from "./extractGeneratedCognition";
import {
  predictFromIndividualSilo,
  predictGenericSummary,
  predictLocalAggregation,
  predictProductionCombined,
  predictProductionState,
} from "./predictionModels";
import { runProductionShadowCognition } from "./runProductionShadowCognition";
import {
  projectVerbalPrediction,
  verbalizeEmergentUnderstanding,
} from "./verbalizeEmergentUnderstanding";
import type {
  GeneratedCognition,
  InferenceScenario,
  RegisteredOrganizationalPrediction,
  VerbalEmergentUnderstanding,
} from "./types";

export type RegisteredScenario = {
  scenarioId: string;
  cognition: GeneratedCognition;
  predictions: RegisteredOrganizationalPrediction[];
  verbal: VerbalEmergentUnderstanding | null;
};

function runAndExtract(scenario: InferenceScenario): GeneratedCognition {
  const replay = runProductionShadowCognition(scenario);
  return extractGeneratedCognition({ scenario, ...replay });
}

export function registerPredictions(
  scenarios: InferenceScenario[],
): {
  registeredBeforeFutureReveal: true;
  rawInputHash: string;
  scenarios: RegisteredScenario[];
  predictions: RegisteredOrganizationalPrediction[];
} {
  const ordered = [...scenarios].sort((a, b) => a.id.localeCompare(b.id));
  const registered = ordered.map((scenario): RegisteredScenario => {
    const cognition = runAndExtract(scenario);
    const silos = [...new Set(scenario.evidence.map((item) => item.silo))].sort();
    const siloPredictions = silos.map((silo) => {
      const siloScenario: InferenceScenario = {
        ...scenario,
        evidence: scenario.evidence.filter((item) => item.silo === silo),
      };
      return predictFromIndividualSilo({
        scenario,
        silo,
        cognition: runAndExtract(siloScenario),
      });
    });
    const canonical = predictProductionCombined({ scenario, cognition });
    const predictions = [
      ...siloPredictions,
      predictLocalAggregation({ scenario, siloPredictions }),
      predictGenericSummary(scenario),
      predictProductionState({ scenario, cognition }),
      canonical,
      projectVerbalPrediction({ scenario, cognition, canonical }),
    ].sort(
      (a, b) =>
        a.modelId.localeCompare(b.modelId) ||
        (a.variantId ?? "").localeCompare(b.variantId ?? ""),
    );
    return {
      scenarioId: scenario.id,
      cognition,
      predictions,
      verbal: verbalizeEmergentUnderstanding({
        scenario,
        cognition,
        canonical,
      }),
    };
  });
  return {
    registeredBeforeFutureReveal: true,
    rawInputHash: createHash("sha256")
      .update(JSON.stringify(ordered))
      .digest("hex"),
    scenarios: registered,
    predictions: registered.flatMap((item) => item.predictions),
  };
}
