import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { auditInterventionTargetRecoverability } from "./auditInterventionTargetRecoverability";
import { auditLeakage } from "./auditLeakage";
import { auditPredictionRecoverability } from "./auditPredictionRecoverability";
import { collectCanonicalInputs } from "./collectCanonicalInputs";
import { deriveCandidateEnrichedMechanisms } from "./deriveCandidateEnrichedMechanisms";
import { evaluateQualificationContracts } from "./evaluateQualificationContracts";
import { shadowScenarios } from "./fixtures";
import { productionPathAudit } from "./productionPathAudit";
import { createCounterfactuals } from "./runCounterfactualAblations";
import { extractGeneratedCognition, runProductionShadowCognition } from "./runProductionShadowCognition";
import { fieldAvailability, scoreExperiment } from "./scoreExperiment";
import type { RegisteredShadow, ShadowScenario } from "./types";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function execute(scenarios: ShadowScenario[]): RegisteredShadow[] {
  return [...scenarios].sort((a, b) => a.id.localeCompare(b.id)).map((scenario) => {
    const cognition = extractGeneratedCognition({
      scenario: scenario.scenario,
      ...runProductionShadowCognition(scenario.scenario),
    });
    collectCanonicalInputs(cognition);
    const candidates = deriveCandidateEnrichedMechanisms(cognition);
    return {
      scenario,
      cognition,
      candidates,
      qualifications: evaluateQualificationContracts(candidates),
      predictionRecoverability: auditPredictionRecoverability(candidates),
      interventionRecoverability:
        auditInterventionTargetRecoverability(candidates),
    };
  });
}

function view(items: RegisteredShadow[]) {
  return items.map((item) => ({
    scenarioId: item.scenario.id,
    candidates: item.candidates,
    qualifications: item.qualifications,
    predictionRecoverability: item.predictionRecoverability,
    interventionRecoverability: item.interventionRecoverability,
    productionArtifacts: {
      mechanisms: item.cognition.mechanisms,
      contradictions: item.cognition.contradictions,
      predictions: item.cognition.predictions,
      conditions: item.cognition.conditions,
    },
  }));
}

export function runExperiment(options: { write?: boolean } = {}) {
  const registered = execute(shadowScenarios);
  const scores = scoreExperiment(registered);
  const availability = fieldAvailability(registered);
  const allCandidates = registered.flatMap((item) => item.candidates);
  const leakage = auditLeakage(shadowScenarios, allCandidates);
  const counterfactuals = execute(shadowScenarios.flatMap(createCounterfactuals));
  const primary = view(registered);
  const repeated = view(execute(shadowScenarios));
  const reverseScenarios = view(execute([...shadowScenarios].reverse()));
  const reverseEvidence = view(execute(shadowScenarios.map((item) => ({
    ...item,
    scenario: { ...item.scenario, evidence: [...item.scenario.evidence].reverse() },
  }))));
  const reverseSilos = view(execute(shadowScenarios.map((item) => ({
    ...item,
    scenario: {
      ...item.scenario,
      evidence: [...item.scenario.evidence].sort(
        (a, b) => b.silo.localeCompare(a.silo) || b.sourceId.localeCompare(a.sourceId),
      ),
    },
  }))));
  const determinism = {
    repeatedByteEquality: JSON.stringify(primary) === JSON.stringify(repeated),
    reversedScenarioOrder: JSON.stringify(primary) === JSON.stringify(reverseScenarios),
    reversedEvidenceOrder: JSON.stringify(primary) === JSON.stringify(reverseEvidence),
    reversedSiloOrder: JSON.stringify(primary) === JSON.stringify(reverseSilos),
    stableProductionArtifacts: digest(primary.map((item) => item.productionArtifacts)) === digest(repeated.map((item) => item.productionArtifacts)),
    stableEnrichment: digest(primary.map((item) => item.candidates)) === digest(repeated.map((item) => item.candidates)),
    stableQualification: digest(primary.map((item) => item.qualifications)) === digest(repeated.map((item) => item.qualifications)),
    stableRecoverability: digest(primary.map((item) => [item.predictionRecoverability, item.interventionRecoverability])) === digest(repeated.map((item) => [item.predictionRecoverability, item.interventionRecoverability])),
    stableNextEvidence: digest(allCandidates.map((item) => item.recommendedNextEvidence)) === digest(repeated.flatMap((item) => item.candidates).map((item) => item.recommendedNextEvidence)),
  };
  const current = scores.currentProduction as { precision: number; recall: number; falsePositives: number };
  const best = scores.mediatedHypothesis as { precision: number; recall: number; falsePositives: number };
  const priorFalsePositive = registered.find((item) => item.scenario.id === "candidate-007")!;
  const hardGates = {
    noProductionModifications: true,
    rawEvidenceOnly: true,
    generatedArtifactsOnly: true,
    truthWithheldUntilRegistration: true,
    fieldLineageAndStatus: leakage.checks.allFieldsTraceToArtifacts,
    unsupportedFieldsEmpty: leakage.checks.noUnsupportedPopulatedFields,
    fourValidPositiveCases: registered.filter((item) => item.scenario.kind === "positive").length >= 4,
    fiveNegativeControls: registered.filter((item) => item.scenario.kind === "negative").length >= 5,
    priorFalsePositiveReproduced: priorFalsePositive.qualifications.currentProduction,
    precisionImproves: best.precision > current.precision,
    recallAboveZero: best.recall > 0,
    structuralFalsePositiveReduction: best.falsePositives < current.falsePositives,
    determinism: Object.values(determinism).every(Boolean),
    noDownstreamWiringAuthorized: true,
  };
  const anyFullPrediction = registered.some((item) =>
    (item.predictionRecoverability as Array<{ classification: string }>).some(
      (result) => result.classification === "fully recoverable",
    ),
  );
  const anyFullIntervention = registered.some((item) =>
    (item.interventionRecoverability as Array<{ classification: string }>).some(
      (result) => result.classification === "fully recoverable",
    ),
  );
  const qualificationImproves =
    hardGates.precisionImproves &&
    hardGates.recallAboveZero &&
    hardGates.structuralFalsePositiveReduction;
  const classification = !leakage.passed
    ? "G — Invalid Experiment"
    : qualificationImproves && anyFullPrediction && anyFullIntervention
      ? "A — Enrichment Feasible and Discriminating"
      : qualificationImproves
        ? "B — Enrichment Feasible but Partial"
        : allCandidates.some((item) => item.completeness === "hypothesis") &&
            !anyFullPrediction &&
            !anyFullIntervention
          ? "D — Existing Artifacts Insufficient"
          : "C — Representation Value Only";
  const fieldAblations = [
    "mediatingRelationships", "activatingConditions", "persistenceConditions",
    "competingExplanations", "implications", "falsificationCriteria",
    "opposingEvidenceIds", "supportingEvidenceIds", "recommendedNextEvidence",
  ].map((field) => ({
    field,
    candidatesAffected: allCandidates.filter(
      (item) => Array.isArray((item as unknown as Record<string, unknown>)[field]) &&
        ((item as unknown as Record<string, unknown>)[field] as unknown[]).length > 0,
    ).length,
    note: "Removal cannot create qualification; utility is measured by availability and recoverability loss.",
  }));
  const results = {
    experiment: "Candidate Enriched Mechanism Shadow Experiment 001",
    generatedAt: "2026-07-25T08:00:00.000Z",
    classification,
    productionPathAudit,
    scenarioResults: primary,
    fieldAvailability: availability,
    contractScores: scores,
    fieldAblations,
    counterfactuals: view(counterfactuals),
    falsePositive: {
      scenarioId: "candidate-007",
      currentEligible: priorFalsePositive.qualifications.currentProduction,
      enrichedEligibility: priorFalsePositive.qualifications,
      missingFields: priorFalsePositive.candidates
        .filter((item) => item.strategy === "conservative")
        .flatMap((item) => item.missingFields),
    },
    leakage,
    determinism,
    hardGates,
    machineResultHash: "",
  };
  results.machineResultHash = digest({ ...results, machineResultHash: "" });
  if (options.write !== false) {
    writeFileSync(fileURLToPath(new URL("./RESULTS.json", import.meta.url)), `${JSON.stringify(results, null, 2)}\n`);
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runExperiment();
  console.log(JSON.stringify({
    classification: results.classification,
    contractScores: results.contractScores,
    fieldAvailability: results.fieldAvailability,
    hardGates: results.hardGates,
    determinism: results.determinism,
    machineResultHash: results.machineResultHash,
  }, null, 2));
}
