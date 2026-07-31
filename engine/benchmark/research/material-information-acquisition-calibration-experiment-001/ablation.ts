import { calibrationScenarios } from "./fixtures";
import { selectWithOrdering } from "./selectors";
import type { CalibrationCandidate } from "./types";

const attributes: Array<keyof Pick<CalibrationCandidate, "informationContribution" | "discriminationGain" | "organizationalRelevance" | "reliability" | "burden" | "cost" | "delay" | "reversibility" | "evidenceQuality">> = ["informationContribution", "discriminationGain", "organizationalRelevance", "reliability", "burden", "cost", "delay", "reversibility", "evidenceQuality"];
const holdout = calibrationScenarios.filter((scenario) => scenario.split === "holdout");
const accuracy = (scenarios = holdout) => scenarios.filter((scenario) => selectWithOrdering(scenario, "contract").actionId === scenario.optimalActionId || (scenario.materialTie && selectWithOrdering(scenario, "contract").tiedActionIds.length > 1)).length / scenarios.length;

export function runAblations() {
  const baseline = accuracy();
  const results = attributes.map((attribute) => {
    const ablated = holdout.map((scenario) => ({ ...scenario, candidates: scenario.candidates.map((candidate) => ({ ...candidate, [attribute]: attribute === "burden" || attribute === "cost" || attribute === "delay" ? 0 : 2 })) }));
    const score = accuracy(ablated);
    const delta = Number((baseline - score).toFixed(3));
    return { attribute, holdoutAccuracy: Number(score.toFixed(3)), delta, classification: delta > 0.1 ? "essential" : delta > 0 ? "conditionally-essential" : "useful" };
  });
  return { baseline: Number(baseline.toFixed(3)), results, stoppingThreshold: { classification: "essential", basis: "holdout stopping precision and recall" } };
}
