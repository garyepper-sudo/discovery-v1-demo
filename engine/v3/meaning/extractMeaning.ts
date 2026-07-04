import { MEANING_CATALOG } from "./meaningCatalog";
import type { MeaningSignal } from "./types";
import type { FunctionalInterpretation } from "../functional/functionalInterpretation";

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase().trim() : "";
}

function textOf(interpretation: FunctionalInterpretation): string {
  return [
    interpretation.statement,
    interpretation.description,
    interpretation.category,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (!values.length) return 0.5;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function extractMeaningSignals(params: {
  interpretations: FunctionalInterpretation[];
  existingSignals?: MeaningSignal[];
}): MeaningSignal[] {
  const { interpretations, existingSignals = [] } = params;

  const newSignals = MEANING_CATALOG.map((meaning) => {
    const matches = interpretations
      .map((interpretation) => {
        const text = textOf(interpretation);
        const sourceTerms = meaning.terms.filter((term) =>
          text.includes(term)
        );

        return {
          interpretation,
          sourceTerms,
        };
      })
      .filter((match) => match.sourceTerms.length > 0);

    if (!matches.length) return null;

    const supportingUnderstandingIds = Array.from(
      new Set(
        matches.flatMap(
          (match) => match.interpretation.supportingUnderstandingIds ?? []
        )
      )
    );

    const sourceTerms = Array.from(
      new Set(matches.flatMap((match) => match.sourceTerms))
    );

    const supportRatio =
      matches.length / Math.max(interpretations.length, 1);

    const confidence = clamp(
      average(
        matches.map(
          (match) => match.interpretation.confidence ?? 0.55
        )
      ) *
        0.65 +
        supportRatio * 0.35
    );

    const strength = clamp(
      average(
        matches.map((match) => match.interpretation.strength ?? 0.5)
      ) *
        0.55 +
        supportRatio * 0.45
    );

    return {
      id: `meaning-${meaning.id}`,
      meaningId: meaning.id,
      label: meaning.label,
      description: meaning.description,
      confidence,
      strength,
      supportingUnderstandingIds,
      sourceTerms,
    };
  }).filter(Boolean) as MeaningSignal[];

  const merged = [...existingSignals];

  for (const signal of newSignals) {
    const existingIndex = merged.findIndex(
      (existing) => existing.meaningId === signal.meaningId
    );

    if (existingIndex === -1) {
      merged.push(signal);
      continue;
    }

    const existing = merged[existingIndex];

    merged[existingIndex] = {
      ...existing,
      confidence: clamp((existing.confidence + signal.confidence) / 2 + 0.04),
      strength: clamp((existing.strength + signal.strength) / 2 + 0.04),
      supportingUnderstandingIds: Array.from(
        new Set([
          ...existing.supportingUnderstandingIds,
          ...signal.supportingUnderstandingIds,
        ])
      ),
      sourceTerms: Array.from(
        new Set([...existing.sourceTerms, ...signal.sourceTerms])
      ),
    };
  }

  return merged.sort((a, b) => b.strength - a.strength);
}