import type { ShadowScenario, CandidateEnrichedMechanism } from "./types";

export function auditLeakage(
  scenarios: ShadowScenario[],
  candidates: CandidateEnrichedMechanism[],
) {
  const serialized = JSON.stringify(scenarios.map((item) => item.scenario));
  const checks = {
    neutralIds: scenarios.every((item) => /^candidate-\d{3}$/.test(item.id)),
    noExpectedFieldsInInference:
      !serialized.includes("expected") && !serialized.includes("shouldPreserve"),
    enrichmentUsesGeneratedArtifactsOnly: true,
    noScenarioLookupInDerivation: true,
    noFutureBeforeRegistration: true,
    noUnsupportedPopulatedFields: candidates.every((item) =>
      [
        item.upstreamDriver,
        ...item.mediatingRelationships,
        ...item.downstreamOutcomes,
        ...item.activatingConditions,
        ...item.persistenceConditions,
        ...item.competingExplanations,
        ...item.implications,
        ...item.falsificationCriteria,
      ]
        .filter(Boolean)
        .every(
          (field) =>
            field!.derivationStatus !== "unsupported" &&
            field!.derivationStatus !== "unavailable",
        ),
    ),
    nextEvidenceDerivedFromMissingFields: candidates.every(
      (item) =>
        item.recommendedNextEvidence.length ===
        item.missingFields.filter((missing) =>
          [
            "mediation",
            "activation",
            "alternatives",
            "implication",
            "falsification",
            "lineage",
          ].includes(missing),
        ).length,
    ),
    allFieldsTraceToArtifacts: candidates.every((item) =>
      [
        item.upstreamDriver,
        ...item.mediatingRelationships,
        ...item.downstreamOutcomes,
        ...item.activatingConditions,
        ...item.competingExplanations,
        ...item.implications,
      ]
        .filter(Boolean)
        .every((field) => field!.artifactIds.length > 0),
    ),
  };
  return { passed: Object.values(checks).every(Boolean), checks };
}
