import { createHash } from "node:crypto";

function digest(...parts: string[]): string {
  return createHash("sha256").update(parts.join("\u001f")).digest("hex");
}

export function normalizeExtractedContent(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function googleDriveExternalSourceIdentity(input: {
  organizationId: string;
  connectedSourceId: string;
  googleFileId: string;
}): string {
  return `google-drive-source:${digest(
    input.organizationId,
    input.connectedSourceId,
    input.googleFileId,
  )}`;
}

export function googleDriveSourceVersionIdentity(input: {
  sourceIdentity: string;
  revisionId: string;
}): string {
  return `google-drive-version:${digest(input.sourceIdentity, input.revisionId)}`;
}

export function googleDrivePassageIdentity(input: {
  sourceIdentity: string;
  location: string;
  contentDigest: string;
}): string {
  return digest(input.sourceIdentity, input.location, input.contentDigest);
}

export function googleDriveCanonicalEvidenceIdentity(input: {
  organizationId: string;
  connectedSourceId: string;
  contentDigest: string;
}): string {
  return `google-drive-evidence:${digest(
    input.organizationId,
    input.connectedSourceId,
    input.contentDigest,
  )}`;
}

export function googleDriveQuestionAdmissionIdentity(input: {
  questionId: string;
  contentDigest: string;
}): string {
  // Preserve the established Question + normalized-content key. The canonical
  // adapter adds organization scope when it creates the durable marker.
  return createHash("sha256")
    .update(`${input.questionId}:${input.contentDigest}`)
    .digest("hex");
}

export function googleDriveCitationIdentity(input: {
  sourceIdentity: string;
  revisionId: string;
  passageId: string;
}): string {
  return `google-drive-citation:${digest(
    input.sourceIdentity,
    input.revisionId,
    input.passageId,
  )}`;
}
