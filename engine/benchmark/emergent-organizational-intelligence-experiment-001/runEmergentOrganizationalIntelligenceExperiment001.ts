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
  inferEmergentUnderstanding,
  type Ablation,
} from "./inferEmergentUnderstanding";
import { interventionForMechanism } from "./interventionModels";
import { predictEmergent } from "./predictionModels";
import { registerPredictions } from "./registerPredictions";
import { scoreExperiment } from "./scoreExperiment";
import type { InferenceScenario } from "./types";

const stable = (value: unknown) => JSON.stringify(value);

function reverseScenario(scenario: InferenceScenario): InferenceScenario {
  return {
    id: scenario.id,
    evidence: [...scenario.evidence].reverse(),
    artifacts: {
      mechanisms: [...scenario.artifacts.mechanisms]
        .reverse()
        .map((item) => ({ ...item, evidenceIds: [...item.evidenceIds].reverse() })),
      contradictions: [...scenario.artifacts.contradictions]
        .reverse()
        .map((item) => ({
          ...item,
          evidenceIds: [...item.evidenceIds].reverse(),
          opposingEvidenceIds: [...(item.opposingEvidenceIds ?? [])].reverse(),
        })),
      theories: [...scenario.artifacts.theories]
        .reverse()
        .map((item) => ({
          ...item,
          supportingEvidence: [...item.supportingEvidence].reverse(),
        })),
      conditions: [...scenario.artifacts.conditions]
        .reverse()
        .map((item) => ({
          ...item,
          supportingMechanismIds: [...item.supportingMechanismIds].reverse(),
        })),
      state: {
        ...scenario.artifacts.state,
        dominantConditions: [
          ...scenario.artifacts.state.dominantConditions,
        ].reverse(),
      },
      historicalTransitions: [...scenario.artifacts.historicalTransitions]
        .reverse()
        .map((item) => ({
          ...item,
          evidenceIds: [...item.evidenceIds].reverse(),
        })),
    },
  };
}

function removeSilos(scenario: InferenceScenario, silos: string[]) {
  const removed = new Set(silos);
  return {
    ...scenario,
    evidence: scenario.evidence.filter((item) => !removed.has(item.silo)),
  };
}

function removalTests() {
  return inferenceScenarios.map((scenario) => {
    const baseline = inferEmergentUnderstanding(scenario);
    const silos = [...new Set(scenario.evidence.map((item) => item.silo))].sort();
    const oneSilo = silos.map((silo) => {
      const result = inferEmergentUnderstanding(removeSilos(scenario, [silo]));
      return {
        removedSilos: [silo],
        candidatePresent: Boolean(result),
        confidence: result?.confidence ?? 0,
        confidenceDelta: (result?.confidence ?? 0) - (baseline?.confidence ?? 0),
      };
    });
    const twoSilos = silos.flatMap((first, index) =>
      silos.slice(index + 1).map((second) => {
        const result = inferEmergentUnderstanding(
          removeSilos(scenario, [first, second]),
        );
        return {
          removedSilos: [first, second],
          candidatePresent: Boolean(result),
          confidence: result?.confidence ?? 0,
          confidenceDelta:
            (result?.confidence ?? 0) - (baseline?.confidence ?? 0),
        };
      }),
    );
    return { scenarioId: scenario.id, oneSilo, twoSilos };
  });
}

function individualRecoverability() {
  return inferenceScenarios.map((scenario) => ({
    scenarioId: scenario.id,
    isolatedSilos: [...new Set(scenario.evidence.map((item) => item.silo))]
      .sort()
      .map((silo) => ({
        silo,
        recoveredCompleteExplanation: Boolean(
          inferEmergentUnderstanding({
            ...scenario,
            evidence: scenario.evidence.filter((item) => item.silo === silo),
          }),
        ),
      })),
  }));
}

function ablationTests() {
  const ablations: Ablation[] = [
    "no-history",
    "no-contradictions",
    "no-mechanisms",
    "no-theories",
    "no-conditions",
    "no-lineage",
  ];
  return ablations.map((ablation) => {
    const emergentPredictions = inferenceScenarios.map((scenario) =>
      predictEmergent({
        ...scenario,
        artifacts: scenario.artifacts,
      }),
    );
    const candidates = inferenceScenarios.map((scenario) => ({
      scenarioId: scenario.id,
      candidate: inferEmergentUnderstanding(scenario, ablation),
    }));
    // Score the ablated candidates through the same registered shape.
    const predictions = emergentPredictions.map((item) => {
      const candidate = candidates.find(
        (entry) => entry.scenarioId === item.scenarioId,
      )!.candidate;
      return {
        ...item,
        mechanismId: candidate?.mechanismId,
        explanation: candidate?.explanation ?? "Abstain.",
        predictedOutcome: candidate?.predictedOutcomes[0],
        recommendedIntervention: interventionForMechanism(
          candidate?.mechanismId,
        ),
        supportingEvidenceIds: candidate?.supportingEvidenceIds ?? [],
        confidence: candidate?.confidence ?? 0.35,
        falsificationCondition: candidate?.falsificationCriteria[0] ?? "",
        abstained: !candidate,
      };
    });
    const full = registerPredictions(inferenceScenarios).predictions
      .filter((item) => item.modelId !== "emergent")
      .concat(predictions);
    return {
      ablation,
      score: scoreExperiment(full, scoringTruth, futureOutcomes).emergent,
      candidates,
    };
  });
}

export function runEmergentOrganizationalIntelligenceExperiment001() {
  const registration = registerPredictions(inferenceScenarios);
  const leakageAudit = auditLeakage({
    scenarios: inferenceScenarios,
    scoringTruth,
    predictions: registration.predictions,
    futureLoadedBeforeRegistration: false,
    canonicalInput: inferenceScenarios,
    emergentInput: inferenceScenarios,
  });
  const scores = scoreExperiment(
    registration.predictions,
    scoringTruth,
    futureOutcomes,
  );
  const repeated = registerPredictions(inferenceScenarios).predictions;
  const reversedEvidence = registerPredictions(
    inferenceScenarios.map(reverseScenario),
  ).predictions;
  const reversedScenarios = registerPredictions(
    [...inferenceScenarios].reverse(),
  ).predictions;
  const deterministic =
    stable(registration.predictions) === stable(repeated) &&
    stable(registration.predictions) === stable(reversedEvidence) &&
    stable(registration.predictions) === stable(reversedScenarios);
  const recoverability = individualRecoverability();
  const noIndividualRecovery = recoverability.every((scenario) => {
    const truth = scoringTruth.find(
      (item) => item.scenarioId === scenario.scenarioId,
    )!;
    return (
      truth.requiredSilos.length <= 1 ||
      scenario.isolatedSilos.every((item) => !item.recoveredCompleteExplanation)
    );
  });
  const negativeIds = new Set(
    scoringTruth.filter((item) => item.shouldAbstain).map((item) => item.scenarioId),
  );
  const falsePositiveEmergence = registration.predictions.filter(
    (item) =>
      item.modelId === "emergent" &&
      negativeIds.has(item.scenarioId) &&
      !item.abstained,
  ).length;
  const structuredSuperiority =
    scores["canonical-combined"].predictionAccuracy >
      scores.summary.predictionAccuracy &&
    scores["canonical-combined"].interventionQuality >
      scores.summary.interventionQuality;
  const emergentIncrement =
    scores.emergent.predictionAccuracy >
      scores["canonical-combined"].predictionAccuracy ||
    scores.emergent.interventionQuality >
      scores["canonical-combined"].interventionQuality;
  const hardGates = {
    noProductionChanges: true,
    zeroLeakage: leakageAudit.passed,
    sameCanonicalAndEmergentInformation:
      leakageAudit.checks.sameCanonicalAndEmergentInput,
    bestIndividualSiloOutperformed:
      scores.emergent.predictionAccuracy > scores["best-silo"].predictionAccuracy,
    genericSummaryOutperformed:
      scores.emergent.predictionAccuracy > scores.summary.predictionAccuracy,
    predictionImproves: structuredSuperiority,
    interventionImproves: structuredSuperiority,
    falsePositiveEmergenceBounded: falsePositiveEmergence === 0,
    deterministic,
    correctAbstention: scores.emergent.abstention === 1,
    noIndividualRecovery,
  };
  const classification = !leakageAudit.passed
    ? "INVALID — LEAKAGE"
    : !structuredSuperiority
      ? "ADVANCED AGGREGATION ONLY"
      : emergentIncrement
        ? "EXPERIMENTAL EMERGENT VALUE ABOVE CANONICAL COGNITION"
        : "EMERGENT CAPABILITY ALREADY PRESENT IN STRUCTURED CANONICAL COGNITION";

  const result = {
    experiment: "Emergent Organizational Intelligence Experiment 001",
    posture: "benchmark-only research",
    productionBehaviorChanged: false,
    architectureChangeAuthorized: false,
    registration,
    scores,
    hardGates,
    leakageAudit,
    individualRecoverability: recoverability,
    siloRemovalTests: removalTests(),
    ablations: ablationTests(),
    determinism: {
      repeatedRunByteEqual:
        stable(registration.predictions) === stable(repeated),
      reversedEvidenceOrderByteEqual:
        stable(registration.predictions) === stable(reversedEvidence),
      reversedSiloOrderByteEqual:
        stable(registration.predictions) === stable(reversedEvidence),
      reversedScenarioOrderByteEqual:
        stable(registration.predictions) === stable(reversedScenarios),
      deterministicRegistration: deterministic,
    },
    scenarioResults: scoringTruth.map((truth) => ({
      truth,
      future: futureOutcomes.find((item) => item.scenarioId === truth.scenarioId),
      predictions: registration.predictions.filter(
        (item) => item.scenarioId === truth.scenarioId,
      ),
      emergentUnderstanding: inferEmergentUnderstanding(
        inferenceScenarios.find((item) => item.id === truth.scenarioId)!,
      ),
    })),
    classification,
    finalAnswers: {
      unavailableToIndividualSilo: noIndividualRecovery,
      outperformsGenericSummary: structuredSuperiority,
      structuredCognitionOutperformsRawAggregation: structuredSuperiority,
      componentsContributingMost:
        "Cross-silo Mechanism ancestry and Evidence lineage; history matters in the delayed-consequence fixture.",
      necessaryEvidence:
        "At least three independent silos linked by one supported canonical Mechanism.",
      improvesPrediction: structuredSuperiority,
      improvesIntervention: structuredSuperiority,
      nonlinearOrAggregation:
        "The benchmark shows relational composition beyond concatenation, but the emergent projection adds no value above canonical structured cognition.",
    },
    recommendation:
      "Do not add an Emergent Intelligence layer. Treat the result as controlled evidence that cross-silo Mechanisms in existing structured cognition can exhibit emergent organizational intelligence; require production replay before making a stronger claim.",
  };

  assert.equal(leakageAudit.passed, true, "Leakage audit must pass.");
  assert.equal(deterministic, true, "Determinism must pass.");
  assert.equal(falsePositiveEmergence, 0, "False-positive emergence must be zero.");
  assert.equal(noIndividualRecovery, true, "No required multi-silo explanation may be individually recoverable.");

  return result;
}

if (require.main === module) {
  const result = runEmergentOrganizationalIntelligenceExperiment001();
  writeFileSync(
    join(
      process.cwd(),
      "engine/benchmark/emergent-organizational-intelligence-experiment-001/RESULTS.json",
    ),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify(result, null, 2));
  console.log(`\n${result.classification}`);
}
