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
import { compareObservationsToState } from "./comparison/comparisonEngine";
import { detectPatternsFromComparison } from "./patterns/patternDetectionEngine";
import { mergePatternsIntoState } from "./patterns/mergePatterns";

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

  const comparison = compareObservationsToState({
    state: currentState,
    observations: observationMerge.observations,
  });

  const patternDetection = detectPatternsFromComparison(comparison);

  const mergedPatterns = mergePatternsIntoState({
    state: currentState,
    detectedPatterns: patternDetection.detectedPatterns,
    now,
  });

  const newStablePatterns = mergedPatterns.filter((pattern) => {
    const existedBefore = (currentState.patterns ?? []).some(
      (existingPattern) => existingPattern.id === pattern.id
    );

    return !existedBefore && pattern.status === "stable";
  });

  const changedStablePatterns = mergedPatterns.filter((pattern) => {
    const previousPattern = (currentState.patterns ?? []).find(
      (existingPattern) => existingPattern.id === pattern.id
    );

    if (!previousPattern) return false;

    return (
      previousPattern.status !== pattern.status ||
      previousPattern.confidence !== pattern.confidence ||
      previousPattern.strength !== pattern.strength ||
      previousPattern.occurrences !== pattern.occurrences
    );
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

    newStablePatterns,

    changedStablePatterns: changedStablePatterns.map((pattern) => ({
      stablePatternId: pattern.id,
      label: pattern.label,
      direction: pattern.status === "stable" ? "strengthened" : "unchanged",
      reason: pattern.reason,
    })),

    executiveNarrative: {
      headline: buildHeadline(
        deltaCounts(observationMerge, beliefMerge, patternDetection)
      ),
      summary: buildSummary(observationMerge, beliefMerge, patternDetection),
      whatChanged: buildWhatChanged(
        observationMerge,
        beliefMerge,
        patternDetection
      ),
      whyItMatters: buildWhyItMatters(
        observationMerge,
        beliefMerge,
        patternDetection
      ),
      suggestedQuestions: buildSuggestedQuestions(
        observationMerge,
        beliefMerge,
        patternDetection
      ),
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
    ...patternDetection.detectedPatterns.map((pattern) => pattern.id),
  ];

  const nextStateWithoutOrganism: UnderstandingState = {
    ...currentState,
    version: currentState.version + 1,
    updatedAt: now,
    events: [...currentState.events, event],
    observations: observationMerge.observations,
    beliefs: beliefMerge.beliefs,
    patterns: mergedPatterns,
    stablePatterns: mergedPatterns.filter(
      (pattern) => pattern.status === "stable"
    ),
  };

  const nextState: UnderstandingState = {
    ...nextStateWithoutOrganism,
    organism: evolveOrganismFromState(
      nextStateWithoutOrganism,
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
  beliefMerge: ReturnType<typeof mergeBeliefs>,
  patternDetection: ReturnType<typeof detectPatternsFromComparison>
) {
  return {
    addedObservations: observationMerge.addedObservations.length,
    strengthenedObservations: observationMerge.strengthenedObservations.length,
    addedBeliefs: beliefMerge.addedBeliefs.length,
    strengthenedBeliefs: beliefMerge.strengthenedBeliefs.length,
    detectedPatterns: patternDetection.detectedPatterns.length,
  };
}

function buildHeadline(counts: ReturnType<typeof deltaCounts>): string {
  const totalNew = counts.addedObservations + counts.addedBeliefs;
  const totalStrengthened =
    counts.strengthenedObservations + counts.strengthenedBeliefs;

  if (counts.detectedPatterns > 0) {
    return "A recurring organizational pattern is emerging";
  }

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
  beliefMerge: ReturnType<typeof mergeBeliefs>,
  patternDetection: ReturnType<typeof detectPatternsFromComparison>
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

  if (patternDetection.detectedPatterns.length > 0) {
    parts.push(
      `${patternDetection.detectedPatterns.length} recurring pattern${
        patternDetection.detectedPatterns.length === 1 ? "" : "s"
      } detected`
    );
  }

  if (parts.length === 0) {
    return "The latest upload was processed without materially changing the persistent understanding.";
  }

  return `${parts.join(", ")}.`;
}

function buildWhatChanged(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>,
  patternDetection: ReturnType<typeof detectPatternsFromComparison>
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

  patternDetection.detectedPatterns.slice(0, 3).forEach((pattern) => {
    changes.push(`Emerging pattern: ${pattern.statement}`);
  });

  return changes;
}

function buildWhyItMatters(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>,
  patternDetection: ReturnType<typeof detectPatternsFromComparison>
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

  if (patternDetection.detectedPatterns.length > 0) {
    reasons.push(
      "Recurring patterns are the first sign that Discovery is learning across uploads rather than only analyzing documents independently."
    );
  }

  return reasons;
}

function buildSuggestedQuestions(
  observationMerge: ReturnType<typeof mergeObservations>,
  beliefMerge: ReturnType<typeof mergeBeliefs>,
  patternDetection: ReturnType<typeof detectPatternsFromComparison>
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

  if (patternDetection.detectedPatterns.length > 0) {
    questions.push(
      "Should this emerging pattern become something Discovery tracks over time?"
    );
  }

  if (questions.length === 0) {
    questions.push("Did this upload change anything important that should be tracked?");
  }

  return questions;
}