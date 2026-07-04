import {
  PersistentBelief,
  PersistentObservation,
  UnderstandingState,
} from "../../understanding/types";

export type BeliefInference = {
  beliefId?: string;
  observationId: string;
  inferenceType: "supports_existing" | "suggests_new" | "possibly_related";
  confidence: number;
  reason: string;
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bdelays\b/g, "delay capacity constraint")
    .replace(/\bhiring\b/g, "hiring talent capacity")
    .replace(/\bslowing\b/g, "limiting slowing constraint")
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

function findMostRelatedBelief(params: {
  observation: PersistentObservation;
  beliefs: PersistentBelief[];
}): {
  belief?: PersistentBelief;
  similarity: number;
} {
  let bestBelief: PersistentBelief | undefined;
  let bestSimilarity = 0;

  params.beliefs.forEach((belief) => {
    const similarity = Math.max(
      calculateSimilarity(params.observation.statement, belief.statement),
      calculateSimilarity(params.observation.statement, belief.rationale)
    );

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestBelief = belief;
    }
  });

  return {
    belief: bestBelief,
    similarity: bestSimilarity,
  };
}

export function inferBeliefUpdates(params: {
  state: UnderstandingState;
  observations: PersistentObservation[];
}): BeliefInference[] {
  return params.observations.map((observation) => {
    const related = findMostRelatedBelief({
      observation,
      beliefs: params.state.beliefs,
    });

    if (related.belief && related.similarity >= 0.42) {
      return {
        beliefId: related.belief.id,
        observationId: observation.id,
        inferenceType: "supports_existing",
        confidence: Math.min(1, observation.confidence + related.similarity * 0.2),
        reason:
          "This observation appears to support an existing belief in organizational memory.",
      };
    }

    if (related.belief && related.similarity >= 0.24) {
      return {
        beliefId: related.belief.id,
        observationId: observation.id,
        inferenceType: "possibly_related",
        confidence: Math.min(1, observation.confidence + related.similarity * 0.1),
        reason:
          "This observation may relate to an existing belief, but the relationship is not strong enough to treat as support yet.",
      };
    }

    return {
      observationId: observation.id,
      inferenceType: "suggests_new",
      confidence: observation.confidence,
      reason:
        "This observation does not strongly match existing beliefs and may suggest a new belief.",
    };
  });
}