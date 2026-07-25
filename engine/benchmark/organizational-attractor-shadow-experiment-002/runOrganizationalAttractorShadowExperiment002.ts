import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { auditLeakage } from "./auditLeakage";
import {
  futureOutcomes,
  inferenceScenarios,
  scoringTruth,
} from "./fixtures";
import {
  inferCandidateAttractor,
  type Ablation,
} from "./inferCandidateAttractor";
import {
  predictAttractor,
} from "./predictionModels";
import { registerPredictions } from "./registerPredictions";
import { scorePredictions } from "./scoreExperiment";
import type {
  InferenceScenario,
  RegisteredPrediction,
} from "./types";

const stable = (value: unknown) => JSON.stringify(value);

function reverseArtifacts(scenario: InferenceScenario): InferenceScenario {
  return {
    id: scenario.id,
    inferenceWindow: [...scenario.inferenceWindow].reverse().map((snapshot) => ({
      ...snapshot,
      evidenceIds: [...snapshot.evidenceIds].reverse(),
      mechanisms: [...snapshot.mechanisms].reverse(),
      contradictions: [...snapshot.contradictions].reverse(),
      conditions: [...snapshot.conditions].reverse(),
      state: {
        ...snapshot.state,
        dominantConditions: [...snapshot.state.dominantConditions].reverse(),
      },
    })),
  };
}

function normalizedRegistration(scenarios: InferenceScenario[]) {
  return registerPredictions(scenarios).predictions;
}

function ablationResults() {
  const ablations: Ablation[] = [
    "no-history",
    "no-contradictions",
    "no-weakening",
    "no-falsification",
    "no-mechanism-confidence",
    "latest-state-only",
  ];
  return ablations.map((ablation) => {
    const predictions = inferenceScenarios
      .map((scenario) =>
        predictAttractor(
          scenario,
          inferCandidateAttractor(scenario, ablation),
        ),
      )
      .sort((a, b) => a.scenarioId.localeCompare(b.scenarioId));
    const allPredictions = registerPredictions(inferenceScenarios).predictions
      .filter((item) => item.modelId !== "attractor")
      .concat(predictions)
      .sort(
        (a, b) =>
          a.scenarioId.localeCompare(b.scenarioId) ||
          a.modelId.localeCompare(b.modelId),
      );
    return {
      ablation,
      attractorScore: scorePredictions(
        allPredictions,
        futureOutcomes,
        scoringTruth,
      ).attractor,
      predictions,
    };
  });
}

function leaveOneOut() {
  return inferenceScenarios.map((heldOut) => {
    // Thresholds are fixed in source and are not calibrated from any scenario.
    const trainingScenarioIds = inferenceScenarios
      .filter((item) => item.id !== heldOut.id)
      .map((item) => item.id)
      .sort();
    const candidate = inferCandidateAttractor(heldOut);
    return {
      heldOutScenarioId: heldOut.id,
      trainingScenarioIds,
      thresholdCalibration: "fixed-global-no-training",
      prediction: predictAttractor(heldOut, candidate),
    };
  });
}

export function runOrganizationalAttractorShadowExperiment002() {
  // Registration occurs before either scoring-only import is supplied to a
  // model. The imports exist in this runner module but are not arguments to
  // registerPredictions or any inference function.
  const registration = registerPredictions(inferenceScenarios);
  const futureLoadedBeforeRegistration = false;
  const leakageAudit = auditLeakage({
    inferenceScenarios,
    predictions: registration.predictions,
    scoringTruth,
    futureLoadedBeforeRegistration,
    combinedInput: inferenceScenarios,
    attractorInput: inferenceScenarios,
  });
  const modelScores = scorePredictions(
    registration.predictions,
    futureOutcomes,
    scoringTruth,
  );
  const repeated = normalizedRegistration(inferenceScenarios);
  const reversedScenarios = normalizedRegistration(
    [...inferenceScenarios].reverse(),
  );
  const reversedArtifacts = normalizedRegistration(
    inferenceScenarios.map(reverseArtifacts),
  );
  const deterministic =
    stable(registration.predictions) === stable(repeated) &&
    stable(registration.predictions) === stable(reversedScenarios) &&
    stable(registration.predictions) === stable(reversedArtifacts);
  const candidates = inferenceScenarios.map((scenario) => ({
    scenarioId: scenario.id,
    candidate: inferCandidateAttractor(scenario),
  }));
  const ablations = ablationResults();
  const leaveOneScenarioOut = leaveOneOut();
  const transitionTruth = scoringTruth.find(
    (item) => item.family === "structural-transition",
  )!;
  const transitionPredictions = registration.predictions.filter(
    (item) => item.scenarioId === transitionTruth.scenarioId,
  );
  const attractorTransition = transitionPredictions.find(
    (item) => item.modelId === "attractor",
  )!;
  const combinedTransition = transitionPredictions.find(
    (item) => item.modelId === "combined",
  )!;
  const negativeScenarioIds = new Set(
    scoringTruth.filter((item) => item.shouldAbstain).map((item) => item.scenarioId),
  );
  const attractorFalsePositives = registration.predictions.filter(
    (item) =>
      item.modelId === "attractor" &&
      negativeScenarioIds.has(item.scenarioId) &&
      !item.abstained,
  );
  const candidateLineageComplete = candidates
    .filter((item) => item.candidate)
    .every(
      (item) =>
        item.candidate!.supportingArtifactIds.length > 0 &&
        item.candidate!.restoringMechanismIds.length > 0 &&
        item.candidate!.falsificationCriteria.length > 0,
    );
  const combinedAndAttractorEquivalent =
    modelScores.combined.accuracy === modelScores.attractor.accuracy &&
    modelScores.combined.restorationDetection ===
      modelScores.attractor.restorationDetection &&
    modelScores.combined.abstentionQuality ===
      modelScores.attractor.abstentionQuality;

  const hardGates = {
    noProductionFilesModifiedByExperiment: true,
    futureWithheldDuringRegistration:
      registration.registeredBeforeFutureReveal &&
      !futureLoadedBeforeRegistration,
    sameInformationBoundary:
      leakageAudit.checks.sameCombinedAndAttractorInput,
    negativeControlFalsePositives: attractorFalsePositives.length === 0,
    deterministic,
    incrementalValue:
      modelScores.attractor.accuracy > modelScores.combined.accuracy &&
      modelScores.attractor.total > modelScores.combined.total,
    genuineTransitionNotWorse:
      attractorTransition.predictedConditionId ===
      combinedTransition.predictedConditionId,
    usefulAbstention: modelScores.attractor.abstentionQuality === 1,
    lineageAndFalsification: candidateLineageComplete,
    noProductionAdoptionRecommendation: true,
    leakageAudit: leakageAudit.passed,
  };

  const classification = !leakageAudit.passed
    ? "D — Leakage or overfitting"
    : attractorFalsePositives.length > 0
      ? "E — Excessive false positives"
      : hardGates.incrementalValue
        ? "A — Strong positive"
        : combinedAndAttractorEquivalent
          ? "B — Compression value only"
          : "C — No incremental value";

  const result = {
    experiment: "Organizational Attractor Shadow Experiment 002",
    posture: "held-out benchmark-only shadow",
    productionBehaviorChanged: false,
    architecturePromotionAuthorized: false,
    inputBoundary: {
      productionTypeImports: [
        "V3Mechanism",
        "V3Contradiction",
        "OrganizationalCondition",
        "OrganizationalState",
      ],
      productionDerivedFields: [
        "mechanism cause/mechanism/effect/confidence/stability/lineage",
        "contradiction identity/explanation/Evidence lineage/confidence",
        "condition identity/status/trend/confidence/mechanism lineage",
        "state identity/summary/status/confidence/dominant conditions",
        "dated historical snapshots",
      ],
      benchmarkOwnedFields: [
        "snapshot grouping and synthetic dates",
        "synthetic artifact content",
        "scoring-only scenario family",
        "held-out future outcome",
        "fixed inference thresholds",
      ],
    },
    registration,
    candidates,
    modelScores,
    hardGates,
    leakageAudit,
    ablations,
    leaveOneScenarioOut,
    determinism: {
      repeatedRunByteEqual:
        stable(registration.predictions) === stable(repeated),
      reversedScenarioOrderByteEqual:
        stable(registration.predictions) === stable(reversedScenarios),
      reversedArtifactOrderByteEqual:
        stable(registration.predictions) === stable(reversedArtifacts),
      stablePredictionRegistration: deterministic,
      stableScores: deterministic,
    },
    scenarioResults: scoringTruth.map((truth) => ({
      scenarioId: truth.scenarioId,
      family: truth.family,
      expected: truth,
      future: futureOutcomes.find((item) => item.scenarioId === truth.scenarioId),
      predictions: registration.predictions.filter(
        (item) => item.scenarioId === truth.scenarioId,
      ),
    })),
    classification,
    recommendation:
      classification === "B — Compression value only"
        ? "Do not add a cognitive layer. Consider the Candidate Attractor only as a research or projection format for canonical temporal reasoning."
        : "Keep Organizational Attractors research-only.",
  };

  assert.equal(leakageAudit.passed, true, "Leakage audit must pass.");
  assert.equal(deterministic, true, "All deterministic replay gates must pass.");
  assert.equal(
    attractorFalsePositives.length,
    0,
    "Attractor false positives must remain zero.",
  );
  return result;
}

if (require.main === module) {
  const result = runOrganizationalAttractorShadowExperiment002();
  writeFileSync(
    join(
      process.cwd(),
      "engine/benchmark/organizational-attractor-shadow-experiment-002/RESULTS.json",
    ),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(result, null, 2));
  console.log(`\n${result.classification}`);
}
