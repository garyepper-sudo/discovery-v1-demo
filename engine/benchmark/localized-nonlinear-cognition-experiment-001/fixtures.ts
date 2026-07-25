import type { RawSiloEvidence } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { CognitiveInput, NonlinearScenario, ScenarioTruth } from "./types";

const defaults: Omit<CognitiveInput, "scenarioId" | "lineageIds"> = {
  complementarySupport: 0, redundantSupport: 0, mediationSupport: 0,
  alternativeMargin: 0, stateContrastSupport: 0, conditionSupport: 0,
  conditionMode: "none", accumulatedStateSupport: 0, contradictionSupport: 0,
  predictionRegistered: false, outcomeDiscrimination: 0, outcomeTarget: "ambiguous",
  cycleOutcomes: [], irrelevantEvidence: 0, lowQualityConflict: 0, externalShock: false,
};

type Definition = {
  family: string;
  kind: "positive" | "control";
  input: Partial<Omit<CognitiveInput, "scenarioId" | "lineageIds">>;
  truth: Omit<ScenarioTruth, "scenarioId">;
};

const definitions: Definition[] = [
  { family: "threshold-below", kind: "control", input: { complementarySupport: 1, mediationSupport: 1, alternativeMargin: 0.1 }, truth: { expectedTransitions: [], expectedMechanismStatus: "fragment", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.3, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "threshold-boundary", kind: "positive", input: { complementarySupport: 2, mediationSupport: 2, alternativeMargin: 0.15 }, truth: { expectedTransitions: ["fragment-to-hypothesis"], expectedMechanismStatus: "hypothesis", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.5, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "threshold-redundancy", kind: "control", input: { complementarySupport: 1, redundantSupport: 8, mediationSupport: 1, alternativeMargin: 0.1 }, truth: { expectedTransitions: [], expectedMechanismStatus: "fragment", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.3, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "threshold-complement", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3 }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.65, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "condition-convergence", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, stateContrastSupport: 3, conditionSupport: 3, conditionMode: "activate" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "inactive-to-active"], expectedMechanismStatus: "qualified", expectedActivation: "active", expectedLeading: "leading", expectedPrediction: 0.82, expectedIntervention: "condition", nonlinearExpected: true }},
  { family: "inhibition", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, stateContrastSupport: 3, conditionSupport: 3, conditionMode: "inhibit" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "active-to-inhibited"], expectedMechanismStatus: "qualified", expectedActivation: "inhibited", expectedLeading: "leading", expectedPrediction: 0.28, expectedIntervention: "condition", nonlinearExpected: true }},
  { family: "amplification", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, stateContrastSupport: 3, conditionSupport: 3, conditionMode: "amplify" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "active-to-amplified"], expectedMechanismStatus: "qualified", expectedActivation: "amplified", expectedLeading: "leading", expectedPrediction: 0.92, expectedIntervention: "condition", nonlinearExpected: true }},
  { family: "state-transition", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, accumulatedStateSupport: 4 }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "state-transition"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.72, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "state-reversal", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, accumulatedStateSupport: 4, contradictionSupport: 3 }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "state-transition", "reverse-transition"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.58, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "outcome-leading", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, predictionRegistered: true, outcomeDiscrimination: 0.8, outcomeTarget: "leading" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "confirm"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.78, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "outcome-alternative", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, predictionRegistered: true, outcomeDiscrimination: 0.85, outcomeTarget: "alternative" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "weaken", "promote-alternative"], expectedMechanismStatus: "hypothesis", expectedActivation: "static", expectedLeading: "alternative", expectedPrediction: 0.62, expectedIntervention: "alternative", nonlinearExpected: true }},
  { family: "outcome-falsifies", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, predictionRegistered: true, outcomeDiscrimination: 0.9, outcomeTarget: "neither" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "retire"], expectedMechanismStatus: "retired", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.2, expectedIntervention: "none", nonlinearExpected: true }},
  { family: "outcome-ambiguous", kind: "control", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, predictionRegistered: true, outcomeDiscrimination: 0.2, outcomeTarget: "ambiguous" }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.65, expectedIntervention: "mechanism", nonlinearExpected: false }},
  { family: "recursive-learning", kind: "positive", input: { complementarySupport: 3, mediationSupport: 2, alternativeMargin: 0.3, predictionRegistered: true, outcomeDiscrimination: 0.8, outcomeTarget: "leading", cycleOutcomes: ["leading", "leading", "alternative", "leading"] }, truth: { expectedTransitions: ["fragment-to-hypothesis", "hypothesis-to-qualified", "confirm", "weaken", "promote-alternative"], expectedMechanismStatus: "qualified", expectedActivation: "static", expectedLeading: "leading", expectedPrediction: 0.76, expectedIntervention: "mechanism", nonlinearExpected: true }},
  { family: "static-additive", kind: "control", input: { complementarySupport: 2, mediationSupport: 1, alternativeMargin: 0.05 }, truth: { expectedTransitions: [], expectedMechanismStatus: "hypothesis", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.45, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "noise-redundancy", kind: "control", input: { complementarySupport: 1, redundantSupport: 10, irrelevantEvidence: 8, lowQualityConflict: 3 }, truth: { expectedTransitions: [], expectedMechanismStatus: "fragment", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.3, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "false-phase-transition", kind: "control", input: { complementarySupport: 1, redundantSupport: 5, accumulatedStateSupport: 4, externalShock: true }, truth: { expectedTransitions: [], expectedMechanismStatus: "fragment", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.3, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "correlated-conditions", kind: "control", input: { complementarySupport: 2, mediationSupport: 1, stateContrastSupport: 1, conditionSupport: 4, conditionMode: "activate" }, truth: { expectedTransitions: [], expectedMechanismStatus: "hypothesis", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.45, expectedIntervention: "none", nonlinearExpected: false }},
  { family: "feedback-self-repeat", kind: "control", input: { complementarySupport: 1, redundantSupport: 6, predictionRegistered: false, outcomeDiscrimination: 0.9, outcomeTarget: "leading" }, truth: { expectedTransitions: [], expectedMechanismStatus: "fragment", expectedActivation: "static", expectedLeading: "unresolved", expectedPrediction: 0.3, expectedIntervention: "none", nonlinearExpected: false }},
];

const serialize = (input: CognitiveInput) =>
  `Cognition input: complementary=${input.complementarySupport}; redundant=${input.redundantSupport}; mediation=${input.mediationSupport}; alternative-margin=${input.alternativeMargin.toFixed(2)}; state-contrast=${input.stateContrastSupport}; condition-support=${input.conditionSupport}; condition-mode=${input.conditionMode}; accumulated-state=${input.accumulatedStateSupport}; contradictions=${input.contradictionSupport}; prediction-registered=${input.predictionRegistered}; outcome-discrimination=${input.outcomeDiscrimination.toFixed(2)}; outcome-target=${input.outcomeTarget}; cycles=${input.cycleOutcomes.join(",") || "none"}; irrelevant=${input.irrelevantEvidence}; low-quality-conflict=${input.lowQualityConflict}; external-shock=${input.externalShock}.`;

const evidence = (id: string, silo: string, content: string): RawSiloEvidence => ({
  sourceId: id, sourceType: silo, silo, content, reliability: 0.8,
  observedAt: "2026-01-01T00:00:00.000Z",
});

export const scenarios: NonlinearScenario[] = [];
export const scoringTruth: ScenarioTruth[] = [];
definitions.forEach((definition, index) => {
  const id = `lnc-${String(index + 1).padStart(3, "0")}`;
  const input: CognitiveInput = {
    ...defaults, ...definition.input, scenarioId: id,
    lineageIds: [`${id}-evidence-a`, `${id}-evidence-b`],
  };
  scenarios.push({
    id, family: definition.family, kind: definition.kind,
    scenario: {
      id, organizationId: `organization-${id}`, company: "Neutral Test Organization",
      industry: "Cross-industry", question: "How should cognition evolve?",
      evidence: [
        evidence(`${id}-evidence-a`, "Operations", serialize(input)),
        evidence(`${id}-evidence-b`, "Audit", "Independent lineage record confirms the input measurements."),
      ],
    },
  });
  scoringTruth.push({ ...definition.truth, scenarioId: id });
});
