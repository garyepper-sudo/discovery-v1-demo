import {
  V3Evidence,
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
  signals: V3Signal[] = []
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

  const emergentThemes = buildEmergentThemes(evidence, existingTitles);

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
  existingThemeIds: Set<string>
): V3Theme[] {
  const keywordCounts = new Map<string, V3Evidence[]>();

  evidence.forEach((item) => {
    (item.keywords ?? []).forEach((keyword) => {
      const current = keywordCounts.get(keyword) ?? [];
      current.push(item);
      keywordCounts.set(keyword, current);
    });
  });

  return Array.from(keywordCounts.entries())
    .filter(([, matchedEvidence]) => matchedEvidence.length >= 2)
    .map(([keyword, matchedEvidence], index) => {
      const title = `${capitalize(keyword)} Pattern`;
      const id = `ET${index + 1}`;

      if (existingThemeIds.has(title)) return null;

      return {
        id,
        title,
        description: buildThemeDescription(title, matchedEvidence),
        evidenceIds: matchedEvidence.map((item) => item.id),
        signalIds: [],
        confidence: calculateThemeConfidence(matchedEvidence),
        keywords: collectKeywords(matchedEvidence, [keyword]),
        entities: collectEntities(matchedEvidence),
        polarity: dominantPolarity(matchedEvidence),
        strength: strongestSignal(matchedEvidence),
        stability: calculateStability(matchedEvidence),
      };
    })
    .filter((theme) => theme !== null)
    .slice(0, 3);
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}