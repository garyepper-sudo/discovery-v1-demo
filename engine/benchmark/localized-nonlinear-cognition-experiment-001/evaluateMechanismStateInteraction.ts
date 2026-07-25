import type { ArchitectureOutput, CognitiveInput, CognitiveTransition } from "./types";

export function evaluateMechanismStateInteraction(
  input: CognitiveInput,
  mechanismStatus: ArchitectureOutput["mechanismStatus"],
) {
  const transitions: CognitiveTransition[] = [];
  let status: ArchitectureOutput["activationStatus"] = "static";
  if (mechanismStatus === "qualified" && input.stateContrastSupport >= 2 &&
      input.conditionSupport >= 2) {
    const mapping = {
      activate: ["active", "inactive-to-active"],
      inhibit: ["inhibited", "active-to-inhibited"],
      amplify: ["amplified", "active-to-amplified"],
      none: ["static", null],
    } as const;
    const [next, kind] = mapping[input.conditionMode];
    status = next;
    if (kind) transitions.push({
      kind,
      reason: `Independent state contrast and condition support established ${next} behavior.`,
      lineageIds: input.lineageIds,
      reversibleBy: "Remove the condition or produce a contrary state contrast.",
    });
  }
  return { status, transitions };
}
