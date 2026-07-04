import {
  createInitialUnderstandingState,
  evolveUnderstandingState,
} from "./index";
import { UnderstandingEngineInput } from "../understanding/types";
import { inferBeliefUpdates } from "./inference/beliefInference";

const organizationId = "demo-organization";

const firstInvestigation: UnderstandingEngineInput = {
  evidence: [
    {
      id: "evidence-1",
      text: "The board discussed hiring delays as a recurring constraint.",
      type: "observation",
      source: "Board Minutes 1",
      confidence: 0.72,
    } as any,
  ],
  themes: [],
  contradictions: [],
  beliefs: [
    {
      id: "belief-1",
      statement: "Hiring capacity may be limiting execution speed.",
      rationale: "Hiring delays appeared as a repeated board concern.",
      confidence: 0.68,
    } as any,
  ],
  understanding: {} as any,
};

const secondInvestigation: UnderstandingEngineInput = {
  evidence: [
    {
      id: "evidence-2",
      text: "Hiring delays were again discussed as slowing execution.",
      type: "observation",
      source: "Board Minutes 2",
      confidence: 0.76,
    } as any,
  ],
  themes: [],
  contradictions: [],
  beliefs: [
    {
      id: "belief-2",
      statement: "Hiring delays may be limiting execution speed.",
      rationale: "The same constraint appeared again in a later meeting.",
      confidence: 0.74,
    } as any,
  ],
  understanding: {} as any,
};

const initialState = createInitialUnderstandingState(organizationId);

const firstResult = evolveUnderstandingState({
  organizationId,
  previousState: initialState,
  investigation: firstInvestigation,
  uploadId: "upload-1",
});

const secondResult = evolveUnderstandingState({
  organizationId,
  previousState: firstResult.state,
  investigation: secondInvestigation,
  uploadId: "upload-2",
});

console.log("\nFIRST DELTA");
console.log(firstResult.delta.executiveNarrative);

console.log("\nSECOND DELTA");
console.log(secondResult.delta.executiveNarrative);

console.log("\nFINAL STATE");
console.log({
  version: secondResult.state.version,
  events: secondResult.state.events.length,
  observations: secondResult.state.observations.length,
  beliefs: secondResult.state.beliefs.length,
  organismNodes: secondResult.state.organism.nodes.length,
  recentChangeNodeIds: secondResult.state.organism.recentChangeNodeIds,
});

const inferences = inferBeliefUpdates({
  state: firstResult.state,
  observations: secondResult.delta.addedObservations,
});

console.log("\nBELIEF INFERENCES");
console.log(inferences);