import type { ArchitectureOutput } from "./types";

export function verbalizeDynamicRevision(output: ArchitectureOutput) {
  const last = output.transitions.at(-1);
  return {
    whatDiscoveryPreviouslyBelieved: output.transitions.length
      ? "The prior model had not crossed the current structural transition."
      : "The prior model remained stable.",
    whatChanged: last?.reason ?? "No transition contract was crossed.",
    whatDiscoveryBelievesNow:
      `${output.mechanismStatus}; ${output.activationStatus}; ${output.leadingExplanation}.`,
    whyNonProportional: last
      ? `The ${last.kind} contract changed the type of conclusion, not only confidence.`
      : "No non-proportional change occurred.",
    whatDiscoveryPredictsNext: `Conditional outcome estimate: ${output.prediction.toFixed(2)}.`,
    whatWouldReverseTheUpdate: last?.reversibleBy ?? "Material new discriminating Evidence.",
    whatDiscoveryStillDoesNotKnow:
      output.leadingExplanation === "unresolved"
        ? "The leading explanation remains unresolved." : "Future outcomes may still falsify the current leader.",
  };
}
