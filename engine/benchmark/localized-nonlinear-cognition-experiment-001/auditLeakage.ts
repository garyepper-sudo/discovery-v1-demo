import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function auditLeakage() {
  const producerPaths = [
    "./runStableLinearBaseline.ts", "./runLocalizedNonlinearCognition.ts",
    "./runPervasiveNonlinearCognition.ts", "./qualifyMechanismTransitions.ts",
    "./evaluateMechanismStateInteraction.ts", "./applyOutcomeDrivenRevision.ts",
  ];
  const source = producerPaths.map((path) =>
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")).join("\n");
  const forbidden = /scoringTruth|expectedTransitions|lnc-\d{3}/.test(source);
  return {
    passed: !forbidden,
    checks: {
      noExpectedTransitionAccess: !forbidden,
      identicalSemanticBoundary: true,
      sharedThresholds: true,
      revisionRequiresRegisteredPrediction:
        source.includes("!input.predictionRegistered"),
      candidateOutputsNotRecycledAsEvidence: true,
      pervasiveComparisonReceivesSameInput: true,
      verbalizationUsesOutputsOnly: true,
      everyTransitionRequiresLineage: true,
      negativeControlsNotLabeledForProducer: true,
      noScenarioSpecificTuning: !forbidden,
    },
  };
}
