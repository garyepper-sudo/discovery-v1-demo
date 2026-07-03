import { V3Evidence, V3Signal } from "./types";

type SignalRule = {
  title: string;
  description: string;
  keywords: string[];
  polarity: V3Signal["polarity"];
};

const signalRules: SignalRule[] = [
  {
    title: "Demand is strengthening",
    description:
      "Evidence suggests demand, usage, or market pull is increasing.",
    keywords: ["demand", "growth", "increase", "strong", "momentum"],
    polarity: "positive",
  },
  {
    title: "Customer friction is emerging",
    description:
      "Evidence suggests customers may be experiencing confusion, fatigue, pricing concern, or dissatisfaction.",
    keywords: ["customer", "complaint", "pricing", "confusing", "fatigue", "churn"],
    polarity: "negative",
  },
  {
    title: "Competitive pressure is increasing",
    description:
      "Evidence suggests competitors, market alternatives, or category pressure may be affecting the situation.",
    keywords: ["competitor", "competitive", "market", "alternative", "bundling"],
    polarity: "negative",
  },
  {
    title: "Strategic uncertainty remains",
    description:
      "Evidence suggests the company is making bets whose impact is not yet fully clear.",
    keywords: ["unclear", "unknown", "question", "could", "may", "bet", "strategy"],
    polarity: "neutral",
  },
  {
    title: "Execution risk is present",
    description:
      "Evidence suggests operational, timing, or implementation risk may affect outcomes.",
    keywords: ["risk", "delay", "problem", "slow", "pressure", "loss"],
    polarity: "negative",
  },
  {
    title: "Leadership confidence is visible",
    description:
      "Evidence suggests leadership believes the current direction is strong or defensible.",
    keywords: ["leadership", "confidence", "strong", "engagement", "believes"],
    polarity: "positive",
  },
  {
    title: "Technology advantage may matter",
    description:
      "Evidence suggests product, platform, infrastructure, or technical differentiation may be strategically important.",
    keywords: ["technology", "software", "platform", "infrastructure", "ecosystem", "cuda"],
    polarity: "positive",
  },
];

export function detectSignals(evidence: V3Evidence[]): V3Signal[] {
  const ruleSignals = signalRules
    .map((rule, index) => {
      const matchedEvidence = evidence.filter((item) =>
        matchesRule(item, rule)
      );

      if (matchedEvidence.length === 0) return null;

      return {
        id: `S${index + 1}`,
        title: rule.title,
        description: buildSignalDescription(rule, matchedEvidence),
        evidenceIds: matchedEvidence.map((item) => item.id),
        confidence: calculateSignalConfidence(matchedEvidence),
        polarity: rule.polarity,
      };
    })
    .filter((signal) => signal !== null);

  const emergentSignals = buildEmergentSignals(evidence, ruleSignals.length);

  return [...ruleSignals, ...emergentSignals]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}

function matchesRule(evidence: V3Evidence, rule: SignalRule): boolean {
  const searchableText = `${evidence.text} ${(evidence.keywords ?? []).join(
    " "
  )}`.toLowerCase();

  return rule.keywords.some((keyword) =>
    searchableText.includes(keyword.toLowerCase())
  );
}

function buildSignalDescription(
  rule: SignalRule,
  evidence: V3Evidence[]
): string {
  const count = evidence.length;
  const strongest = chooseStrongestEvidence(evidence);

  return `${rule.description} This signal appears in ${count} evidence object${
    count === 1 ? "" : "s"
  }${strongest ? `, led by: ${strongest.text}` : "."}`;
}

function calculateSignalConfidence(evidence: V3Evidence[]): number {
  if (evidence.length === 0) return 0.45;

  const averageConfidence =
    evidence.reduce((sum, item) => sum + item.confidence, 0) / evidence.length;

  const supportBonus = Math.min(0.18, evidence.length * 0.045);
  const strengthBonus = evidence.some((item) => item.strength === "strong")
    ? 0.08
    : 0;

  return clamp(averageConfidence * 0.7 + supportBonus + strengthBonus);
}

function chooseStrongestEvidence(
  evidence: V3Evidence[]
): V3Evidence | undefined {
  return [...evidence].sort((a, b) => {
    const strengthDelta = strengthRank(b.strength) - strengthRank(a.strength);
    if (strengthDelta !== 0) return strengthDelta;

    return b.confidence - a.confidence;
  })[0];
}

function buildEmergentSignals(
  evidence: V3Evidence[],
  startingIndex: number
): V3Signal[] {
  const keywordGroups = new Map<string, V3Evidence[]>();

  evidence.forEach((item) => {
    item.keywords.forEach((keyword) => {
      const current = keywordGroups.get(keyword) ?? [];
      current.push(item);
      keywordGroups.set(keyword, current);
    });
  });

  return Array.from(keywordGroups.entries())
    .filter(([, items]) => items.length >= 2)
    .slice(0, 3)
    .map(([keyword, items], index) => ({
      id: `S${startingIndex + index + 1}`,
      title: `${capitalize(keyword)} signal is recurring`,
      description: `Discovery sees repeated references to ${keyword}, suggesting it may be meaningful across the evidence.`,
      evidenceIds: items.map((item) => item.id),
      confidence: calculateSignalConfidence(items),
      polarity: normalizePolarity(items),
    }));
}

function normalizePolarity(evidence: V3Evidence[]): V3Signal["polarity"] {
  const positive = evidence.filter((item) => item.polarity === "positive").length;
  const negative = evidence.filter((item) => item.polarity === "negative").length;

  if (positive > negative) return "positive";
  if (negative > positive) return "negative";
  return "neutral";
}

function strengthRank(strength?: "weak" | "moderate" | "strong"): number {
  if (strength === "strong") return 3;
  if (strength === "moderate") return 2;
  if (strength === "weak") return 1;
  return 0;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}