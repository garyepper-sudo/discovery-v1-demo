import { V3ExecutiveUnderstanding } from "../types";
import { compressUnderstanding } from "./compress";
import { explainUnderstanding } from "./explain";
import { buildExecutiveNarrative } from "./narrative";
import { prioritizeUnderstanding } from "./prioritize";
import { recommendFromUnderstanding } from "./recommend";
import { UnderstandingEngineInput } from "./types";

export function runUnderstandingEngine(
  input: UnderstandingEngineInput
): V3ExecutiveUnderstanding {
  const prioritized = prioritizeUnderstanding(input);
  const compressed = compressUnderstanding(prioritized);
  const explanation = explainUnderstanding(prioritized, compressed);
  const recommendation = recommendFromUnderstanding(prioritized);
  const narrative = buildExecutiveNarrative({
    compressed,
    explanation,
    recommendation,
  });

  return {
    headline: narrative.headline,
    explanation: narrative.body,
    confidence: narrative.confidence,
    evidenceSummary: input.evidence
      .filter((item) => input.understanding.evidenceIds.includes(item.id))
      .slice(0, 3)
      .map((item) => item.text),
    contradictions: input.contradictions
      .slice(0, 3)
      .map((item) => item.title),
    openQuestions: [narrative.suggestedNextQuestion],
    nextMoves: narrative.nextMoves,
  };
}

export type { ExecutiveNarrative } from "./types";