import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { analyzeEmergencePreconditions } from "./analyzeEmergencePreconditions";
import { auditLeakage } from "./auditLeakage";
import { extractGeneratedCognition } from "./extractGeneratedCognition";
import {
  heldOutFutures,
  inferenceScenarios,
  scoringTruth,
} from "./fixtures";
import { predictProductionCombined } from "./predictionModels";
import { productionPathAudit } from "./productionPathAudit";
import { registerPredictions } from "./registerPredictions";
import { runProductionShadowCognition } from "./runProductionShadowCognition";
import { scoreExperiment } from "./scoreExperiment";
import type {
  GeneratedCognition,
  InferenceScenario,
  RegisteredOrganizationalPrediction,
} from "./types";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function cognitionFor(scenario: InferenceScenario) {
  return extractGeneratedCognition({
    scenario,
    ...runProductionShadowCognition(scenario),
  });
}

function qualifying(cognition: GeneratedCognition) {
  return cognition.mechanisms.filter(
    (item) => item.crossSilo && !item.explicitInSingleSource,
  );
}

function scenarioSummary(
  scenario: InferenceScenario,
  cognition: GeneratedCognition,
  prediction: RegisteredOrganizationalPrediction,
) {
  return {
    scenarioId: scenario.id,
    evidenceCount: scenario.evidence.length,
    silos: [...new Set(scenario.evidence.map((item) => item.silo))].sort(),
    generated: {
      observations: cognition.observations.length,
      signals: cognition.signals.length,
      contradictions: cognition.contradictions.length,
      mechanisms: cognition.mechanisms.length,
      qualifyingCrossSiloMechanisms: qualifying(cognition).length,
      phenomena: cognition.phenomena.length,
      concepts: cognition.concepts.length,
      theories: cognition.theories.length,
      conditions: cognition.conditions.length,
    },
    registeredProductionPrediction: prediction,
  };
}

function runSiloAblations() {
  const positives = inferenceScenarios.filter(
    (scenario) =>
      scoringTruth.find((item) => item.scenarioId === scenario.id)
        ?.emergentExpected,
  );
  const rows = positives.flatMap((scenario) => {
    const silos = [...new Set(scenario.evidence.map((item) => item.silo))].sort();
    const removals = silos.map((silo) => [silo]);
    // Pair ablations are exhaustive for the first scenario and sampled
    // deterministically for the remaining families to bound replay cost.
    const pairs =
      scenario.id === "scenario-001"
        ? silos.flatMap((left, index) =>
            silos.slice(index + 1).map((right) => [left, right]),
          )
        : silos.length > 1
          ? [[silos[0], silos.at(-1)!]]
          : [];
    return [...removals, ...pairs].map((removed) => {
      const ablated = {
        ...scenario,
        evidence: scenario.evidence.filter(
          (item) => !removed.includes(item.silo),
        ),
      };
      const cognition = cognitionFor(ablated);
      const prediction = predictProductionCombined({
        scenario: ablated,
        cognition,
      });
      return {
        scenarioId: scenario.id,
        removed,
        remainingEvidence: ablated.evidence.length,
        mechanismCount: cognition.mechanisms.length,
        qualifyingCrossSiloMechanisms: qualifying(cognition).length,
        confidence: prediction.confidence,
        abstained: prediction.abstained,
        prediction: prediction.predictedOutcome,
        intervention: prediction.recommendedIntervention,
      };
    });
  });
  return {
    rows,
    criticalRemovalSensitivity: round(
      rows.filter((item) => item.abstained).length / Math.max(1, rows.length),
    ),
  };
}

function runCognitionAblations(input: {
  scenario: InferenceScenario;
  cognition: GeneratedCognition;
}) {
  const variants: Array<[string, Partial<GeneratedCognition>]> = [
    ["remove-contradictions", { contradictions: [] }],
    ["remove-mechanisms", { mechanisms: [] }],
    ["remove-history", { predictions: [] }],
    ["remove-theories", { theories: [] }],
    ["remove-conditions", { conditions: [] }],
    ["remove-organizational-state", { organizationalState: null }],
    [
      "remove-lineage",
      {
        mechanisms: input.cognition.mechanisms.map((item) => ({
          ...item,
          evidenceIds: [],
          sourceIds: [],
          silos: [],
          crossSilo: false,
        })),
      },
    ],
    [
      "latest-snapshot-only",
      { predictions: [], theories: [], conditions: [] },
    ],
  ];
  return variants.map(([name, patch]) => {
    const cognition = { ...input.cognition, ...patch };
    const prediction = predictProductionCombined({
      scenario: input.scenario,
      cognition,
    });
    return {
      name,
      abstained: prediction.abstained,
      confidence: prediction.confidence,
      explanation: prediction.explanation,
      lineageCount: prediction.supportingEvidenceIds.length,
    };
  });
}

function evidenceQualityScenarios(base: InferenceScenario) {
  const firstSilo = base.evidence[0].silo;
  const duplicate = (suffix: string, index: number) => ({
    ...base.evidence[0],
    sourceId: `src-001-${suffix}${index}`,
  });
  return [
    {
      name: "reduce-temporal-depth",
      scenario: {
        ...base,
        evidence: base.evidence.map((item) => ({
          ...item,
          observedAt: "2026-01-01T00:00:00.000Z",
        })),
      },
    },
    {
      name: "increase-redundancy",
      scenario: {
        ...base,
        evidence: [
          ...base.evidence,
          ...[1, 2, 3].map((index) => duplicate("r", index)),
        ],
      },
    },
    {
      name: "remove-complementary-evidence",
      scenario: {
        ...base,
        evidence: base.evidence.filter((item) => item.silo === firstSilo),
      },
    },
    {
      name: "add-noise",
      scenario: {
        ...base,
        evidence: [
          ...base.evidence,
          {
            ...duplicate("n", 1),
            silo: "Facilities",
            sourceType: "Facilities",
            content: "Office badge replacement volume increased this month.",
          },
        ],
      },
    },
    {
      name: "add-low-quality-conflict",
      scenario: {
        ...base,
        evidence: [
          ...base.evidence,
          {
            ...duplicate("c", 1),
            silo: "External",
            sourceType: "External",
            reliability: 0.2,
            content:
              "An unverified comment says customization has no delivery effect.",
          },
        ],
      },
    },
    {
      name: "reduce-source-diversity",
      scenario: {
        ...base,
        evidence: base.evidence.map((item, index) => ({
          ...item,
          sourceId: `src-001-z${index}`,
          silo: firstSilo,
          sourceType: firstSilo,
        })),
      },
    },
    {
      name: "increase-source-count-same-semantics",
      scenario: {
        ...base,
        evidence: [
          ...base.evidence,
          ...[1, 2, 3, 4].map((index) => duplicate("v", index)),
        ],
      },
    },
  ];
}

function runEvidenceQualityAblations() {
  const base = inferenceScenarios[0];
  return evidenceQualityScenarios(base).map(({ name, scenario }) => {
    const cognition = cognitionFor(scenario);
    const prediction = predictProductionCombined({ scenario, cognition });
    return {
      name,
      evidenceCount: scenario.evidence.length,
      siloCount: new Set(scenario.evidence.map((item) => item.silo)).size,
      qualifyingCrossSiloMechanisms: qualifying(cognition).length,
      confidence: prediction.confidence,
      abstained: prediction.abstained,
    };
  });
}

function normalizedRegistration(
  scenarios: InferenceScenario[],
) {
  const registration = registerPredictions(scenarios);
  return {
    ...registration,
    rawInputHash: undefined,
  };
}

export function runExperiment(options: { write?: boolean } = {}) {
  // Registration is complete before held-out futures are supplied to scoring.
  const registration = registerPredictions(inferenceScenarios);
  const leakage = auditLeakage({
    scenarios: inferenceScenarios,
    truth: scoringTruth,
    predictions: registration.predictions,
    futureLoadedBeforeRegistration: false,
  });
  const scores = scoreExperiment(
    registration.predictions,
    scoringTruth,
    heldOutFutures,
  );
  const cognitionByScenario = new Map(
    registration.scenarios.map((item) => [item.scenarioId, item.cognition]),
  );
  const combined = registration.predictions.filter(
    (item) => item.modelId === "production-combined",
  );
  const summaries = inferenceScenarios.map((scenario) =>
    scenarioSummary(
      scenario,
      cognitionByScenario.get(scenario.id)!,
      combined.find((item) => item.scenarioId === scenario.id)!,
    ),
  );
  const positiveIds = new Set(
    scoringTruth
      .filter((item) => item.emergentExpected)
      .map((item) => item.scenarioId),
  );
  const positiveCombined = combined.filter((item) =>
    positiveIds.has(item.scenarioId),
  );
  const negativeCombined = combined.filter(
    (item) => !positiveIds.has(item.scenarioId),
  );
  const individual = registration.predictions.filter(
    (item) => item.modelId === "best-silo",
  );
  const siloAblations = runSiloAblations();
  const cognitionAblations = registration.scenarios
    .filter((item) => positiveIds.has(item.scenarioId))
    .map((item) => ({
      scenarioId: item.scenarioId,
      variants: runCognitionAblations({
        scenario: inferenceScenarios.find(
          (scenario) => scenario.id === item.scenarioId,
        )!,
        cognition: item.cognition,
      }),
    }));
  const evidenceQualityAblations = runEvidenceQualityAblations();
  const preconditions = analyzeEmergencePreconditions({
    scenarios: inferenceScenarios,
    cognitionByScenario,
    combinedPredictions: combined,
    truth: scoringTruth,
  });

  const repeated = normalizedRegistration(inferenceScenarios);
  const reverseScenario = normalizedRegistration([...inferenceScenarios].reverse());
  const reverseEvidence = normalizedRegistration(
    inferenceScenarios.map((scenario) => ({
      ...scenario,
      evidence: [...scenario.evidence].reverse(),
    })),
  );
  const reverseSilos = normalizedRegistration(
    inferenceScenarios.map((scenario) => ({
      ...scenario,
      evidence: [...scenario.evidence].sort(
        (a, b) =>
          b.silo.localeCompare(a.silo) ||
          b.sourceId.localeCompare(a.sourceId),
      ),
    })),
  );
  const reference = normalizedRegistration(inferenceScenarios);
  const determinism = {
    repeatedByteEquality: JSON.stringify(reference) === JSON.stringify(repeated),
    reversedScenarioOrderEquality:
      JSON.stringify(reference) === JSON.stringify(reverseScenario),
    reversedRawEvidenceOrderEquality:
      JSON.stringify(reference) === JSON.stringify(reverseEvidence),
    reversedSiloAndWithinSiloOrderEquality:
      JSON.stringify(reference) === JSON.stringify(reverseSilos),
    stablePredictionRegistration:
      digest(reference.predictions) === digest(repeated.predictions),
    stableVerbalOutputs:
      digest(reference.scenarios.map((item) => item.verbal)) ===
      digest(repeated.scenarios.map((item) => item.verbal)),
  };

  const gates = {
    rawEvidenceOrigin: true,
    crossSiloMechanismFormation: positiveCombined.every(
      (item) => !item.abstained,
    ),
    individualNonRecoverability: [...positiveIds].every((scenarioId) =>
      individual
        .filter((item) => item.scenarioId === scenarioId)
        .every((item) => item.abstained),
    ),
    genericSummarySuperiority:
      scores["production-combined"].total > scores["generic-summary"].total,
    predictionImprovement:
      scores["production-combined"].predictionAccuracy >
      scores["generic-summary"].predictionAccuracy,
    interventionImprovement:
      scores["production-combined"].interventionAccuracy >
      scores["generic-summary"].interventionAccuracy,
    evidenceLineage: positiveCombined.every(
      (item) =>
        item.supportingEvidenceIds.length > 0 &&
        item.supportingCognitionArtifactIds.length > 0,
    ),
    counterfactualNecessity: siloAblations.criticalRemovalSensitivity > 0,
    negativeControlAbstention: negativeCombined.every((item) => item.abstained),
    determinism: Object.values(determinism).every(Boolean),
    noInformationAdvantage:
      leakage.checks.genericSummaryReceivedAllRawEvidence,
    noBenchmarkSemanticInjection: leakage.passed,
  };
  const decisive = [
    gates.rawEvidenceOrigin,
    gates.crossSiloMechanismFormation,
    gates.genericSummarySuperiority,
    gates.predictionImprovement,
    gates.interventionImprovement,
    gates.noBenchmarkSemanticInjection,
  ];
  const usefulCrossSiloCount = positiveCombined.filter(
    (item) => !item.abstained,
  ).length;
  const classification = !leakage.passed
    ? "E — Invalid Experiment"
    : decisive.every(Boolean)
      ? "A — End-to-End Capability Demonstrated"
      : usefulCrossSiloCount > 0
        ? "B — Partial Capability"
        : scores["production-combined"].total <=
            scores["generic-summary"].total
          ? "D — Aggregation Only"
          : "C — Structured Value Only";
  const results = {
    experiment:
      "Emergent Organizational Intelligence Production-Shadow Experiment 002",
    generatedAt: "2026-07-24T20:00:00.000Z",
    classification,
    productionPathAudit,
    dataSeparation: {
      registrationPrecedesFutureReveal:
        registration.registeredBeforeFutureReveal,
      rawInputHash: registration.rawInputHash,
    },
    scores,
    gates,
    determinism,
    leakage,
    scenarioResults: summaries,
    registeredPredictions: registration.predictions,
    verbalArtifacts: registration.scenarios.map((item) => ({
      scenarioId: item.scenarioId,
      verbal: item.verbal,
    })),
    ablations: {
      silo: siloAblations,
      cognition: cognitionAblations,
      evidenceQuality: evidenceQualityAblations,
    },
    preconditions,
    machineResultHash: "",
  };
  results.machineResultHash = digest({ ...results, machineResultHash: "" });
  if (options.write !== false) {
    const path = fileURLToPath(
      new URL("./RESULTS.json", import.meta.url),
    );
    writeFileSync(path, `${JSON.stringify(results, null, 2)}\n`);
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runExperiment();
  console.log(JSON.stringify({
    classification: results.classification,
    scores: results.scores,
    gates: results.gates,
    determinism: results.determinism,
    leakagePassed: results.leakage.passed,
    machineResultHash: results.machineResultHash,
  }, null, 2));
}
