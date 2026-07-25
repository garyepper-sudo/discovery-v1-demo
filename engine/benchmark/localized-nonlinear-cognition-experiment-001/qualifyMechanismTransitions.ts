import type { ArchitectureOutput, CognitiveInput, CognitiveTransition } from "./types";

export function qualifyMechanismTransitions(input: CognitiveInput) {
  const transitions: CognitiveTransition[] = [];
  let status: ArchitectureOutput["mechanismStatus"] =
    input.complementarySupport >= 2 ? "hypothesis" : "fragment";
  if (input.complementarySupport >= 2 && input.mediationSupport >= 2) {
    transitions.push({
      kind: "fragment-to-hypothesis",
      reason: "Complementary support and mediation reached the shared hypothesis gate.",
      lineageIds: input.lineageIds,
      reversibleBy: "Remove a complementary bridge or add material counterevidence.",
    });
  }
  if (input.complementarySupport >= 3 && input.mediationSupport >= 2 &&
      input.alternativeMargin >= 0.2) {
    status = "qualified";
    transitions.push({
      kind: "hypothesis-to-qualified",
      reason: "Complete mediation and a discriminating alternative margin crossed the qualification gate.",
      lineageIds: input.lineageIds,
      reversibleBy: "Reduce mediation completeness or eliminate the alternative margin.",
    });
  }
  return { status, transitions };
}
