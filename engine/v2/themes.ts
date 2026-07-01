import { EvidenceGraph } from "./graph";

export interface Theme {
  id: string;
  title: string;
  summary: string;
  evidenceIds: string[];
  confidence: number;
  keywords: string[];
}

export function detectThemes(graph: EvidenceGraph): Theme[] {
  const themeRules = [
    {
      title: "Customer Friction",
      keywords: ["customer", "complaints", "pricing", "price", "content", "plans"],
    },
    {
      title: "Growth Uncertainty",
      keywords: ["growth", "slowing", "inconsistent", "unclear", "retention"],
    },
    {
      title: "Competitive Pressure",
      keywords: ["competitors", "bundling", "market"],
    },
    {
      title: "Strategic Experimentation",
      keywords: ["games", "ads", "events", "investing", "bets"],
    },
    {
      title: "Leadership Narrative Gap",
      keywords: ["leadership", "engagement", "strong", "complaints"],
    },
  ];

  return themeRules
    .map((rule, index) => {
      const evidence = graph.nodes.filter((node) =>
        rule.keywords.some((keyword) =>
          node.text.toLowerCase().includes(keyword)
        )
      );

      return {
        id: `theme-${index + 1}`,
        title: rule.title,
        summary: buildThemeSummary(rule.title, evidence.map((e) => e.text)),
        evidenceIds: evidence.map((e) => e.id),
        confidence: Math.min(95, 40 + evidence.length * 15),
        keywords: rule.keywords,
      };
    })
    .filter((theme) => theme.evidenceIds.length > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

function buildThemeSummary(title: string, evidenceTexts: string[]): string {
  const sample = evidenceTexts.slice(0, 2).join(" ");
  return `${title} appears in the evidence through: ${sample}`;
}