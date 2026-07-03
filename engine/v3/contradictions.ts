import {
  V3Contradiction,
  V3Evidence,
  V3SignalStrength,
  V3Theme,
} from "./types";

export function detectContradictions(
  evidence: V3Evidence[],
  themes: V3Theme[]
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

  const questionContradictions = detectUnresolvedQuestionContradictions(
    evidence,
    contradictions.length + polarityContradictions.length
  );

  return [...contradictions, ...polarityContradictions, ...questionContradictions]
    .filter((contradiction, index, all) => {
      return (
        all.findIndex((item) => item.title === contradiction.title) === index
      );
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
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