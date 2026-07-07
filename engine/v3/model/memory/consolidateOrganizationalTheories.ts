import type {
  OrganizationalTheory,
  OrganizationalTheoryEvolution,
  OrganizationalTheoryStatus,
} from "./organizationalTheories";

type TheorySignal = {
  id?: string;
  title?: string;
  statement?: string;
  explanation?: string;
  summary?: string;
  confidence?: number;
  supportingMechanismIds?: string[];
  supportingBeliefIds?: string[];
  supportingConceptIds?: string[];
  supportingEvidenceIds?: string[];
};

export type ConsolidateOrganizationalTheoriesParams = {
  existingTheories: OrganizationalTheory[];
  beliefs: TheorySignal[];
  mechanisms: TheorySignal[];
  concepts: TheorySignal[];
  evidence: TheorySignal[];
  now?: string;
};

export type ConsolidateOrganizationalTheoriesResult = {
  theories: OrganizationalTheory[];
  theoryEvolution: OrganizationalTheoryEvolution[];
};

export function consolidateOrganizationalTheories({
  existingTheories,
  beliefs,
  mechanisms,
  concepts,
  evidence,
  now = new Date().toISOString(),
}: ConsolidateOrganizationalTheoriesParams): ConsolidateOrganizationalTheoriesResult {
  const candidates = buildTheoryCandidates({
    beliefs,
    mechanisms,
    concepts,
    evidence,
    now,
  });

  const theoryMap = new Map(existingTheories.map((theory) => [theory.id, theory]));
  const theoryEvolution: OrganizationalTheoryEvolution[] = [];

  for (const candidate of candidates) {
    const existing = theoryMap.get(candidate.id);

    if (!existing) {
      theoryMap.set(candidate.id, candidate);
      theoryEvolution.push({
        theoryId: candidate.id,
        previousConfidence: 0,
        currentConfidence: candidate.confidence,
        delta: candidate.confidence,
        status: candidate.status,
        reason:
          candidate.status === "strengthening"
            ? "A new organizational theory emerged with enough support to begin strengthening immediately."
            : "A new organizational theory emerged from recurring beliefs, mechanisms, or concepts.",
      });
      continue;
    }

    const currentConfidence = clamp(
      existing.confidence * 0.72 + candidate.confidence * 0.28 + 0.04,
      0,
      1,
    );

    const delta = currentConfidence - existing.confidence;
    const status = classifyTheoryStatus({
      previousConfidence: existing.confidence,
      currentConfidence,
      investigationCount: existing.investigationCount + 1,
      supportCount:
        candidate.supportingBeliefs.length +
        candidate.supportingMechanisms.length +
        candidate.supportingConcepts.length +
        candidate.supportingEvidence.length,
    });

    const updated: OrganizationalTheory = {
      ...existing,
      explanation: candidate.explanation || existing.explanation,
      confidence: currentConfidence,
      stability: clamp(
        existing.stability * 0.72 + candidate.stability * 0.28 + 0.04,
        0,
        1,
      ),
      novelty: Math.max(0, existing.novelty * 0.82 - 0.04),
      supportingMechanisms: mergeIds(
        existing.supportingMechanisms,
        candidate.supportingMechanisms,
      ),
      supportingBeliefs: mergeIds(
        existing.supportingBeliefs,
        candidate.supportingBeliefs,
      ),
      supportingConcepts: mergeIds(
        existing.supportingConcepts,
        candidate.supportingConcepts,
      ),
      supportingEvidence: mergeIds(
        existing.supportingEvidence,
        candidate.supportingEvidence,
      ),
      lastConfirmed: now,
      investigationCount: existing.investigationCount + 1,
      status,
    };

    theoryMap.set(candidate.id, updated);

    theoryEvolution.push({
      theoryId: updated.id,
      previousConfidence: existing.confidence,
      currentConfidence,
      delta,
      status,
      reason:
        delta >= 0
          ? "This organizational theory was reinforced by the current investigation."
          : "This organizational theory received weaker support in the current investigation.",
    });
  }

  const retired = retireUnsupportedTheories({
    existingTheories,
    candidateIds: new Set(candidates.map((candidate) => candidate.id)),
    now,
  });

  for (const retiredTheory of retired) {
    theoryMap.set(retiredTheory.id, retiredTheory);
    theoryEvolution.push({
      theoryId: retiredTheory.id,
      previousConfidence:
        existingTheories.find((theory) => theory.id === retiredTheory.id)
          ?.confidence ?? retiredTheory.confidence,
      currentConfidence: retiredTheory.confidence,
      delta: 0,
      status: "retired",
      reason:
        "This organizational theory was retired because it was not reinforced by recent investigation evidence.",
    });
  }

  return {
    theories: [...theoryMap.values()].sort(
      (a, b) => b.confidence + b.stability - (a.confidence + a.stability),
    ),
    theoryEvolution,
  };
}

function buildTheoryCandidates(params: {
  beliefs: TheorySignal[];
  mechanisms: TheorySignal[];
  concepts: TheorySignal[];
  evidence: TheorySignal[];
  now: string;
}): OrganizationalTheory[] {
  const { beliefs, mechanisms, concepts, evidence, now } = params;
  const text = [...beliefs, ...mechanisms, ...concepts]
    .map(signalText)
    .join(" ")
    .toLowerCase();

  const candidates: OrganizationalTheory[] = [];

  if (matchesAny(text, ["knowledge", "documentation", "memory", "handoff"])) {
    candidates.push(
      createTheory({
        id: "theory:organizational-continuity-failure",
        title: "Organizational continuity failure",
        explanation:
          "The organization appears to be struggling to preserve, transfer, and reuse knowledge across time, teams, or leadership transitions.",
        beliefs,
        mechanisms,
        concepts,
        evidence,
        now,
      }),
    );
  }

  if (
    matchesAny(text, [
      "coordination",
      "cross-functional",
      "handoff",
      "execution",
      "alignment",
    ])
  ) {
    candidates.push(
      createTheory({
        id: "theory:cross-functional-execution-friction",
        title: "Cross-functional execution friction",
        explanation:
          "Execution appears constrained by coordination gaps, unclear ownership, or weak handoffs across functions.",
        beliefs,
        mechanisms,
        concepts,
        evidence,
        now,
      }),
    );
  }

  if (
    matchesAny(text, [
      "centralized",
      "approval",
      "decision",
      "governance",
      "bottleneck",
    ])
  ) {
    candidates.push(
      createTheory({
        id: "theory:centralized-governance-bottleneck",
        title: "Centralized governance bottleneck",
        explanation:
          "Decision authority appears concentrated in ways that slow execution, reduce local ownership, or create dependency on a small number of leaders.",
        beliefs,
        mechanisms,
        concepts,
        evidence,
        now,
      }),
    );
  }

  if (matchesAny(text, ["learning", "feedback", "repeat", "recurring"])) {
    candidates.push(
      createTheory({
        id: "theory:organizational-learning-failure",
        title: "Organizational learning failure",
        explanation:
          "The organization appears to repeat similar issues because feedback, lessons, or prior experience are not being converted into durable operating knowledge.",
        beliefs,
        mechanisms,
        concepts,
        evidence,
        now,
      }),
    );
  }

  if (candidates.length === 0 && beliefs.length > 0) {
    candidates.push(
      createTheory({
        id: "theory:emerging-organizational-strain",
        title: "Emerging organizational strain",
        explanation:
          "The investigation revealed early signs of organizational strain that may become more stable as additional evidence accumulates.",
        beliefs,
        mechanisms,
        concepts,
        evidence,
        now,
      }),
    );
  }

  return candidates;
}

function createTheory(params: {
  id: string;
  title: string;
  explanation: string;
  beliefs: TheorySignal[];
  mechanisms: TheorySignal[];
  concepts: TheorySignal[];
  evidence: TheorySignal[];
  now: string;
}): OrganizationalTheory {
  const supportingBeliefs = ids(params.beliefs).slice(0, 12);
  const supportingMechanisms = ids(params.mechanisms).slice(0, 12);
  const supportingConcepts = ids(params.concepts).slice(0, 12);
  const supportingEvidence = ids(params.evidence).slice(0, 16);

  const supportCount =
    supportingBeliefs.length +
    supportingMechanisms.length +
    supportingConcepts.length +
    supportingEvidence.length;

  const averageConfidence = average([
    ...params.beliefs.map((item) => item.confidence),
    ...params.mechanisms.map((item) => item.confidence),
    ...params.concepts.map((item) => item.confidence),
  ]);

  const confidence = clamp(
    averageConfidence || 0.52 + Math.min(0.22, supportCount * 0.015),
    0.35,
    0.88,
  );

  const stability = clamp(
    0.28 + Math.min(0.52, supportCount * 0.035),
    0.2,
    0.85,
  );

  const status = classifyTheoryStatus({
    previousConfidence: 0,
    currentConfidence: confidence,
    investigationCount: 1,
    supportCount,
  });

  return {
    id: params.id,
    title: params.title,
    explanation: params.explanation,
    confidence,
    stability,
    novelty: 0.72,
    supportingMechanisms,
    supportingBeliefs,
    supportingConcepts,
    supportingEvidence,
    competingTheories: [],
    firstObserved: params.now,
    lastConfirmed: params.now,
    investigationCount: 1,
    status,
  };
}

function retireUnsupportedTheories(params: {
  existingTheories: OrganizationalTheory[];
  candidateIds: Set<string>;
  now: string;
}): OrganizationalTheory[] {
  return params.existingTheories
    .filter((theory) => !params.candidateIds.has(theory.id))
    .filter((theory) => theory.status !== "retired")
    .filter((theory) => theory.investigationCount >= 3)
    .map((theory) => ({
      ...theory,
      confidence: clamp(theory.confidence - 0.08, 0, 1),
      stability: clamp(theory.stability - 0.04, 0, 1),
      novelty: Math.max(0, theory.novelty - 0.05),
      status:
        theory.confidence <= 0.28
          ? "retired"
          : ("weakening" as OrganizationalTheoryStatus),
      lastConfirmed: theory.lastConfirmed || params.now,
    }))
    .filter((theory) => theory.status === "retired");
}

function classifyTheoryStatus(params: {
  previousConfidence: number;
  currentConfidence: number;
  investigationCount: number;
  supportCount: number;
}): OrganizationalTheoryStatus {
  const delta = params.currentConfidence - params.previousConfidence;

  if (params.currentConfidence < 0.28) return "retired";
  if (delta < -0.08) return "weakening";

  if (params.investigationCount >= 3 && params.currentConfidence >= 0.68) {
    return "stable";
  }

  if (
    params.currentConfidence >= 0.5 &&
    (delta >= 0.02 || params.supportCount >= 4)
  ) {
    return "strengthening";
  }

  return "new";
}

function signalText(signal: TheorySignal): string {
  return String(
    signal.title ??
      signal.statement ??
      signal.explanation ??
      signal.summary ??
      signal.id ??
      "",
  );
}

function ids(items: TheorySignal[]): string[] {
  return Array.from(
    new Set(
      items
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );
}

function mergeIds(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function average(values: Array<number | undefined>): number {
  const valid = values.filter(
    (value): value is number => typeof value === "number",
  );

  if (valid.length === 0) return 0;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}