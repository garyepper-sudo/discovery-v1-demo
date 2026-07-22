import type { OrganizationRuntime } from "../../../engine/v3/runtime";

export type OrganizationModelContext = {
  coherence: number | null;
  coherenceLabel: string;
  areas: Array<{ id: string; label: string; status: string }>;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function text(...values: unknown[]): string | null {
  for (const value of values) if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export function buildOrganizationModelContext(runtime: OrganizationRuntime): OrganizationModelContext {
  const memory = record(runtime.memory);
  const understanding = record(memory.organizationalUnderstandingState);
  const health = record(understanding.health);
  const rawCoherence = typeof health.coherence === "number" ? health.coherence : null;
  const coherence = rawCoherence === null ? null : Math.round(Math.max(0, Math.min(100, rawCoherence <= 1 ? rawCoherence * 100 : rawCoherence)));
  const conditions = Array.isArray(memory.organizationalConditions) ? memory.organizationalConditions.map(record) : [];
  const primaryId = text(record(record(memory.executiveAssessment).primaryJudgment).dominantConditionId);
  const ordered = [...conditions].sort((left, right) => {
    if (left.id === primaryId) return -1;
    if (right.id === primaryId) return 1;
    return (Number(right.confidence) || 0) - (Number(left.confidence) || 0);
  });

  return {
    coherence,
    coherenceLabel: coherence === null ? "Establishing" : coherence < 45 ? "Emerging" : coherence < 65 ? "Connecting" : coherence < 85 ? "Coherent" : "Strongly coherent",
    areas: ordered.slice(0, 5).map((condition) => ({
      id: text(condition.id) ?? text(condition.name) ?? "condition",
      label: text(condition.name, condition.title) ?? "Organizational condition",
      status: text(condition.status, condition.trend) ?? "active",
    })),
  };
}
