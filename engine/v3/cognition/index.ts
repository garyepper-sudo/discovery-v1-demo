export { createInitialUnderstandingState } from "./createInitialUnderstandingState";
export { evolveUnderstandingState } from "./evolutionEngine";

export type {
  EvolutionInput,
  EvolutionResult,
} from "./evolutionEngine";

export { mergeObservations } from "./observations/mergeObservations";
export { mergeBeliefs } from "./beliefs/mergeBeliefs";
export { compareObservationsToState } from "./comparison/comparisonEngine";
export { evolveOrganismFromState } from "./organism/organismEvolution";
export { inferBeliefUpdates } from "./inference/beliefInference";