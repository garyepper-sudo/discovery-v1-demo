import type {
  EmergentOrganizationalUnderstanding,
  InferenceScenario,
} from "./types";

export type Ablation =
  | "none"
  | "no-history"
  | "no-contradictions"
  | "no-mechanisms"
  | "no-theories"
  | "no-conditions"
  | "no-lineage";

const unique = <T>(items: T[]) => [...new Set(items)];
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function inferEmergentUnderstanding(
  scenario: InferenceScenario,
  ablation: Ablation = "none",
): EmergentOrganizationalUnderstanding | null {
  const evidence = [...scenario.evidence].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  if (ablation === "no-mechanisms") return null;
  const mechanisms = [...scenario.artifacts.mechanisms].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const candidates = mechanisms
    .map((mechanism) => {
      const supporting = evidence.filter((item) =>
        mechanism.evidenceIds.includes(item.id),
      );
      const silos = unique(supporting.map((item) => item.silo)).sort();
      const conditionSupport =
        ablation === "no-conditions"
          ? 0
          : scenario.artifacts.conditions.filter((item) =>
              item.supportingMechanismIds.includes(mechanism.id),
            ).length;
      const theorySupport =
        ablation === "no-theories"
          ? 0
          : scenario.artifacts.theories.filter((item) =>
              item.supportingEvidence.some((id) =>
                mechanism.evidenceIds.includes(id),
              ),
            ).length;
      const historicalSupport =
        ablation === "no-history"
          ? 0
          : scenario.artifacts.historicalTransitions.filter((item) =>
              item.evidenceIds.some((id) => mechanism.evidenceIds.includes(id)),
            ).length;
      const contradictionPenalty =
        ablation === "no-contradictions"
          ? 0
          : scenario.artifacts.contradictions.length * 0.08;
      return {
        mechanism,
        supporting,
        silos,
        score:
          silos.length * 0.16 +
          mechanism.confidence * 0.3 +
          conditionSupport * 0.08 +
          theorySupport * 0.08 +
          historicalSupport * 0.08 -
          contradictionPenalty,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.mechanism.id.localeCompare(b.mechanism.id),
    );
  const leader = candidates[0];
  if (!leader || leader.silos.length < 3) return null;
  if (/no universal|unresolved|incompatible/i.test(leader.mechanism.effect)) {
    return null;
  }
  const next = candidates[1];
  if (next && leader.score - next.score < 0.12) return null;

  const lineage =
    ablation === "no-lineage"
      ? []
      : leader.supporting.map((item) => item.id).sort();
  const confidence = round(Math.min(0.9, 0.46 + leader.score * 0.28));
  return {
    explanation: `${leader.mechanism.cause} interacts across ${leader.silos.join(
      ", ",
    )}; ${leader.mechanism.mechanism}, producing ${leader.mechanism.effect}.`,
    mechanismId: leader.mechanism.id,
    requiredSilos: leader.silos,
    supportingEvidenceIds: lineage,
    reconciledLocalInterpretations: leader.supporting.map(
      (item) =>
        `${item.silo}: ${item.localInterpretation} is locally plausible but explains only ${item.observation}`,
    ),
    discoveredRelationships: [
      `${leader.mechanism.cause} → ${leader.mechanism.mechanism}`,
      `${leader.mechanism.mechanism} → ${leader.mechanism.effect}`,
    ],
    discoveredMechanisms: [leader.mechanism.mechanism],
    interventionImplications: [
      `Change ${leader.mechanism.cause} rather than treating each local symptom independently.`,
    ],
    predictedOutcomes: [leader.mechanism.effect],
    confidence,
    falsificationCriteria: [
      `The predicted outcome does not occur when ${leader.mechanism.cause} remains present.`,
      `Removing one claimed cross-silo link leaves the explanation and prediction unchanged.`,
    ],
  };
}
