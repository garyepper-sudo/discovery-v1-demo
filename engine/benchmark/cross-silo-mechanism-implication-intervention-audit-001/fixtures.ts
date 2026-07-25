import {
  inferenceScenarios,
  scoringTruth as priorTruth,
} from "../emergent-organizational-intelligence-production-shadow-experiment-002/fixtures";
import type { AuditScenario } from "./types";

const selected = [
  ["audit-001", "positive", "successful-partial-commercial", "scenario-001"],
  ["audit-002", "positive", "successful-partial-escalation", "scenario-002"],
  ["audit-003", "positive", "failed-positive-customer", "scenario-004"],
  ["audit-004", "positive", "failed-positive-contradictory", "scenario-006"],
  ["audit-005", "negative", "insufficient-false-positive", "scenario-009"],
  ["audit-006", "negative", "high-connectivity-no-sufficiency", "scenario-008"],
  ["audit-007", "negative", "one-silo-answer", "scenario-007"],
  ["audit-008", "negative", "competing-mechanisms", "scenario-010"],
] as const;

export const auditScenarios: AuditScenario[] = selected.map(
  ([id, kind, pattern, sourceId]) => {
    const source = inferenceScenarios.find((item) => item.id === sourceId)!;
    return {
      id,
      kind,
      pattern,
      scenario: {
        ...source,
        id,
        organizationId: `organization-${id}`,
      },
    };
  },
);

// Scoring-only partition. Never passed to replay, tracing, decomposition, or
// recomposition.
export const scoringTruth = Object.fromEntries(
  selected.map(([id, kind, _pattern, sourceId]) => [
    id,
    {
      shouldQualify: kind === "positive",
      expected: priorTruth.find((item) => item.scenarioId === sourceId)!,
    },
  ]),
);
