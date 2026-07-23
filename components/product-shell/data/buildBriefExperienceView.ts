import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildOrganizationModelContext } from "./buildOrganizationModelContext";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => value && typeof value === "object" ? value as UnknownRecord : {};
const text = (...values: unknown[]) => values.find((value): value is string => typeof value === "string" && Boolean(value.trim()))?.trim() ?? null;

export function buildBriefExperienceView(runtime: OrganizationRuntime) {
  const memory = record(runtime.memory);
  const communication = record(memory.executiveCommunication);
  const decisions = Array.isArray(memory.executiveDecisionRecords) ? memory.executiveDecisionRecords.map(record) : [];
  const recentBriefs = [
    text(communication.headline, communication.executiveSummary),
    ...decisions.map((decision) => text(decision.title, decision.decision)),
  ].filter((item): item is string => Boolean(item)).filter((item, index, items) => items.indexOf(item) === index).slice(0, 4);
  return {
    organization: { id: runtime.metadata.organizationId, name: runtime.metadata.name || "Your organization" },
    model: buildOrganizationModelContext(runtime),
    recentBriefs,
    sourceSummary: text(communication.executiveSummary, communication.headline) ?? "Discovery will ground a brief in the current Organization Model.",
    templates: ["Board Update", "Leadership Memo", "Team Update"] as const,
  };
}
