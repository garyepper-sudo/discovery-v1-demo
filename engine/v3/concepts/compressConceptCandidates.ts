import type { ConceptCandidate } from "./conceptCandidateTypes";
import type { OrganizationalConcept } from "../compression/types";

type ScoredCandidate = {
  candidate: ConceptCandidate;
  score: number;
  penalties: number;
  supportIds: string[];
  layerCount: number;
};

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateKey(candidate: ConceptCandidate): string {
  return candidate.semanticSignature || normalize(candidate.statement);
}

function conceptStatus(params: {
  confidence: number;
  stability: number;
}): OrganizationalConcept["status"] {
  const { confidence, stability } = params;

  if (confidence >= 0.75 && stability >= 0.65) return "stable";
  if (confidence >= 0.55 || stability >= 0.45) return "reinforced";
  return "new";
}

function allSupportIds(candidate: ConceptCandidate): string[] {
  return unique([
    ...asArray(candidate.supportingUnderstandingIds),
    ...asArray(candidate.supportingMechanismIds),
    ...asArray(candidate.supportingPatternIds),
    ...asArray(candidate.supportingBeliefIds),
    ...asArray(candidate.supportingDynamicIds),
    ...asArray(candidate.supportingClusterIds),
    ...asArray(candidate.sourceIds),
  ]);
}

function cognitiveLayerCount(candidate: ConceptCandidate): number {
  return [
    asArray(candidate.supportingUnderstandingIds).length > 0,
    asArray(candidate.supportingMechanismIds).length > 0,
    asArray(candidate.supportingPatternIds).length > 0,
    asArray(candidate.supportingBeliefIds).length > 0,
    asArray(candidate.supportingDynamicIds).length > 0,
    asArray(candidate.supportingClusterIds).length > 0,
  ].filter(Boolean).length;
}

function supportCount(candidate: ConceptCandidate): number {
  return allSupportIds(candidate).length;
}

function isGarbageEmergentCandidate(candidate: ConceptCandidate): boolean {
  const id = normalize(candidate.id);
  const statement = normalize(candidate.statement);
  const signature = normalize(candidate.semanticSignature);

  const text = `${id} ${statement} ${signature}`;

  const blocked = [
    "emergent appears",
    "emergent across",
    "emergent organization",
    "emergent organizational",
    "emergent mechanism",
    "emergent recurring",
    "emergent unclassified",
    "recurring appears pattern",
    "recurring across pattern",
    "recurring organization pattern",
    "recurring organizational pattern",
    "recurring mechanism pattern",
    "recurring recurring pattern",
    "recurring unclassified pattern",
  ];

  return blocked.some((phrase) => text.includes(phrase));
}

function isMechanismNameEcho(candidate: ConceptCandidate): boolean {
  const statement = normalize(candidate.statement);

  if (!candidate.id.startsWith("concept-emergent-")) return false;

  const mechanismEchoes = [
    "knowledge fragmentation",
    "weak knowledge transfer",
    "coordination breakdown",
    "documentation breakdown",
    "duplicated knowledge work",
    "governance friction",
    "decision latency",
    "priority conflict",
    "institutional memory loss",
    "organizational learning failure",
  ];

  return mechanismEchoes.some((phrase) => statement.includes(phrase));
}

function genericityPenalty(candidate: ConceptCandidate): number {
  const text = normalize(
    `${candidate.id} ${candidate.statement} ${candidate.summary} ${candidate.semanticSignature}`,
  );

  const weakGenericSignals = [
    "recurring knowledge",
    "recurring teams",
    "recurring team",
    "recurring organization",
    "recurring organizational",
    "recurring mechanism",
    "recurring pattern",
    "coherent organizational pattern",
    "general organizational pattern",
    "emerging organizational pattern",
  ];

  const genericHit = weakGenericSignals.some((signal) => text.includes(signal));

  if (!genericHit) return 0;

  const hasStrongSupport =
    cognitiveLayerCount(candidate) >= 3 &&
    asArray(candidate.supportingMechanismIds).length >= 3 &&
    supportCount(candidate) >= 8;

  return hasStrongSupport ? 0.15 : 0.45;
}

function mechanismEchoPenalty(candidate: ConceptCandidate): number {
  return isMechanismNameEcho(candidate) ? 0.35 : 0;
}

function weakEmergentPenalty(candidate: ConceptCandidate): number {
  if (!candidate.id.startsWith("concept-emergent-")) return 0;
  if (cognitiveLayerCount(candidate) >= 3) return 0.1;
  return 0.25;
}

function theorySignalScore(candidate: ConceptCandidate): number {
  const text = normalize(
    `${candidate.id} ${candidate.statement} ${candidate.summary} ${candidate.explanation}`,
  );

  const theorySignals = [
    "organizational continuity",
    "continuity failure",
    "organizational learning failure",
    "centralized governance",
    "governance bottleneck",
    "cross functional execution",
    "execution friction",
    "strategic alignment",
    "alignment drift",
    "execution capacity",
    "capacity strain",
    "operating model",
    "systemic",
    "structural",
    "deeper failure",
    "deeper dependency",
    "deeper coordination problem",
    "deeper mismatch",
    "deeper loss",
    "manifestations of a deeper",
    "higher order organizational theory",
  ];

  const matches = theorySignals.filter((signal) => text.includes(signal)).length;

  return clamp01(matches / 3);
}

function organizationalScopeScore(candidate: ConceptCandidate): number {
  const text = normalize(
    `${candidate.statement} ${candidate.summary} ${candidate.explanation}`,
  );

  const scopeSignals = [
    "organization",
    "organizational",
    "cross functional",
    "governance",
    "operating model",
    "leadership",
    "execution",
    "continuity",
    "strategy",
    "alignment",
    "learning",
    "memory",
  ];

  const matches = scopeSignals.filter((signal) => text.includes(signal)).length;

  return clamp01(matches / 4);
}

function explanatoryEfficiency(candidate: ConceptCandidate): number {
  const supports = supportCount(candidate);
  const statementLength = normalize(candidate.statement).split(" ").length;
  const summaryLength = normalize(candidate.summary).split(" ").length;

  const compactness = clamp01(1 - Math.max(0, statementLength - 8) / 24);
  const supportBreadth = clamp01(supports / 10);
  const summaryCompactness = clamp01(1 - Math.max(0, summaryLength - 24) / 60);

  return clamp01(
    supportBreadth * 0.5 + compactness * 0.25 + summaryCompactness * 0.25,
  );
}

function theorySelectionScore(candidate: ConceptCandidate): number {
  const confidence = clamp01(candidate.confidence ?? 0.5);
  const layerScore = clamp01(cognitiveLayerCount(candidate) / 4);
  const supportScore = clamp01(supportCount(candidate) / 10);
  const mechanismScore = clamp01(
    asArray(candidate.supportingMechanismIds).length / 5,
  );
  const beliefScore = clamp01(asArray(candidate.supportingBeliefIds).length / 4);
  const scopeScore = organizationalScopeScore(candidate);
  const theoryScore = theorySignalScore(candidate);
  const efficiencyScore = explanatoryEfficiency(candidate);

  const penalties =
    genericityPenalty(candidate) +
    mechanismEchoPenalty(candidate) +
    weakEmergentPenalty(candidate);

  return clamp01(
    confidence * 0.22 +
      layerScore * 0.18 +
      supportScore * 0.16 +
      mechanismScore * 0.14 +
      beliefScore * 0.1 +
      scopeScore * 0.08 +
      theoryScore * 0.07 +
      efficiencyScore * 0.05 -
      penalties,
  );
}

function shouldHardReject(candidate: ConceptCandidate): boolean {
  if (isGarbageEmergentCandidate(candidate)) return true;
  if (isMechanismNameEcho(candidate)) return true;

  const statement = normalize(candidate.statement);
  if (!statement) return true;

  return false;
}

function scoreCandidate(candidate: ConceptCandidate): ScoredCandidate {
  const supportIds = allSupportIds(candidate);
  const layerCount = cognitiveLayerCount(candidate);
  const penalties =
    genericityPenalty(candidate) +
    mechanismEchoPenalty(candidate) +
    weakEmergentPenalty(candidate);

  return {
    candidate,
    score: theorySelectionScore(candidate),
    penalties,
    supportIds,
    layerCount,
  };
}

function isMostlySubsumedBy(
  weaker: ScoredCandidate,
  stronger: ScoredCandidate,
): boolean {
  if (stronger.score <= weaker.score) return false;

  const weakerSupport = new Set(weaker.supportIds);
  const strongerSupport = new Set(stronger.supportIds);

  if (weakerSupport.size === 0 || strongerSupport.size === 0) return false;

  const sharedSupport = [...weakerSupport].filter((id) =>
    strongerSupport.has(id),
  ).length;

  const supportOverlap = sharedSupport / weakerSupport.size;

  const strongerHasBroaderSupport =
    stronger.supportIds.length >= weaker.supportIds.length;
  const strongerHasBroaderLayers = stronger.layerCount >= weaker.layerCount;

  return (
    supportOverlap >= 0.6 &&
    strongerHasBroaderSupport &&
    strongerHasBroaderLayers &&
    stronger.score - weaker.score >= 0.08
  );
}

function removeSubsumedCandidates(
  scoredCandidates: ScoredCandidate[],
): ScoredCandidate[] {
  return scoredCandidates.filter((candidate, index) => {
    const strongerCompetitor = scoredCandidates.find(
      (competitor, competitorIndex) =>
        competitorIndex !== index && isMostlySubsumedBy(candidate, competitor),
    );

    return !strongerCompetitor;
  });
}

function mergeCandidates(candidates: ConceptCandidate[]): ConceptCandidate[] {
  const merged = new Map<string, ConceptCandidate>();

  for (const candidate of candidates) {
    const key = candidateKey(candidate);
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, {
        ...candidate,
        sourceIds: unique(asArray(candidate.sourceIds)),
        supportingUnderstandingIds: unique(
          asArray(candidate.supportingUnderstandingIds),
        ),
        supportingMechanismIds: unique(
          asArray(candidate.supportingMechanismIds),
        ),
        supportingPatternIds: unique(asArray(candidate.supportingPatternIds)),
        supportingBeliefIds: unique(asArray(candidate.supportingBeliefIds)),
        supportingDynamicIds: unique(asArray(candidate.supportingDynamicIds)),
        supportingClusterIds: unique(asArray(candidate.supportingClusterIds)),
        keywords: unique(asArray(candidate.keywords)),
        confidence: clamp01(candidate.confidence ?? 0.5),
      });

      continue;
    }

    const confidence = clamp01(
      Math.max(existing.confidence ?? 0.5, candidate.confidence ?? 0.5) * 0.7 +
        average([existing.confidence ?? 0.5, candidate.confidence ?? 0.5]) * 0.3,
    );

    merged.set(key, {
      ...existing,

      statement:
        candidate.statement.length > existing.statement.length
          ? candidate.statement
          : existing.statement,

      summary:
        candidate.summary.length > existing.summary.length
          ? candidate.summary
          : existing.summary,

      sourceIds: unique([
        ...asArray(existing.sourceIds),
        ...asArray(candidate.sourceIds),
      ]),

      supportingUnderstandingIds: unique([
        ...asArray(existing.supportingUnderstandingIds),
        ...asArray(candidate.supportingUnderstandingIds),
      ]),

      supportingMechanismIds: unique([
        ...asArray(existing.supportingMechanismIds),
        ...asArray(candidate.supportingMechanismIds),
      ]),

      supportingPatternIds: unique([
        ...asArray(existing.supportingPatternIds),
        ...asArray(candidate.supportingPatternIds),
      ]),

      supportingBeliefIds: unique([
        ...asArray(existing.supportingBeliefIds),
        ...asArray(candidate.supportingBeliefIds),
      ]),

      supportingDynamicIds: unique([
        ...asArray(existing.supportingDynamicIds),
        ...asArray(candidate.supportingDynamicIds),
      ]),

      supportingClusterIds: unique([
        ...asArray(existing.supportingClusterIds),
        ...asArray(candidate.supportingClusterIds),
      ]),

      keywords: unique([
        ...asArray(existing.keywords),
        ...asArray(candidate.keywords),
      ]),

      confidence,

      strength:
        confidence >= 0.75
          ? "strong"
          : confidence >= 0.45
            ? "moderate"
            : "weak",

      explanation:
        existing.explanation === candidate.explanation
          ? existing.explanation
          : `${existing.explanation} ${candidate.explanation}`,
    });
  }

  return Array.from(merged.values());
}

function createConceptFromCandidate(params: {
  candidate: ConceptCandidate;
  totalCandidates: number;
}): OrganizationalConcept {
  const { candidate, totalCandidates } = params;

  const supportIds = allSupportIds(candidate);
  const layerCount = cognitiveLayerCount(candidate);
  const confidence = clamp01(candidate.confidence ?? 0.5);
  const selectionScore = theorySelectionScore(candidate);

  const coverage = clamp01(supportIds.length / Math.max(1, totalCandidates));

  const stability = clamp01(
    confidence * 0.3 +
      clamp01(supportIds.length / 8) * 0.25 +
      clamp01(layerCount / 4) * 0.2 +
      selectionScore * 0.25,
  );

  const novelty = clamp01(1 - stability);

  const explanatoryPower = clamp01(
    confidence * 0.25 +
      coverage * 0.1 +
      stability * 0.2 +
      selectionScore * 0.45,
  );

  return {
    id: `concept-${candidateKey(candidate)}`,
    statement: candidate.statement,
    summary: candidate.summary,
    understandingIds: unique([
      ...asArray(candidate.supportingUnderstandingIds),
      ...asArray(
        candidate.sourceType === "understanding" ? candidate.sourceIds : [],
      ),
    ]),
    confidence,
    coverage,
    stability,
    novelty,
    explanatoryPower,
    status: conceptStatus({ confidence, stability }),
    explanation:
      candidate.explanation ||
      "Discovery formed this concept by selecting and compressing concept candidates from multiple cognitive layers.",
  };
}

export function compressConceptCandidates(
  conceptCandidates?: ConceptCandidate[],
): OrganizationalConcept[] {
  const mergedCandidates = mergeCandidates(asArray(conceptCandidates)).filter(
    (candidate) => !shouldHardReject(candidate),
  );

  if (mergedCandidates.length === 0) return [];

  const scoredCandidates = mergedCandidates
    .map(scoreCandidate)
    .filter((scored) => {
      const candidate = scored.candidate;

      const hasTheorySignal = theorySignalScore(candidate) >= 0.2;
      const hasCrossLayerSupport = scored.layerCount >= 2;
      const hasMechanismSupport =
        asArray(candidate.supportingMechanismIds).length >= 2;
      const hasEnoughSupport = scored.supportIds.length >= 5;
      const isStrong =
        candidate.strength === "strong" || (candidate.confidence ?? 0) >= 0.75;

      return (
        scored.score >= 0.48 ||
        (hasTheorySignal && hasCrossLayerSupport) ||
        (hasCrossLayerSupport &&
          hasMechanismSupport &&
          hasEnoughSupport &&
          isStrong)
      );
    })
    .sort((a, b) => b.score - a.score);

  if (scoredCandidates.length === 0) return [];

  const selectedCandidates = removeSubsumedCandidates(scoredCandidates)
    .sort((a, b) => b.score - a.score)
    .slice(0, 7);

  return selectedCandidates
    .map((scored) =>
      createConceptFromCandidate({
        candidate: scored.candidate,
        totalCandidates: selectedCandidates.length,
      }),
    )
    .sort((a, b) => b.explanatoryPower - a.explanatoryPower);
}