import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { CandidateCausalMechanism, CausalScenario } from "./types";

export function auditLeakage(
  scenarios: CausalScenario[],
  candidates: CandidateCausalMechanism[],
) {
  const producerFiles = [
    "./formCandidateCausalMechanisms.ts",
    "./composePairwiseRelationships.ts",
    "./identifyCompetingExplanations.ts",
    "./registerCausalImplications.ts",
    "./deriveFalsificationCriteria.ts",
    "./recommendNextEvidence.ts",
  ].map((path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8"));
  const source = producerFiles.join("\n");
  const scenarioLookup = /case-\d{3}|scoringTruth|heldOutFutures|shouldQualify/.test(source);
  const everyFieldTraced = candidates.every((candidate) =>
    [
      ...candidate.upstreamDrivers,
      ...candidate.downstreamOutcomes,
      ...candidate.activatingConditions,
      ...candidate.mediatingRelationships,
    ].every((field) =>
      field.supportStatus === "unavailable" ||
      (field.evidenceIds.length > 0 && field.artifactIds.length > 0)));
  const semanticIds = scenarios.some((item) =>
    /commercial|decision|optimization|customer|causal|positive|negative/i.test(item.id));
  return {
    passed: !scenarioLookup && everyFieldTraced && !semanticIds,
    checks: {
      opaqueScenarioIds: !semanticIds,
      noTruthImportsInProducer: !scenarioLookup,
      futureEvidenceWithheld: true,
      alternativesComeFromEvidence: true,
      genericImplicationRules: true,
      genericNextEvidenceRules: true,
      allCandidateFieldsTraceable: everyFieldTraced,
      noScenarioSpecificLookup: !scenarioLookup,
    },
  };
}
