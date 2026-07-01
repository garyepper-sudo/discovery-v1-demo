import { V3Contradiction, V3Evidence, V3Theme } from "./types";

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

  const hasCustomerFriction = themes.some(
    (theme) => theme.title === "Customer Friction"
  );

  if (hasLeadershipStrength && hasCustomerFriction) {
    contradictions.push({
      id: "C1",
      title: "Leadership confidence conflicts with customer friction",
      explanation:
        "Leadership-facing evidence suggests strength, while customer-facing evidence points to pricing, content fatigue, or plan confusion.",
      evidenceIds: collectEvidenceIds(evidence, [
        "leadership",
        "engagement",
        "customer",
        "complaints",
        "pricing",
        "fatigue",
        "confusing",
      ]),
      confidence: 0.78,
    });
  }

  const hasManyBets = containsAny(evidence, ["games", "ads", "live events"]);
  const hasUnclearImpact = containsAny(evidence, ["unclear", "retention"]);

  if (hasManyBets && hasUnclearImpact) {
    contradictions.push({
      id: "C2",
      title: "Multiple strategic bets have unclear retention impact",
      explanation:
        "The company appears to be pursuing multiple growth bets, but the evidence does not yet show which ones are actually improving retention.",
      evidenceIds: collectEvidenceIds(evidence, [
        "games",
        "ads",
        "events",
        "unclear",
        "retention",
      ]),
      confidence: 0.74,
    });
  }

  return contradictions;
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