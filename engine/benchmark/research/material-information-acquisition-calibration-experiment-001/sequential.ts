import { sequentialScenarios } from "./fixtures";
import { select } from "./selectors";

export function runSequentialCalibration() {
  const results = sequentialScenarios.map((sequence) => {
    const selections = sequence.rounds.map((round) => ({ revision: round.revision, expectedKind: round.expectedKind, selection: select(round.scenario, "H-calibrated-stop") }));
    return { id: sequence.id, selections, correct: selections.every((row) => row.selection.kind === row.expectedKind), staleCandidateReuse: selections.some((row, index) => index > 0 && row.selection.actionId === selections[index - 1].selection.actionId), stopped: selections.at(-1)?.selection.kind === "stop" };
  });
  return { scenarioCount: results.length, roundCount: results.reduce((sum, result) => sum + result.selections.length, 0), correctSequences: results.filter((result) => result.correct).length, repeatedActionRate: results.filter((result) => result.staleCandidateReuse).length / results.length, stoppingRate: results.filter((result) => result.stopped).length / results.length, results };
}
