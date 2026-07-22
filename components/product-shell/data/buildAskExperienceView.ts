import type { OrganizationRuntime } from "../../../engine/v3/runtime";
import { buildProductHref } from "./productOrganization";
import { buildOrganizationModelContext, type OrganizationModelContext } from "./buildOrganizationModelContext";

export type AskExperienceView = {
  organization: { id: string; name: string };
  model: OrganizationModelContext;
  question: { text: string; context: string | null } | null;
  answer: { headline: string; summary: string | null } | null;
  reasoning: {
    central: string | null;
    observations: string[];
    confidence: string | null;
    couldChangeAnswer: string | null;
  };
  uncertainty: Array<{ statement: string; evidenceRequest: string | null }>;
  nextQuestion: { text: string; rationale: string | null; destination: string } | null;
  otherQuestions: Array<{ text: string; destination: string }>;
  navigation: Array<{ label: string; destination: string }>;
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

function question(...values: unknown[]): string | null {
  return values.find((value): value is string => typeof value === "string" && value.trim().endsWith("?"))?.trim() ?? null;
}

function compact(value: string | null, maximum = 300): string | null {
  if (!value) return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  const sentence = normalized.slice(0, maximum + 1).match(/^(.{80,300}?[.!?])(?:\s|$)/)?.[1];
  return sentence ?? `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function readable(value: unknown): string | null {
  const candidate = text(value);
  if (!candidate || /\.\s+is\s+(?:the|a|an)\b/i.test(candidate)) return null;
  return candidate;
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

function confidenceText(communication: UnknownRecord, explanation: UnknownRecord, assessment: UnknownRecord, understanding: UnknownRecord): string | null {
  const confidence = record(communication.confidence);
  const value = typeof confidence.value === "number" ? confidence.value : typeof assessment.confidence === "number" ? assessment.confidence : typeof understanding.confidence === "number" ? understanding.confidence : null;
  const label = text(confidence.label);
  const percentage = value === null ? null : Math.round(Math.max(0, Math.min(100, value <= 1 ? value * 100 : value)));
  return compact(text(
    explanation.confidenceNarrative,
    percentage === null ? null : `${label ? `${label.charAt(0).toUpperCase()}${label.slice(1)} confidence` : "Confidence"} at ${percentage}%.`,
  ), 240);
}

export function buildAskExperienceView(runtime: OrganizationRuntime): AskExperienceView {
  const memory = record(runtime.memory);
  const opportunities = records(memory.investigationOpportunities);
  const primaryOpportunity = opportunities[0] ?? null;
  const communication = record(memory.executiveCommunication);
  const communicationUncertainty = record(communication.uncertainty);
  const communicationRecommendation = record(communication.recommendation);
  const explanation = record(memory.executiveExplanation);
  const assessment = record(memory.executiveAssessment);
  const theoryValidation = record(assessment.theoryValidation);
  const understandingState = record(memory.organizationalUnderstandingState);
  const understanding = records(understandingState.currentUnderstandings)[0] ?? {};
  const uncertainty = record(memory.organizationalUncertainty);

  const questionText = compact(text(
    primaryOpportunity?.suggestedExecutiveQuestion,
    communicationUncertainty.question,
    strings(understanding.openQuestions)[0],
    explanation.uncertaintyNarrative,
  ), 230);
  const answerHeadline = compact(text(
    communication.headline,
    communication.executiveSummary,
    explanation.executiveSummary,
    assessment.summary,
    understanding.statement,
  ), 250);
  const answerSummary = compact(text(
    readable(communication.executiveSummary),
    explanation.executiveSummary,
    assessment.summary,
    understanding.summary,
  ), 320);
  const observations = unique([
    ...records(communication.supportingSignals).map((signal) => compact(text(signal.statement), 190)),
    ...records(theoryValidation.supportingMechanisms).map((item) => compact(text(item.rationale, item.label), 190)),
  ], 3);
  const changeEvidence = text(
    strings(communicationRecommendation.evidenceThatCouldChangeRecommendation)[0],
    strings(theoryValidation.evidenceThatWouldFalsifyTheory)[0],
    strings(record(communication.forecast).falsifyingSignals)[0],
  );
  const missingEvidence = unique([
    ...strings(primaryOpportunity?.missingEvidence),
    ...strings(understanding.missingInformation),
    ...strings(explanation.recommendedEvidenceAreas),
  ].map((item) => compact(item, 190)), 3);
  const uncertaintyStatements = unique([
    ...strings(explanation.confidenceLimiters),
    ...records(uncertainty.drivers).map((driver) => compact(text(driver.description), 190)),
    ...strings(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence),
  ], 3);
  const uncertaintyItems: AskExperienceView["uncertainty"] = uncertaintyStatements.map((statement, index) => ({
    statement,
    evidenceRequest: missingEvidence[index] ?? null,
  }));
  if (!uncertaintyItems.length && missingEvidence.length) {
    uncertaintyItems.push(...missingEvidence.map((statement) => ({ statement, evidenceRequest: null })));
  }

  const nextOpportunity = opportunities[1] ?? null;
  const fallbackQuestion = strings(understanding.openQuestions).find((item) => item !== questionText) ?? null;
  const recommendationChallenge = strings(communicationRecommendation.evidenceThatCouldChangeRecommendation).find((item) => item !== questionText) ?? null;
  const nextQuestionText = compact(question(
    nextOpportunity?.suggestedExecutiveQuestion,
    recommendationChallenge,
    fallbackQuestion,
  ), 230);
  const researchHref = buildProductHref("/research", runtime.metadata.organizationId);

  return {
    organization: { id: runtime.metadata.organizationId, name: runtime.metadata.name || "Your organization" },
    model: buildOrganizationModelContext(runtime),
    question: questionText ? { text: questionText, context: compact(text(primaryOpportunity?.reason, communicationUncertainty.implication), 250) } : null,
    answer: answerHeadline ? { headline: answerHeadline, summary: answerSummary === answerHeadline ? null : answerSummary } : null,
    reasoning: {
      central: compact(text(explanation.assessmentNarrative, assessment.summary, understanding.mechanism, theoryValidation.whyDiscoveryBelievesIt), 320),
      observations,
      confidence: confidenceText(communication, explanation, assessment, understanding),
      couldChangeAnswer: compact(changeEvidence, 240),
    },
    uncertainty: uncertaintyItems,
    nextQuestion: nextQuestionText ? {
      text: nextQuestionText,
      rationale: compact(text(nextOpportunity?.reason, primaryOpportunity?.reason), 240),
      destination: researchHref,
    } : null,
    otherQuestions: opportunities.slice(nextOpportunity ? 2 : 1).map((item) => text(item.suggestedExecutiveQuestion)).filter((item): item is string => Boolean(item)).filter((item, index, items) => items.indexOf(item) === index).slice(0, 2).map((item) => ({ text: item, destination: researchHref })),
    navigation: [
      { label: "Inspect the Organization Model", destination: buildProductHref("/your-organization", runtime.metadata.organizationId) },
      { label: "Investigate the missing evidence", destination: researchHref },
      { label: "Review Executive Work", destination: buildProductHref("/decisions", runtime.metadata.organizationId) },
    ],
  };
}
