import type { DiscoveryV3Result } from "../types";
import type { OrganizationRuntime } from "./organizationRuntime";
import { runOrganizationCognition } from "../cognition/cognitionEngine";
import { updateOrganizationalUnderstandingState } from "./updateOrganizationalUnderstandingState";

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
  const now = new Date().toISOString();

  const eventId = `event-${runtime.memory.events.length + 1}`;

  const existingOrganizationalUnderstandingState =
    runtime.memory.organizationalUnderstandingState ?? {
      organizationId: runtime.metadata.organizationId,
      name: input.company || runtime.metadata.name,
      industry: input.industry || runtime.metadata.industry,
      website: input.website || runtime.metadata.website,
      lastUpdatedAt: now,
      currentUnderstandings: [],
      confidenceLandscape: [],
      activeQuestions: [],
      strategicRisks: [],
      evolutionHistory: [],
      health: {
        maturity: 0,
        coherence: 0,
        uncertainty: 1,
        adaptation: 0,
      },
    };

  const updatedOrganizationalUnderstandingState =
    updateOrganizationalUnderstandingState({
      state: existingOrganizationalUnderstandingState,
      result,
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
      ...runtime.memory,
      understandingState: result,
      organizationalUnderstandingState: updatedOrganizationalUnderstandingState,
      events: [
        ...runtime.memory.events,
        {
          id: eventId,
          timestamp: now,
          company: input.company,
          question: input.question,
          evidenceCount: result.evidence.length,
          beliefCount: result.beliefs.length,
          themeCount: result.themes.length,
          contradictionCount: result.contradictions.length,
        },
      ],
      deltas: [...runtime.memory.deltas, result.delta].filter(Boolean),
    },
    organism: {
      ...runtime.organism,
      organismState: result.organismState || runtime.organism.organismState,
      lastEvolutionAt: result.organismState
        ? now
        : runtime.organism.lastEvolutionAt,
    },
  };

  return runOrganizationCognition({
    runtime: runtimeWithEvent,
    result,
    eventId,
    now,
  });
}