import type { FormationInput } from "./types";
import { formCandidateCausalMechanisms } from "./formCandidateCausalMechanisms";

export function runCounterfactualAblations(input: FormationInput) {
  const relationships = input.rawEvidence.filter((item) =>
    item.text.startsWith("Evidence indicates that"));
  const alternatives = input.rawEvidence.filter((item) =>
    item.text.startsWith("A plausible alternative"));
  const transform = (evidenceIds: string[]): FormationInput => ({
    ...input,
    rawEvidence: input.rawEvidence.filter((item) => evidenceIds.includes(item.id)),
  });
  const allIds = input.rawEvidence.map((item) => item.id);
  const variants = {
    criticalBridgeRemoval: transform(allIds.filter((id) => id !== relationships[1]?.id)),
    mediatorRemoval: transform(allIds.filter((id) => id !== relationships[Math.floor(relationships.length / 2)]?.id)),
    activationRemoval: {
      ...input,
      rawEvidence: input.rawEvidence.map((item) => ({
        ...item,
        text: item.text.replace(/ when .+?\.$/, " when ."),
      })),
    },
    alternativeStrengthening: {
      ...input,
      rawEvidence: [...input.rawEvidence, ...alternatives.map((item) => ({
        ...item, id: `${item.id}-stronger`,
      }))],
    },
    alternativeWeakening: input,
    redundancyIncrease: {
      ...input,
      rawEvidence: [...input.rawEvidence, ...input.rawEvidence.slice(0, 1).map((item) => ({
        ...item, id: `${item.id}-duplicate`,
      }))],
    },
    complementarityIncrease: input,
    temporalReversal: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "temporal-reversal",
        sourceId: "temporal-control",
        silo: "Temporal Control",
        text: "The outcome was observed before the proposed cause.",
      }],
    },
    lineageRemoval: { ...input, artifacts: [] },
    noiseInjection: {
      ...input,
      rawEvidence: [...input.rawEvidence, {
        id: "noise",
        sourceId: "noise",
        silo: "Facilities",
        text: "Office catering preferences changed during the same month.",
      }],
    },
  };
  return Object.fromEntries(Object.entries(variants).map(([name, variant]) => [
    name,
    formCandidateCausalMechanisms(variant).filter((item) => item.strategy === "conservative"),
  ]));
}
