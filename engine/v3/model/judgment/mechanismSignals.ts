import type {
  CompressedPatternThemeLike,
  ExplanationLike,
  PatternLike,
  PhenomenonLike,
  SemanticConceptLike,
} from "./mechanismInferenceTypes";
import { normalizeText } from "./mechanismUtils";

export type MechanismSignalSource =
  | "phenomenon"
  | "pattern"
  | "compressedPatternTheme"
  | "semanticConcept"
  | "explanation";

export type MechanismSignal = {
  id: string;
  source: MechanismSignalSource;
  text: string;
  confidence: number;
};

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeConfidence(value: unknown, fallback: number): number {
  if (typeof value !== "number") return fallback;

  return Math.max(0, Math.min(1, value));
}

export function collectMechanismSignals(params: {
  phenomena?: PhenomenonLike[];
  patterns?: PatternLike[];
  compressedPatternThemes?: CompressedPatternThemeLike[];
  semanticConcepts?: SemanticConceptLike[];
  explanations?: ExplanationLike[];
}): MechanismSignal[] {
  const phenomenonSignals: MechanismSignal[] = asArray(params.phenomena).map(
    (phenomenon) => ({
      id: phenomenon.id,
      source: "phenomenon",
      text: normalizeText(
        phenomenon.type,
        phenomenon.label,
        phenomenon.summary,
        phenomenon.description,
        ...asArray(phenomenon.possibleMechanismTypes),
      ),
      confidence: normalizeConfidence(
        phenomenon.confidence,
        phenomenon.strength ?? 0.75,
      ),
    }),
  );

  const patternSignals: MechanismSignal[] = asArray(params.patterns).map(
    (pattern) => ({
      id: pattern.id,
      source: "pattern",
      text: normalizeText(
        pattern.label,
        pattern.statement,
        pattern.description,
        pattern.reason,
      ),
      confidence: normalizeConfidence(
        pattern.confidence,
        pattern.strength ?? 0.65,
      ),
    }),
  );

  const compressedThemeSignals: MechanismSignal[] = asArray(
    params.compressedPatternThemes,
  ).map((theme) => ({
    id: theme.id,
    source: "compressedPatternTheme",
    text: normalizeText(theme.label, theme.summary),
    confidence: normalizeConfidence(theme.confidence, 0.75),
  }));

  const semanticConceptSignals: MechanismSignal[] = asArray(
    params.semanticConcepts,
  ).map((concept) => ({
    id: concept.id,
    source: "semanticConcept",
    text: normalizeText(
      concept.title,
      concept.label,
      concept.summary,
      concept.description,
    ),
    confidence: normalizeConfidence(concept.confidence, 0.7),
  }));

  const explanationSignals: MechanismSignal[] = asArray(
    params.explanations,
  ).map((explanation) => ({
    id: explanation.id,
    source: "explanation",
    text: normalizeText(
      explanation.title,
      explanation.summary,
      explanation.interpretation,
      explanation.executiveImplication,
      explanation.type,
    ),
    confidence: normalizeConfidence(explanation.confidence, 0.65),
  }));

  const deduped = new Map<string, MechanismSignal>();

  for (const signal of [
    ...phenomenonSignals,
    ...patternSignals,
    ...compressedThemeSignals,
    ...semanticConceptSignals,
    ...explanationSignals,
  ]) {
    if (!signal.id || signal.text.length === 0) continue;

    const key = `${signal.source}:${signal.id}`;
    const existing = deduped.get(key);

    if (!existing || signal.confidence > existing.confidence) {
      deduped.set(key, signal);
    }
  }

  return [...deduped.values()];
}