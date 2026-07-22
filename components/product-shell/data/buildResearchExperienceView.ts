import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildProductHref } from "./productOrganization";

export type ResearchExperienceView = {
  organization: { id: string; name: string };
  highestUnknown: {
    headline: string;
    summary: string;
    confidence: number | null;
    confidenceLabel: string;
  } | null;
  whyItMatters: { explanation: string; impact: string | null; observations: string[] };
  recommendation: { title: string; rationale: string; destination?: string } | null;
  evidenceRequests: Array<{ title: string; explanation: string }>;
  opportunities: Array<{ title: string; summary: string; destination?: string }>;
};

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? value as UnknownRecord : {};
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function text(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function compact(value: string | null, maximum = 280): string | null {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  const sentence = normalized.slice(0, maximum + 1).match(/^(.{80,280}?[.!?])(?:\s|$)/)?.[1];
  return sentence ?? `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function percent(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(Math.max(0, Math.min(100, value <= 1 ? value * 100 : value)));
}

function confidenceLabel(value: number | null): string {
  if (value === null) return "Confidence not attached to this question";
  if (value < 45) return "Low confidence";
  if (value < 75) return "Moderate confidence";
  return "High confidence";
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

export function buildResearchExperienceView(runtime: OrganizationRuntime): ResearchExperienceView {
  const memory = record(runtime.memory);
  const opportunities = records(memory.investigationOpportunities);
  const primary = opportunities[0] ?? null;
  const understandingState = record(memory.organizationalUnderstandingState);
  const understanding = records(understandingState.currentUnderstandings)[0] ?? null;
  const uncertainty = record(memory.organizationalUncertainty);
  const explanation = record(memory.executiveExplanation);
  const assessment = record(memory.executiveAssessment);
  const theoryValidation = record(assessment.theoryValidation);

  const fallbackEvidence = unique([
    ...strings(understanding?.missingInformation),
    ...strings(explanation.recommendedEvidenceAreas),
    ...strings(uncertainty.recommendedEvidenceAreas),
    ...strings(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence),
  ].map((item) => compact(item, 210)), 3);
  const primaryEvidence = unique(strings(primary?.missingEvidence).map((item) => compact(item, 210)), 3);
  const evidence = primaryEvidence.length ? primaryEvidence : fallbackEvidence;

  const fallbackHeadline = text(
    strings(understanding?.openQuestions)[0],
    strings(explanation.confidenceLimiters)[0],
    records(uncertainty.drivers)[0]?.description,
    strings(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence)[0],
  );
  const headline = compact(text(primary?.suggestedExecutiveQuestion, primary?.topic, fallbackHeadline), 220);
  const summary = compact(text(
    primary?.reason,
    explanation.uncertaintyNarrative,
    uncertainty.summary,
    understanding?.whyItMatters,
  ));
  const attachedConfidence = primary ? null : percent(understanding?.confidence);
  const researchHref = buildProductHref("/research", runtime.metadata.organizationId);

  const evidenceRequests = evidence.map((item) => ({
    title: item,
    explanation: compact(text(primary?.reason, explanation.investigationNarrative, uncertainty.summary), 220)
      ?? "Discovery has identified this as relevant evidence, but Runtime does not yet explain its expected contribution.",
  }));

  return {
    organization: { id: runtime.metadata.organizationId, name: runtime.metadata.name || "Your organization" },
    highestUnknown: headline ? {
      headline,
      summary: summary ?? "Discovery has identified this question but has not yet recorded a fuller uncertainty explanation.",
      confidence: attachedConfidence,
      confidenceLabel: confidenceLabel(attachedConfidence),
    } : null,
    whyItMatters: {
      explanation: compact(text(primary?.reason, explanation.uncertaintyNarrative, uncertainty.summary, understanding?.whyItMatters))
        ?? "Additional evidence will allow Discovery to strengthen its understanding.",
      impact: compact(text(explanation.investigationNarrative, understanding?.whyItMatters, theoryValidation.whyDiscoveryBelievesIt), 240),
      observations: unique([
        ...strings(primary?.affectedConditions),
        ...records(uncertainty.drivers).map((driver) => compact(text(driver.description), 170)),
      ], 3),
    },
    recommendation: primary ? {
      title: text(primary.suggestedExecutiveQuestion, primary.topic) ?? "Review the leading research question",
      rationale: compact(text(primary.reason), 260) ?? "Discovery has identified this as the leading investigation opportunity.",
      destination: researchHref,
    } : evidence[0] ? {
      title: evidence[0],
      rationale: compact(text(explanation.investigationNarrative, uncertainty.summary), 260)
        ?? "This is the strongest evidence request currently preserved in Runtime.",
    } : null,
    evidenceRequests,
    opportunities: opportunities.slice(1).map((opportunity) => ({
      title: text(opportunity.suggestedExecutiveQuestion, opportunity.topic) ?? "Research opportunity",
      summary: compact(text(opportunity.reason), 220) ?? "Runtime does not yet include a fuller explanation for this opportunity.",
      destination: researchHref,
    })).filter((item, index, items) => items.findIndex((candidate) => candidate.title.toLowerCase() === item.title.toLowerCase()) === index).slice(0, 3),
  };
}
