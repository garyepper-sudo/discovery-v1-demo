import {
  UnderstandingState,
  UnderstandingDelta,
  UnderstandingEngineInput,
  UnderstandingEvent,
} from "../understanding/types";
import { createInitialUnderstandingState } from "./createInitialUnderstandingState";
import { mergeObservations } from "./observations/mergeObservations";
import { evolveOrganismFromState } from "./organism/organismEvolution";
import { mergeBeliefs } from "./beliefs/mergeBeliefs";

export type EvolutionInput = {
  organizationId: string;
  previousState?: UnderstandingState;
  investigation: UnderstandingEngineInput;
  uploadId: string;
};

export type EvolutionResult = {
  state: UnderstandingState;
  delta: UnderstandingDelta;
  event: UnderstandingEvent;
};

export function evolveUnderstandingState({
  organizationId,
  previousState,
  investigation,
  uploadId,
}: EvolutionInput): EvolutionResult {
  const now = new Date().toISOString();

  const currentState =
    previousState ?? createInitialUnderstandingState(organizationId);

  const observationMerge = mergeObservations({
    previousObservations: currentState.observations,
    investigation,
    uploadId,
    now,
  });

  const beliefMerge = mergeBeliefs({
    previousBeliefs: currentState.beliefs,
    investigation,
    uploadId,
    now,
  });

  const delta: UnderstandingDelta = {
    uploadId,
    createdAt: now,

    addedObservations: observationMerge.addedObservations,
    strengthenedObservations: observationMerge.strengthenedObservations,

    addedBeliefs: beliefMerge.addedBeliefs,
    strengthenedBeliefs: beliefMerge.strengthenedBeliefs,
    weakenedBeliefs: beliefMerge.weakenedBeliefs,

    addedThemes: [],
    strengthenedThemes: [],

    newContradictions: [],
    resolvedContradictions: [],

    newMechanisms: [],

    newStablePatterns: [],
    changedStablePatterns: [],

    executiveNarrative: {
      headline: buildHeadline(deltaCounts(observationMerge, beliefMerge)),
      summary: buildSummary(observationMerge, beliefMerge),
      whatChanged: buildWhatChanged(observationMerge, beliefMerge),
      whyItMatters: buildWhyItMatters(observationMerge, beliefMerge),
      suggestedQuestions: buildSuggestedQuestions(observationMerge, beliefMerge),
    },
  };

  const event: UnderstandingEvent = {
    id: `event-${uploadId}-${currentState.version + 1}`,
    uploadId,
    organizationId,
    timestamp: now,
    eventType: "upload",
    summary: delta.executiveNarrative.summary,
    addedObservationIds: observationMerge.addedObservations.map(
      (observation) => observation.id
    ),
    strengthenedObservationIds: observationMerge.strengthenedObservations.map(
      (change) => change.observationId
    ),
    addedBeliefIds: beliefMerge.addedBeliefs.map((belief) => belief.id),
    strengthenedBeliefIds: beliefMerge.strengthenedBeliefs.map(
      (change) => change.beliefId
    ),
    delta,
  };

  const recentChangeNodeIds = [
    ...event.addedObservationIds,
    ...event.strengthenedObservationIds,
    ...event.addedBeliefIds,
    ...event.strengthenedBeliefIds,
  ];

  const nextState: UnderstandingState = {
    ...currentState,
    version: currentState.version + 1,
    updatedAt: now,
    events: [...currentState.events, event],
    observations: observationMerge.observations,
    beliefs: beliefMerge.beliefs,
    organism: evolveOrganismFromState(
  {
    ...currentState,
    observations: observationMerge.observations,
    beliefs: beliefMerge.beliefs,
  },
  recentChangeNodeIds
),
  };

  return {
    state: nextState,
    delta,
    event,
  };
}

function deltaCounts(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>
) {
  return {
    addedObservations: observationMerge.addedObservations.length,
    strengthenedObservations: observationMerge.strengthenedObservations.length,
    addedBeliefs: beliefMerge.addedBeliefs.length,
    strengthenedBeliefs: beliefMerge.strengthenedBeliefs.length,
  };
}

function buildHeadline(counts: ReturnType<typeof deltaCounts>): string {
  const totalNew = counts.addedObservations + counts.addedBeliefs;
  const totalStrengthened =
    counts.strengthenedObservations + counts.strengthenedBeliefs;

  if (totalNew > 0 && totalStrengthened > 0) {
    return "New signals emerged while existing understanding strengthened";
  }

  if (totalNew > 0) {
    return "New organizational signals emerged";
  }

  if (totalStrengthened > 0) {
    return "Existing understanding strengthened";
  }

  return "Understanding updated";
}

function buildSummary(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>
): string {
  const parts: string[] = [];

  if (observationMerge.addedObservations.length > 0) {
    parts.push(
      `${observationMerge.addedObservations.length} new observation${
        observationMerge.addedObservations.length === 1 ? "" : "s"
      } entered the organizational memory`
    );
  }

  if (observationMerge.strengthenedObservations.length > 0) {
    parts.push(
      `${observationMerge.strengthenedObservations.length} existing observation${
        observationMerge.strengthenedObservations.length === 1 ? "" : "s"
      } became more supported`
    );
  }

  if (beliefMerge.addedBeliefs.length > 0) {
    parts.push(
      `${beliefMerge.addedBeliefs.length} new belief${
        beliefMerge.addedBeliefs.length === 1 ? "" : "s"
      } formed`
    );
  }

  if (beliefMerge.strengthenedBeliefs.length > 0) {
    parts.push(
      `${beliefMerge.strengthenedBeliefs.length} belief${
        beliefMerge.strengthenedBeliefs.length === 1 ? "" : "s"
      } became more stable`
    );
  }

  if (parts.length === 0) {
    return "The latest upload was processed without materially changing the persistent understanding.";
  }

  return `${parts.join(", ")}.`;
}

function buildWhatChanged(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>
): string[] {
  const changes: string[] = [];

  observationMerge.addedObservations.slice(0, 3).forEach((observation) => {
    changes.push(`New observation: ${observation.statement}`);
  });

  beliefMerge.addedBeliefs.slice(0, 3).forEach((belief) => {
    changes.push(`New belief: ${belief.statement}`);
  });

  beliefMerge.strengthenedBeliefs.slice(0, 3).forEach((change) => {
    changes.push(`Strengthened belief: ${change.statement}`);
  });

  return changes;
}

function buildWhyItMatters(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>
): string[] {
  const reasons: string[] = [];

  if (observationMerge.addedObservations.length > 0) {
    reasons.push(
      "New observations expand the organization’s memory beyond this single upload."
    );
  }

  if (beliefMerge.addedBeliefs.length > 0) {
    reasons.push(
      "New beliefs may become stable patterns if future uploads continue to support them."
    );
  }

  if (beliefMerge.strengthenedBeliefs.length > 0) {
    reasons.push(
      "Repeated beliefs are becoming more reliable parts of the organization’s operating model."
    );
  }

  return reasons;
}

function buildSuggestedQuestions(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>
): string[] {
  const questions: string[] = [];

  if (observationMerge.addedObservations.length > 0) {
    questions.push("Which of these new signals should we monitor going forward?");
  }

  if (beliefMerge.addedBeliefs.length > 0) {
    questions.push(
      "What additional evidence would confirm or weaken these new beliefs?"
    );
  }

  if (beliefMerge.strengthenedBeliefs.length > 0) {
    questions.push("Are these repeated patterns now strong enough to act on?");
  }

  if (questions.length === 0) {
    questions.push("Did this upload change anything important that should be tracked?");
  }

  return questions;
}