import { createHash } from "node:crypto";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../../engine/types";
import {
  ONBOARDING_EVIDENCE_MAX_FILES,
  type OnboardingEvidenceSubmission,
  sanitizeEvidenceName,
  validateEvidenceContent,
  validateEvidenceFileMetadata,
} from "../evidence/onboardingEvidence";

type OnboardingInvestigationSubmission = {
  company?: unknown;
  website?: unknown;
  industry?: unknown;
  question?: unknown;
  messyInput?: unknown;
  context?: unknown;
  evidenceSources?: unknown;
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

function addedEvidence(value: unknown): InvestigationEvidenceSource[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > ONBOARDING_EVIDENCE_MAX_FILES) {
    throw new Error("Invalid onboarding evidence collection.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid onboarding evidence source.");
    }
    const candidate = item as Partial<OnboardingEvidenceSubmission>;
    const content = text(candidate.content);
    const sourceRole = text(candidate.sourceRole);
    const displayName = sanitizeEvidenceName(text(candidate.displayName));
    const originalFilename = candidate.originalFilename === undefined
      ? undefined
      : sanitizeEvidenceName(text(candidate.originalFilename));
    const mimeType = text(candidate.mimeType);
    const method = candidate.ingestionMethod;
    const contentError = validateEvidenceContent(content);
    if (
      contentError ||
      !/^[a-z0-9-]{1,80}$/.test(sourceRole) ||
      !displayName ||
      (method !== "file" && method !== "paste") ||
      candidate.extractionStatus !== "extracted" ||
      (method === "file" && !originalFilename) ||
      (
        method === "file" &&
        validateEvidenceFileMetadata({
          name: originalFilename ?? "",
          type: mimeType,
          size: Buffer.byteLength(content, "utf8"),
        }) !== null
      )
    ) {
      throw new Error("Invalid onboarding evidence source.");
    }
    const digest = createHash("sha256").update(content).digest("hex");
    if (candidate.contentDigest !== digest) {
      throw new Error("Invalid onboarding evidence digest.");
    }

    return {
      sourceId: `onboarding-added-${digest.slice(0, 20)}-${index + 1}`,
      sourceType: `onboarding-${method}`,
      sourceName: displayName,
      sourceRole,
      organizationScope: "current-onboarding-organization",
      ingestionMethod: method,
      ...(originalFilename ? { originalFilename } : {}),
      ...(mimeType ? { mimeType } : {}),
      contentDigest: digest,
      extractionStatus: "extracted",
      content,
    };
  });
}

export function buildOnboardingInvestigationInput(
  submission: OnboardingInvestigationSubmission,
): InvestigationInput {
  const company = text(submission.company);
  const website = text(submission.website);
  const industry = text(submission.industry);
  const question = text(submission.question);
  const context = text(submission.messyInput) || text(submission.context);
  const submittedEvidence = addedEvidence(submission.evidenceSources);

  const profile = [
    company ? `Company: ${company}` : "",
    industry ? `Industry: ${industry}` : "",
    website ? `Website: ${website}` : "",
  ].filter(Boolean).join("\n");

  const onboardingFormEvidence: InvestigationEvidenceSource[] = [
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
  ).map((item): InvestigationEvidenceSource => ({
    ...item,
    sourceName: item.sourceType,
    sourceRole: item.sourceType,
    organizationScope: "current-onboarding-organization",
    ingestionMethod: "onboarding-form" as const,
    contentDigest: createHash("sha256").update(item.content).digest("hex"),
    extractionStatus: "extracted" as const,
  }));
  const evidenceSources = [...onboardingFormEvidence, ...submittedEvidence];

  return {
    company,
    website,
    industry,
    question,
    context,
    evidenceSources,
  };
}
