import {
  BeliefChange,
  PersistentBelief,
  UnderstandingEngineInput,
} from "../../understanding/types";

type MergeBeliefsResult = {
  beliefs: PersistentBelief[];
  addedBeliefs: PersistentBelief[];
  strengthenedBeliefs: BeliefChange[];
  weakenedBeliefs: BeliefChange[];
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

function getStability(occurrenceCount: number): PersistentBelief["stability"] {
  if (occurrenceCount >= 4) return "stable";
  if (occurrenceCount >= 2) return "forming";
  return "emerging";
}

function getBeliefStatement(belief: any): string {
  return (
    belief?.statement ||
    belief?.headline ||
    belief?.claim ||
    belief?.title ||
    belief?.label ||
    "Unspecified belief"
  );
}

function getBeliefRationale(belief: any): string {
  return (
    belief?.rationale ||
    belief?.reason ||
    belief?.explanation ||
    belief?.description ||
    belief?.summary ||
    "This belief emerged from the latest investigation."
  );
}

function getBeliefConfidence(belief: any): number {
  const rawConfidence = belief?.confidence;

  if (typeof rawConfidence === "number") {
    return Math.max(0, Math.min(1, rawConfidence));
  }

  return 0.55;
}

function getBeliefEvidenceIds(belief: any): string[] {
  const ids = [
    ...(belief?.evidenceIds || []),
    ...(belief?.supportingEvidenceIds || []),
  ];

  return Array.from(new Set(ids.filter(Boolean)));
}

function getBeliefThemeIds(belief: any): string[] {
  return Array.from(new Set([...(belief?.themeIds || [])].filter(Boolean)));
}

export function mergeBeliefs(params: {
  previousBeliefs: PersistentBelief[];
  investigation: UnderstandingEngineInput;
  uploadId: string;
  now: string;
}): MergeBeliefsResult {
  const nextBeliefs = [...params.previousBeliefs];
  const addedBeliefs: PersistentBelief[] = [];
  const strengthenedBeliefs: BeliefChange[] = [];
  const weakenedBeliefs: BeliefChange[] = [];

  const incomingBeliefs = params.investigation.beliefs ?? [];

  incomingBeliefs.forEach((incomingBelief, index) => {
    const statement = getBeliefStatement(incomingBelief);
    const rationale = getBeliefRationale(incomingBelief);
    const confidence = getBeliefConfidence(incomingBelief);
    const evidenceIds = getBeliefEvidenceIds(incomingBelief);
    const themeIds = getBeliefThemeIds(incomingBelief);

    const existingIndex = nextBeliefs.findIndex((existingBelief) => {
      return calculateSimilarity(existingBelief.statement, statement) >= 0.42;
    });

    if (existingIndex === -1) {
      const newBelief: PersistentBelief = {
        id: `belief-${params.uploadId}-${index}`,
        statement,
        rationale,
        confidence,
        stability: "emerging",
        firstSeenAt: params.now,
        lastSeenAt: params.now,
        evidenceIds,
        observationIds: [],
        themeIds,
        occurrenceCount: 1,
      };

      nextBeliefs.push(newBelief);
      addedBeliefs.push(newBelief);
      return;
    }

    const existingBelief = nextBeliefs[existingIndex];
    const previousConfidence = existingBelief.confidence;
    const occurrenceCount = existingBelief.occurrenceCount + 1;

    const nextConfidence = Math.min(
      0.98,
      Number(
        (
          previousConfidence +
          (confidence - previousConfidence) * 0.25 +
          0.05
        ).toFixed(2)
      )
    );

    const updatedBelief: PersistentBelief = {
      ...existingBelief,
      rationale,
      confidence: nextConfidence,
      lastSeenAt: params.now,
      occurrenceCount,
      stability: getStability(occurrenceCount),
      evidenceIds: Array.from(
        new Set([...(existingBelief.evidenceIds || []), ...evidenceIds])
      ),
      themeIds: Array.from(
        new Set([...(existingBelief.themeIds || []), ...themeIds])
      ),
    };

    nextBeliefs[existingIndex] = updatedBelief;

    strengthenedBeliefs.push({
      beliefId: updatedBelief.id,
      statement: updatedBelief.statement,
      direction: "strengthened",
      previousConfidence,
      nextConfidence,
      reason: "A similar belief appeared again in the latest investigation.",
    });
  });

  return {
    beliefs: nextBeliefs,
    addedBeliefs,
    strengthenedBeliefs,
    weakenedBeliefs,
  };
}