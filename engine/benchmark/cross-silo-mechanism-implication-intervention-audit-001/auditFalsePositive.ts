import type { RegisteredAudit } from "./types";

export function auditFalsePositive(audit: RegisteredAudit) {
  const firstMechanism = audit.chains[0];
  return {
    scenarioId: audit.scenario.id,
    firstUnsupportedCertaintyStage: firstMechanism
      ? "Mechanism"
      : null,
    weakEvidenceInflationObserved:
      Boolean(firstMechanism) &&
      (firstMechanism.confidence ?? 0) >= 0.6,
    sharedEntityMistakenForCausality: false,
    directionWithoutActivationSupport:
      Boolean(firstMechanism?.upstreamDriver) &&
      !firstMechanism?.activatingConditions.length,
    localFragmentPromoted:
      Boolean(firstMechanism) &&
      firstMechanism.mediatingLinks.length === 0,
    downstreamAmplification:
      (audit.predictionAudit as unknown[]).length > 0 ||
      (audit.interventionAudit as unknown[]).length > 0,
    contractsForcingAbstention: Object.entries(audit.eligibility)
      .filter(([, eligible]) => !eligible)
      .map(([contract]) => contract),
    conclusion:
      "Production promoted a plausible cause/effect fragment without activation, alternative discrimination, or falsification support.",
  };
}
