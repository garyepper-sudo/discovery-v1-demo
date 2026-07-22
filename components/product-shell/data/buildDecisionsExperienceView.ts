import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildProductHref } from "./productOrganization";

export type DecisionLifecycleStageId =
  | "exploring"
  | "preparing"
  | "committed"
  | "executing"
  | "review"
  | "learned";

export type DecisionsExperienceView = {
  organization: { id: string; name: string };
  state:
    | { kind: "active"; title: string; status: string; summary: string }
    | { kind: "no-active-decision"; title: string; summary: string }
    | { kind: "not-ready"; title: string; summary: string };
  currentPosition: {
    headline: string;
    summary: string;
    confidence: number | null;
    confidenceLabel: string;
    rationale: string | null;
    primaryConstraint: string | null;
    recommendationStatus: string | null;
    observations: string[];
    risks: string[];
  };
  lifecycle: {
    stages: Array<{
      id: DecisionLifecycleStageId;
      label: string;
      status: "complete" | "current" | "upcoming" | "unavailable";
    }>;
    currentStage: DecisionLifecycleStageId | null;
    summary: string;
  };
  nextStep: { label: string; rationale: string; destination: string } | null;
  exploreFurther: Array<{ label: string; rationale?: string; destination: string }>;
  otherWork: Array<{ title: string; status: string; summary?: string }>;
};

type UnknownRecord = Record<string, unknown>;

const STAGES: Array<{ id: DecisionLifecycleStageId; label: string }> = [
  { id: "exploring", label: "Exploring" },
  { id: "preparing", label: "Preparing" },
  { id: "committed", label: "Committed" },
  { id: "executing", label: "Executing" },
  { id: "review", label: "Review" },
  { id: "learned", label: "Learned" },
];

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function text(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function percent(value: unknown): number | null {
  const numeric = number(value);
  if (numeric === null) return null;
  return Math.round(Math.max(0, Math.min(100, numeric <= 1 ? numeric * 100 : numeric)));
}

function confidenceLabel(value: number | null): string {
  if (value === null) return "Confidence not yet established";
  if (value < 45) return "Low confidence";
  if (value < 75) return "Moderate confidence";
  return "High confidence";
}

function compact(value: string | null, maximum = 260): string | null {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  const sentence = normalized.slice(0, maximum + 1).match(/^(.{80,260}?[.!?])(?:\s|$)/)?.[1];
  return sentence ?? `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function unique(values: Array<string | null>, limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!value) continue;
    const key = value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
    if (result.length === limit) break;
  }
  return result;
}

function displayStatus(value: string | null): string {
  if (!value) return "Status unavailable";
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function recommendationStatus(value: string | null): string | null {
  if (!value) return null;
  if (value === "investigate-further") return "Investigate further";
  if (value === "do-not-proceed") return "Do not proceed";
  if (value === "proceed") return "Proceed";
  return displayStatus(value);
}

function workStage(work: UnknownRecord, recordValue: UnknownRecord | null, hasReview: boolean, hasLearning: boolean): DecisionLifecycleStageId {
  if (hasLearning) return "learned";
  if (hasReview) return "review";
  const status = text(work.status, recordValue?.status);
  if (status === "in-progress" || status === "blocked") return "executing";
  return "committed";
}

function recordStage(value: UnknownRecord): DecisionLifecycleStageId {
  const status = text(value.status);
  if (status === "draft") return "preparing";
  if (status === "in-progress") return "executing";
  if (status === "completed") return "review";
  return "committed";
}

function buildLifecycle(currentStage: DecisionLifecycleStageId | null): DecisionsExperienceView["lifecycle"] {
  const currentIndex = currentStage ? STAGES.findIndex((stage) => stage.id === currentStage) : -1;
  return {
    currentStage,
    summary: currentStage
      ? `This Executive Work is currently ${STAGES[currentIndex].label.toLowerCase()}.`
      : "The decision lifecycle begins when Executive Work is opened.",
    stages: STAGES.map((stage, index) => ({
      ...stage,
      status: currentIndex < 0
        ? "unavailable"
        : index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
    })),
  };
}

export function buildDecisionsExperienceView(runtime: OrganizationRuntime): DecisionsExperienceView {
  const memory = record(runtime.memory);
  const workItems = records(memory.executiveWork);
  const decisionRecords = records(memory.executiveDecisionRecords);
  const reviews = records(memory.executiveReviews);
  const learning = records(memory.executiveLearning);
  const activeWork = workItems
    .filter((item) => !["completed", "cancelled"].includes(text(item.status) ?? ""))
    .sort((left, right) => (text(right.updatedAt) ?? "").localeCompare(text(left.updatedAt) ?? ""))[0] ?? null;
  const activeRecord = !activeWork
    ? decisionRecords
        .filter((item) => !["completed", "cancelled"].includes(text(item.status) ?? ""))
        .sort((left, right) => (text(right.updatedAt, right.createdAt) ?? "").localeCompare(text(left.updatedAt, left.createdAt) ?? ""))[0] ?? null
    : null;
  const selectedRecord = activeWork
    ? decisionRecords.find((item) => text(item.id) === text(activeWork.decisionRecordId)) ?? null
    : activeRecord;
  const selectedId = text(activeWork?.id, selectedRecord?.id);
  const hasReview = reviews.some((item) => text(item.executiveWorkId) === text(activeWork?.id));
  const hasLearning = learning.some((item) => text(item.executiveWorkId) === text(activeWork?.id));
  const currentStage = activeWork
    ? workStage(activeWork, selectedRecord, hasReview, hasLearning)
    : activeRecord ? recordStage(activeRecord) : null;

  const executiveRecommendation = record(memory.executiveRecommendation);
  const executiveSimulation = record(memory.executiveSimulation);
  const simulationRecommendation = record(executiveSimulation.recommendation);
  const constraint = record(memory.primaryExecutiveConstraint);
  const assessment = record(memory.executiveAssessment);
  const primaryJudgment = record(assessment.primaryJudgment);
  const organizationalState = record(memory.organizationalState);
  const recommendation = Object.keys(simulationRecommendation).length
    ? simulationRecommendation
    : executiveRecommendation;
  const hasRecommendation = Object.keys(recommendation).length > 0;
  const hasConstraint = Object.keys(constraint).length > 0;

  const recommendationHeadline = text(
    record(recommendation.recommendedStrategy).title,
    recommendation.headline,
    recommendation.executiveRecommendation,
  );
  const constraintTitle = text(constraint.title, records(organizationalState.dominantConditions)[0]?.name);
  const positionHeadline = compact(text(
    selectedRecord?.decision,
    selectedRecord?.title,
    recommendationHeadline,
    constraintTitle,
    primaryJudgment.title,
    assessment.summary,
  ), 180) ?? "Discovery has not yet formed a grounded decision recommendation.";
  const positionSummary = compact(text(
    selectedRecord?.rationale,
    recommendation.summary,
    recommendation.executiveRecommendation,
    recommendation.rationale,
    constraint.executiveSummary,
    assessment.summary,
    organizationalState.executiveImplication,
  )) ?? "Discovery needs stronger organizational understanding before it can frame an executive decision opportunity.";
  const selectedConfidence = percent(
    activeWork ? selectedRecord?.discoveryConfidenceAtDecision
      : activeRecord ? activeRecord.discoveryConfidenceAtDecision
      : recommendation.confidence ?? constraint.confidence ?? assessment.confidence,
  );
  const status = recommendationStatus(text(recommendation.status));
  const observations = unique([
    compact(text(constraint.whyNow), 180),
    compact(text(constraint.expectedExecutiveImpact), 180),
    compact(text(recommendation.uncertaintySummary), 180),
    ...strings(recommendation.whyRecommended).map((item) => compact(item, 180)),
  ], 3);

  const activeTitle = text(activeWork?.title, selectedRecord?.title, selectedRecord?.decision);
  const state: DecisionsExperienceView["state"] = activeWork || activeRecord
    ? {
        kind: "active",
        title: activeTitle ?? "Active Executive Work",
        status: displayStatus(text(activeWork?.status, selectedRecord?.status)),
        summary: compact(text(selectedRecord?.decision, selectedRecord?.rationale, activeTitle)) ?? "This decision is recorded in the organization’s Executive Work.",
      }
    : hasRecommendation || hasConstraint
      ? {
          kind: "no-active-decision",
          title: "No active Executive Work",
          summary: "Discovery has identified a decision opportunity, but no decision has been opened or committed.",
        }
      : {
          kind: "not-ready",
          title: "No active Executive Work",
          summary: "Discovery has not yet formed a grounded decision recommendation.",
        };

  const researchHref = buildProductHref("/research", runtime.metadata.organizationId);
  const askHref = buildProductHref("/ask", runtime.metadata.organizationId);
  const organizationHref = buildProductHref("/your-organization", runtime.metadata.organizationId);
  const nextStep = activeWork || activeRecord
    ? {
        label: currentStage === "review" ? "Review the recorded outcome" : "Review this Executive Work",
        rationale: compact(text(selectedRecord?.rationale, activeWork?.expectedOutcomes && records(activeWork.expectedOutcomes)[0]?.description), 220)
          ?? "Review the persisted decision, its rationale, and the next unresolved requirement.",
        destination: buildProductHref("/decisions", runtime.metadata.organizationId),
      }
    : hasRecommendation
      ? {
          label: status === "Investigate further" ? "Investigate the missing evidence first" : "Review this decision opportunity",
          rationale: compact(text(recommendation.uncertaintySummary, recommendation.rationale, recommendation.executiveRecommendation), 220)
            ?? "Review Discovery’s grounded recommendation before opening Executive Work.",
          destination: status === "Investigate further" ? researchHref : organizationHref,
        }
      : hasConstraint
        ? {
            label: "Review the primary constraint",
            rationale: compact(text(constraint.whyNow, constraint.executiveSummary), 220)
              ?? "Review the organizational constraint before framing a decision.",
            destination: organizationHref,
          }
        : null;

  const exploreFurther = unique([
    hasConstraint ? "Review the primary organizational constraint" : null,
    text(recommendation.uncertaintySummary) ? "Investigate the missing evidence" : null,
    hasRecommendation ? "Challenge Discovery’s recommendation" : null,
    "Inspect the current Organization Model",
  ], 3).map((label) => ({
    label,
    rationale: label.includes("missing") ? compact(text(recommendation.uncertaintySummary), 180) ?? undefined : undefined,
    destination: label.includes("missing") ? researchHref : label.includes("Challenge") ? askHref : organizationHref,
  }));

  const historical = [...workItems, ...decisionRecords]
    .filter((item) => text(item.id) !== selectedId)
    .filter((item) => text(item.title))
    .sort((left, right) => (text(right.updatedAt, right.createdAt) ?? "").localeCompare(text(left.updatedAt, left.createdAt) ?? ""));
  const otherWork = unique(historical.map((item) => text(item.title)), 3).map((title) => {
    const item = historical.find((candidate) => text(candidate.title) === title) ?? {};
    return {
      title,
      status: displayStatus(text(item.status)),
      summary: compact(text(item.decision, item.rationale), 160) ?? undefined,
    };
  });

  return {
    organization: { id: runtime.metadata.organizationId, name: runtime.metadata.name || "Your organization" },
    state,
    currentPosition: {
      headline: positionHeadline,
      summary: positionSummary,
      confidence: selectedConfidence,
      confidenceLabel: confidenceLabel(selectedConfidence),
      rationale: compact(text(selectedRecord?.rationale, recommendation.rationale, constraint.whyNow)),
      primaryConstraint: constraintTitle,
      recommendationStatus: status,
      observations,
      risks: strings(recommendation.risks),
    },
    lifecycle: buildLifecycle(currentStage),
    nextStep,
    exploreFurther,
    otherWork,
  };
}
