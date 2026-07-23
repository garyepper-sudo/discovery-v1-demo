import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildOrganizationModelContext } from "./buildOrganizationModelContext";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => value && typeof value === "object" ? value as UnknownRecord : {};
const text = (...values: unknown[]) => values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? null;

export function buildExperimentExperienceView(runtime: OrganizationRuntime) {
  const memory = record(runtime.memory);
  const simulation = record(memory.executiveSimulation);
  const recommendation = record(simulation.recommendation);
  const scenarios = Array.isArray(memory.simulatedOrganizationStates) ? memory.simulatedOrganizationStates.map(record) : [];
  const currentScenario = text(recommendation.headline, recommendation.title, recommendation.summary, scenarios[0]?.name, scenarios[0]?.title)
    ?? "No scenario is currently ready to stress test.";
  return {
    organization: { id: runtime.metadata.organizationId, name: runtime.metadata.name || "Your organization" },
    model: buildOrganizationModelContext(runtime),
    currentScenario,
    scenarioSummary: text(recommendation.rationale, recommendation.summary, scenarios[0]?.summary, scenarios[0]?.description),
    recentScenarios: scenarios.slice(0, 4).map((scenario, index) => ({
      id: text(scenario.id) ?? `scenario-${index + 1}`,
      title: text(scenario.name, scenario.title, scenario.summary) ?? `Scenario ${index + 1}`,
      status: text(scenario.status, scenario.outcome) ?? "modeled",
    })),
  };
}
