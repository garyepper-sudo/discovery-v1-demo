import { createHash } from "node:crypto";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[^\S\n]+/g, " ").trim())
    .filter((line, index, lines) =>
      line || (index > 0 && index < lines.length - 1 && lines[index - 1])
    )
    .join("\n")
    .trim();
}

function normalizedEvidenceSource(source: InvestigationEvidenceSource) {
  const content = normalizeText(source.content);
  return {
    sourceType: normalizeText(source.sourceType ?? ""),
    observedAt: normalizeText(source.observedAt ?? ""),
    reliability: source.reliability ?? null,
    sourceName: normalizeText(source.sourceName ?? ""),
    sourceRole: normalizeText(source.sourceRole ?? ""),
    organizationScope: normalizeText(source.organizationScope ?? ""),
    ingestionMethod: source.ingestionMethod ?? null,
    originalFilename: normalizeText(source.originalFilename ?? ""),
    mimeType: normalizeText(source.mimeType ?? "").toLowerCase(),
    contentDigest: createHash("sha256").update(content).digest("hex"),
    extractionStatus: source.extractionStatus ?? null,
    content,
  };
}

function stableEvidenceKey(
  source: ReturnType<typeof normalizedEvidenceSource>,
): string {
  return JSON.stringify(source);
}

export function canonicalInvestigationFingerprint(params: {
  organizationId: string;
  input: InvestigationInput;
}): string {
  const canonical = {
    organizationId: normalizeText(params.organizationId),
    company: normalizeText(params.input.company),
    website: normalizeText(params.input.website).toLowerCase(),
    industry: normalizeText(params.input.industry),
    question: normalizeText(params.input.question),
    context: normalizeText(params.input.context),
    evidenceSources: (params.input.evidenceSources ?? [])
      .map(normalizedEvidenceSource)
      .sort((left, right) =>
        stableEvidenceKey(left).localeCompare(stableEvidenceKey(right))
      ),
  };

  return createHash("sha256")
    .update(JSON.stringify(canonical))
    .digest("hex");
}

export class InvestigationIdempotencyConflictError extends Error {
  readonly code = "INVESTIGATION_IDEMPOTENCY_CONFLICT";

  constructor() {
    super("Investigation request identity was already used for different input.");
    this.name = "InvestigationIdempotencyConflictError";
  }
}

export class InvestigationInProgressError extends Error {
  readonly code = "INVESTIGATION_IN_PROGRESS";

  constructor() {
    super("An identical investigation is already in progress.");
    this.name = "InvestigationInProgressError";
  }
}
