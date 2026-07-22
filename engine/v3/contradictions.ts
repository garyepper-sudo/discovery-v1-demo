import {
  V3Contradiction,
  V3Evidence,
  V3SignalStrength,
  V3Theme,
} from "./types";

export type LongitudinalContradictionContext = {
  previousEvidence?: V3Evidence[];
};

type LongitudinalRelationship =
  | "supports"
  | "contradicts"
  | "qualifies"
  | "unrelated";

export function detectContradictions(
  evidence: V3Evidence[],
  themes: V3Theme[],
  longitudinalContext: LongitudinalContradictionContext = {},
): V3Contradiction[] {
  const contradictions: V3Contradiction[] = [];

  const hasLeadershipStrength = containsAny(evidence, [
    "leadership",
    "engagement is strong",
    "strong engagement",
  ]);

  const customerFrictionTheme = themes.find(
    (theme) => theme.title === "Customer Friction"
  );

  if (hasLeadershipStrength && customerFrictionTheme) {
    const evidenceIds = collectEvidenceIds(evidence, [
      "leadership",
      "engagement",
      "customer",
      "complaints",
      "pricing",
      "fatigue",
      "confusing",
    ]);

    contradictions.push({
      id: "C1",
      title: "Leadership confidence conflicts with customer friction",
      explanation:
        "Leadership-facing evidence suggests strength, while customer-facing evidence points to pricing, content fatigue, or plan confusion.",
      evidenceIds,
      opposingEvidenceIds: evidenceIds,
      confidence: calculateContradictionConfidence(evidence, evidenceIds),
      severity: "strong",
      unresolvedQuestion:
        "Is leadership confidence supported by customer behavior, or is it masking friction in the market?",
    });
  }

  const hasManyBets = containsAny(evidence, ["games", "ads", "live events"]);
  const hasUnclearImpact = containsAny(evidence, ["unclear", "retention"]);

  if (hasManyBets && hasUnclearImpact) {
    const evidenceIds = collectEvidenceIds(evidence, [
      "games",
      "ads",
      "events",
      "unclear",
      "retention",
    ]);

    contradictions.push({
      id: "C2",
      title: "Multiple strategic bets have unclear retention impact",
      explanation:
        "The company appears to be pursuing multiple growth bets, but the evidence does not yet show which ones are actually improving retention.",
      evidenceIds,
      opposingEvidenceIds: evidenceIds,
      confidence: calculateContradictionConfidence(evidence, evidenceIds),
      severity: "moderate",
      unresolvedQuestion:
        "Which strategic bets are actually changing customer retention or growth behavior?",
    });
  }

  const polarityContradictions = detectPolarityContradictions(
    evidence,
    themes,
    contradictions.length
  );

  const longitudinalContradictions = detectLongitudinalContradictions(
    evidence,
    longitudinalContext.previousEvidence ?? [],
    contradictions.length + polarityContradictions.length,
  );

  const questionContradictions = detectUnresolvedQuestionContradictions(
    evidence,
    contradictions.length +
      polarityContradictions.length +
      longitudinalContradictions.length,
  );

  return [
    ...contradictions,
    ...polarityContradictions,
    ...longitudinalContradictions,
    ...questionContradictions,
  ]
    .filter((contradiction, index, all) => {
      return (
        all.findIndex((item) => item.title === contradiction.title) === index
      );
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

const comparisonStopWords = new Set([
  "about",
  "after",
  "also",
  "been",
  "before",
  "being",
  "between",
  "both",
  "company",
  "context",
  "could",
  "current",
  "from",
  "have",
  "industry",
  "into",
  "more",
  "organization",
  "question",
  "should",
  "their",
  "there",
  "these",
  "this",
  "through",
  "using",
  "website",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
]);

const constraintMarkers = [
  "blocked by",
  "bottleneck",
  "cannot",
  "concentrated in",
  "depend on",
  "depends on",
  "dependent on",
  "lack access",
  "lacks access",
  "only when",
  "requires",
  "strongest when",
  "unable to",
];

const resolutionMarkers = [
  "able to",
  "can be",
  "documented",
  "independent",
  "met the same",
  "no longer",
  "resolved",
  "standardized",
  "succeeded",
  "transferred",
  "without",
];

const qualificationMarkers = [
  "partially",
  "some",
  "suggesting",
  "to an extent",
  "under some conditions",
];

function comparableEvidence(evidence: V3Evidence[]): V3Evidence[] {
  return evidence.filter((item) => {
    const text = item.text.trim().toLowerCase();
    return (
      item.type !== "question" &&
      text !== "context:" &&
      !text.startsWith("company:") &&
      !text.startsWith("website:") &&
      !text.startsWith("industry:")
    );
  });
}

function normalizedTerms(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .map((term) => term.replace(/(?:ing|ed|es|s)$/i, ""))
        .filter((term) => term.length >= 4)
        .filter((term) => !comparisonStopWords.has(term)),
    ),
  );
}

function markerCount(text: string, markers: string[]): number {
  const normalized = text.toLowerCase();
  return markers.filter((marker) => normalized.includes(marker)).length;
}

function sharedTermCount(current: V3Evidence, previous: V3Evidence): number {
  const previousTerms = new Set(normalizedTerms(previous.text));
  return normalizedTerms(current.text).filter((term) =>
    previousTerms.has(term),
  ).length;
}

function classifyLongitudinalRelationship(
  current: V3Evidence,
  previous: V3Evidence,
): { relationship: LongitudinalRelationship; score: number } {
  const sharedTerms = sharedTermCount(current, previous);
  if (sharedTerms < 2) return { relationship: "unrelated", score: sharedTerms };

  const currentConstraints = markerCount(current.text, constraintMarkers);
  const previousConstraints = markerCount(previous.text, constraintMarkers);
  const currentResolutions = markerCount(current.text, resolutionMarkers);
  const previousResolutions = markerCount(previous.text, resolutionMarkers);
  const currentQualifications = markerCount(
    current.text,
    qualificationMarkers,
  );

  const reversesConstraint =
    previousConstraints > previousResolutions &&
    currentResolutions > currentConstraints;
  const introducesConstraint =
    previousResolutions > previousConstraints &&
    currentConstraints > currentResolutions;

  if (reversesConstraint || introducesConstraint) {
    return {
      relationship: currentQualifications > 0 ? "qualifies" : "contradicts",
      score:
        sharedTerms * 2 +
        Math.abs(currentConstraints - currentResolutions) +
        Math.abs(previousConstraints - previousResolutions),
    };
  }

  const sameDirection =
    (currentConstraints > currentResolutions &&
      previousConstraints > previousResolutions) ||
    (currentResolutions > currentConstraints &&
      previousResolutions > previousConstraints);

  return {
    relationship: sameDirection ? "supports" : "unrelated",
    score: sharedTerms,
  };
}

function detectLongitudinalContradictions(
  currentEvidence: V3Evidence[],
  previousEvidence: V3Evidence[],
  startingIndex: number,
): V3Contradiction[] {
  const previous = comparableEvidence(previousEvidence);
  if (previous.length === 0) return [];

  return comparableEvidence(currentEvidence).flatMap((current) => {
    const comparisons = previous
      .map((prior) => ({
        prior,
        ...classifyLongitudinalRelationship(current, prior),
      }))
      .filter(
        (comparison) =>
          comparison.relationship === "contradicts" ||
          comparison.relationship === "qualifies",
      )
      .sort(
        (left, right) =>
          right.score - left.score || left.prior.id.localeCompare(right.prior.id),
      );

    const strongest = comparisons[0];
    if (!strongest) return [];
    if (comparisons[1]?.score === strongest.score) return [];

    const isQualification = strongest.relationship === "qualifies";
    const confidence = Number(
      Math.min(
        0.92,
        current.confidence * 0.55 + strongest.prior.confidence * 0.35,
      ).toFixed(2),
    );

    return [{
      id: `C${startingIndex + 1}`,
      title: isQualification
        ? "New evidence qualifies previous organizational understanding"
        : "New evidence conflicts with previous organizational understanding",
      explanation: isQualification
        ? "Current evidence narrows a previously established organizational constraint and indicates that it may not hold under every observed condition."
        : "Current evidence opposes a previously established organizational constraint and requires Discovery to reassess the prior understanding.",
      evidenceIds: [current.id],
      opposingEvidenceIds: [current.id],
      confidence,
      severity: (isQualification ? "moderate" : "strong") as V3SignalStrength,
      unresolvedQuestion:
        "Under which organizational conditions does the previous understanding continue to hold?",
    }];
  }).map((contradiction, index) => ({
    ...contradiction,
    id: `C${startingIndex + index + 1}`,
  }));
}

function detectPolarityContradictions(
  evidence: V3Evidence[],
  themes: V3Theme[],
  startingIndex: number
): V3Contradiction[] {
  const contradictions: V3Contradiction[] = [];

  themes.forEach((theme) => {
    const relatedEvidence = evidence.filter((item) =>
      theme.evidenceIds.includes(item.id)
    );

    const positive = relatedEvidence.filter(
      (item) => item.polarity === "positive"
    );

    const negative = relatedEvidence.filter(
      (item) => item.polarity === "negative"
    );

    if (positive.length > 0 && negative.length > 0) {
      const evidenceIds = [
        ...positive.map((item) => item.id),
        ...negative.map((item) => item.id),
      ];

      contradictions.push({
        id: `C${startingIndex + contradictions.length + 1}`,
        title: `${theme.title} contains mixed signals`,
        explanation:
          "The same theme contains both positive and negative evidence, suggesting the pattern may not be fully resolved.",
        evidenceIds,
        opposingEvidenceIds: negative.map((item) => item.id),
        confidence: calculateContradictionConfidence(evidence, evidenceIds),
        severity: severityFromEvidenceCount(evidenceIds.length),
        unresolvedQuestion: `Which side of the ${theme.title.toLowerCase()} signal is more predictive of what happens next?`,
      });
    }
  });

  return contradictions;
}

function detectUnresolvedQuestionContradictions(
  evidence: V3Evidence[],
  startingIndex: number
): V3Contradiction[] {
  const questions = evidence.filter((item) => item.type === "question");

  return questions.slice(0, 2).map((question, index) => ({
    id: `C${startingIndex + index + 1}`,
    title: "Important question remains unresolved",
    explanation:
      "The input contains an explicit open question, which means Discovery should avoid treating the current understanding as fully settled.",
    evidenceIds: [question.id],
    opposingEvidenceIds: [],
    confidence: Math.max(0.55, question.confidence),
    severity: "weak" as V3SignalStrength,
    unresolvedQuestion: question.text,
  }));
}

function calculateContradictionConfidence(
  evidence: V3Evidence[],
  evidenceIds: string[]
): number {
  const related = evidence.filter((item) => evidenceIds.includes(item.id));

  if (related.length === 0) return 0.5;

  const avg =
    related.reduce((sum, item) => sum + item.confidence, 0) / related.length;

  const strengthBonus = related.some((item) => item.strength === "strong")
    ? 0.08
    : 0;

  const mixedPolarityBonus =
    new Set(related.map((item) => item.polarity)).size > 1 ? 0.08 : 0;

  return Number(
    Math.min(0.94, avg * 0.82 + strengthBonus + mixedPolarityBonus).toFixed(2)
  );
}

function severityFromEvidenceCount(count: number): V3SignalStrength {
  if (count >= 5) return "strong";
  if (count >= 3) return "moderate";
  return "weak";
}

function containsAny(evidence: V3Evidence[], terms: string[]): boolean {
  const text = evidence.map((item) => item.text.toLowerCase()).join(" ");
  return terms.some((term) => text.includes(term));
}

function collectEvidenceIds(evidence: V3Evidence[], terms: string[]): string[] {
  return evidence
    .filter((item) => {
      const lower = item.text.toLowerCase();
      return terms.some((term) => lower.includes(term));
    })
    .map((item) => item.id);
}
