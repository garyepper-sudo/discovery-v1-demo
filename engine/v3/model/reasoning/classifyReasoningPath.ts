import type {
  OrganizationalReasoningPath,
  OrganizationalReasoningType,
} from "./reasoningTypes";

export function classifyReasoningPath(
  path: OrganizationalReasoningPath
): OrganizationalReasoningPath {
  const text = path.steps
    .map((step) => `${step.fromLabel} ${step.relationship} ${step.toLabel}`)
    .join(" ")
    .toLowerCase();

  const reasoningType: OrganizationalReasoningType =
    includesAny(text, ["fail", "delay", "break", "friction", "bottleneck"])
      ? "failurePropagation"
      : includesAny(text, ["risk", "exposure", "compliance"])
        ? "riskAmplification"
        : includesAny(text, ["own", "accountable", "responsible"])
          ? "ownership"
          : includesAny(text, ["depends", "requires", "uses"])
            ? "dependency"
            : includesAny(text, ["constraint", "blocks", "limits"])
              ? "constraint"
              : includesAny(text, ["capability", "enables", "strengthens"])
                ? "capabilityFormation"
                : includesAny(text, ["causes", "creates", "drives", "contributes", "influences"])
                  ? "causal"
                  : "unknown";

  return {
    ...path,
    reasoningType,
    directness:
      path.pathLength <= 1
        ? "direct"
        : path.pathLength >= 4 && path.causalStrength >= 0.75
          ? "emergent"
          : "indirect",
  };
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}