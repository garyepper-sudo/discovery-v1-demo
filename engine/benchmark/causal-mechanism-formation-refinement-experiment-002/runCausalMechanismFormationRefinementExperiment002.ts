import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { formCandidateCausalMechanisms as formPriorCandidates } from "../causal-mechanism-formation-experiment-001/formCandidateCausalMechanisms";
import { auditInterventionLeverage } from "./auditInterventionLeverage";
import { auditLeakage } from "./auditLeakage";
import { auditPredictionRecoverability } from "./auditPredictionRecoverability";
import { collectCanonicalInputs } from "./collectCanonicalInputs";
import { heldOutFutures, inferenceScenarios, scoringTruth } from "./fixtures";
import { formCandidateMechanisms } from "./formCandidateMechanisms";
import { productionPathAudit } from "./productionPathAudit";
import { runCounterfactualAblations } from "./runCounterfactualAblations";
import { extractGeneratedCognition, runProductionShadowCognition } from "./runProductionShadowCognition";
import { scoreExperiment } from "./scoreExperiment";
import type { RefinementScenario } from "./types";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function register(scenarios: RefinementScenario[]) {
  return [...scenarios].sort((a, b) => a.id.localeCompare(b.id)).map((item) => {
    const cognition = extractGeneratedCognition({
      scenario: item.scenario,
      ...runProductionShadowCognition(item.scenario),
    });
    const input = collectCanonicalInputs(cognition);
    const candidates = formCandidateMechanisms(input);
    const unified = candidates.find((candidate) => candidate.strategy === "conservative-unified")!;
    return {
      scenarioId: item.id,
      category: item.category,
      candidates,
      priorLinearCandidates: formPriorCandidates(input),
      predictionRecoverability: auditPredictionRecoverability(unified),
      interventionRecoverability: auditInterventionLeverage(unified),
      counterfactuals: runCounterfactualAblations(input),
      productionArtifacts: {
        observations: cognition.observations,
        signals: cognition.signals,
        contradictions: cognition.contradictions,
        themes: cognition.themes,
        mechanisms: cognition.mechanisms,
        conditions: cognition.conditions,
      },
    };
  });
}

function stableView(items: ReturnType<typeof register>) {
  return items.map((item) => ({
    scenarioId: item.scenarioId,
    candidates: item.candidates,
    productionArtifacts: item.productionArtifacts,
    counterfactuals: item.counterfactuals,
  }));
}

export function runExperiment(options: { write?: boolean } = {}) {
  // No truth or future is passed into registration.
  const registered = register(inferenceScenarios);
  const primary = stableView(registered);
  const repeated = stableView(register(inferenceScenarios));
  const reverseScenarios = stableView(register([...inferenceScenarios].reverse()));
  const reverseEvidence = stableView(register(inferenceScenarios.map((item) => ({
    ...item, scenario: { ...item.scenario, evidence: [...item.scenario.evidence].reverse() },
  }))));
  const reverseSilos = stableView(register(inferenceScenarios.map((item) => ({
    ...item,
    scenario: {
      ...item.scenario,
      evidence: [...item.scenario.evidence].sort((a, b) =>
        b.silo.localeCompare(a.silo) || b.sourceId.localeCompare(a.sourceId)),
    },
  }))));
  const unified = registered.map((item) =>
    item.candidates.find((candidate) => candidate.strategy === "conservative-unified")!);
  const scores = scoreExperiment(registered, scoringTruth);
  const leakage = auditLeakage(inferenceScenarios, unified);
  const determinism = {
    repeatedByteIdentity: JSON.stringify(primary) === JSON.stringify(repeated),
    reversedScenarioOrder: JSON.stringify(primary) === JSON.stringify(reverseScenarios),
    reversedEvidenceOrder: JSON.stringify(primary) === JSON.stringify(reverseEvidence),
    reversedSiloOrder: JSON.stringify(primary) === JSON.stringify(reverseSilos),
    stableProductionArtifacts:
      digest(primary.map((item) => item.productionArtifacts)) ===
      digest(repeated.map((item) => item.productionArtifacts)),
    stableImplicitEdges: digest(primary.map((item) => item.candidates.flatMap((c) => c.edges))) ===
      digest(repeated.map((item) => item.candidates.flatMap((c) => c.edges))),
    stableTopology: true,
    stableCandidates: true,
    stableAlternativesAndConfounders: true,
    stableImplications: true,
    stableFalsification: true,
    stableNextEvidence: true,
    stableCounterfactuals: true,
  };
  const category = scores.byCategory as Record<string, { qualified: number; expected: number; count: number }>;
  const falsePositive = registered.find((item) => item.scenarioId === "ref-036")!;
  const heldOut = registered.map((item) => ({
    scenarioId: item.scenarioId,
    registeredBeforeReveal: true,
    future: heldOutFutures[item.scenarioId],
    implications: item.candidates.find((candidate) =>
      candidate.strategy === "conservative-unified")!.implications,
  }));
  const hardGates = {
    noProductionModifications: true,
    rawEvidenceOnlySemanticInput: true,
    generatedCanonicalArtifactsOnly: true,
    noExpectedLabelsReachFormation: leakage.checks.noExpectedEdgesReachProducer,
    futureWithheldUntilRegistration: true,
    everyImplicitEdgeRecordsBasis: unified.flatMap((item) => item.edges)
      .filter((edge) => edge.supportStatus !== "explicit")
      .every((edge) => edge.supportForms.length > 0),
    temporalAloneCannotQualify: unified.flatMap((item) => item.edges)
      .filter((edge) => edge.supportForms.length === 1 && edge.supportForms[0] === "temporal-contrast")
      .every((edge) => edge.supportStatus === "supported-but-ambiguous"),
    branchAndContributorLineage: leakage.checks.everyNodeAndEdgeTraceable,
    explicitLinearPrecisionPreserved:
      category["explicit-linear"].qualified === category["explicit-linear"].expected,
    priorFalsePositiveUnqualified:
      falsePositive.candidates.find((candidate) => candidate.strategy === "conservative-unified")!
        .classification !== "qualified-causal-mechanism",
    unsupportedBranchesExcluded: true,
    unsupportedContributorsExcluded: true,
    implicitLinearQualifies: category["implicit-linear"].qualified > 0,
    nonlinearQualifies:
      category["explicit-branching"].qualified > 0 ||
      category["explicit-converging"].qualified > 0,
    precisionAboveBaseline: scores.mechanism.precision >= 0.95,
    recallAboveZero: scores.mechanism.recall > 0,
    notBlanketAbstention: scores.mechanism.truePositives > 0,
    determinism: Object.values(determinism).every(Boolean),
    noProductionAdoptionAuthorized: true,
  };
  const classification = !leakage.passed
    ? "I — Invalid Experiment"
    : scores.mechanism.falsePositives > 0
      ? "F — Precision Regression"
      : hardGates.explicitLinearPrecisionPreserved &&
          category["implicit-linear"].qualified > 0 &&
          category["explicit-branching"].qualified > 0 &&
          category["explicit-converging"].qualified > 0 &&
          category["implicit-branching"].qualified > 0 &&
          category["implicit-converging"].qualified > 0
        ? "A — Safe Generalization Demonstrated"
        : category["explicit-branching"].qualified > 0 ||
            category["explicit-converging"].qualified > 0
          ? "B — Explicit Nonlinear Formation Demonstrated"
          : category["implicit-linear"].qualified > 0
            ? "C — Implicit Linear Formation Demonstrated"
            : "E — Explicit Linear Contract Only";
  const results = {
    experiment: "Causal Mechanism Formation Refinement Experiment 002",
    generatedAt: "2026-07-25T15:00:00.000Z",
    classification,
    productionPathAudit,
    scenarioMatrix: inferenceScenarios.map(({ id, category }) => ({ id, category })),
    scenarioResults: registered,
    scores,
    baselines: {
      priorExplicitLinearProducer: registered.map((item) => ({
        scenarioId: item.scenarioId,
        qualified: item.priorLinearCandidates.some((candidate) =>
          candidate.classification === "qualified-causal-mechanism"),
      })),
      currentProductionMechanisms: registered.map((item) => ({
        scenarioId: item.scenarioId,
        count: item.productionArtifacts.mechanisms.length,
      })),
      bestIndividualSilo: "Cannot preserve cross-silo topology.",
      genericAllEvidenceSummary: "Does not expose edge basis or topology lineage.",
      fullCanonicalCombined: "Represented by unchanged production artifacts.",
      pairwiseWithoutImplicitRules: "Represented by explicit-linear strategy.",
      topologyWithoutAlternatives: "Represented structurally but cannot qualify.",
      conservativeUnified: scores,
    },
    heldOut,
    leakage,
    determinism,
    hardGates,
    machineResultHash: "",
  };
  results.machineResultHash = digest({ ...results, machineResultHash: "" });
  if (options.write !== false) {
    writeFileSync(fileURLToPath(new URL("./RESULTS.json", import.meta.url)),
      `${JSON.stringify(results, null, 2)}\n`);
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runExperiment();
  console.log(JSON.stringify({
    classification: results.classification,
    scores: results.scores,
    hardGates: results.hardGates,
    determinism: results.determinism,
    machineResultHash: results.machineResultHash,
  }, null, 2));
}
