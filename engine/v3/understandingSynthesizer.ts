import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3ExecutiveUnderstanding,
  V3Theme,
  V3Understanding,
} from "./types";

type SynthesizeInput = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
};

export type SynthesizedExecutiveInsight = {
  id: string;
  headline: string;
  narrative: string;
  confidence: number;
  whyItMatters: string;
  supportingBeliefIds: string[];
  supportingThemeIds: string[];
  tensionIds: string[];
  evidenceIds: string[];
  executiveActions: string[];
};

export function synthesizeExecutiveInsight({
  evidence,
  themes,
  contradictions,
  beliefs,
  understanding,
}: SynthesizeInput): SynthesizedExecutiveInsight {
  const primaryBelief = choosePrimaryBelief(beliefs);
  const primaryTheme = choosePrimaryTheme(themes);
  const primaryTension = choosePrimaryTension(contradictions);

  const headline = buildExecutiveHeadline({
    primaryBelief,
    primaryTheme,
    primaryTension,
    understanding,
  });

  return {
    id: "SEI-1",
    headline,
    narrative: buildNarrative({
      headline,
      primaryBelief,
      primaryTheme,
      primaryTension,
      evidence,
      understanding,
    }),
    confidence: understanding.confidence,
    whyItMatters: buildWhyItMatters(primaryTheme, primaryTension),
    supportingBeliefIds: primaryBelief ? [primaryBelief.id] : [],
    supportingThemeIds: primaryTheme ? [primaryTheme.id] : [],
    tensionIds: primaryTension ? [primaryTension.id] : [],
    evidenceIds: understanding.evidenceIds,
    executiveActions: buildExecutiveActions({
      primaryTheme,
      primaryTension,
      understanding,
    }),
  };
}

export function synthesizeExecutiveUnderstanding(
  input: SynthesizeInput
): V3ExecutiveUnderstanding {
  const insight = synthesizeExecutiveInsight(input);

  return {
    headline: insight.headline,
    explanation: insight.narrative,
    confidence: insight.confidence,
    evidenceSummary: input.evidence
      .filter((item) => insight.evidenceIds.includes(item.id))
      .slice(0, 3)
      .map((item) => item.text),
    contradictions: input.contradictions
      .filter((item) => insight.tensionIds.includes(item.id))
      .map((item) => item.title),
    openQuestions: input.understanding.unknowns.slice(0, 3),
    nextMoves: insight.executiveActions,
  };
}

function choosePrimaryBelief(beliefs: V3Belief[]): V3Belief | undefined {
  return [...beliefs].sort((a, b) => {
    const utilityDelta = (b.utility ?? 0) - (a.utility ?? 0);
    if (utilityDelta !== 0) return utilityDelta;
    return b.confidence - a.confidence;
  })[0];
}

function choosePrimaryTheme(themes: V3Theme[]): V3Theme | undefined {
  return [...themes].sort((a, b) => {
    const stabilityDelta = (b.stability ?? 0) - (a.stability ?? 0);
    if (stabilityDelta !== 0) return stabilityDelta;
    return b.confidence - a.confidence;
  })[0];
}

function choosePrimaryTension(
  contradictions: V3Contradiction[]
): V3Contradiction | undefined {
  return [...contradictions].sort((a, b) => b.confidence - a.confidence)[0];
}

function buildExecutiveHeadline({
  primaryBelief,
  primaryTheme,
  primaryTension,
  understanding,
}: {
  primaryBelief?: V3Belief;
  primaryTheme?: V3Theme;
  primaryTension?: V3Contradiction;
  understanding: V3Understanding;
}): string {
  const theme = cleanThemeName(primaryTheme?.title);

  if (theme && primaryTension) {
    return `${theme} appears important, but one tension still needs resolution`;
  }

  if (theme) {
    return `${theme} is becoming the clearest strategic signal`;
  }

  if (primaryBelief) {
    return cleanHeadline(primaryBelief.headline);
  }

  return cleanHeadline(understanding.title);
}

function buildNarrative({
  headline,
  primaryBelief,
  primaryTheme,
  primaryTension,
  evidence,
  understanding,
}: {
  headline: string;
  primaryBelief?: V3Belief;
  primaryTheme?: V3Theme;
  primaryTension?: V3Contradiction;
  evidence: V3Evidence[];
  understanding: V3Understanding;
}): string {
  const evidenceCount = understanding.evidenceIds.length;
  const confidenceWord =
    understanding.confidence >= 0.78
      ? "strong"
      : understanding.confidence >= 0.58
        ? "moderate"
        : "early";

  const strongestEvidence = evidence.find((item) =>
    understanding.evidenceIds.includes(item.id)
  );

  const supportLine = primaryTheme
    ? `Discovery sees ${evidenceCount} evidence object${
        evidenceCount === 1 ? "" : "s"
      } clustering around ${cleanThemeName(primaryTheme.title).toLowerCase()}.`
    : `Discovery sees ${evidenceCount} evidence object${
        evidenceCount === 1 ? "" : "s"
      } supporting this view.`;

  const evidenceLine = strongestEvidence
    ? `The strongest signal is: ${strongestEvidence.text}`
    : "The available evidence supports the direction of this understanding.";

  const tensionLine = primaryTension
    ? `However, the understanding should not be treated as settled because ${primaryTension.title.toLowerCase()}.`
    : "Discovery does not see a major unresolved tension in the current evidence.";

  const beliefLine = primaryBelief
    ? `This is a ${confidenceWord} working understanding, not a final conclusion.`
    : `This is an early understanding that needs more evidence.`;

  return `${headline}. ${supportLine} ${evidenceLine} ${tensionLine} ${beliefLine}`;
}

function buildWhyItMatters(
  primaryTheme?: V3Theme,
  primaryTension?: V3Contradiction
): string {
  if (primaryTheme && primaryTension) {
    return `${cleanThemeName(
      primaryTheme.title
    )} may shape the strategic picture, but the unresolved tension could change how leadership should act.`;
  }

  if (primaryTheme) {
    return `${cleanThemeName(
      primaryTheme.title
    )} may be the highest-signal area for leadership attention right now.`;
  }

  return "Discovery has enough signal to form an early understanding, but more context would improve confidence.";
}

function buildExecutiveActions({
  primaryTheme,
  primaryTension,
  understanding,
}: {
  primaryTheme?: V3Theme;
  primaryTension?: V3Contradiction;
  understanding: V3Understanding;
}): string[] {
  const actions: string[] = [];

  if (primaryTheme) {
    actions.push(
      `Validate whether ${cleanThemeName(
        primaryTheme.title
      ).toLowerCase()} is accelerating, stabilizing, or fading.`
    );
  }

  if (primaryTension) {
    actions.push(
      primaryTension.unresolvedQuestion ??
        "Resolve the strongest open tension before treating this as settled."
    );
  }

  actions.push(...understanding.recommendations);

  return Array.from(new Set(actions)).slice(0, 4);
}

function cleanThemeName(title?: string): string {
  if (!title) return "";

  return title
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeadline(headline: string): string {
  return headline
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}