import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import { evolveObservations } from "./observationEvolution";
import { extractEntityMentions } from "../entities/extractEntities";
import { syncOrganizationEntities } from "../entities/syncOrganizationEntities";

function getObservationText(observation: unknown): string {
  if (typeof observation === "string") return observation;

  if (!observation || typeof observation !== "object") return "";

  const record = observation as Record<string, unknown>;

  const candidates = [
    record.statement,
    record.content,
    record.value,
    record.label,
    record.title,
    record.description,
    record.summary,
    record.text,
    record.headline,
  ];

  const text = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0
  );

  return text ?? "";
}

export function runOrganizationCognition(params: {
  runtime: OrganizationRuntime;
  result: DiscoveryV3Result;
  eventId: string;
  now: string;
}): OrganizationRuntime {
  const { runtime, result, eventId, now } = params;
  const memory = runtime.memory;

  const observations = result.observations ?? [];

  const entityMentions = observations.flatMap((observation, index) => {
    const text = getObservationText(observation);

    if (!text) return [];

    return extractEntityMentions({
      organizationId: runtime.metadata.organizationId,
      sourceId: `${eventId}:observation:${index}`,
      sourceType: "observation",
      text,
    });
  });

  const organizationModel = syncOrganizationEntities({
    organizationModel: runtime.organizationModel,
    organizationId: runtime.metadata.organizationId,
    entityMentions,
  });

  const observationEvolution = evolveObservations({
    existingObservations: memory.observations,
    newObservations: observations,
    eventId,
    now,
  });

  return {
    ...runtime,

    organizationModel,

    memory: {
      ...memory,
      entityMentions: [...(memory.entityMentions ?? []), ...entityMentions],
      observations: observationEvolution.observations,
    },

    cognition: {
      ...(runtime as any).cognition,
      lastUpdatedAt: now,
      lastEvolution: {
        observationChanges: observationEvolution.changes,
        entityMentionsCreated: entityMentions.length,
        persistentEntities: organizationModel.entities.length,
      },
    },
  } as OrganizationRuntime;
}