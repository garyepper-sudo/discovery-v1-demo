import {
  V3Belief,
  V3CausalChain,
  V3Contradiction,
  V3PriorityScore,
  V3Signal,
  V3Theme,
} from "./types";

export function scoreSignals(signals: V3Signal[]): V3Signal[] {
  return signals.map((signal) => ({
    ...signal,
    priority: score({
      confidence: signal.confidence,
      connectedness: signal.evidenceIds.length,
      urgency: signal.polarity === "negative" ? 0.8 : 0.5,
    }),
  }));
}

export function scoreThemes(themes: V3Theme[]): V3Theme[] {
  return themes.map((theme) => ({
    ...theme,
    priority: score({
      confidence: theme.confidence,
      connectedness:
        theme.evidenceIds.length + (theme.signalIds?.length ?? 0),
      urgency: theme.polarity === "negative" ? 0.85 : 0.45,
    }),
  }));
}

export function scoreContradictions(
  contradictions: V3Contradiction[]
): V3Contradiction[] {
  return contradictions.map((item) => ({
    ...item,
    priority: score({
      confidence: item.confidence,
      connectedness: item.evidenceIds.length,
      urgency: 1.0,
    }),
  }));
}

export function scoreCausalChains(
  chains: V3CausalChain[]
): V3CausalChain[] {
  return chains.map((chain) => ({
    ...chain,
    priority: score({
      confidence: chain.confidence,
      connectedness:
        chain.evidenceIds.length + chain.themeIds.length,
      urgency: 0.6,
    }),
  }));
}

export function scoreBeliefs(
  beliefs: V3Belief[]
): V3Belief[] {
  return beliefs.map((belief) => ({
    ...belief,
    priority: score({
      confidence: belief.confidence,
      connectedness:
        belief.supportingEvidenceIds.length +
        (belief.themeIds?.length ?? 0),
      urgency:
        belief.concerns.length > 0
          ? 0.75
          : 0.45,
    }),
  }));
}

function score(params: {
  confidence: number;
  connectedness: number;
  urgency: number;
}): V3PriorityScore {
  const importance = Math.min(
    1,
    params.connectedness * 0.12 +
      params.confidence * 0.45
  );

  const connectedness = Math.min(
    1,
    params.connectedness / 10
  );

  const total =
    importance * 0.45 +
    params.confidence * 0.35 +
    connectedness * 0.1 +
    params.urgency * 0.1;

  return {
    confidence: round(params.confidence),
    importance: round(importance),
    connectedness: round(connectedness),
    urgency: round(params.urgency),
    total: round(total),
  };
}

function round(value: number): number {
  return Number(value.toFixed(2));
}