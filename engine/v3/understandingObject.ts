import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3Theme,
  V3Understanding,
} from "./types";

export function buildUnderstandingObject(params: {
  beliefs: V3Belief[];
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
}): V3Understanding {
  const primaryBelief = choosePrimaryBelief(params.beliefs);
  const strongestThemes = chooseStrongestThemes(params.themes);
  const highestRiskContradictions = chooseHighestRiskContradictions(
    params.contradictions
  );

  const evidenceIds = collectEvidenceIds({
    primaryBelief,
    themes: strongestThemes,
    evidence: params.evidence,
  });

  const confidence = calculateUnderstandingConfidence({
    primaryBelief,
    themes: strongestThemes,
    contradictions: highestRiskContradictions,
  });

  return {
    id: "U-CANONICAL-1",

    title:
      primaryBelief?.headline ??
      buildFallbackTitle(strongestThemes, highestRiskContradictions),

    summary: buildSummary({
      primaryBelief,
      themes: strongestThemes,
      contradictions: highestRiskContradictions,
      evidence: params.evidence,
    }),

    confidence,

    supportScore: calculateSupportScore(evidenceIds, strongestThemes),

    contradictionScore: calculateContradictionScore(highestRiskContradictions),

    noveltyScore: calculateNoveltyScore(strongestThemes, highestRiskContradictions),

    evidenceIds,

    themeIds: strongestThemes.map((theme) => theme.id),

    explanationIds: [],

    causalChainIds: primaryBelief?.causalChainIds ?? [],

    supportingReasons: buildSupportingReasons(primaryBelief, strongestThemes),

    contradictions: highestRiskContradictions.map(
      (contradiction) => contradiction.explanation
    ),

    unknowns: buildUnknowns(primaryBelief, highestRiskContradictions),

    implications: buildImplications(primaryBelief, highestRiskContradictions),

    recommendations: buildRecommendations({
      primaryBelief,
      themes: strongestThemes,
      contradictions: highestRiskContradictions,
    }),

    beliefIds: params.beliefs.map((belief) => belief.id),
  };
}

function choosePrimaryBelief(beliefs: V3Belief[]): V3Belief | undefined {
  return [...beliefs].sort((a, b) => {
    const utilityDelta = (b.utility ?? 0) - (a.utility ?? 0);
    if (utilityDelta !== 0) return utilityDelta;

    const stabilityDelta = (b.stability ?? 0) - (a.stability ?? 0);
    if (stabilityDelta !== 0) return stabilityDelta;

    return b.confidence - a.confidence;
  })[0];
}

function chooseStrongestThemes(themes: V3Theme[]): V3Theme[] {
  return [...themes]
    .sort((a, b) => {
      const stabilityDelta = (b.stability ?? 0) - (a.stability ?? 0);
      if (stabilityDelta !== 0) return stabilityDelta;

      return b.confidence - a.confidence;
    })
    .slice(0, 4);
}

function chooseHighestRiskContradictions(
  contradictions: V3Contradiction[]
): V3Contradiction[] {
  return [...contradictions]
    .sort((a, b) => {
      const severityDelta = severityRank(b.severity) - severityRank(a.severity);
      if (severityDelta !== 0) return severityDelta;

      return b.confidence - a.confidence;
    })
    .slice(0, 3);
}

function collectEvidenceIds(params: {
  primaryBelief?: V3Belief;
  themes: V3Theme[];
  evidence: V3Evidence[];
}): string[] {
  const ids = new Set<string>();

  params.primaryBelief?.supportingEvidenceIds.forEach((id) => ids.add(id));
  params.themes.forEach((theme) => {
    theme.evidenceIds.forEach((id) => ids.add(id));
  });

  if (ids.size === 0) {
    params.evidence.slice(0, 6).forEach((item) => ids.add(item.id));
  }

  return Array.from(ids).slice(0, 14);
}

function calculateUnderstandingConfidence(params: {
  primaryBelief?: V3Belief;
  themes: V3Theme[];
  contradictions: V3Contradiction[];
}): number {
  const beliefConfidence = params.primaryBelief?.confidence ?? 0.45;

  const themeConfidence =
    params.themes.length > 0
      ? average(params.themes.map((theme) => theme.confidence))
      : 0.45;

  const contradictionPenalty = Math.min(
    0.22,
    params.contradictions.reduce(
      (sum, contradiction) => sum + contradiction.confidence,
      0
    ) * 0.04
  );

  return clamp(beliefConfidence * 0.58 + themeConfidence * 0.32 - contradictionPenalty);
}

function calculateSupportScore(
  evidenceIds: string[],
  themes: V3Theme[]
): number {
  const evidenceSupport = evidenceIds.length;
  const themeSupport = themes.length * 1.5;

  return Number((evidenceSupport + themeSupport).toFixed(1));
}

function calculateContradictionScore(
  contradictions: V3Contradiction[]
): number {
  return Number(
    contradictions
      .reduce(
        (sum, contradiction) =>
          sum + contradiction.confidence * severityRank(contradiction.severity),
        0
      )
      .toFixed(1)
  );
}

function calculateNoveltyScore(
  themes: V3Theme[],
  contradictions: V3Contradiction[]
): number {
  const emergentThemeBonus = themes.some((theme) => theme.id.startsWith("ET"))
    ? 0.35
    : 0;

  const contradictionBonus = Math.min(0.35, contradictions.length * 0.12);

  return clamp(0.25 + emergentThemeBonus + contradictionBonus);
}

function buildFallbackTitle(
  themes: V3Theme[],
  contradictions: V3Contradiction[]
): string {
  if (themes.length > 0 && contradictions.length > 0) {
    return `${themes[0].title} is emerging, but unresolved tensions remain`;
  }

  if (themes.length > 0) {
    return `${themes[0].title} is the clearest emerging pattern`;
  }

  return "Discovery has not formed a stable belief yet.";
}

function buildSummary(params: {
  primaryBelief?: V3Belief;
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  evidence: V3Evidence[];
}): string {
  if (params.primaryBelief) {
    const themePhrase =
      params.themes.length > 0
        ? ` It is supported by ${params.themes.length} major pattern${
            params.themes.length === 1 ? "" : "s"
          }.`
        : "";

    const contradictionPhrase =
      params.contradictions.length > 0
        ? ` Discovery also sees ${params.contradictions.length} unresolved tension${
            params.contradictions.length === 1 ? "" : "s"
          } that could change the conclusion.`
        : "";

    return `${params.primaryBelief.explanation}${themePhrase}${contradictionPhrase}`;
  }

  if (params.evidence.length > 0) {
    return "Discovery has evidence, but it needs stronger patterns before forming a stable executive understanding.";
  }

  return "Discovery needs more evidence before it can summarize the current understanding.";
}

function buildSupportingReasons(
  primaryBelief: V3Belief | undefined,
  themes: V3Theme[]
): string[] {
  const reasons = [
    ...(primaryBelief?.supportingReasons ?? []),
    ...themes.map(
      (theme) =>
        `${theme.title} is supported by ${theme.evidenceIds.length} evidence object${
          theme.evidenceIds.length === 1 ? "" : "s"
        }.`
    ),
  ];

  return Array.from(new Set(reasons)).slice(0, 5);
}

function buildUnknowns(
  primaryBelief: V3Belief | undefined,
  contradictions: V3Contradiction[]
): string[] {
  const unknowns = [
    ...(primaryBelief?.nextQuestions ?? []),
    ...contradictions
      .map((contradiction) => contradiction.unresolvedQuestion)
      .filter((question): question is string => Boolean(question)),
  ];

  return Array.from(new Set(unknowns)).slice(0, 5);
}

function buildImplications(
  primaryBelief: V3Belief | undefined,
  contradictions: V3Contradiction[]
): string[] {
  const implications = [...(primaryBelief?.concerns ?? [])];

  if (contradictions.length > 0) {
    implications.push(
      "The current understanding should be treated as actionable, but not fully settled."
    );
  }

  return Array.from(new Set(implications)).slice(0, 5);
}

function buildRecommendations(params: {
  primaryBelief?: V3Belief;
  themes: V3Theme[];
  contradictions: V3Contradiction[];
}): string[] {
  const recommendations: string[] = [
    "Review the strongest supporting evidence behind the current belief.",
  ];

  if (params.contradictions.length > 0) {
    recommendations.push("Investigate the strongest unresolved tension.");
  }

  if (params.themes.length > 0) {
    recommendations.push(
      `Test whether ${params.themes[0].title.toLowerCase()} is worsening, stabilizing, or resolving.`
    );
  }

  if (params.primaryBelief?.nextQuestions?.[0]) {
    recommendations.push(params.primaryBelief.nextQuestions[0]);
  }

  return Array.from(new Set(recommendations)).slice(0, 4);
}

function severityRank(severity?: "weak" | "moderate" | "strong"): number {
  if (severity === "strong") return 3;
  if (severity === "moderate") return 2;
  if (severity === "weak") return 1;
  return 1;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}