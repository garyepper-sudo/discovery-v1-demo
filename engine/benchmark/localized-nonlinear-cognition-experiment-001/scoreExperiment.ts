import { analyzeTransitions } from "./analyzeTransitions";
import type { ArchitectureOutput, ScenarioTruth } from "./types";

export function scoreArchitecture(outputs: ArchitectureOutput[], truth: ScenarioTruth[]) {
  const transitions = analyzeTransitions(outputs, truth);
  const mechanismAccuracy = truth.filter((expected) =>
    outputs.find((item) => item.scenarioId === expected.scenarioId)!.mechanismStatus ===
      expected.expectedMechanismStatus).length / truth.length;
  const predictionMae = truth.reduce((sum, expected) =>
    sum + Math.abs(outputs.find((item) =>
      item.scenarioId === expected.scenarioId)!.prediction - expected.expectedPrediction), 0) /
    truth.length;
  const interventionAccuracy = truth.filter((expected) =>
    outputs.find((item) => item.scenarioId === expected.scenarioId)!.interventionTarget ===
      expected.expectedIntervention).length / truth.length;
  const activationAccuracy = truth.filter((expected) =>
    outputs.find((item) => item.scenarioId === expected.scenarioId)!.activationStatus ===
      expected.expectedActivation).length / truth.length;
  const alternativeAccuracy = truth.filter((expected) =>
    outputs.find((item) => item.scenarioId === expected.scenarioId)!.leadingExplanation ===
      expected.expectedLeading).length / truth.length;
  const controls = truth.filter((item) => !item.nonlinearExpected);
  const falseNonlinear = transitions.cases.filter((item) =>
    controls.some((control) => control.scenarioId === item.scenarioId) &&
    item.falseTransitions.length > 0).length;
  return {
    explanationAccuracy: (mechanismAccuracy + activationAccuracy + alternativeAccuracy) / 3,
    mechanismAccuracy, predictionMae, interventionAccuracy,
    alternativeDiscrimination: alternativeAccuracy,
    transitionPrecision: transitions.precision, transitionRecall: transitions.recall,
    falseTransitions: transitions.falseTransitions,
    falseNonlinearClassifications: falseNonlinear,
    negativeControlPrecision: controls.length ? 1 - falseNonlinear / controls.length : 1,
    blanketAbstention: outputs.every((item) => item.transitions.length === 0),
    transitionAnalysis: transitions,
  };
}
