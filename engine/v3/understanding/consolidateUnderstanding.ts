import type {
  OrganizationalUnderstandingItem,
  OrganizationalUnderstandingState,
} from "../runtime/organizationalUnderstandingState";
import {
  getConfidenceBand,
  getUnderstandingStatus,
} from "../runtime/organizationalUnderstandingState";

type UnderstandingCandidate = {
  id?: string;
  statement: string;
  confidence?: number;
  evidenceIds?: string[];
  observationIds?: string[];
  beliefIds?: string[];
  themeIds?: string[];
  mechanismIds?: string[];
  contradictionIds?: string[];
  source?: string;
};

type ConsolidationChange = {
  type:
    | "new_understanding"
    | "strengthened_understanding"
    | "weakened_understanding"
    | "stabilized_understanding";
  title: string;
  description: string;
  relatedUnderstandingIds: string[];
};

type ConsolidationResult = {
  updatedUnderstandings: OrganizationalUnderstandingItem[];
  changes: ConsolidationChange[];
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSimilarity(a: string, b: string): number {
  const aTokens = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeText(b).split(" ").filter(Boolean));

  if (!aTokens.size || !bTokens.size) return 0;

  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;

  return overlap / union;
}

function isContradictory(candidate: string, existing: string): boolean {
  const candidateText = normalizeText(candidate);
  const existingText = normalizeText(existing);

  const improvementSignal =
    candidateText.includes("improved") ||
    candidateText.includes("resolved") ||
    candidateText.includes("reduced") ||
    candidateText.includes("no longer") ||
    candidateText.includes("eliminated") ||
    candidateText.includes("accelerated");

  const existingConstraintSignal =
    existingText.includes("delay") ||
    existingText.includes("constraint") ||
    existingText.includes("risk") ||
    existingText.includes("slowing") ||
    existingText.includes("blocked") ||
    existingText.includes("limited");

  return improvementSignal && existingConstraintSignal;
}

function clampConfidence(value: number): number {
  return Math.max(0.05, Math.min(0.98, Number(value.toFixed(2))));
}

function createId(statement: string): string {
  const normalized = normalizeText(statement).slice(0, 48).replace(/\s+/g, "-");
  return `understanding-${normalized}-${Date.now()}`;
}

function mergeIds(existing: string[], incoming?: string[]): string[] {
  return Array.from(new Set([...existing, ...(incoming ?? [])]));
}

export function consolidateUnderstanding(
  currentState: OrganizationalUnderstandingState,
  candidates: UnderstandingCandidate[]
): ConsolidationResult {
  const now = new Date().toISOString();
  const updatedUnderstandings = [...currentState.currentUnderstandings];
  const changes: ConsolidationChange[] = [];

  for (const candidate of candidates) {
    const bestMatch = updatedUnderstandings
      .map((existing) => ({
        existing,
        similarity: tokenSimilarity(candidate.statement, existing.statement),
      }))
      .sort((a, b) => b.similarity - a.similarity)[0];

    const candidateConfidence = candidate.confidence ?? 0.55;

    if (bestMatch && bestMatch.similarity >= 0.45) {
      const existing = bestMatch.existing;
      const previousConfidence = existing.confidence;
      const contradictory = isContradictory(
        candidate.statement,
        existing.statement
      );

      const nextConfidence = contradictory
        ? clampConfidence(existing.confidence - 0.12)
        : clampConfidence(existing.confidence + 0.08 * candidateConfidence);

      const nextSupportCount = contradictory
        ? existing.supportCount
        : existing.supportCount + 1;

      existing.confidence = nextConfidence;
      existing.confidenceBand = getConfidenceBand(nextConfidence);
      existing.status = contradictory
        ? "weakening"
        : getUnderstandingStatus({
            confidence: nextConfidence,
            supportCount: nextSupportCount,
          });

      existing.supportCount = nextSupportCount;
      existing.lastUpdatedAt = now;

      existing.evidenceIds = mergeIds(existing.evidenceIds, candidate.evidenceIds);
      existing.observationIds = mergeIds(
        existing.observationIds,
        candidate.observationIds
      );
      existing.beliefIds = mergeIds(existing.beliefIds, candidate.beliefIds);
      existing.themeIds = mergeIds(existing.themeIds, candidate.themeIds);
      existing.mechanismIds = mergeIds(
        existing.mechanismIds,
        candidate.mechanismIds
      );
      existing.contradictionIds = mergeIds(
        existing.contradictionIds,
        candidate.contradictionIds
      );

      existing.history = [
        ...existing.history,
        {
          date: now,
          event: contradictory ? "weakened" : "strengthened",
          previousConfidence,
          nextConfidence,
          reason: contradictory
            ? `New experience weakened this understanding: "${candidate.statement}"`
            : `New experience reinforced this understanding: "${candidate.statement}"`,
        },
      ];

      changes.push({
        type: contradictory
          ? "weakened_understanding"
          : nextSupportCount >= 4 && nextConfidence >= 0.75
            ? "stabilized_understanding"
            : "strengthened_understanding",
        title: contradictory
          ? "Understanding weakened"
          : "Understanding strengthened",
        description: contradictory
          ? `Discovery found evidence that may contradict: "${existing.statement}"`
          : `Discovery connected new experience to existing understanding: "${existing.statement}"`,
        relatedUnderstandingIds: [existing.id],
      });

      continue;
    }

    const confidence = clampConfidence(candidateConfidence);

    const newUnderstanding: OrganizationalUnderstandingItem = {
      id: candidate.id ?? createId(candidate.statement),
      statement: candidate.statement,
      summary: candidate.statement,
      confidence,
      confidenceBand: getConfidenceBand(confidence),
      status: getUnderstandingStatus({ confidence, supportCount: 1 }),
      firstSeenAt: now,
      lastUpdatedAt: now,
      supportCount: 1,
      evidenceIds: candidate.evidenceIds ?? [],
      observationIds: candidate.observationIds ?? [],
      beliefIds: candidate.beliefIds ?? [],
      themeIds: candidate.themeIds ?? [],
      mechanismIds: candidate.mechanismIds ?? [],
      contradictionIds: candidate.contradictionIds ?? [],
      whyItMatters:
        "This may represent a recurring organizational pattern worth tracking.",
      openQuestions: [
        "Will future organizational experience reinforce or weaken this understanding?",
      ],
      implications: [],
      history: [
        {
          date: now,
          event: "created",
          nextConfidence: confidence,
          reason: `New organizational understanding created from experience: "${candidate.statement}"`,
        },
      ],
    };

    updatedUnderstandings.push(newUnderstanding);

    changes.push({
      type: "new_understanding",
      title: "New understanding created",
      description: `Discovery formed a new organizational understanding: "${candidate.statement}"`,
      relatedUnderstandingIds: [newUnderstanding.id],
    });
  }

  return {
    updatedUnderstandings,
    changes,
  };
}