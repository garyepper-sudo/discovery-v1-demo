import type {
  PersistentBelief,
  BeliefChange,
} from "../../understanding/types";

// 🔥 NEW: pattern integration
import type { MechanismPattern } from "../../compression/consolidateMechanismPatterns";

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

  // optional forward compatibility (safe no-op if not used elsewhere)
  patternIds?: string[];
  patternSupportCount?: number;
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

// 🔥 NEW: pattern signal function
function computePatternSignal(patterns: MechanismPattern[]): number {
  if (!patterns.length) return 0;

  const avgConfidence =
    patterns.reduce((sum, p) => sum + (p.averageConfidence ?? 0), 0) /
    patterns.length;

  const frequencyBoost = Math.log(1 + patterns.length) * 0.1;

  return Math.min(0.25, avgConfidence * 0.2 + frequencyBoost);
}

export function mergeBeliefs(params: {
  previousBeliefs: PersistentBelief[];
  investigation: BeliefInvestigationInput;
  uploadId: string;
  now: string;

  // 🔥 NEW: patterns injected from consolidation layer
  patterns?: MechanismPattern[];
}): BeliefMergeResult {
  const beliefs = [...params.previousBeliefs] as BeliefWithSupportCount[];

  const addedBeliefs: PersistentBelief[] = [];
  const strengthenedBeliefs: BeliefChange[] = [];
  const weakenedBeliefs: BeliefChange[] = [];

  const candidateStatements = extractCandidateStatements(params.investigation);

  const patterns = params.patterns ?? [];
  const patternSignal = computePatternSignal(patterns);

  for (const statement of candidateStatements) {
    const normalizedStatement = normalizeText(statement);

    const existing = beliefs.find(
      (belief) => normalizeText(belief.statement) === normalizedStatement,
    );

    // =========================
    // 🔁 STRENGTHEN EXISTING BELIEF
    // =========================
    if (existing) {
      const previousConfidence = existing.confidence;

      const nextConfidence = clampConfidence(
        existing.confidence +
          0.04 +
          patternSignal * 0.5,
      );

      existing.confidence = nextConfidence;
      existing.supportCount = (existing.supportCount ?? 1) + 1;
      existing.lastSeenAt = params.now;

      existing.evidenceIds = Array.from(
        new Set([...existing.evidenceIds, params.uploadId]),
      );

      // optional pattern traceability
      existing.patternIds = [
        ...(existing.patternIds ?? []),
        ...patterns.map((p) => p.id),
      ];

      existing.patternSupportCount =
        (existing.patternSupportCount ?? 0) + patterns.length;

      strengthenedBeliefs.push({
        beliefId: existing.id,
        statement: existing.statement,
        direction: "strengthened",
        previousConfidence,
        nextConfidence,
        reason: `Reinforced by new evidence + pattern recurrence signal`,
      });

      continue;
    }

    // =========================
    // 🧠 CREATE NEW BELIEF
    // =========================
    const newBelief = {
      id: createBeliefId(statement),
      cognitiveLayer: "belief",
      ontologyVersion: "1.0",
      statement,
      rationale: "Belief inferred from repeated investigation input.",
      confidence: clampConfidence(0.58 + patternSignal),
      stability: "emerging",
      evidenceIds: [params.uploadId],
      observationIds: [],
      themeIds: [],
      firstSeenAt: params.now,
      lastSeenAt: params.now,
      occurrenceCount: 1,
      supportCount: 1,

      // 🔥 pattern enrichment
      patternIds: patterns.map((p) => p.id),
      patternSupportCount: patterns.length,
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