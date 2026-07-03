import { Observation, Signal, Surprise } from "../../types";

export function detectSurprises(
  observations: Observation[],
  signals: Signal[]
): Surprise[] {
  const surprises: Surprise[] = [];

  const hasMultipleThemes = new Set(signals.map((signal) => signal.category)).size >= 3;

  if (hasMultipleThemes) {
    surprises.push({
      title: "Cross-theme connection detected",
      score: 72,
      reason:
        "The input appears to touch multiple strategic domains at once, which may indicate a broader pattern rather than an isolated issue.",
    });
  }

  const uncertaintyLanguage = observations.some((observation) => {
    const text = observation.description.toLowerCase();
    return text.includes("not sure") || text.includes("unclear") || text.includes("confused");
  });

  if (uncertaintyLanguage) {
    surprises.push({
      title: "Leadership uncertainty detected",
      score: 68,
      reason:
        "The input contains uncertainty language, suggesting the main value may be clarifying the strategic frame before producing recommendations.",
    });
  }

  if (surprises.length === 0) {
    surprises.push({
      title: "No structural surprise yet",
      score: 35,
      reason:
        "The current input did not strongly challenge the investigation frame. More evidence over time may create deeper surprise.",
    });
  }

  return surprises;
}