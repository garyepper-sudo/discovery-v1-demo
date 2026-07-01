import {
  V3CausalChain,
  V3Contradiction,
  V3Explanation,
  V3Theme,
} from "./types";

export function generateExplanations(
  themes: V3Theme[],
  contradictions: V3Contradiction[],
  causalChains: V3CausalChain[]
): V3Explanation[] {
  const explanations: V3Explanation[] = [];

  causalChains.forEach((chain, index) => {
    explanations.push({
      id: `EX${index + 1}`,
      title: buildTitle(chain, themes),
      explanation: buildExplanation(chain, contradictions),
      supportingEvidenceIds: chain.evidenceIds,
      weakeningEvidenceIds: [],
      confidence: chain.confidence,
    });
  });

  if (explanations.length === 0 && themes.length > 0) {
    themes.slice(0, 3).forEach((theme, index) => {
      explanations.push({
        id: `EX${index + 1}`,
        title: `${theme.title} may be shaping the situation`,
        explanation: describeTheme(theme),
        supportingEvidenceIds: theme.evidenceIds,
        weakeningEvidenceIds: [],
        confidence: theme.confidence,
      });
    });
  }

  return explanations.sort((a, b) => b.confidence - a.confidence);
}

function buildTitle(chain: V3CausalChain, themes: V3Theme[]): string {
  const relatedTheme = themes.find((theme) => chain.themeIds?.includes(theme.id));
  const label = relatedTheme?.title ?? chain.cause;

  if (label === "Customer Friction") {
    return "Customer concerns may be limiting momentum";
  }

  if (label === "Growth Pressure") {
    return "Growth expectations may be running ahead of certainty";
  }

  if (label === "Leadership Narrative Gap") {
    return "Leadership confidence may be outpacing the evidence";
  }

  if (label === "Strategic Bet Uncertainty") {
    return "The strategic bet may need sharper validation";
  }

  return `${label} may be shaping the strategic picture`;
}

function buildExplanation(
  chain: V3CausalChain,
  contradictions: V3Contradiction[]
): string {
  const relatedContradiction = contradictions.find((contradiction) =>
    contradiction.evidenceIds?.some((id) => chain.evidenceIds.includes(id))
  );

  const base = describeChain(chain);

  if (!relatedContradiction) {
    return base;
  }

  return `${base} However, Discovery also found a tension: ${relatedContradiction.title}. That means this belief should be tested before leadership treats it as settled.`;
}

function describeChain(chain: V3CausalChain): string {
  if (chain.cause === "Customer Friction") {
    return "Customers are signaling concern about constraints, availability, pricing, or complexity. Discovery sees this as important because friction can weaken momentum even when demand appears strong.";
  }

  if (chain.cause === "Growth Pressure") {
    return "The evidence suggests expectations for continued growth are high. Discovery cannot yet tell whether those expectations are supported by durable demand or whether optimism is moving faster than proof.";
  }

  if (chain.cause === "Leadership Narrative Gap") {
    return "Leadership-facing evidence suggests confidence, but other signals point to operational or customer-side constraints. Discovery currently believes the narrative may be stronger than the underlying evidence.";
  }

  if (chain.cause === "Strategic Bet Uncertainty") {
    return "The evidence points to a meaningful strategic bet, but the durability of that bet is not yet fully proven. Discovery believes leadership should test whether the opportunity is structural or temporary.";
  }

  return `Discovery sees a possible relationship between ${chain.cause} and ${chain.effect}. The current mechanism is: ${chain.mechanism}`;
}

function describeTheme(theme: V3Theme): string {
  if (theme.title === "Customer Friction") {
    return "Customer-facing evidence suggests the organization may be encountering resistance in the market. Discovery sees this as a pattern worth testing because friction can quietly weaken growth.";
  }

  if (theme.title === "Growth Pressure") {
    return "The evidence points to pressure around growth expectations. Discovery believes leadership should clarify whether the growth story is durable or dependent on short-term conditions.";
  }

  if (theme.title === "Leadership Narrative Gap") {
    return "Leadership appears to be communicating confidence, but Discovery sees signs that the evidence may not fully support that confidence yet.";
  }

  if (theme.title === "Strategic Bet Uncertainty") {
    return "The organization appears to be making or defending a strategic bet. Discovery believes the next step is to test whether the bet is supported by enough evidence.";
  }

  return `${theme.title} appears repeatedly in the evidence. Discovery sees it as part of the strategic picture, but more evidence is needed before treating it as decisive.`;
}