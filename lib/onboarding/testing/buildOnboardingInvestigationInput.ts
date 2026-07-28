import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../../engine/types";

type OnboardingInvestigationSubmission = {
  company?: unknown;
  website?: unknown;
  industry?: unknown;
  question?: unknown;
  messyInput?: unknown;
  context?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function source(
  sourceId: string,
  sourceType: string,
  content: string,
): InvestigationEvidenceSource | null {
  return content
    ? {
        sourceId,
        sourceType,
        content,
      }
    : null;
}

export function buildOnboardingInvestigationInput(
  submission: OnboardingInvestigationSubmission,
): InvestigationInput {
  const company = text(submission.company);
  const website = text(submission.website);
  const industry = text(submission.industry);
  const question = text(submission.question);
  const context = text(submission.messyInput) || text(submission.context);

  const profile = [
    company ? `Company: ${company}` : "",
    industry ? `Industry: ${industry}` : "",
    website ? `Website: ${website}` : "",
  ].filter(Boolean).join("\n");

  const evidenceSources = [
    source("onboarding-organization-profile", "organization-profile", profile),
    source(
      "onboarding-strategic-priority",
      "strategic-priority",
      question,
    ),
    source(
      "onboarding-leadership-context",
      "leadership-context",
      context,
    ),
  ].filter(
    (item): item is InvestigationEvidenceSource => item !== null,
  );

  return {
    company,
    website,
    industry,
    question,
    context,
    evidenceSources,
  };
}
