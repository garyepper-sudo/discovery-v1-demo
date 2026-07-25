import { inferenceScenarios } from "../emergent-organizational-intelligence-production-shadow-experiment-002/fixtures";
import type { ShadowScenario } from "./types";

const sourceIds = [
  "scenario-001", "scenario-002", "scenario-003", "scenario-004",
  "scenario-005", "scenario-006", "scenario-009", "scenario-008",
  "scenario-010", "scenario-007", "scenario-011",
];

export const shadowScenarios: ShadowScenario[] = sourceIds.map(
  (sourceId, index) => {
    const source = inferenceScenarios.find((item) => item.id === sourceId)!;
    const id = `candidate-${String(index + 1).padStart(3, "0")}`;
    return {
      id,
      kind: index < 6 ? "positive" : "negative",
      scenario: { ...source, id, organizationId: `organization-${id}` },
    };
  },
);

const redundantSource = inferenceScenarios.find(
  (item) => item.id === "scenario-009",
)!;
shadowScenarios.push({
  id: "candidate-012",
  kind: "negative",
  scenario: {
    ...redundantSource,
    id: "candidate-012",
    organizationId: "organization-candidate-012",
    evidence: Array.from({ length: 4 }, (_value, index) => ({
      ...redundantSource.evidence[0],
      sourceId: `redundant-${index}`,
      silo: `Repeated Source ${index}`,
      sourceType: `Repeated Source ${index}`,
    })),
  },
});

export const scoringTruth = Object.fromEntries(
  shadowScenarios.map((item) => [
    item.id,
    { shouldPreserve: item.kind === "positive" },
  ]),
);
