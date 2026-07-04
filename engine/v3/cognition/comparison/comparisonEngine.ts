import {
  PersistentBelief,
  PersistentObservation,
  UnderstandingState,
} from "../../understanding/types";

export type ObservationComparison = {
  observationId: string;
  statement: string;
  comparisonType: "new" | "reinforces" | "possibly_related";
  relatedObservationIds: string[];
  relatedBeliefIds: string[];
  confidence: number;
  reason: string;
};

export type UnderstandingComparison = {
  newObservations: ObservationComparison[];
  reinforcingObservations: ObservationComparison[];
  possiblyRelatedObservations: ObservationComparison[];
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeText(a).split(" ").filter(Boolean));
  const wordsB = new Set(normalizeText(b).split(" ").filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const overlap = [...wordsA].filter((word) => wordsB.has(word)).length;
  const totalUnique = new Set([...wordsA, ...wordsB]).size;

  return overlap / totalUnique;
}

function findRelatedObservations(params: {
  observation: PersistentObservation;
  state: UnderstandingState;
}): PersistentObservation[] {
  return params.state.observations.filter((existingObservation) => {
    if (existingObservation.id === params.observation.id) return false;

    return (
      calculateSimilarity(
        existingObservation.statement,
        params.observation.statement
      ) >= 0.32
    );
  });
}

function findRelatedBeliefs(params: {
  observation: PersistentObservation;
  state: UnderstandingState;
}): PersistentBelief[] {
  return params.state.beliefs.filter((belief) => {
    return calculateSimilarity(belief.statement, params.observation.statement) >= 0.28;
  });
}

export function compareObservationsToState(params: {
  state: UnderstandingState;
  observations: PersistentObservation[];
}): UnderstandingComparison {
  const newObservations: ObservationComparison[] = [];
  const reinforcingObservations: ObservationComparison[] = [];
  const possiblyRelatedObservations: ObservationComparison[] = [];

  params.observations.forEach((observation) => {
    const relatedObservations = findRelatedObservations({
      observation,
      state: params.state,
    });

    const relatedBeliefs = findRelatedBeliefs({
      observation,
      state: params.state,
    });

    if (relatedObservations.length > 0) {
      reinforcingObservations.push({
        observationId: observation.id,
        statement: observation.statement,
        comparisonType: "reinforces",
        relatedObservationIds: relatedObservations.map((item) => item.id),
        relatedBeliefIds: relatedBeliefs.map((item) => item.id),
        confidence: observation.confidence,
        reason:
          "This observation resembles something already present in organizational memory.",
      });

      return;
    }

    if (relatedBeliefs.length > 0) {
      possiblyRelatedObservations.push({
        observationId: observation.id,
        statement: observation.statement,
        comparisonType: "possibly_related",
        relatedObservationIds: [],
        relatedBeliefIds: relatedBeliefs.map((item) => item.id),
        confidence: observation.confidence,
        reason:
          "This observation may relate to an existing belief, but it is not yet a repeated observation.",
      });

      return;
    }

    newObservations.push({
      observationId: observation.id,
      statement: observation.statement,
      comparisonType: "new",
      relatedObservationIds: [],
      relatedBeliefIds: [],
      confidence: observation.confidence,
      reason: "This appears to be a new signal in organizational memory.",
    });
  });

  return {
    newObservations,
    reinforcingObservations,
    possiblyRelatedObservations,
  };
}