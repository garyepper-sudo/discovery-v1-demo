import { formCandidateMechanisms } from "./formCandidateMechanisms";
import type { RegisteredInput } from "./types";

export function runCounterfactualAblations(input: RegisteredInput) {
  const remove = (predicate: (text: string) => boolean): RegisteredInput => ({
    ...input, rawEvidence: input.rawEvidence.filter((item) => !predicate(item.text)),
  });
  const variants: Record<string, RegisteredInput> = {
    implicitEdgeRemoval: remove((text) => text.startsWith("When ")),
    temporalReversal: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "reversal", sourceId: "reversal", silo: "Temporal",
        text: "The alleged outcome may create the alleged upstream condition.",
      }],
    },
    interventionResponseRemoval: remove((text) => text.startsWith("When ")),
    commonCauseAddition: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "confounder", sourceId: "confounder", silo: "Audit",
        text: "A third factor plausibly explains both A and B.",
      }],
    },
    branchRemoval: remove((text) => /outcome beta/.test(text)),
    unsupportedBranchAddition: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "unsupported-branch", sourceId: "unsupported-branch", silo: "Noise",
        text: "An unsupported downstream outcome is merely plausible.",
      }],
    },
    driverRemoval: remove((text) => /driver beta/.test(text)),
    unsupportedDriverAddition: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "unsupported-driver", sourceId: "unsupported-driver", silo: "Noise",
        text: "An unsupported driver occurred in the same period.",
      }],
    },
    redundancyIncrease: {
      ...input,
      rawEvidence: [...input.rawEvidence, ...input.rawEvidence.slice(0, 1).map((item) => ({
        ...item, id: `${item.id}-duplicate`,
      }))],
    },
    complementarityIncrease: input,
    lineageRemoval: { ...input, artifacts: [] },
    noiseInjection: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "noise", sourceId: "noise", silo: "Facilities",
        text: "Office catering preferences changed.",
      }],
    },
  };
  return Object.fromEntries(Object.entries(variants).map(([name, value]) => [
    name,
    formCandidateMechanisms(value).find((item) => item.strategy === "conservative-unified"),
  ]));
}
