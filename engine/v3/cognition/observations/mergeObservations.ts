import {
  ObservationChange,
  PersistentObservation,
  UnderstandingEngineInput,
} from "../../understanding/types";

type MergeObservationsResult = {
  observations: PersistentObservation[];
  addedObservations: PersistentObservation[];
  strengthenedObservations: ObservationChange[];
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

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getEvidenceText(evidence: any): string {
  return (
    evidence?.text ||
    evidence?.excerpt ||
    evidence?.summary ||
    evidence?.content ||
    "Unspecified evidence"
  );
}

function getEvidenceConfidence(evidence: any): number {
  if (typeof evidence?.confidence === "number") {
    return clampConfidence(evidence.confidence);
  }

  return 0.55;
}

export function mergeObservations(params: {
  previousObservations: PersistentObservation[];
  investigation: UnderstandingEngineInput;
  uploadId: string;
  now: string;
}): MergeObservationsResult {
  const nextObservations = [...params.previousObservations];
  const addedObservations: PersistentObservation[] = [];
  const strengthenedObservations: ObservationChange[] = [];

  const incomingEvidence = params.investigation.evidence ?? [];

  incomingEvidence.forEach((evidence, index) => {
    const statement = getEvidenceText(evidence);
    const confidence = getEvidenceConfidence(evidence);

    const existingIndex = nextObservations.findIndex((existingObservation) => {
      return calculateSimilarity(existingObservation.statement, statement) >= 0.42;
    });

    if (existingIndex === -1) {
      const newObservation: PersistentObservation = {
        id: `observation-${params.uploadId}-${index}`,
        uploadId: params.uploadId,
        statement,
        implication: "This observation may affect the organization’s evolving understanding.",
        confidence,
        firstSeenAt: params.now,
        lastSeenAt: params.now,
        evidenceIds: [],
        relatedThemeIds: [],
        relatedBeliefIds: [],
        occurrenceCount: 1,
      };

      nextObservations.push(newObservation);
      addedObservations.push(newObservation);
      return;
    }

    const existingObservation = nextObservations[existingIndex];
    const previousConfidence = existingObservation.confidence;
    const nextConfidence = clampConfidence(
      previousConfidence + (confidence - previousConfidence) * 0.25 + 0.04
    );

    const updatedObservation: PersistentObservation = {
      ...existingObservation,
      confidence: nextConfidence,
      lastSeenAt: params.now,
      occurrenceCount: existingObservation.occurrenceCount + 1,
    };

    nextObservations[existingIndex] = updatedObservation;

    strengthenedObservations.push({
      observationId: updatedObservation.id,
      statement: updatedObservation.statement,
      direction: "strengthened",
      previousConfidence,
      nextConfidence,
      reason: "A similar observation appeared again in the latest upload.",
    });
  });

  return {
    observations: nextObservations,
    addedObservations,
    strengthenedObservations,
  };
}