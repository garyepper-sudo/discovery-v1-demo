import { applyOutcomeDrivenRevision } from "./applyOutcomeDrivenRevision";
import { evaluateMechanismStateInteraction } from "./evaluateMechanismStateInteraction";
import { qualifyMechanismTransitions } from "./qualifyMechanismTransitions";
import { runMultiCycleLearning } from "./runMultiCycleLearning";
import type { ArchitectureOutput, CognitiveInput, ZoneConfig } from "./types";

export function runLocalizedNonlinearCognition(
  input: CognitiveInput,
  zones: ZoneConfig = { formation: true, stateInteraction: true, outcomeRevision: true },
): ArchitectureOutput {
  const formation = zones.formation
    ? qualifyMechanismTransitions(input)
    : { status: input.complementarySupport >= 2 ? "hypothesis" as const : "fragment" as const, transitions: [] };
  const state = zones.stateInteraction
    ? evaluateMechanismStateInteraction(input, formation.status)
    : { status: "static" as const, transitions: [] };
  let organizationalState: ArchitectureOutput["organizationalState"] = "stable";
  const stateTransitions: ArchitectureOutput["transitions"] = [];
  if (zones.stateInteraction && formation.status === "qualified" &&
      input.accumulatedStateSupport >= 3 && !input.externalShock) {
    organizationalState = "transitioned";
    stateTransitions.push({
      kind: "state-transition", reason: "Accumulated qualified support crossed the shared state gate.",
      lineageIds: input.lineageIds,
      reversibleBy: "Material contradictory support at the same lineage boundary.",
    });
    if (input.contradictionSupport >= 2) {
      organizationalState = "reversed";
      stateTransitions.push({
        kind: "reverse-transition", reason: "Contradictory support reversed the prior state transition.",
        lineageIds: input.lineageIds,
        reversibleBy: "New complementary support resolving the contradiction.",
      });
    }
  }
  const initialLeading: ArchitectureOutput["leadingExplanation"] =
    formation.status === "fragment" ? "unresolved" : "leading";
  const revision = zones.outcomeRevision
    ? applyOutcomeDrivenRevision(input, formation.status, initialLeading)
    : { status: formation.status, explanation: initialLeading, transitions: [] };
  const cycles = zones.outcomeRevision ? runMultiCycleLearning(input) :
    { confidence: formation.status === "qualified" ? 0.65 : 0.45,
      leading: "leading" as const, history: [], revisions: [] };
  const cycleTransitions = cycles.revisions.flatMap(() => [{
    kind: "weaken" as const, reason: "A registered cycle outcome weakened the current leader.",
    lineageIds: input.lineageIds, reversibleBy: "A later discriminating registered outcome.",
  }, {
    kind: "promote-alternative" as const, reason: "The cycle outcome favored the registered alternative.",
    lineageIds: input.lineageIds, reversibleBy: "A later discriminating registered outcome.",
  }]);
  let prediction = revision.status === "fragment" ? 0.3
    : revision.status === "hypothesis" ? 0.5 : revision.status === "retired" ? 0.2 : 0.65;
  if (state.status === "active") prediction = 0.82;
  if (state.status === "inhibited") prediction = 0.28;
  if (state.status === "amplified") prediction = 0.92;
  if (organizationalState === "transitioned") prediction = 0.72;
  if (organizationalState === "reversed") prediction = 0.58;
  if (revision.transitions.some((item) => item.kind === "confirm")) prediction = 0.78;
  if (revision.explanation === "alternative") prediction = 0.62;
  if (revision.status === "retired") prediction = 0.2;
  if (input.cycleOutcomes.length) prediction = cycles.confidence;
  const transitions = [
    ...formation.transitions, ...state.transitions, ...stateTransitions,
    ...revision.transitions, ...cycleTransitions,
  ];
  return {
    architecture: "localized-nonlinear", scenarioId: input.scenarioId,
    mechanismStatus: revision.status,
    mechanismConfidence: cycles.confidence,
    activationStatus: state.status, organizationalState,
    leadingExplanation: input.cycleOutcomes.length ? cycles.leading : revision.explanation,
    prediction,
    interventionTarget: revision.status === "retired" || revision.status === "fragment" ? "none"
      : revision.explanation === "alternative" ? "alternative"
        : state.status !== "static" ? "condition" : "mechanism",
    transitions, confidenceHistory: cycles.history.length ? cycles.history : [cycles.confidence],
    lineageIds: input.lineageIds,
    interpretation: transitions.map((item) => item.reason),
  };
}
