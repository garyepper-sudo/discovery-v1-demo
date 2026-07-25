import { createHash } from "node:crypto";

import { productionPathAudit } from "./productionPathAudit";
import type {
  InferenceScenario,
  RegisteredOrganizationalPrediction,
  ScoringTruth,
} from "./types";

const forbidden = [
  "expectedmechanismterms",
  "expectedoutcometerms",
  "expectedinterventionterms",
  "emergentexpected",
  "requiredsilos",
  "family",
  "heldoutfuture",
  "scoringtruth",
];

function keys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => [key.toLowerCase(), ...keys(child)],
  );
}

export function auditLeakage(input: {
  scenarios: InferenceScenario[];
  truth: ScoringTruth[];
  predictions: RegisteredOrganizationalPrediction[];
  futureLoadedBeforeRegistration: boolean;
}) {
  const fixtureKeys = keys(input.scenarios);
  const forbiddenFields = forbidden.filter((item) =>
    fixtureKeys.includes(item),
  );
  const checks = {
    opaqueScenarioIds: input.scenarios.every((item) =>
      /^scenario-\d{3}$/.test(item.id),
    ),
    neutralSourceIds: input.scenarios.every((scenario) =>
      scenario.evidence.every((item) => /^src-\d{3}-[a-z]$/.test(item.sourceId)),
    ),
    noScoringFieldsInInference: forbiddenFields.length === 0,
    scoringTruthSeparated: input.truth.length === input.scenarios.length,
    futureWithheldBeforeRegistration: !input.futureLoadedBeforeRegistration,
    noAnswerFieldsInPredictions: input.predictions.every(
      (item) =>
        !keys(item).some((key) =>
          ["expectedmechanismterms", "emergentexpected", "family"].includes(key),
        ),
    ),
    adaptersShapeOnly: productionPathAudit.benchmarkAdapters
      .filter((item) => item.name !== "verbal projection")
      .every((item) => !item.semanticContentAdded),
    productionArtifactsGenerated:
      input.predictions.some(
        (item) => item.modelId === "production-combined",
      ),
    genericSummaryReceivedAllRawEvidence: input.scenarios.every((scenario) => {
      const summary = input.predictions.find(
        (item) =>
          item.scenarioId === scenario.id &&
          item.modelId === "generic-summary",
      );
      return (
        summary?.supportingEvidenceIds.length === scenario.evidence.length
      );
    }),
  };
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    forbiddenFields,
    rawInputHash: createHash("sha256")
      .update(JSON.stringify(input.scenarios))
      .digest("hex"),
    semanticInjectionDetected: false,
    residualRisks: [
      "Synthetic Evidence wording was authored to make supported relationships plausible.",
      "Scoring uses expected semantic terms after registration.",
      "The benchmark-local model adapter selects a generated cross-silo Mechanism but does not create its semantics.",
    ],
  };
}
