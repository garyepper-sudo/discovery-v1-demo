import type {
  ExplanationLike,
  PatternLike,
  PhenomenonLike,
  SemanticConceptLike,
} from "./mechanismInferenceTypes";
import { normalizeText } from "./mechanismUtils";

export type MechanismSignalSource =
  | "phenomenon"
  | "pattern"
  | "semanticConcept"
  | "explanation";

export type MechanismSignal = {
  id: string;
  source: MechanismSignalSource;
  text: string;
  confidence: number;
};

export function collectMechanismSignals(params: {
  phenomena?: PhenomenonLike[];
  patterns?: PatternLike[];
  semanticConcepts?: SemanticConceptLike[];
  explanations?: ExplanationLike[];
}): MechanismSignal[] {
  const phenomenonSignals: MechanismSignal[] = (params.phenomena ?? []).map(
    (phenomenon) => ({
      id: phenomenon.id,
      source: "phenomenon",
      text: normalizeText(
        phenomenon.type,
        phenomenon.label,
        phenomenon.summary,
        phenomenon.description,
        ...(phenomenon.possibleMechanismTypes ?? []),
      ),
      confidence:
        typeof phenomenon.confidence === "number"
          ? phenomenon.confidence
          : phenomenon.strength ?? 0.75,
    }),
  );

  const patternSignals: MechanismSignal[] = (params.patterns ?? []).map(
    (pattern) => ({
      id: pattern.id,
      source: "pattern",
      text: normalizeText(
        pattern.label,
        pattern.statement,
        pattern.description,
        pattern.reason,
      ),
      confidence:
        typeof pattern.confidence === "number"
          ? pattern.confidence
          : pattern.strength ?? 0.65,
    }),
  );

  const semanticConceptSignals: MechanismSignal[] = (
    params.semanticConcepts ?? []
  ).map((concept) => ({
    id: concept.id,
    source: "semanticConcept",
    text: normalizeText(
      concept.title,
      concept.label,
      concept.summary,
      concept.description,
    ),
    confidence:
      typeof concept.confidence === "number" ? concept.confidence : 0.7,
  }));

  const explanationSignals: MechanismSignal[] = (
    params.explanations ?? []
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
    confidence:
      typeof explanation.confidence === "number"
        ? explanation.confidence
        : 0.65,
  }));

  return [
    ...phenomenonSignals,
    ...patternSignals,
    ...semanticConceptSignals,
    ...explanationSignals,
  ].filter((signal) => signal.text.length > 0);
}