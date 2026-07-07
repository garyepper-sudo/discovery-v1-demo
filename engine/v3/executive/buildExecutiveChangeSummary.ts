export type ExecutiveChangeItem = {
  id?: string;
  title: string;
  reason: string;
  confidenceDelta?: number;
};

export type ExecutiveChangeSummary = {
  newBeliefs: ExecutiveChangeItem[];
  strengthenedBeliefs: ExecutiveChangeItem[];
  weakenedBeliefs: ExecutiveChangeItem[];

  newTheories: ExecutiveChangeItem[];
  strengthenedTheories: ExecutiveChangeItem[];
  stabilizedTheories: ExecutiveChangeItem[];
  weakenedTheories: ExecutiveChangeItem[];

  understandingDelta: number;
  memoryDelta: number;
  confidenceDelta: number;
};

export type ExecutiveChangeSummaryInput = {
  currentSnapshot?: {
    organizationalUnderstandingScore?: number;
    memoryMaturityScore?: number;
    executiveAssessmentConfidence?: number;
  };

  previousSnapshot?: {
    organizationalUnderstandingScore?: number;
    memoryMaturityScore?: number;
    executiveAssessmentConfidence?: number;
  };

  learningEvents?: Array<{
    objectType?: string;
    objectId?: string;
    changeType?: string;
    reason?: string;
    confidenceDelta?: number;
  }>;

  beliefs?: Array<{
    id?: string;
    statement?: string;
    confidence?: number;
    trend?: string;
  }>;

  theories?: Array<{
    id?: string;
    statement?: string;
    status?: string;
    confidence?: number;
  }>;
};

function titleFromId(id?: string): string {
  if (!id) {
    return "Unknown organizational object";
  }

  return id
    .replace(/^belief[_:-]?/i, "")
    .replace(/^theory[_:-]?/i, "")
    .replace(/^concept-theory[_:-]?/i, "")
    .replace(/[_:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function findBeliefTitle(
  beliefs: ExecutiveChangeSummaryInput["beliefs"],
  id?: string,
): string {
  const match = beliefs?.find((belief) => belief.id === id);
  return match?.statement || titleFromId(id);
}

function findTheoryTitle(
  theories: ExecutiveChangeSummaryInput["theories"],
  id?: string,
): string {
  const match = theories?.find((theory) => theory.id === id);
  return match?.statement || titleFromId(id);
}

function toChangeItem(params: {
  id?: string;
  title: string;
  reason?: string;
  confidenceDelta?: number;
}): ExecutiveChangeItem {
  return {
    id: params.id,
    title: params.title,
    reason: params.reason || "Discovery detected a meaningful change in organizational understanding.",
    confidenceDelta: params.confidenceDelta,
  };
}

export function buildExecutiveChangeSummary(
  input: ExecutiveChangeSummaryInput,
): ExecutiveChangeSummary {
  const learningEvents = input.learningEvents ?? [];

  const beliefEvents = learningEvents.filter(
    (event) => event.objectType === "belief",
  );

  const theoryEvents = learningEvents.filter(
    (event) => event.objectType === "theory",
  );

  const newBeliefs = beliefEvents
    .filter(
      (event) =>
        event.changeType === "new" ||
        event.changeType === "created" ||
        (event.confidenceDelta ?? 0) > 0.2,
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findBeliefTitle(input.beliefs, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const strengthenedBeliefs = beliefEvents
    .filter(
      (event) =>
        event.changeType === "strengthening" ||
        event.changeType === "strengthened",
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findBeliefTitle(input.beliefs, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const weakenedBeliefs = beliefEvents
    .filter(
      (event) =>
        event.changeType === "weakening" ||
        event.changeType === "weakened",
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findBeliefTitle(input.beliefs, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const newTheories = theoryEvents
    .filter(
      (event) =>
        event.changeType === "new" ||
        event.changeType === "created" ||
        (event.confidenceDelta ?? 0) > 0.2,
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findTheoryTitle(input.theories, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const strengthenedTheories = theoryEvents
    .filter(
      (event) =>
        event.changeType === "strengthening" ||
        event.changeType === "strengthened",
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findTheoryTitle(input.theories, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const stabilizedTheories = theoryEvents
    .filter(
      (event) =>
        event.changeType === "stable" ||
        event.changeType === "stabilized",
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findTheoryTitle(input.theories, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const weakenedTheories = theoryEvents
    .filter(
      (event) =>
        event.changeType === "weakening" ||
        event.changeType === "weakened" ||
        event.changeType === "contradicted" ||
        event.changeType === "retired",
    )
    .map((event) =>
      toChangeItem({
        id: event.objectId,
        title: findTheoryTitle(input.theories, event.objectId),
        reason: event.reason,
        confidenceDelta: event.confidenceDelta,
      }),
    );

  const currentUnderstanding =
    input.currentSnapshot?.organizationalUnderstandingScore ?? 0;

  const previousUnderstanding =
    input.previousSnapshot?.organizationalUnderstandingScore ??
    currentUnderstanding;

  const currentMemory = input.currentSnapshot?.memoryMaturityScore ?? 0;

  const previousMemory =
    input.previousSnapshot?.memoryMaturityScore ?? currentMemory;

  const currentConfidence =
    input.currentSnapshot?.executiveAssessmentConfidence ?? 0;

  const previousConfidence =
    input.previousSnapshot?.executiveAssessmentConfidence ?? currentConfidence;

  return {
    newBeliefs,
    strengthenedBeliefs,
    weakenedBeliefs,

    newTheories,
    strengthenedTheories,
    stabilizedTheories,
    weakenedTheories,

    understandingDelta: currentUnderstanding - previousUnderstanding,
    memoryDelta: currentMemory - previousMemory,
    confidenceDelta: currentConfidence - previousConfidence,
  };
}