import { V3Evidence, V3Theme } from "./types";

const themeRules = [
  {
    title: "Customer Friction",
    keywords: ["customer", "complaints", "pricing", "price", "fatigue", "confusing"],
  },
  {
    title: "Growth Pressure",
    keywords: ["growth", "slowing", "inconsistent", "retention"],
  },
  {
    title: "Competitive Pressure",
    keywords: ["competitors", "bundling", "market"],
  },
  {
    title: "Strategic Bet Uncertainty",
    keywords: ["games", "ads", "events", "investing", "unclear", "bets"],
  },
  {
    title: "Leadership Narrative Gap",
    keywords: ["leadership", "engagement", "strong", "complaints"],
  },
];

export function detectThemes(evidence: V3Evidence[]): V3Theme[] {
  return themeRules
    .map((rule, index) => {
      const matchedEvidence = evidence.filter((item) =>
        rule.keywords.some((keyword) =>
          item.text.toLowerCase().includes(keyword)
        )
      );

      return {
        id: `T${index + 1}`,
        title: rule.title,
        description: buildThemeDescription(rule.title, matchedEvidence),
        evidenceIds: matchedEvidence.map((item) => item.id),
        confidence: Math.min(0.95, 0.45 + matchedEvidence.length * 0.15),
      };
    })
    .filter((theme) => theme.evidenceIds.length > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

function buildThemeDescription(title: string, evidence: V3Evidence[]): string {
  const sample = evidence.slice(0, 2).map((item) => item.text).join(" ");
  return `${title} is present in the evidence: ${sample}`;
}