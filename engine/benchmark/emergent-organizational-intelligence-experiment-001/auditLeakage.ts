import { createHash } from "node:crypto";

import type {
  InferenceScenario,
  RegisteredDecision,
  ScoringTruth,
} from "./types";

const forbidden = [
  "expectedmechanismid",
  "expectedoutcome",
  "effectiveintervention",
  "requiredsilos",
  "shouldabstain",
  "family",
  "future",
];

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => [key.toLowerCase(), ...objectKeys(child)],
  );
}

export function auditLeakage(input: {
  scenarios: InferenceScenario[];
  scoringTruth: ScoringTruth[];
  predictions: RegisteredDecision[];
  futureLoadedBeforeRegistration: boolean;
  canonicalInput: InferenceScenario[];
  emergentInput: InferenceScenario[];
}) {
  const keys = objectKeys(input.scenarios);
  const forbiddenFields = forbidden.filter((item) => keys.includes(item));
  const canonicalHash = createHash("sha256")
    .update(JSON.stringify(input.canonicalInput))
    .digest("hex");
  const emergentHash = createHash("sha256")
    .update(JSON.stringify(input.emergentInput))
    .digest("hex");
  const checks = {
    noScoringFieldsInInference: forbiddenFields.length === 0,
    opaqueScenarioIds: input.scenarios.every((item) =>
      /^scenario-\d{3}$/.test(item.id),
    ),
    futureWithheld: !input.futureLoadedBeforeRegistration,
    sameCanonicalAndEmergentInput: canonicalHash === emergentHash,
    predictionsExcludeAnswerFields: input.predictions.every(
      (item) =>
        !objectKeys(item).some((key) =>
          ["expectedoutcome", "shouldabstain", "family"].includes(key),
        ),
    ),
    truthStoredSeparately:
      input.scoringTruth.length === input.scenarios.length,
  };
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    forbiddenFields,
    canonicalHash,
    emergentHash,
    residualRisks: [
      "Canonical artifacts are synthetic production-shaped outputs, not replayed production outputs.",
      "Benchmark authors supplied cross-silo Mechanism ancestry, so the fixture already represents successful canonical synthesis.",
      "Intervention mappings are benchmark-local and shared by Canonical Combined and Emergent.",
    ],
  };
}
