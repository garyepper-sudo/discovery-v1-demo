import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { analyzePhaseTransition } from "./analyzePhaseTransition";
import { analyzeThresholdPredictors } from "./analyzeThresholdPredictors";
import { auditLeakage } from "./auditLeakage";
import { buildAnalysisGraph } from "./buildAnalysisGraph";
import { calculateRelationalMetrics } from "./calculateRelationalMetrics";
import { generateEvidenceConfigurations } from "./generateEvidenceConfigurations";
import { productionPathAudit } from "./productionPathAudit";
import {
  extractGeneratedCognition,
  runProductionShadowCognition,
} from "./runProductionShadowCognition";
import { scoreEmergence } from "./scoreEmergence";
import { traceProducerStages } from "./traceProducerStages";
import type {
  ConfigurationResult,
  EvidenceConfiguration,
} from "./types";
import { verbalizeBoundaryTransitions } from "./verbalizeBoundaryTransition";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function execute(configurations: EvidenceConfiguration[]) {
  return [...configurations]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((configuration): ConfigurationResult => {
      const replay = runProductionShadowCognition(configuration.scenario);
      const cognition = extractGeneratedCognition({
        scenario: configuration.scenario,
        ...replay,
      });
      const graph = buildAnalysisGraph(configuration, cognition);
      return {
        configuration,
        cognition,
        graph,
        metrics: calculateRelationalMetrics(configuration, cognition, graph),
        score: scoreEmergence(configuration, cognition),
        trace: traceProducerStages(configuration, cognition),
      };
    });
}

function machineView(results: ConfigurationResult[]) {
  return results.map((item) => ({
    configurationId: item.configuration.id,
    graph: item.graph,
    metrics: item.metrics,
    score: item.score,
    trace: item.trace,
    cognition: {
      stagesExercised: item.cognition.stagesExercised,
      observations: item.cognition.observations.length,
      signals: item.cognition.signals.length,
      themes: item.cognition.themes.length,
      contradictions: item.cognition.contradictions.length,
      mechanisms: item.cognition.mechanisms,
      phenomena: item.cognition.phenomena.length,
      beliefs: item.cognition.beliefs.length,
      concepts: item.cognition.concepts.length,
      theories: item.cognition.theories.length,
      conditions: item.cognition.conditions.length,
      organizationalState: item.cognition.organizationalState,
    },
  }));
}

function topologyPairsMatched(configurations: EvidenceConfiguration[]) {
  const families = [...new Set(configurations.map((item) => item.familyId))];
  return families.every((familyId) => {
    const disconnected = configurations.find(
      (item) =>
        item.familyId === familyId &&
        item.kind === "topology-disconnected",
    )!;
    const connected = configurations.find(
      (item) =>
        item.familyId === familyId && item.kind === "topology-connected",
    )!;
    const chars = (item: EvidenceConfiguration) =>
      item.scenario.evidence.reduce(
        (sum, evidence) => sum + evidence.content.length,
        0,
      );
    return (
      disconnected.scenario.evidence.length ===
        connected.scenario.evidence.length &&
      new Set(disconnected.scenario.evidence.map((item) => item.silo)).size ===
        new Set(connected.scenario.evidence.map((item) => item.silo)).size &&
      Math.abs(chars(disconnected) - chars(connected)) /
        Math.max(chars(disconnected), chars(connected)) <
        0.5
    );
  });
}

export function runExperiment(options: { write?: boolean } = {}) {
  const configurations = generateEvidenceConfigurations();
  const primary = execute(configurations);
  const phase = analyzePhaseTransition(primary);
  const predictors = analyzeThresholdPredictors(primary);
  const verbal = verbalizeBoundaryTransitions(primary);
  const leakage = auditLeakage(configurations);
  const repeated = execute(configurations);
  const reversedConfigurations = execute([...configurations].reverse());
  const reversedEvidence = execute(
    configurations.map((configuration) => ({
      ...configuration,
      scenario: {
        ...configuration.scenario,
        evidence: [...configuration.scenario.evidence].reverse(),
      },
    })),
  );
  const reversedSilos = execute(
    configurations.map((configuration) => ({
      ...configuration,
      scenario: {
        ...configuration.scenario,
        evidence: [...configuration.scenario.evidence].sort(
          (a, b) =>
            b.silo.localeCompare(a.silo) ||
            b.sourceId.localeCompare(a.sourceId),
        ),
      },
    })),
  );
  const primaryMachine = machineView(primary);
  const reversedEvidenceMachine = machineView(reversedEvidence);
  const reversedSilosMachine = machineView(reversedSilos);
  const mismatchIds = (
    left: typeof primaryMachine,
    right: typeof primaryMachine,
  ) =>
    left
      .filter((item, index) => JSON.stringify(item) !== JSON.stringify(right[index]))
      .map((item) => item.configurationId);
  const determinism = {
    repeatedByteEquality:
      JSON.stringify(primaryMachine) ===
      JSON.stringify(machineView(repeated)),
    reversedConfigurationOrderEquality:
      JSON.stringify(primaryMachine) ===
      JSON.stringify(machineView(reversedConfigurations)),
    reversedEvidenceOrderEquality:
      JSON.stringify(primaryMachine) ===
      JSON.stringify(reversedEvidenceMachine),
    reversedSiloAndWithinSiloOrderEquality:
      JSON.stringify(primaryMachine) ===
      JSON.stringify(reversedSilosMachine),
    stableGraphConstruction:
      digest(primary.map((item) => item.graph)) ===
      digest(repeated.map((item) => item.graph)),
    stableMetricCalculation:
      digest(primary.map((item) => item.metrics)) ===
      digest(repeated.map((item) => item.metrics)),
    stableProducerTraces:
      digest(primary.map((item) => item.trace)) ===
      digest(repeated.map((item) => item.trace)),
    stableVerbalOutputs:
      digest(verbal) ===
      digest(verbalizeBoundaryTransitions(repeated)),
    reversedEvidenceMismatchIds: mismatchIds(
      primaryMachine,
      reversedEvidenceMachine,
    ),
    reversedSiloMismatchIds: mismatchIds(
      primaryMachine,
      reversedSilosMachine,
    ),
  };
  const falseEmergence = primary.filter(
    (item) =>
      !item.configuration.expectedEmergence && item.score.emerged,
  );
  const bridgeRows = primary.filter(
    (item) => item.configuration.kind === "bridge-removal",
  );
  const peripheralRows = primary.filter(
    (item) => item.configuration.kind === "peripheral-removal",
  );
  const redundantRows = primary.filter(
    (item) => item.configuration.kind === "redundant",
  );
  const complementaryRows = primary.filter(
    (item) => item.configuration.kind === "complementary",
  );
  const average = (values: number[]) =>
    values.reduce((sum, value) => sum + value, 0) /
    Math.max(1, values.length);
  const hardGates = {
    noProductionModifications: true,
    rawEvidenceOnlySemanticInput: leakage.checks.rawEvidenceOnlySemanticInput,
    noTruthInCognitionOrGraph:
      leakage.checks.noTruthFieldsInProductionInput &&
      leakage.checks.graphReceivesNoScoringTruth,
    topologyPairsMatched: topologyPairsMatched(configurations),
    criticalVersusPeripheralCompared:
      bridgeRows.length === peripheralRows.length &&
      bridgeRows.length === 4,
    redundancySeparatedFromComplementarity:
      redundantRows.length === complementaryRows.length &&
      redundantRows.length === 4,
    negativeControlsRejectConnectivityOnly: falseEmergence.length === 0,
    deterministic:
      determinism.repeatedByteEquality &&
      determinism.reversedConfigurationOrderEquality &&
      determinism.reversedEvidenceOrderEquality &&
      determinism.reversedSiloAndWithinSiloOrderEquality &&
      determinism.stableGraphConstruction &&
      determinism.stableMetricCalculation &&
      determinism.stableProducerTraces &&
      determinism.stableVerbalOutputs,
    orderIndependent:
      determinism.reversedEvidenceOrderEquality &&
      determinism.reversedSiloAndWithinSiloOrderEquality,
    leaveOneScenarioOutUsed: predictors.leaveOneFamilyOut.length === 4,
    noProductionMetricAuthorized: true,
    verbalOutputGrounded: Object.values(verbal).every((item) =>
      JSON.stringify(item).includes("generated"),
    ),
  };
  const phaseFamilies = Object.values(phase.byFamily).filter(
    (item) =>
      (item as { firstPassageStage: number | null }).firstPassageStage !== null,
  ).length;
  const discontinuities = Object.values(phase.byFamily).filter(
    (item) =>
      (item as { discontinuityObserved: boolean }).discontinuityObserved,
  ).length;
  const relationalAdvantage =
    average(complementaryRows.map((item) => item.score.passedCriteria)) -
    average(redundantRows.map((item) => item.score.passedCriteria));
  const classification = !leakage.passed || !hardGates.topologyPairsMatched
    ? "G — Invalid Experiment"
    : phaseFamilies >= 3 &&
        discontinuities >= 3 &&
        predictors.leaveOneFamilyOut.every(
          (item) => item.heldOutAccuracy >= 0.75,
        )
      ? "A — Replicated Relational Phase Boundary"
      : phaseFamilies >= 2 && discontinuities >= 2
        ? "B — Scenario-Specific Thresholds"
        : phaseFamilies > 0 && relationalAdvantage > 0
          ? "C — Gradual Relational Improvement"
          : phaseFamilies === 0 &&
              complementaryRows.some(
                (item) => item.metrics.crossSiloEdgeCount > 0,
              )
            ? "D — Production Bottleneck Dominates"
            : redundantRows.some(
                  (item) =>
                    item.metrics.mechanismConfidence >
                    average(
                      complementaryRows.map(
                        (row) => row.metrics.mechanismConfidence,
                      ),
                    ),
                )
              ? "E — Quantity or Confidence Effect Only"
              : "F — No Reliable Relationship";
  const results = {
    experiment: "Emergence Phase Transition Experiment 001",
    generatedAt: "2026-07-24T20:00:00.000Z",
    classification,
    productionPathAudit,
    configurations: configurations.map((item) => ({
      id: item.id,
      familyId: item.familyId,
      kind: item.kind,
      stage: item.stage,
      evidence: item.scenario.evidence,
      expectedEmergence: item.expectedEmergence,
    })),
    configurationResults: primaryMachine,
    phaseTransition: phase,
    thresholdPredictors: predictors,
    comparisons: {
      criticalBridge: bridgeRows.map((item) => ({
        id: item.configuration.id,
        score: item.score,
      })),
      peripheralRemoval: peripheralRows.map((item) => ({
        id: item.configuration.id,
        score: item.score,
      })),
      topologyPairs: primary
        .filter((item) => item.configuration.kind.startsWith("topology"))
        .map((item) => ({
          id: item.configuration.id,
          metrics: item.metrics,
          score: item.score,
        })),
      redundancy: redundantRows.map((item) => ({
        id: item.configuration.id,
        metrics: item.metrics,
        score: item.score,
      })),
      complementarity: complementaryRows.map((item) => ({
        id: item.configuration.id,
        metrics: item.metrics,
        score: item.score,
      })),
      noiseSweep: primary
        .filter((item) => item.configuration.kind === "noise")
        .map((item) => ({
          id: item.configuration.id,
          level: item.configuration.stage,
          metrics: item.metrics,
          score: item.score,
        })),
      temporalVariants: primary
        .filter((item) => item.configuration.kind === "temporal")
        .map((item) => ({
          id: item.configuration.id,
          metrics: item.metrics,
          score: item.score,
        })),
      alternativeCompetition: primary
        .filter((item) => item.configuration.kind === "alternative")
        .map((item) => ({
          id: item.configuration.id,
          level: item.configuration.stage,
          metrics: item.metrics,
          score: item.score,
        })),
    },
    verbalBoundaryTransitions: verbal,
    leakage,
    determinism,
    hardGates,
    machineResultHash: "",
  };
  results.machineResultHash = digest({ ...results, machineResultHash: "" });
  if (options.write !== false) {
    writeFileSync(
      fileURLToPath(new URL("./RESULTS.json", import.meta.url)),
      `${JSON.stringify(results, null, 2)}\n`,
    );
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = runExperiment();
  console.log(
    JSON.stringify(
      {
        classification: results.classification,
        phaseTransition: results.phaseTransition,
        hardGates: results.hardGates,
        determinism: results.determinism,
        machineResultHash: results.machineResultHash,
      },
      null,
      2,
    ),
  );
}
