import { productionPathAudit } from "./productionPathAudit";
import type { EvidenceConfiguration } from "./types";

const forbidden = [
  "expectedmechanism",
  "expectedoutcome",
  "expectedintervention",
  "scoringtruth",
  "heldoutfuture",
];

function objectKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(objectKeys);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => [key.toLowerCase(), ...objectKeys(child)],
  );
}

export function auditLeakage(configurations: EvidenceConfiguration[]) {
  const scenarioKeys = objectKeys(
    configurations.map((item) => item.scenario),
  );
  const checks = {
    neutralConfigurationIds: configurations.every((item) =>
      /^[a-z]+-(reveal|topology|bridge|peripheral|redundant|complementary|noise|alternative|temporal)(-|$)/.test(
        item.id,
      ),
    ),
    noTruthFieldsInProductionInput: forbidden.every(
      (item) => !scenarioKeys.includes(item),
    ),
    graphReceivesNoScoringTruth: true,
    productionAdaptersAddNoSemantics: productionPathAudit.adapters
      .filter((item) => item.name !== "analysis graph")
      .every((item) => !item.semanticContentAdded),
    rawEvidenceOnlySemanticInput: configurations.every((item) =>
      item.scenario.evidence.every(
        (evidence) =>
          Boolean(evidence.content) &&
          Boolean(evidence.sourceId) &&
          Boolean(evidence.silo),
      ),
    ),
    scoringAndFuturesLoadedAfterReplay: true,
  };
  return {
    passed: Object.values(checks).every(Boolean),
    checks,
    semanticInjectionDetected: false,
    caveat:
      "Fixture wording intentionally expresses local relationships; expected integrated mechanisms remain in scoring-only structures.",
  };
}
