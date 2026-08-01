import type { CanonicalProductWorkspaceAdapter } from "../../integration/canonicalProductWorkspaceAdapter";
import type { ProductConfidenceImprovementEnvelopeContext } from "../../improvements/candidateEnvelope";
import type { ProductConfidenceImprovementGovernedEvent, ProductConfidenceImprovementProposal } from "../../improvements/contracts";
import type { CalibrationPreregistrationManifest, CalibrationValidationContext, ExecutionAuthorization, HumanChoiceArtifact, HumanDisposition } from "./contracts";
import { calibrationDigest, validatePreregistrationManifest } from "./protocol";

type GovernedReceipt = Omit<ProductConfidenceImprovementGovernedEvent, "kind" | "schemaVersion" | "operationFingerprint">;
function governedReceipt(value: unknown): GovernedReceipt {
  const receipt = value as Partial<GovernedReceipt>;
  if (!Number.isInteger(receipt.eventVersion) || !receipt.candidateEnvelope || typeof receipt.candidateEnvelopeDigest !== "string" || typeof receipt.authorityRef !== "string") throw new Error("Calibration requires a governed Product Confidence Improvement v3 receipt.");
  return value as GovernedReceipt;
}
function declaredReference(value: CalibrationPreregistrationManifest["objectiveVersion"]): string | null {
  return typeof value === "string" ? value : value.state === "not-applicable" ? null : null;
}

export async function recordCalibrationHumanChoice(input: {
  adapter: Pick<CanonicalProductWorkspaceAdapter, "recordGovernedImprovementChoice">;
  manifest: CalibrationPreregistrationManifest; context: CalibrationValidationContext;
  userId: string; selectedCandidateId: string; proposal: ProductConfidenceImprovementProposal;
  envelopeContext: ProductConfidenceImprovementEnvelopeContext; disposition: HumanDisposition;
  executionAuthorization: ExecutionAuthorization; operationId: string; rationale: string; recordedAt: string;
}): Promise<HumanChoiceArtifact> {
  validatePreregistrationManifest(input.manifest, input.context);
  if (!input.manifest.allowedHumanDispositions.includes(input.disposition) || !input.manifest.executionAuthorizationChoices.includes(input.executionAuthorization) || !input.userId.trim() || !input.operationId.trim() || !input.rationale.trim() || !Number.isFinite(Date.parse(input.recordedAt))) throw new Error("Calibration human choice is invalid.");
  const frozen = input.manifest.candidateEnvelopes.find((item) => item.envelope.candidate.candidateId === input.selectedCandidateId);
  if (!frozen || input.proposal.proposalId !== input.selectedCandidateId || input.proposal.organizationId !== input.manifest.organizationId || input.proposal.questionId !== input.manifest.question.questionId || input.proposal.unknownId !== input.manifest.unknown.unknownId || input.proposal.unknownRevisionRef !== input.manifest.unknown.revisionRef || input.proposal.understandingRevisionRef !== input.manifest.understandingRef || input.envelopeContext.authorityRef !== input.manifest.principal.authorityRef || input.envelopeContext.objectiveVersionRef !== declaredReference(input.manifest.objectiveVersion) || input.envelopeContext.optimizationContextVersionRef !== declaredReference(input.manifest.optimizationContextVersion)) throw new Error("Calibration human choice candidate or manifest state changed.");
  const disposition = input.disposition === "authorize" ? "authorized" : input.disposition === "decline" ? "declined" : "deferred";
  const ancestry = `Calibration manifest ${input.manifest.caseId}:${input.manifest.manifestDigest}. ${input.rationale}`;
  const recorded = await input.adapter.recordGovernedImprovementChoice({
    userId: input.userId, organizationId: input.manifest.organizationId, questionId: input.manifest.question.questionId,
    proposal: input.proposal, context: input.envelopeContext, disposition, operationId: input.operationId,
    expectedCurrentEventVersion: null, occurredAt: input.recordedAt, reason: ancestry,
    operation: { requestId: `calibration:${input.manifest.caseId}:${input.operationId}`, operatorId: input.userId },
  });
  const receipt = governedReceipt(recorded.receipt);
  if (receipt.eventType !== `improvement-${disposition}` || receipt.organizationId !== input.manifest.organizationId || receipt.actorRef !== input.userId || receipt.authorityRef !== input.manifest.principal.authorityRef || receipt.questionId !== input.manifest.question.questionId || receipt.questionRevision !== input.manifest.question.revision || receipt.unknownId !== input.manifest.unknown.unknownId || receipt.unknownRevisionRef !== input.manifest.unknown.revisionRef || receipt.understandingRevisionRef !== input.manifest.understandingRef || receipt.objectiveVersionRef !== declaredReference(input.manifest.objectiveVersion) || receipt.optimizationContextVersionRef !== declaredReference(input.manifest.optimizationContextVersion) || receipt.proposalId !== input.selectedCandidateId || receipt.candidateEnvelope.envelopeId !== frozen.envelope.envelopeId || receipt.candidateEnvelopeDigest !== frozen.digest || receipt.operationId !== input.operationId || !receipt.reason?.includes(input.manifest.manifestDigest)) throw new Error("Canonical governed-choice receipt does not match the frozen calibration manifest.");
  const receiptDigest = calibrationDigest(receipt);
  const unsigned = {
    artifactVersion: "1" as const, phase: "human-choice-recorded" as const,
    caseId: input.manifest.caseId, organizationId: input.manifest.organizationId,
    predecessorManifestDigest: input.manifest.manifestDigest, disposition: input.disposition,
    executionAuthorization: input.executionAuthorization, selectedCandidateId: input.selectedCandidateId,
    rationale: input.rationale, recordedAt: input.recordedAt, canonicalEventSchemaVersion: "3" as const,
    canonicalOwner: { identity: "product-confidence-improvement" as const, version: "3" as const },
    canonicalReceiptSnapshot: receipt, canonicalReceiptDigest: receiptDigest,
    canonicalEventRef: receipt.eventId, idempotencyIdentity: receipt.operationId,
    runtimeRevision: recorded.runtimeRevision,
  };
  return { ...unsigned, artifactDigest: calibrationDigest(unsigned) };
}
