import { createHash } from "node:crypto";

import type {
  InferenceScenario,
  RegisteredPrediction,
  ScoringTruth,
} from "./types";

const FORBIDDEN_KEYS = [
  "expected",
  "future",
  "family",
  "restoration",
  "attractor",
  "targetdirection",
  "shouldabstain",
  "expectedconditionid",
];

function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => [key.toLowerCase(), ...keys(child)],
  );
}

export function auditLeakage(input: {
  inferenceScenarios: InferenceScenario[];
  predictions: RegisteredPrediction[];
  scoringTruth: ScoringTruth[];
  futureLoadedBeforeRegistration: boolean;
  combinedInput: InferenceScenario[];
  attractorInput: InferenceScenario[];
}) {
  const fixtureKeys = keys(input.inferenceScenarios);
  const forbiddenFixtureKeys = FORBIDDEN_KEYS.filter((key) =>
    fixtureKeys.includes(key),
  );
  const scenarioNamesOpaque = input.inferenceScenarios.every((scenario) =>
    /^scenario-\d{3}$/.test(scenario.id),
  );
  const scoringIds = new Set(input.scoringTruth.map((item) => item.scenarioId));
  const scoringSeparated =
    input.inferenceScenarios.every((item) => scoringIds.has(item.id)) &&
    forbiddenFixtureKeys.length === 0;
  const stable = (value: unknown) => JSON.stringify(value);
  const combinedHash = createHash("sha256")
    .update(stable(input.combinedInput))
    .digest("hex");
  const attractorHash = createHash("sha256")
    .update(stable(input.attractorInput))
    .digest("hex");
  const sameInformationBoundary = combinedHash === attractorHash;
  const predictionsContainScoringFields = input.predictions.some((item) =>
    keys(item).some((key) =>
      ["expectedconditionid", "shouldabstain", "family"].includes(key),
    ),
  );

  const checks = {
    noForbiddenInferenceFields: forbiddenFixtureKeys.length === 0,
    opaqueScenarioIds: scenarioNamesOpaque,
    scoringTruthSeparated: scoringSeparated,
    futureWithheldUntilAfterRegistration: !input.futureLoadedBeforeRegistration,
    sameCombinedAndAttractorInput: sameInformationBoundary,
    predictionsExcludeScoringFields: !predictionsContainScoringFields,
  };

  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    forbiddenFixtureKeys,
    combinedInputHash: combinedHash,
    attractorInputHash: attractorHash,
    residualRisks: [
      "Synthetic mechanism effects use Condition-oriented language that makes semantic linkage easier than unconstrained production text.",
      "Fixed inference rules and fixtures share a benchmark-local ontology even though answer fields are withheld.",
    ],
  };
}
