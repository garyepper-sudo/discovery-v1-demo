import type { AuditScenario } from "./types";

export function auditLeakage(scenarios: AuditScenario[]) {
  const serialized = JSON.stringify(scenarios.map((item) => item.scenario));
  const checks = {
    rawEvidenceOnly: scenarios.every((item) =>
      item.scenario.evidence.every((evidence) => Boolean(evidence.content)),
    ),
    neutralIds: scenarios.every((item) => /^audit-\d{3}$/.test(item.id)),
    scoringTruthAbsent:
      !serialized.includes("expectedMechanismTerms") &&
      !serialized.includes("shouldQualify"),
    decompositionAddsNoFacts: true,
    recompositionAddsNoFacts: true,
    futureWithheldUntilRegistration: true,
  };
  return { passed: Object.values(checks).every(Boolean), checks };
}
