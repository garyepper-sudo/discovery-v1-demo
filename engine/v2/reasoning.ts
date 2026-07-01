import { EvidenceGraph } from "./graph";
import { Theme } from "./themes";

export interface V2Tension {
  id: string;
  title: string;
  explanation: string;
  themeIds: string[];
  evidenceIds: string[];
  confidence: number;
}

export interface V2Explanation {
  id: string;
  title: string;
  explanation: string;
  supportingThemes: string[];
  supportingEvidence: string[];
  confidence: number;
}

export function detectTensionsFromThemes(
  themes: Theme[],
  graph: EvidenceGraph
): V2Tension[] {
  const tensions: V2Tension[] = [];

  const customer = themes.find((theme) => theme.title === "Customer Friction");
  const leadership = themes.find((theme) => theme.title === "Leadership Narrative Gap");
  const growth = themes.find((theme) => theme.title === "Growth Uncertainty");
  const experiments = themes.find((theme) => theme.title === "Strategic Experimentation");

  if (customer && leadership) {
    tensions.push({
      id: "v2-tension-1",
      title: "Leadership confidence vs. customer friction",
      explanation:
        "Leadership-facing signals suggest strength, while customer-facing evidence suggests pricing, content, or plan friction.",
      themeIds: [customer.id, leadership.id],
      evidenceIds: [...customer.evidenceIds, ...leadership.evidenceIds],
      confidence: 76,
    });
  }

  if (growth && experiments) {
    tensions.push({
      id: "v2-tension-2",
      title: "Growth pressure vs. unproven strategic bets",
      explanation:
        "The organization appears to be pursuing several growth bets while the retention impact remains unclear.",
      themeIds: [growth.id, experiments.id],
      evidenceIds: [...growth.evidenceIds, ...experiments.evidenceIds],
      confidence: 72,
    });
  }

  return tensions;
}

export function generateExplanationsFromReasoning(
  themes: Theme[],
  tensions: V2Tension[]
): V2Explanation[] {
  const explanations: V2Explanation[] = [];

  const customer = themes.find((theme) => theme.title === "Customer Friction");
  const growth = themes.find((theme) => theme.title === "Growth Uncertainty");
  const competitive = themes.find((theme) => theme.title === "Competitive Pressure");
  const experiments = themes.find((theme) => theme.title === "Strategic Experimentation");

  if (customer && growth) {
    explanations.push({
      id: "v2-explanation-1",
      title: "Growth may be slowing because customer friction is rising",
      explanation:
        "The evidence suggests growth inconsistency may be connected to rising customer friction around pricing, content fatigue, or confusing plans.",
      supportingThemes: [customer.id, growth.id],
      supportingEvidence: [...customer.evidenceIds, ...growth.evidenceIds],
      confidence: tensions.length > 0 ? 74 : 64,
    });
  }

  if (competitive && growth) {
    explanations.push({
      id: "v2-explanation-2",
      title: "Competitive bundling may be weakening perceived value",
      explanation:
        "Competitors bundling aggressively may be making standalone value harder to defend, especially when customers are already sensitive to pricing or content fatigue.",
      supportingThemes: [competitive.id, growth.id],
      supportingEvidence: [...competitive.evidenceIds, ...growth.evidenceIds],
      confidence: 68,
    });
  }

  if (experiments && growth) {
    explanations.push({
      id: "v2-explanation-3",
      title: "New bets may not yet be improving retention",
      explanation:
        "Ads, games, and live events may be strategically important, but the available evidence does not yet show which initiatives improve retention.",
      supportingThemes: [experiments.id, growth.id],
      supportingEvidence: [...experiments.evidenceIds, ...growth.evidenceIds],
      confidence: 63,
    });
  }

  return explanations.sort((a, b) => b.confidence - a.confidence);
}