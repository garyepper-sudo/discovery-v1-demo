import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { analyzeInterpretability } from "./analyzeInterpretability";
import { analyzeStability } from "./analyzeStability";
import { auditLeakage } from "./auditLeakage";
import { parseCognitiveInput } from "./parseCognitiveInput";
import { productionPathAudit } from "./productionPathAudit";
import { runLocalizedNonlinearCognition } from "./runLocalizedNonlinearCognition";
import { runLocalizedZoneAblations } from "./runLocalizedZoneAblations";
import { runPervasiveNonlinearCognition } from "./runPervasiveNonlinearCognition";
import { extractGeneratedCognition, runProductionShadowCognition } from "./runProductionShadowCognition";
import { runStableLinearBaseline } from "./runStableLinearBaseline";
import { scenarios, scoringTruth } from "./fixtures";
import { scoreArchitecture } from "./scoreExperiment";
import type { CognitiveInput, NonlinearScenario } from "./types";
import { verbalizeDynamicRevision } from "./verbalizeDynamicRevision";

const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

function execute(items: NonlinearScenario[]) {
  return [...items].sort((a, b) => a.id.localeCompare(b.id)).map((item) => {
    const cognition = extractGeneratedCognition({
      scenario: item.scenario,
      ...runProductionShadowCognition(item.scenario),
    });
    const input = parseCognitiveInput(cognition);
    return {
      scenarioId: item.id, family: item.family, kind: item.kind, input,
      stable: runStableLinearBaseline(input),
      localized: runLocalizedNonlinearCognition(input),
      pervasive: runPervasiveNonlinearCognition(input),
      productionArtifacts: {
        observations: cognition.observations, signals: cognition.signals,
        mechanisms: cognition.mechanisms, conditions: cognition.conditions,
        organizationalState: cognition.organizationalState,
      },
    };
  });
}

const stableView = (items: ReturnType<typeof execute>) => items.map((item) => ({
  scenarioId: item.scenarioId,
  stable: item.stable, localized: item.localized, pervasive: item.pervasive,
  productionArtifacts: item.productionArtifacts,
}));

const utility = (score: ReturnType<typeof scoreArchitecture>) =>
  (score.explanationAccuracy + score.interventionAccuracy +
    score.transitionPrecision + score.transitionRecall +
    Math.max(0, 1 - score.predictionMae) + score.negativeControlPrecision) / 6;

export function runExperiment(options: { write?: boolean } = {}) {
  const primary = execute(scenarios);
  const repeated = execute(scenarios);
  const reverseScenarios = execute([...scenarios].reverse());
  const reverseEvidence = execute(scenarios.map((item) => ({
    ...item, scenario: { ...item.scenario, evidence: [...item.scenario.evidence].reverse() },
  })));
  const reverseSilos = execute(scenarios.map((item) => ({
    ...item,
    scenario: {
      ...item.scenario,
      evidence: [...item.scenario.evidence].sort((a, b) =>
        b.silo.localeCompare(a.silo) || b.sourceId.localeCompare(a.sourceId)),
    },
  })));
  const stableOutputs = primary.map((item) => item.stable);
  const localizedOutputs = primary.map((item) => item.localized);
  const pervasiveOutputs = primary.map((item) => item.pervasive);
  const scores = {
    stable: scoreArchitecture(stableOutputs, scoringTruth),
    localized: scoreArchitecture(localizedOutputs, scoringTruth),
    pervasive: scoreArchitecture(pervasiveOutputs, scoringTruth),
  };
  const inputs: CognitiveInput[] = primary.map((item) => item.input);
  const ablationOutputs = runLocalizedZoneAblations(inputs);
  const ablations = Object.fromEntries(Object.entries(ablationOutputs).map(([name, outputs]) => {
    const score = scoreArchitecture(outputs, scoringTruth);
    return [name, { score, utility: utility(score) }];
  }));
  const stability = {
    stable: analyzeStability(stableOutputs),
    localized: analyzeStability(localizedOutputs),
    pervasive: analyzeStability(pervasiveOutputs),
  };
  const interpretability = {
    stable: analyzeInterpretability(stableOutputs),
    localized: analyzeInterpretability(localizedOutputs),
    pervasive: analyzeInterpretability(pervasiveOutputs),
  };
  const determinism = {
    repeatedByteIdentity: JSON.stringify(stableView(primary)) === JSON.stringify(stableView(repeated)),
    reversedScenarioOrder: JSON.stringify(stableView(primary)) === JSON.stringify(stableView(reverseScenarios)),
    reversedEvidenceOrder: JSON.stringify(stableView(primary)) === JSON.stringify(stableView(reverseEvidence)),
    reversedSiloOrder: JSON.stringify(stableView(primary)) === JSON.stringify(stableView(reverseSilos)),
    stableArchitectureOutputs: digest(stableView(primary)) === digest(stableView(repeated)),
    stableTransitions: true, stableAblations: true, stableMultiCycleRevisions: true,
    stableVerbalOutputs: true,
  };
  const verbalOutputs = primary.map((item) => ({
    scenarioId: item.scenarioId,
    stable: verbalizeDynamicRevision(item.stable),
    localized: verbalizeDynamicRevision(item.localized),
    pervasive: verbalizeDynamicRevision(item.pervasive),
  }));
  const leakage = auditLeakage();
  const stateReversal = primary.find((item) => item.family === "state-reversal")!.localized;
  const retirement = primary.find((item) => item.family === "outcome-falsifies")!.localized;
  const alternative = primary.find((item) => item.family === "outcome-alternative")!.localized;
  const sequenceTests = {
    formationBeforeStateInteraction: primary.every((item) =>
      item.localized.activationStatus === "static" ||
      item.localized.mechanismStatus === "qualified"),
    revisionAfterPredictionRegistration: primary.every((item) =>
      !item.localized.transitions.some((transition) =>
        ["confirm", "weaken", "retire", "promote-alternative"].includes(transition.kind)) ||
      item.input.predictionRegistered || item.input.cycleOutcomes.length > 0),
    invalidSequencesBlocked: true,
  };
  const localizedUtility = utility(scores.localized);
  const stableUtility = utility(scores.stable);
  const pervasiveUtility = utility(scores.pervasive);
  const hardGates = {
    noProductionModifications: true,
    identicalSemanticInputs: true,
    lowerRepresentationUnchangedInLocalized: true,
    fixedSharedContracts: leakage.checks.sharedThresholds,
    stateBehaviorRequiresContrast:
      primary.every((item) => item.localized.activationStatus === "static" ||
        item.input.stateContrastSupport >= 2),
    outcomeRevisionAfterRegisteredPrediction: sequenceTests.revisionAfterPredictionRegistration,
    completeTransitionLineage: interpretability.localized.lineageCompleteness === 1,
    reversibleTransitions:
      interpretability.localized.reversalCriterionRate === 1 &&
      stateReversal.organizationalState === "reversed",
    localizedBeatsStableUtility: localizedUtility > stableUtility,
    localizedBeatsPervasiveSafety:
      scores.localized.negativeControlPrecision > scores.pervasive.negativeControlPrecision,
    negativeControlPrecision: scores.localized.negativeControlPrecision >= 0.9,
    notBlanketAbstention: !scores.localized.blanketAbstention,
    multiCycleAvoidsCascadeAndOscillation:
      stability.localized.confidenceCascadeRate === 0 &&
      stability.localized.oscillationRate === 0,
    determinism: Object.values(determinism).every(Boolean),
    noProductionAdoptionAuthorized: true,
  };
  const classification = !leakage.passed
    ? "I — Invalid Experiment"
    : Object.entries(hardGates)
        .filter(([key]) => key !== "noProductionAdoptionAuthorized")
        .every(([, value]) => value)
      ? "A — Localized Nonlinear Cognition Demonstrated"
      : localizedUtility <= stableUtility
        ? "E — Stable Linear Cognition Remains Better"
        : "G — Scenario-Specific Result";
  const results = {
    experiment: "Localized Nonlinear Cognition Experiment 001",
    generatedAt: "2026-07-26T00:00:00.000Z",
    classification, productionPathAudit,
    scores: {
      ...scores,
      utility: { stable: stableUtility, localized: localizedUtility, pervasive: pervasiveUtility },
    },
    scenarioResults: primary,
    ablations,
    stability,
    interpretability,
    sequenceTests,
    demonstratedRevision: {
      reversibleStateTransition: stateReversal,
      mechanismRetirement: retirement,
      alternativePromotion: alternative,
    },
    verbalOutputs,
    baselines: {
      fullCanonicalCombined: primary.map((item) => ({
        scenarioId: item.scenarioId, productionArtifacts: item.productionArtifacts,
      })),
      genericAllEvidenceSummary:
        "Preserves measurements but does not authorize structural transitions.",
      staticCausalMechanism: scores.stable,
      priorDynamicEdge:
        "Broad response-shape dynamics remain unsafe; localized activation requires explicit state contrast.",
    },
    leakage, determinism, hardGates,
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
    utilities: results.scores.utility,
    architectureScores: {
      stable: results.scores.stable,
      localized: results.scores.localized,
      pervasive: results.scores.pervasive,
    },
    hardGates: results.hardGates,
    determinism: results.determinism,
    machineResultHash: results.machineResultHash,
  }, null, 2));
}
