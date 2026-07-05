import type {
  PersistentBelief,
  BeliefChange,
} from "../../understanding/types";

export type { PersistentBelief, BeliefChange };

type BeliefInvestigationInput = {
  summary?: string;
  title?: string;
  statement?: string;
  context?: string;
  question?: string;
  [key: string]: unknown;
};

type BeliefWithSupportCount = PersistentBelief & {
  supportCount?: number;
};

export type BeliefMergeResult = {
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

function createBeliefId(statement: string): string {
  const normalized = normalizeText(statement).slice(0, 56).replace(/\s+/g, "-");
  return `belief-${normalized}`;
}

function clampConfidence(value: number): number {
  return Math.max(0.1, Math.min(0.95, Number(value.toFixed(2))));
}

function isUsefulStatement(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const normalized = normalizeText(value);
  return normalized.length >= 12 && normalized.split(" ").length >= 3;
}

function extractCandidateStatements(
  investigation: BeliefInvestigationInput,
): string[] {
  return [
    investigation.summary,
    investigation.title,
    investigation.statement,
    investigation.context,
    investigation.question,
  ].filter(isUsefulStatement);
}

export function mergeBeliefs(params: {
  previousBeliefs: PersistentBelief[];
  investigation: BeliefInvestigationInput;
  uploadId: string;
  now: string;
}): BeliefMergeResult {
  const beliefs = [...params.previousBeliefs] as BeliefWithSupportCount[];

  const addedBeliefs: PersistentBelief[] = [];
  const strengthenedBeliefs: BeliefChange[] = [];
  const weakenedBeliefs: BeliefChange[] = [];

  const candidateStatements = extractCandidateStatements(params.investigation);

  for (const statement of candidateStatements) {
    const normalizedStatement = normalizeText(statement);

    const existing = beliefs.find(
      (belief) => normalizeText(belief.statement) === normalizedStatement,
    );

    if (existing) {
      const previousConfidence = existing.confidence;
      const nextConfidence = clampConfidence(existing.confidence + 0.06);

      existing.confidence = nextConfidence;
      existing.supportCount = (existing.supportCount ?? 1) + 1;
      existing.lastSeenAt = params.now;
      existing.evidenceIds = Array.from(
        new Set([...existing.evidenceIds, params.uploadId]),
      );

      strengthenedBeliefs.push({
        beliefId: existing.id,
        statement: existing.statement,
        direction: "strengthened",
        previousConfidence,
        nextConfidence,
        reason: `Belief reinforced by new investigation evidence: "${statement}"`,
      });

      continue;
    }

    const newBelief = {
      id: createBeliefId(statement),
      cognitiveLayer: "belief",
      ontologyVersion: "1.0",
      statement,
      rationale: "Belief inferred from repeated investigation input.",
      confidence: 0.58,
      stability: "emerging",
      evidenceIds: [params.uploadId],
      observationIds: [],
      themeIds: [],
      firstSeenAt: params.now,
      lastSeenAt: params.now,
      occurrenceCount: 1,
      supportCount: 1,
    } as BeliefWithSupportCount;

    beliefs.push(newBelief);
    addedBeliefs.push(newBelief as PersistentBelief);
  }

  return {
    beliefs: beliefs as PersistentBelief[],
    addedBeliefs,
    strengthenedBeliefs,
    weakenedBeliefs,
  };
}