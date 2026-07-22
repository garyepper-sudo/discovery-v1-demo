import type { OrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import type { EvolutionModelObject, EvolutionScope, OperatingModelSnapshot } from "./contracts";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === "object" ? value as RecordValue : {};
const records = (value: unknown): RecordValue[] => Array.isArray(value) ? value.map(record) : [];
const text = (...values: unknown[]) => values.find((value) => typeof value === "string" && value.trim()) as string | undefined;
const number = (...values: unknown[]) => values.find((value) => typeof value === "number" && Number.isFinite(value)) as number | undefined;

function scope(value: unknown): EvolutionScope {
  switch (value) {
    case "local": case "team": return "team";
    case "department": return "department";
    case "crossFunctional": case "cross-functional": return "cross-functional";
    case "business-unit": return "business-unit";
    case "enterprise": return "enterprise";
    default: return "organization";
  }
}

function status(value: unknown): EvolutionModelObject["status"] {
  if (["emerging", "active", "weakened", "resolved", "retired"].includes(String(value))) return value as EvolutionModelObject["status"];
  if (["stable", "strengthening", "deteriorating", "constrained", "weak", "unresolved"].includes(String(value))) return "active";
  return "emerging";
}

function adaptObjects(values: unknown, timestamp: string, kind: "entity" | "belief" | "condition" | "mechanism" | "concept"): EvolutionModelObject[] {
  return records(values).map((item, index) => ({
    id: text(item.id) ?? `${kind}-${index + 1}`,
    label: text(item.label, item.name, item.title, item.statement, item.summary, item.executiveName) ?? `Unlabeled ${kind}`,
    confidence: Math.max(0, Math.min(1, number(item.confidence, item.strength) ?? 0.5)),
    scope: scope(item.organizationalScope ?? item.scope ?? (kind === "entity" ? item.type : undefined)),
    status: status(item.status ?? item.stability ?? item.trend),
    firstObservedAt: timestamp,
    lastUpdatedAt: timestamp,
  })).sort((left, right) => left.id.localeCompare(right.id));
}

export function adaptRuntimeToOperatingModelSnapshot(params: {
  runtime: OrganizationRuntime;
  snapshotId: string;
  timestamp: string;
}): OperatingModelSnapshot {
  const memory = record(params.runtime.memory);
  const mechanismNetwork = record(memory.mechanismNetwork);
  const recommendation = record(memory.executiveRecommendation);
  const intervention = record(recommendation.intervention);
  const beliefRevisions = records(memory.organizationalBeliefRevisions);
  const learning = records(memory.executiveLearning);
  const recommendationStrategy = text(intervention.executiveIntervention, intervention.headline, recommendation.executiveRecommendation, recommendation.headline);

  return {
    id: params.snapshotId,
    timestamp: params.timestamp,
    entities: adaptObjects(params.runtime.organizationModel.entities, params.timestamp, "entity"),
    beliefs: adaptObjects(memory.organizationalBeliefs ?? memory.beliefs, params.timestamp, "belief"),
    conditions: adaptObjects(memory.organizationalConditions, params.timestamp, "condition"),
    mechanisms: adaptObjects(mechanismNetwork.mechanisms, params.timestamp, "mechanism"),
    concepts: adaptObjects(memory.conceptualUnderstanding ?? memory.organizationalConcepts ?? memory.semanticConcepts, params.timestamp, "concept"),
    recommendation: recommendationStrategy ? {
      id: text(recommendation.id) ?? "production-recommendation",
      strategy: recommendationStrategy,
      scope: scope(intervention.scope),
      confidence: Math.max(0, Math.min(1, number(recommendation.confidence, intervention.confidence) ?? 0.5)),
      reasonEventIds: [params.snapshotId],
    } : undefined,
    historicalTruths: beliefRevisions.map((revision, index) => ({
      objectId: text(revision.beliefId) ?? `belief-revision-${index + 1}`,
      statement: text(revision.reason) ?? "Production recorded a belief revision.",
      trueFrom: params.timestamp,
      supersededByEventId: params.snapshotId,
    })),
    decisionLearning: learning.map((item, index) => ({
      decisionId: text(item.decisionId, item.sourceDecisionId) ?? `decision-learning-${index + 1}`,
      outcomeEventIds: Array.isArray(item.outcomeEventIds) ? item.outcomeEventIds.filter((id): id is string => typeof id === "string") : [],
      influencedObjectIds: Array.isArray(item.influencedObjectIds) ? item.influencedObjectIds.filter((id): id is string => typeof id === "string") : [],
    })),
  };
}

