export const ONBOARDING_EVIDENCE_MAX_FILES = 3;
export const ONBOARDING_EVIDENCE_MAX_BYTES = 512 * 1024;
export const ONBOARDING_EVIDENCE_MAX_CHARACTERS = 512 * 1024;

const supportedExtensions = new Set(["txt", "md", "markdown", "csv"]);
const supportedMimeTypes = new Set([
  "",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

export type OnboardingEvidenceSubmission = {
  id: string;
  sourceRole: string;
  displayName: string;
  ingestionMethod: "file" | "paste";
  originalFilename?: string;
  mimeType?: string;
  contentDigest: string;
  extractionStatus: "extracted";
  content: string;
};

export function sanitizeEvidenceName(value: string): string {
  return value
    .replace(/[^\w.\- ()]/g, "")
    .replace(/^\.+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function validateEvidenceFileMetadata(file: {
  name: string;
  type: string;
  size: number;
}): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!supportedExtensions.has(extension)) {
    return "Use a TXT, Markdown, or CSV file. PDF and DOCX are not supported in this bounded local flow.";
  }
  if (!supportedMimeTypes.has(file.type.toLowerCase())) {
    return "This file’s declared type does not match a supported plain-text format.";
  }
  if (file.size <= 0) {
    return "Choose a non-empty file.";
  }
  if (file.size > ONBOARDING_EVIDENCE_MAX_BYTES) {
    return "Keep each evidence file under 512 KB.";
  }
  return null;
}

export function validateEvidenceContent(content: string): string | null {
  if (!content.trim()) return "Add some evidence before continuing.";
  if (
    content.length > ONBOARDING_EVIDENCE_MAX_CHARACTERS ||
    new TextEncoder().encode(content).byteLength > ONBOARDING_EVIDENCE_MAX_BYTES
  ) {
    return "Keep each evidence source under 512 KB.";
  }
  if (content.includes("\u0000")) {
    return "This file is not plain text and cannot be read safely.";
  }
  return null;
}

export async function evidenceDigest(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
