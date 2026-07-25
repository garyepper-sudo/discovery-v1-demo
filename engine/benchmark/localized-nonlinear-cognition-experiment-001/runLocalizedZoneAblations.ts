import { runLocalizedNonlinearCognition } from "./runLocalizedNonlinearCognition";
import type { CognitiveInput, ZoneConfig } from "./types";

const configurations: Record<string, ZoneConfig> = {
  noMechanismFormation: { formation: false, stateInteraction: true, outcomeRevision: true },
  noStateInteraction: { formation: true, stateInteraction: false, outcomeRevision: true },
  noOutcomeRevision: { formation: true, stateInteraction: true, outcomeRevision: false },
  mechanismFormationOnly: { formation: true, stateInteraction: false, outcomeRevision: false },
  formationAndState: { formation: true, stateInteraction: true, outcomeRevision: false },
  formationAndOutcome: { formation: true, stateInteraction: false, outcomeRevision: true },
};

export function runLocalizedZoneAblations(inputs: CognitiveInput[]) {
  return Object.fromEntries(Object.entries(configurations).map(([name, config]) => [
    name,
    inputs.map((input) => runLocalizedNonlinearCognition(input, config)),
  ]));
}
