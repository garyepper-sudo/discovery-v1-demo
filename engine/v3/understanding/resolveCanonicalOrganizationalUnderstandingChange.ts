import { createHash } from "node:crypto";
import type { CanonicalUnderstandingComposition } from "./buildCanonicalUnderstandingCompatibilityShadow";

export type CanonicalUnderstandingCompositionRevisionRefV1 = {
  compositionId: string;
  revisionId: string;
};

export type CanonicalOrganizationalUnderstandingChangeResultV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  contributionOperationId: string;
  beforeCompositionRevisionRefs: CanonicalUnderstandingCompositionRevisionRefV1[];
  afterCompositionRevisionRefs: CanonicalUnderstandingCompositionRevisionRefV1[];
  beforeCompositionSetDigest: string;
  afterCompositionSetDigest: string;
  disposition: "changed" | "unchanged";
  resultDigest: string;
};

export type CanonicalOrganizationalUnderstandingChangeOutcomeV1 =
  | { status: "available"; result: CanonicalOrganizationalUnderstandingChangeResultV1 }
  | {
      status: "unavailable";
      reason:
        | "historical-composition-state-unavailable"
        | "historical-operation-result-unavailable";
    };

export function validateCanonicalOrganizationalUnderstandingChangeOutcome(
  outcome: CanonicalOrganizationalUnderstandingChangeOutcomeV1,
): void {
  if (!outcome || typeof outcome !== "object") {
    throw new Error("Canonical Organizational Understanding change outcome is invalid.");
  }
  if (outcome.status === "available") {
    validateCanonicalOrganizationalUnderstandingChangeResult(outcome.result);
    return;
  }
  if (
    outcome.status !== "unavailable" ||
    (outcome.reason !== "historical-composition-state-unavailable" &&
      outcome.reason !== "historical-operation-result-unavailable")
  ) {
    throw new Error("Canonical Organizational Understanding change outcome is invalid.");
  }
}

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const digest = (value: unknown): string =>
  createHash("sha256").update(stable(value)).digest("hex");

function normalize(
  organizationId: string,
  compositions: readonly CanonicalUnderstandingComposition[],
): CanonicalUnderstandingCompositionRevisionRefV1[] {
  const byComposition = new Map<string, string>();
  for (const composition of compositions) {
    if (
      composition.organizationId !== organizationId ||
      !composition.id.trim() ||
      !composition.revisionId.trim()
    ) {
      throw new Error("Canonical Organizational Understanding composition reference is invalid.");
    }
    const retained = byComposition.get(composition.id);
    if (retained && retained !== composition.revisionId) {
      throw new Error("Canonical Organizational Understanding composition revisions conflict.");
    }
    byComposition.set(composition.id, composition.revisionId);
  }
  return [...byComposition]
    .map(([compositionId, revisionId]) => ({ compositionId, revisionId }))
    .sort(
      (left, right) =>
        left.compositionId.localeCompare(right.compositionId) ||
        left.revisionId.localeCompare(right.revisionId),
    );
}

export function validateCanonicalOrganizationalUnderstandingChangeResult(
  result: CanonicalOrganizationalUnderstandingChangeResultV1,
): void {
  const before = normalize(
    result.organizationId,
    result.beforeCompositionRevisionRefs.map((ref) => ({
      id: ref.compositionId,
      revisionId: ref.revisionId,
      organizationId: result.organizationId,
    })) as CanonicalUnderstandingComposition[],
  );
  const after = normalize(
    result.organizationId,
    result.afterCompositionRevisionRefs.map((ref) => ({
      id: ref.compositionId,
      revisionId: ref.revisionId,
      organizationId: result.organizationId,
    })) as CanonicalUnderstandingComposition[],
  );
  const beforeDigest = digest({ contractVersion: "1", revisionRefs: before });
  const afterDigest = digest({ contractVersion: "1", revisionRefs: after });
  const disposition = beforeDigest === afterDigest ? "unchanged" : "changed";
  const { resultDigest, ...unsigned } = result;
  if (
    result.contractVersion !== "1" ||
    !result.organizationId.trim() ||
    !result.questionId.trim() ||
    !result.contributionOperationId.trim() ||
    stable(before) !== stable(result.beforeCompositionRevisionRefs) ||
    stable(after) !== stable(result.afterCompositionRevisionRefs) ||
    result.beforeCompositionSetDigest !== beforeDigest ||
    result.afterCompositionSetDigest !== afterDigest ||
    result.disposition !== disposition ||
    resultDigest !== digest(unsigned)
  ) {
    throw new Error("Canonical Organizational Understanding change result is invalid.");
  }
}

export function resolveCanonicalOrganizationalUnderstandingChange(input: {
  organizationId: string;
  questionId: string;
  contributionOperationId: string;
  beforeCompositions: readonly CanonicalUnderstandingComposition[] | undefined;
  afterCompositions: readonly CanonicalUnderstandingComposition[] | undefined;
}): CanonicalOrganizationalUnderstandingChangeOutcomeV1 {
  if (!input.beforeCompositions || !input.afterCompositions) {
    return { status: "unavailable", reason: "historical-composition-state-unavailable" };
  }
  const beforeCompositionRevisionRefs = normalize(input.organizationId, input.beforeCompositions);
  const afterCompositionRevisionRefs = normalize(input.organizationId, input.afterCompositions);
  const beforeCompositionSetDigest = digest({
    contractVersion: "1",
    revisionRefs: beforeCompositionRevisionRefs,
  });
  const afterCompositionSetDigest = digest({
    contractVersion: "1",
    revisionRefs: afterCompositionRevisionRefs,
  });
  const unsigned = {
    contractVersion: "1" as const,
    organizationId: input.organizationId,
    questionId: input.questionId,
    contributionOperationId: input.contributionOperationId,
    beforeCompositionRevisionRefs,
    afterCompositionRevisionRefs,
    beforeCompositionSetDigest,
    afterCompositionSetDigest,
    disposition:
      beforeCompositionSetDigest === afterCompositionSetDigest
        ? ("unchanged" as const)
        : ("changed" as const),
  };
  const result = { ...unsigned, resultDigest: digest(unsigned) };
  validateCanonicalOrganizationalUnderstandingChangeResult(result);
  return { status: "available", result };
}
