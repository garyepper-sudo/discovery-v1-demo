import {
  PersistentBelief,
  PersistentObservation,
  UnderstandingState,
} from "../../understanding/types";

import { semanticSimilarity } from "../semanticSimilarity";

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

function findRelatedObservations(params: {
  observation: PersistentObservation;
  state: UnderstandingState;
}): PersistentObservation[] {
  return params.state.observations.filter((existingObservation) => {
    if (existingObservation.id === params.observation.id) return false;

    const similarity = semanticSimilarity(
      existingObservation.statement,
      params.observation.statement
    );

    return similarity.score >= 0.34;
  });
}

function findRelatedBeliefs(params: {
  observation: PersistentObservation;
  state: UnderstandingState;
}): PersistentBelief[] {
  return params.state.beliefs.filter((belief) => {
    const similarity = semanticSimilarity(
      belief.statement,
      params.observation.statement
    );

    return similarity.score >= 0.34;
  });
}

function buildReason(params: {
  comparisonType: ObservationComparison["comparisonType"];
  observation: PersistentObservation;
  relatedObservations: PersistentObservation[];
  relatedBeliefs: PersistentBelief[];
}): string {
  if (params.comparisonType === "reinforces") {
    return "This observation semantically reinforces something already present in organizational memory.";
  }

  if (params.comparisonType === "possibly_related") {
    return "This observation appears semantically related to an existing belief, but it is not yet a repeated observation.";
  }

  return "This appears to be a new signal in organizational memory.";
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
        reason: buildReason({
          comparisonType: "reinforces",
          observation,
          relatedObservations,
          relatedBeliefs,
        }),
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
        reason: buildReason({
          comparisonType: "possibly_related",
          observation,
          relatedObservations,
          relatedBeliefs,
        }),
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
      reason: buildReason({
        comparisonType: "new",
        observation,
        relatedObservations,
        relatedBeliefs,
      }),
    });
  });

  return {
    newObservations,
    reinforcingObservations,
    possiblyRelatedObservations,
  };
}