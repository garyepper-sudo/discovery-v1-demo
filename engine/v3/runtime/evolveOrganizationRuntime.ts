import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "./organizationRuntime";
import type { OrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { runOrganizationCognition } from "../cognition/cognitionEngine";
import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";
import { consolidateUnderstanding } from "../understanding/consolidateUnderstanding";
import { buildUnderstandingClusters } from "../understanding/understandingClusters";
import { runSemanticCompression } from "../compression/semanticCompression";
import { inferOrganizationalPhenomena } from "../phenomena/inferOrganizationalPhenomena";
import { synthesizeOrganizationalConcepts } from "../concepts/synthesizeOrganizationalConcepts";
import { extractMeaningSignals } from "../meaning/extractMeaning";
import { inferOrganizationalCapabilities } from "../capabilities/inferOrganizationalCapabilities";
import { updateOrganizationalCapabilities } from "../capabilities/updateOrganizationalCapabilities";
import { inferFunctionalInterpretations } from "../functional/inferFunctionalInterpretations";
import { createEmptyOrganizationalUnderstandingState } from "./organizationalUnderstandingState";
import { synchronizeOrganizationModel } from "../model/synchronizeOrganizationModel";
import { inferOrganizationRelationships } from "../model/inferOrganizationRelationships";

export function evolveOrganizationRuntime(params: {
  runtime: OrganizationRuntime;
  result: DiscoveryV3Result;
  input: {
    company: string;
    website: string;
    industry: string;
    question: string;
    context: string;
  };
}): OrganizationRuntime {
  const { runtime, result, input } = params;

  const memory = runtime.memory as typeof runtime.memory & {
    functionalInterpretationState?: any;
    organizationalCapabilitiesState?: any;
    organizationalPhenomenaState?: any;
    meaningSignals: any[];
    organizationalConcepts: any[];
  };

  const now = new Date().toISOString();
  const eventId = `event-${memory.events.length + 1}`;

  const existingOrganizationalUnderstandingState:
    OrganizationalUnderstandingState =
    memory.organizationalUnderstandingState ??
    createEmptyOrganizationalUnderstandingState({
      organizationId: runtime.metadata.organizationId,
      name: input.company || runtime.metadata.name,
      industry: input.industry || runtime.metadata.industry,
      website: input.website || runtime.metadata.website,
      now,
    });

  const candidateUnderstandings = (result.understanding ?? [])
    .map((understanding) => ({
      id: understanding.id,
      statement: understanding.summary || understanding.title,
      confidence: understanding.confidence,
      evidenceIds: understanding.evidenceIds ?? [],
      beliefIds: understanding.beliefIds ?? [],
      themeIds: understanding.themeIds ?? [],
      mechanismIds: understanding.mechanismIds ?? [],
      contradictionIds: [],
      source: "understanding",
    }))
    .filter((candidate) => Boolean(candidate.statement));

  const baseOrganizationalUnderstandingState =
    updateOrganizationalUnderstandingState({
      state: existingOrganizationalUnderstandingState,
      result,
      now,
    });

  const consolidationResult = consolidateUnderstanding(
    baseOrganizationalUnderstandingState,
    candidateUnderstandings
  );

  const updatedOrganizationalUnderstandingState: OrganizationalUnderstandingState =
    {
      ...baseOrganizationalUnderstandingState,
      currentUnderstandings: consolidationResult.updatedUnderstandings,
      lastUpdatedAt: now,
      evolutionHistory: [
        ...baseOrganizationalUnderstandingState.evolutionHistory,
        ...consolidationResult.changes.map((change) => ({
          id: `understanding-change-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,
          date: now,
          type: change.type,
          title: change.title,
          description: change.description,
          relatedUnderstandingIds: change.relatedUnderstandingIds,
        })),
      ],
    };

  const organizationalDynamicsState = inferFunctionalInterpretations({
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,
    existingState: memory.functionalInterpretationState,
    now,
  });

  const detectedCapabilities = inferOrganizationalCapabilities({
    interpretations: organizationalDynamicsState.interpretations,
  });

  const organizationalCapabilitiesState = updateOrganizationalCapabilities({
    existingState: memory.organizationalCapabilitiesState,
    detectedCapabilities,
    now,
  });

  const understandingClusters = buildUnderstandingClusters({
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,
    existingClusters: memory.understandingClusters,
    now,
  });

  const semanticConcepts = runSemanticCompression({
    dynamics: organizationalDynamicsState.interpretations,
    understandings: updatedOrganizationalUnderstandingState.currentUnderstandings,
  });

  const meaningSignals = extractMeaningSignals({
    interpretations: organizationalDynamicsState.interpretations,
    existingSignals: memory.meaningSignals ?? [],
  });

  const organizationalConcepts = synthesizeOrganizationalConcepts({
    meaningSignals,
    existingConcepts: memory.organizationalConcepts ?? [],
  });

  const organizationalPhenomenaState = inferOrganizationalPhenomena({
    clusters: understandingClusters,
    previousState: memory.organizationalPhenomenaState,
    now,
  });

  const runtimeWithEvent: OrganizationRuntime = {
    ...runtime,

    metadata: {
      ...runtime.metadata,
      name: input.company || runtime.metadata.name,
      industry: input.industry || runtime.metadata.industry,
      website: input.website || runtime.metadata.website,
      updatedAt: now,
      investigationCount: runtime.metadata.investigationCount + 1,
    },

    memory: {
      ...memory,

      understandingState: result,
      organizationalUnderstandingState: updatedOrganizationalUnderstandingState,

      functionalInterpretationState: organizationalDynamicsState,
      organizationalCapabilitiesState,
      organizationalPhenomenaState,

      understandingClusters,
      semanticConcepts,
      meaningSignals,
      organizationalConcepts,

      events: [
        ...memory.events,
        {
          id: eventId,
          timestamp: now,
          company: input.company,
          question: input.question,
          evidenceCount: result.evidence?.length ?? 0,
          beliefCount: result.beliefs?.length ?? 0,
          themeCount: result.themes?.length ?? 0,
          contradictionCount: result.contradictions?.length ?? 0,
          understandingClusterCount: understandingClusters.length,
          functionalInterpretationCount:
            organizationalDynamicsState.interpretations.length,
          organizationalCapabilityCount:
            organizationalCapabilitiesState.capabilities.length,
          semanticConceptCount: semanticConcepts.length,
          meaningSignalCount: meaningSignals.length,
          organizationalConceptCount: organizationalConcepts.length,
          organizationalPhenomenonCount:
            organizationalPhenomenaState.phenomena.length,
        },
      ],

      deltas: [...memory.deltas, result.delta].filter(Boolean),
    },

    organism: {
      ...runtime.organism,
      organismState: result.organismState || runtime.organism.organismState,
      lastEvolutionAt: result.organismState
        ? now
        : runtime.organism.lastEvolutionAt,
    },
  };

  const cognitivelyUpdatedRuntime = runOrganizationCognition({
    runtime: runtimeWithEvent,
    result,
    eventId,
    now,
  });

  const synchronizedOrganizationModel = synchronizeOrganizationModel(
    cognitivelyUpdatedRuntime
  );

  const organizationModel = inferOrganizationRelationships(
    synchronizedOrganizationModel
  );

  return {
    ...cognitivelyUpdatedRuntime,
    organizationModel,
  };
}