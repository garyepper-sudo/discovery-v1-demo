import {
  V3Evidence,
  V3EvidenceRelationship,
  V3Polarity,
  V3Signal,
  V3SignalStrength,
  V3Theme,
} from "./types";

type ThemeRule = {
  title: string;
  keywords: string[];
};

const themeRules: ThemeRule[] = [
  {
    title: "Customer Friction",
    keywords: [
      "customer",
      "complaints",
      "pricing",
      "price",
      "fatigue",
      "confusing",
      "churn",
      "retention",
    ],
  },
  {
    title: "Growth Pressure",
    keywords: [
      "growth",
      "slowing",
      "slow",
      "inconsistent",
      "retention",
      "decline",
      "revenue",
    ],
  },
  {
    title: "Competitive Pressure",
    keywords: ["competitors", "competitive", "bundling", "market", "category"],
  },
  {
    title: "Strategic Bet Uncertainty",
    keywords: [
      "games",
      "ads",
      "events",
      "investing",
      "unclear",
      "bets",
      "strategy",
      "initiative",
    ],
  },
  {
    title: "Leadership Narrative Gap",
    keywords: [
      "leadership",
      "narrative",
      "engagement",
      "strong",
      "complaints",
      "alignment",
    ],
  },
];

export function detectThemes(
  evidence: V3Evidence[],
  signals: V3Signal[] = [],
  relationships: V3EvidenceRelationship[] = []
): V3Theme[] {
  const signalThemes = buildSignalThemes(evidence, signals);

  const ruleThemes = themeRules
    .map((rule, index) => {
      const matchedEvidence = evidence.filter((item) => {
        const searchableText = `${item.text} ${(item.keywords ?? []).join(
          " "
        )}`.toLowerCase();

        return rule.keywords.some((keyword) =>
          searchableText.includes(keyword.toLowerCase())
        );
      });

      if (matchedEvidence.length === 0) return null;

      return {
        id: `T${index + 1}`,
        title: rule.title,
        description: buildThemeDescription(rule.title, matchedEvidence),
        evidenceIds: matchedEvidence.map((item) => item.id),
        signalIds: signals
          .filter((signal) =>
            signal.evidenceIds.some((id) =>
              matchedEvidence.map((item) => item.id).includes(id)
            )
          )
          .map((signal) => signal.id),
        confidence: calculateThemeConfidence(matchedEvidence),
        keywords: collectKeywords(matchedEvidence, rule.keywords),
        entities: collectEntities(matchedEvidence),
        polarity: dominantPolarity(matchedEvidence),
        strength: strongestSignal(matchedEvidence),
        stability: calculateStability(matchedEvidence),
      };
    })
    .filter((theme) => theme !== null);

  const existingTitles = new Set([
    ...signalThemes.map((theme) => theme.title),
    ...ruleThemes.map((theme) => theme.title),
  ]);

  const emergentThemes = buildEmergentThemes(
    evidence,
    signals,
    relationships,
    existingTitles
  );

  return [...signalThemes, ...ruleThemes, ...emergentThemes]
    .filter((theme, index, all) => {
      return all.findIndex((item) => item.title === theme.title) === index;
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}

function buildSignalThemes(
  evidence: V3Evidence[],
  signals: V3Signal[]
): V3Theme[] {
  if (signals.length === 0) return [];

  return signals.slice(0, 5).map((signal, index) => {
    const matchedEvidence = evidence.filter((item) =>
      signal.evidenceIds.includes(item.id)
    );

    return {
      id: `ST${index + 1}`,
      title: signalToThemeTitle(signal.title),
      description: signal.description,
      evidenceIds: signal.evidenceIds,
      signalIds: [signal.id],
      confidence: signal.confidence,
      keywords: collectKeywords(matchedEvidence, []),
      entities: collectEntities(matchedEvidence),
      polarity: signal.polarity,
      strength: strongestSignal(matchedEvidence),
      stability: calculateStability(matchedEvidence),
    };
  });
}

function signalToThemeTitle(signalTitle: string): string {
  return signalTitle
    .replace(" is strengthening", "")
    .replace(" is emerging", "")
    .replace(" is increasing", "")
    .replace(" remains", "")
    .replace(" is present", "")
    .replace(" is visible", "")
    .replace(" may matter", "")
    .trim();
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dominantPolarity(evidence: V3Evidence[]): V3Polarity {
  const counts: Record<V3Polarity, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
    unknown: 0,
  };

  evidence.forEach((item) => {
    counts[item.polarity ?? "unknown"] += 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as V3Polarity;
}

function strongestSignal(evidence: V3Evidence[]): V3SignalStrength {
  if (evidence.some((item) => item.strength === "strong")) return "strong";
  if (evidence.some((item) => item.strength === "moderate")) return "moderate";
  return "weak";
}

function collectKeywords(
  evidence: V3Evidence[],
  ruleKeywords: string[]
): string[] {
  return Array.from(
    new Set([
      ...ruleKeywords,
      ...evidence.flatMap((item) => item.keywords ?? []),
    ])
  ).slice(0, 14);
}

function collectEntities(evidence: V3Evidence[]): string[] {
  return Array.from(
    new Set(evidence.flatMap((item) => item.entities ?? []))
  ).slice(0, 10);
}

function calculateThemeConfidence(evidence: V3Evidence[]): number {
  const evidenceWeight = Math.min(0.35, evidence.length * 0.09);
  const confidenceWeight =
    average(evidence.map((item) => item.confidence)) * 0.45;
  const strongSignalBonus = evidence.some((item) => item.strength === "strong")
    ? 0.08
    : 0;

  return Number(
    Math.min(
      0.96,
      0.25 + evidenceWeight + confidenceWeight + strongSignalBonus
    ).toFixed(2)
  );
}

function calculateStability(evidence: V3Evidence[]): number {
  const support = Math.min(0.55, evidence.length * 0.12);
  const confidence = average(evidence.map((item) => item.confidence)) * 0.35;
  const polarityConsistency =
    new Set(evidence.map((item) => item.polarity ?? "unknown")).size <= 2
      ? 0.1
      : 0;

  return Number(
    Math.min(0.95, support + confidence + polarityConsistency).toFixed(2)
  );
}

function buildThemeDescription(title: string, evidence: V3Evidence[]): string {
  const evidenceCount = evidence.length;
  const strongest = strongestSignal(evidence);
  const polarity = dominantPolarity(evidence);

  const sample = evidence
    .slice(0, 2)
    .map((item) => item.text)
    .join(" ");

  return `${title} appears across ${evidenceCount} evidence object${
    evidenceCount === 1 ? "" : "s"
  }. The signal is ${strongest} and the dominant polarity is ${polarity}. ${sample}`;
}

function buildEmergentThemes(
  evidence: V3Evidence[],
  signals: V3Signal[],
  relationships: V3EvidenceRelationship[],
  existingThemeIds: Set<string>
): V3Theme[] {
  const evidenceOrder = new Map(evidence.map((item, index) => [item.id, index]));
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const usableRelationships = relationships.filter((relationship) =>
    ["depends_on", "explains", "supports", "extends"].includes(
      relationship.type
    )
  );

  const candidates = buildRelatedEvidenceGroups(evidence, usableRelationships)
    .map((evidenceIds) => {
      const matchedEvidence = evidenceIds
        .map((id) => evidenceById.get(id))
        .filter((item): item is V3Evidence => Boolean(item));
      const matchedRelationships = usableRelationships.filter(
        (relationship) =>
          evidenceIds.includes(relationship.sourceEvidenceId) &&
          evidenceIds.includes(relationship.targetEvidenceId)
      );
      const matchedSignals = signals.filter((signal) =>
        signal.evidenceIds.some((id) => evidenceIds.includes(id))
      );

      if (
        matchedEvidence.length < 2 ||
        !hasOrganizationalGrounding(
          matchedEvidence,
          matchedRelationships,
          matchedSignals
        )
      ) {
        return null;
      }

      const title = choosePatternStatement(
        matchedEvidence,
        matchedRelationships,
        matchedSignals,
        evidenceOrder
      );

      if (!title || existingThemeIds.has(title)) return null;

      return { title, matchedEvidence, matchedSignals };
    })
    .filter((candidate) => candidate !== null)
    .filter(
      (candidate, index, all) =>
        all.findIndex((item) => item.title === candidate.title) === index
    )
    .slice(0, 3);

  return candidates.map(({ title, matchedEvidence, matchedSignals }, index) => ({
    id: `ET${index + 1}`,
    title,
    description: buildThemeDescription(title, matchedEvidence),
    evidenceIds: matchedEvidence.map((item) => item.id),
    signalIds: matchedSignals.map((signal) => signal.id),
    confidence: calculateThemeConfidence(matchedEvidence),
    keywords: collectKeywords(matchedEvidence, []),
    entities: collectEntities(matchedEvidence),
    polarity: dominantPolarity(matchedEvidence),
    strength: strongestSignal(matchedEvidence),
    stability: calculateStability(matchedEvidence),
  }));
}

function buildRelatedEvidenceGroups(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): string[][] {
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const adjacency = new Map<string, Set<string>>();

  relationships.forEach((relationship) => {
    const { sourceEvidenceId, targetEvidenceId } = relationship;
    if (!evidenceIds.has(sourceEvidenceId) || !evidenceIds.has(targetEvidenceId)) {
      return;
    }

    const sourceNeighbors = adjacency.get(sourceEvidenceId) ?? new Set<string>();
    const targetNeighbors = adjacency.get(targetEvidenceId) ?? new Set<string>();
    sourceNeighbors.add(targetEvidenceId);
    targetNeighbors.add(sourceEvidenceId);
    adjacency.set(sourceEvidenceId, sourceNeighbors);
    adjacency.set(targetEvidenceId, targetNeighbors);
  });

  const visited = new Set<string>();
  const groups: string[][] = [];

  evidence.forEach((item) => {
    if (visited.has(item.id) || !adjacency.has(item.id)) return;

    const group: string[] = [];
    const queue = [item.id];
    visited.add(item.id);

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) continue;
      group.push(currentId);

      adjacency.get(currentId)?.forEach((neighborId) => {
        if (visited.has(neighborId)) return;
        visited.add(neighborId);
        queue.push(neighborId);
      });
    }

    if (group.length >= 2) groups.push(group);
  });

  return groups;
}

function hasOrganizationalGrounding(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[],
  signals: V3Signal[]
): boolean {
  const hasCausalRelationship = relationships.some(
    (relationship) =>
      relationship.type === "depends_on" || relationship.type === "explains"
  );
  const hasSignalOverlap = signals.some(
    (signal) => signal.evidenceIds.filter((id) =>
      evidence.some((item) => item.id === id)
    ).length > 0
  );
  const entityCounts = new Map<string, number>();

  evidence.forEach((item) => {
    new Set(item.entities ?? []).forEach((entity) => {
      const normalized = entity.trim().toLowerCase();
      if (!normalized || ["company", "website", "industry", "context"].includes(normalized)) {
        return;
      }
      entityCounts.set(normalized, (entityCounts.get(normalized) ?? 0) + 1);
    });
  });

  const hasSharedEntity = Array.from(entityCounts.values()).some(
    (count) => count >= 2
  );

  return hasCausalRelationship || hasSignalOverlap || hasSharedEntity;
}

function choosePatternStatement(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[],
  signals: V3Signal[],
  evidenceOrder: Map<string, number>
): string {
  const relationshipDegree = new Map<string, number>();
  const relationshipPriority = new Map<string, number>();

  relationships.forEach((relationship) => {
    const priority = relationship.type === "depends_on"
      ? 2
      : relationship.type === "explains"
        ? 1
        : 0;

    [relationship.sourceEvidenceId, relationship.targetEvidenceId].forEach(
      (id) => {
        relationshipDegree.set(id, (relationshipDegree.get(id) ?? 0) + 1);
        relationshipPriority.set(
          id,
          Math.max(relationshipPriority.get(id) ?? 0, priority)
        );
      }
    );
  });

  const strongestSignalConfidence = (id: string): number =>
    signals.reduce(
      (strongest, signal) =>
        signal.evidenceIds.includes(id)
          ? Math.max(strongest, signal.confidence)
          : strongest,
      0
    );

  const selected = [...evidence]
    .filter((item) => !isRejectedMetadataStatement(item.text))
    .sort((a, b) => {
      const relationshipDelta =
        (relationshipPriority.get(b.id) ?? 0) -
        (relationshipPriority.get(a.id) ?? 0);
      if (relationshipDelta !== 0) return relationshipDelta;

      const signalDelta =
        strongestSignalConfidence(b.id) - strongestSignalConfidence(a.id);
      if (signalDelta !== 0) return signalDelta;

      const degreeDelta =
        (relationshipDegree.get(b.id) ?? 0) -
        (relationshipDegree.get(a.id) ?? 0);
      if (degreeDelta !== 0) return degreeDelta;

      const confidenceDelta = b.confidence - a.confidence;
      if (confidenceDelta !== 0) return confidenceDelta;

      const languageDelta =
        Number(hasRelationshipLanguage(b.text)) -
        Number(hasRelationshipLanguage(a.text));
      if (languageDelta !== 0) return languageDelta;

      return (evidenceOrder.get(a.id) ?? 0) - (evidenceOrder.get(b.id) ?? 0);
    })[0];

  return selected ? normalizePatternTitle(selected.text) : "";
}

function hasRelationshipLanguage(text: string): boolean {
  const normalized = text.toLowerCase();
  return [
    "depends on",
    "requires",
    "driven by",
    "caused by",
    "leads to",
    "enabled by",
    "blocked by",
    "concentrated in",
    "lacks access to",
  ].some((phrase) => normalized.includes(phrase));
}

function isRejectedMetadataStatement(text: string): boolean {
  return /^(company|website|industry)\s*:/i.test(text.trim());
}

function normalizePatternTitle(text: string): string {
  return text
    .trim()
    .replace(/^context\s*:\s*/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
}
