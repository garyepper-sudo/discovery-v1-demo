import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import { evolveObservations } from "./observations/evolveobservations";
import { mergeBeliefs } from "./beliefs/mergeBeliefs";

export function runOrganizationCognition(params: {
  runtime: OrganizationRuntime;
  result: DiscoveryV3Result;
  eventId: string;
  now: string;
}): OrganizationRuntime {
  const { runtime, result, eventId, now } = params;

  const observationEvolution = evolveObservations({
    existingObservations: runtime.memory.observations,
    newObservations: result.observations,
    eventId,
    now,
  });

  const beliefEvolution = mergeBeliefs({
    previousBeliefs: runtime.memory.beliefs,
    investigation: result as any,
    uploadId: eventId,
    now,
  });

  return {
    ...runtime,
    memory: {
      ...runtime.memory,
      observations: observationEvolution.observations,
      beliefs: beliefEvolution.beliefs,
    },
    cognition: {
      ...(runtime as any).cognition,
      lastUpdatedAt: now,
      lastEvolution: {
        observationChanges: observationEvolution.changes,
        beliefChanges: {
          added: beliefEvolution.addedBeliefs,
          strengthened: beliefEvolution.strengthenedBeliefs,
          weakened: beliefEvolution.weakenedBeliefs,
        },
      },
    },
  } as OrganizationRuntime;
}