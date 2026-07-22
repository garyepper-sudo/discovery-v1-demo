import type { OrganizationRuntime } from "../../../engine/v3/runtime";

import { buildProductHref } from "./productOrganization";
import { buildOrganizationModelContext } from "./buildOrganizationModelContext";

export type OrganizationExperienceView = {
  organization: {
    id: string;
    name: string;
  };
  model: {
    coherence: number | null;
    coherenceLabel: string;
    summary: string;
    areas: ReturnType<typeof buildOrganizationModelContext>["areas"];
  };
  currentUnderstanding: {
    headline: string;
    explanation: string;
    confidence: number | null;
    confidenceLabel: string;
    reasoning: string;
    observations: string[];
    confidenceRationale: string | null;
    missingEvidence: string | null;
    falsificationCondition: string;
  };
  insights: string[];
  changes: {
    isFirstBaseline: boolean;
    summary: string;
    items: string[];
  };
  exploration: {
    recommended: {
      label: string;
      rationale: string;
      destination: string;
    };
    alternatives: Array<{
      label: string;
      destination: string;
    }>;
  };
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.replace(/\s+/g, " ").trim()
    : null;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const candidate = text(value);
    if (candidate) return candidate;
  }
  return null;
}

function normalizePercentage(value: unknown): number | null {
  const candidate = number(value);
  if (candidate === null) return null;

  const percentage = candidate <= 1 ? candidate * 100 : candidate;
  return Math.round(Math.min(100, Math.max(0, percentage)));
}

function compact(value: string, limit = 320): string {
  if (value.length <= limit) return value;

  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [];
  let result = "";

  for (const sentence of sentences) {
    const next = `${result} ${sentence.trim()}`.trim();
    if (next.length > limit) break;
    result = next;
  }

  if (result) return result;
  return `${value.slice(0, limit - 1).trimEnd()}…`;
}

function distinct(values: Array<string | null>, limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (!value) continue;
    const key = value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
    if (result.length === limit) break;
  }

  return result;
}

export function getCoherenceLabel(coherence: number | null): string {
  if (coherence === null) return "Establishing";
  if (coherence < 25) return "Fragmented";
  if (coherence < 45) return "Emerging";
  if (coherence < 65) return "Connecting";
  if (coherence < 85) return "Coherent";
  return "Strongly coherent";
}

function getConfidenceLabel(confidence: number | null): string {
  if (confidence === null) return "Confidence not yet established";
  if (confidence < 45) return "Low confidence";
  if (confidence < 75) return "Moderate confidence";
  return "High confidence";
}

export function buildOrganizationExperienceView(
  runtime: OrganizationRuntime,
): OrganizationExperienceView {
  const memory = runtime.memory as unknown as UnknownRecord;
  const understandingState = record(memory.organizationalUnderstandingState);
  const health = record(understandingState.health);
  const understandings = records(understandingState.currentUnderstandings);
  const selectedUnderstanding = understandings[0] ?? {};
  const assessment = record(memory.executiveAssessment);
  const primaryJudgment = record(assessment.primaryJudgment);
  const communication = record(memory.executiveCommunication);
  const explanation = record(memory.executiveExplanation);
  const constraint = record(memory.primaryExecutiveConstraint);
  const organizationalState = record(memory.organizationalState);
  const conditions = records(memory.organizationalConditions);
  const beliefs = records(memory.organizationalBeliefs);
  const observations = records(memory.observations);
  const investigations = records(memory.investigationOpportunities);
  const recommendation = record(memory.executiveRecommendation);
  const organizationId = runtime.metadata.organizationId;
  const organizationName = runtime.metadata.name || "Your organization";
  const coherence = normalizePercentage(health.coherence);
  const coherenceLabel = getCoherenceLabel(coherence);
  const modelContext = buildOrganizationModelContext(runtime);

  const headline = firstText(
    selectedUnderstanding.statement,
    selectedUnderstanding.title,
    primaryJudgment.headline,
    communication.headline,
    communication.summary,
    assessment.summary,
    constraint.title,
    constraint.executiveSummary,
    organizationalState.summary,
  ) ?? "Discovery is still forming its first understanding of this organization.";

  const supportingExplanation = distinct([
    text(selectedUnderstanding.summary),
    text(selectedUnderstanding.whyItMatters),
    text(communication.explanation),
    text(communication.executiveSummary),
    text(assessment.summary),
    text(constraint.executiveImpact),
    text(organizationalState.summary),
  ].filter((candidate) => candidate?.toLocaleLowerCase() !== headline.toLocaleLowerCase()), 1)[0]
    ?? "Discovery is still establishing the implications of this understanding.";

  const confidence = normalizePercentage(firstText(
    selectedUnderstanding.confidence,
  ) ?? number(selectedUnderstanding.confidence)
    ?? number(primaryJudgment.confidence)
    ?? number(assessment.confidence)
    ?? number(organizationalState.confidence));

  const reasoning = firstText(
    selectedUnderstanding.mechanism,
    selectedUnderstanding.whyItMatters,
    explanation.assessmentNarrative,
    primaryJudgment.rationale,
    primaryJudgment.executiveJudgment,
    communication.reasoning,
    assessment.summary,
  );

  const observationIds = Array.isArray(selectedUnderstanding.observationIds)
    ? selectedUnderstanding.observationIds.filter((id): id is string => typeof id === "string")
    : [];
  const resolvedObservations = observationIds.map((id) => {
    const observation = observations.find((candidate) => candidate.id === id);
    return observation ? firstText(observation.summary, observation.statement, observation.description) : null;
  });
  const supportingObservations = distinct([
    ...resolvedObservations,
    ...conditions.map((condition) => firstText(condition.whyItMatters, condition.summary)),
    ...beliefs.map((belief) => firstText(belief.statement, belief.summary)),
  ].map((candidate) => candidate ? compact(candidate, 210) : null), 3);

  const confidenceRationale = firstText(
    explanation.confidenceNarrative,
    primaryJudgment.uncertaintySummary,
    selectedUnderstanding.confidenceExplanation,
  );
  const selectedCondition = conditions.find(
    (condition) => condition.id === primaryJudgment.dominantConditionId,
  ) ?? conditions[0];
  const selectedMissingInformation = Array.isArray(selectedUnderstanding.missingInformation)
    ? selectedUnderstanding.missingInformation[0]
    : null;
  const conditionMissingEvidence = selectedCondition && Array.isArray(selectedCondition.missingEvidence)
    ? selectedCondition.missingEvidence[0]
    : null;
  const recommendedEvidence = Array.isArray(explanation.recommendedEvidenceAreas)
    ? explanation.recommendedEvidenceAreas[0]
    : null;
  const missingEvidence = firstText(
    selectedMissingInformation,
    conditionMissingEvidence,
    recommendedEvidence,
  );

  const evolutionHistory = records(understandingState.evolutionHistory);
  const learningEvents = records(memory.learningEvents);
  const isFirstBaseline = runtime.metadata.investigationCount <= 1;
  const changeItems = isFirstBaseline
    ? []
    : distinct([
        ...evolutionHistory.slice().reverse().map((event) => firstText(event.description, event.title)),
        ...learningEvents.slice().reverse().map((event) => firstText(event.reason)),
      ].map((candidate) => candidate ? compact(candidate, 190) : null), 3);

  const primaryInvestigation = investigations[0] ?? {};
  const investigationLabel = firstText(
    primaryInvestigation.suggestedExecutiveQuestion,
    primaryInvestigation.topic,
  );
  const recommendationLabel = firstText(
    recommendation.title,
    recommendation.recommendedAction,
    recommendation.summary,
  );
  const recommendedLabel = investigationLabel
    ?? recommendationLabel
    ?? "Strengthen Discovery's understanding.";
  const recommendedRationale = firstText(
    primaryInvestigation.reason,
    recommendation.rationale,
    recommendation.summary,
    missingEvidence,
  ) ?? "Discovery needs more grounded evidence before it can recommend a more specific direction.";
  const recommendedDestination = buildProductHref(
    investigationLabel ? "/research" : recommendationLabel ? "/decisions" : "/ask",
    organizationId,
  );

  const alternatives = distinct([
    headline !== "Discovery is still forming its first understanding of this organization."
      ? "Challenge the current understanding"
      : null,
    missingEvidence ? "Investigate the missing evidence" : null,
    recommendationLabel ? "Review the executive recommendation" : null,
  ], 3).map((label) => ({
    label,
    destination: buildProductHref(
      label.includes("evidence") ? "/research" : label.includes("recommendation") ? "/decisions" : "/ask",
      organizationId,
    ),
  }));

  return {
    organization: { id: organizationId, name: organizationName },
    model: {
      coherence,
      coherenceLabel,
      summary: compact(
        firstText(understandingState.executiveSummary)
          ?? "Discovery is establishing the first coherent view of this organization.",
        250,
      ),
      areas: modelContext.areas,
    },
    currentUnderstanding: {
      headline: compact(headline, 360),
      explanation: compact(supportingExplanation, 280),
      confidence,
      confidenceLabel: getConfidenceLabel(confidence),
      reasoning: compact(
        reasoning ?? "Discovery has not yet formed a complete explanation for this understanding.",
        360,
      ),
      observations: supportingObservations,
      confidenceRationale: confidenceRationale ? compact(confidenceRationale, 280) : null,
      missingEvidence: missingEvidence ? compact(missingEvidence, 220) : null,
      falsificationCondition: "Discovery has not yet identified the strongest evidence that would overturn this understanding.",
    },
    insights: distinct([headline, ...supportingObservations], 3),
    changes: {
      isFirstBaseline,
      summary: isFirstBaseline
        ? "Discovery is establishing its first organizational baseline."
        : changeItems.length > 0
          ? "Discovery's understanding has continued to evolve."
          : "Discovery has not yet recorded a meaningful cognitive change since the prior baseline.",
      items: changeItems,
    },
    exploration: {
      recommended: {
        label: compact(recommendedLabel, 150),
        rationale: compact(recommendedRationale, 240),
        destination: recommendedDestination,
      },
      alternatives,
    },
  };
}
