import type { OrganizationRuntimeRepository } from "../../../engine/v3/runtime/organizationRuntimeRepository";
import { productConfidenceImprovementEvents } from "../../improvements/improvementLifecycle";
import { CanonicalProductWorkspaceAdapter } from "../../integration/canonicalProductWorkspaceAdapter";
import type { ProductConfidenceImprovementGovernedEvent } from "../../improvements/contracts";
import type { CalibrationPreregistrationManifest, CalibrationValidationContext, HumanChoiceArtifact, HumanChoiceReloadVerification } from "./contracts";
import { calibrationDigest, validatePreregistrationManifest } from "./protocol";

type Repository = Pick<OrganizationRuntimeRepository, "read" | "replace">;
export type CalibrationReloadDependencies = {
  createRepository(): Repository;
  authorize(input: { userId: string; organizationId: string }): Promise<boolean>;
  authorizeImprovementOperation(input: { userId: string; organizationId: string; operation: "candidate:project" | "choice:authorize" | "choice:decline" | "choice:defer" | "choice:correct" | "outcome:observe" | "outcome:correct" }): Promise<boolean>;
};
function receiptOf(event: ProductConfidenceImprovementGovernedEvent) {
  const { kind: _kind, schemaVersion: _schemaVersion, operationFingerprint: _fingerprint, ...receipt } = event;
  return receipt;
}
export async function resolveCanonicalCalibrationChoice(input: { manifest: CalibrationPreregistrationManifest; context: CalibrationValidationContext; choice: HumanChoiceArtifact; userId: string; dependencies: CalibrationReloadDependencies }) {
  validatePreregistrationManifest(input.manifest, input.context);
  const { artifactDigest, ...choiceUnsigned } = input.choice;
  if (calibrationDigest(choiceUnsigned) !== artifactDigest || input.choice.predecessorManifestDigest !== input.manifest.manifestDigest || input.choice.canonicalEventSchemaVersion !== "3" || input.choice.canonicalReceiptDigest !== calibrationDigest(input.choice.canonicalReceiptSnapshot)) throw new Error("Calibration choice artifact is mutated or stale.");
  const repository = input.dependencies.createRepository();
  const adapter = new CanonicalProductWorkspaceAdapter({ runtimeRepository: repository, authorize: input.dependencies.authorize, authorizeImprovementOperation: input.dependencies.authorizeImprovementOperation, async investigate() { throw new Error("Calibration verification performs no investigation."); } });
  const workspace = await adapter.getQuestionWorkspace({ userId: input.userId, organizationId: input.manifest.organizationId, questionId: input.manifest.question.questionId });
  if (workspace.workspace.question.id !== input.manifest.question.questionId || workspace.workspace.question.revision !== input.manifest.question.revision) throw new Error("Calibration reloaded ProductQuestion revision changed.");
  const stored = await repository.read(input.manifest.organizationId);
  if (!stored) throw new Error("Calibration canonical choice store is unavailable.");
  const matches = productConfidenceImprovementEvents(stored.runtime).filter((event): event is ProductConfidenceImprovementGovernedEvent => event.schemaVersion === "3" && event.eventId === input.choice.canonicalEventRef && event.operationId === input.choice.idempotencyIdentity);
  if (matches.length !== 1) throw new Error("Calibration canonical governed-choice event is missing or conflicting.");
  const event = matches[0]!;
  const receipt = receiptOf(event);
  const expected = input.choice.canonicalReceiptSnapshot;
  if (calibrationDigest(receipt) !== input.choice.canonicalReceiptDigest || calibrationDigest(receipt) !== calibrationDigest(expected) || event.organizationId !== input.manifest.organizationId || event.actorRef !== expected.actorRef || event.authorityRef !== input.manifest.principal.authorityRef || event.questionId !== input.manifest.question.questionId || event.questionRevision !== input.manifest.question.revision || event.unknownId !== input.manifest.unknown.unknownId || event.unknownRevisionRef !== input.manifest.unknown.revisionRef || event.understandingRevisionRef !== input.manifest.understandingRef || event.proposalId !== input.choice.selectedCandidateId || event.candidateEnvelope.envelopeId !== expected.candidateEnvelope.envelopeId || event.candidateEnvelopeDigest !== expected.candidateEnvelopeDigest || event.eventVersion !== expected.eventVersion || event.supersedesEventId !== expected.supersedesEventId || !event.reason?.includes(input.manifest.manifestDigest)) throw new Error("Calibration canonical governed-choice receipt lineage changed.");
  return { repository, adapter, stored, event, receipt, receiptDigest: calibrationDigest(receipt) };
}
export async function verifyCalibrationHumanChoiceReload(input: { manifest: CalibrationPreregistrationManifest; context: CalibrationValidationContext; reloadedChoice: HumanChoiceArtifact; userId: string; dependencies: CalibrationReloadDependencies; verifiedAt: string }): Promise<HumanChoiceReloadVerification> {
  validatePreregistrationManifest(input.manifest, input.context);
  const { artifactDigest, ...unsignedChoice } = input.reloadedChoice;
  if (input.reloadedChoice.phase !== "human-choice-recorded" || input.reloadedChoice.predecessorManifestDigest !== input.manifest.manifestDigest || calibrationDigest(unsignedChoice) !== artifactDigest || !Number.isFinite(Date.parse(input.verifiedAt))) throw new Error("Calibration choice was not independently and immutably reloaded.");
  const resolved = await resolveCanonicalCalibrationChoice({ manifest: input.manifest, context: input.context, choice: input.reloadedChoice, userId: input.userId, dependencies: input.dependencies });
  const unsigned = { artifactVersion: "1" as const, phase: "human-choice-reloaded" as const, caseId: input.manifest.caseId, organizationId: input.manifest.organizationId, predecessorChoiceDigest: artifactDigest, canonicalReceiptDigest: resolved.receiptDigest, canonicalEventRef: resolved.event.eventId, canonicalOperationId: resolved.event.operationId, reloadedRuntimeRevision: resolved.stored.revision, independentlyReloaded: true as const, verifiedAt: input.verifiedAt };
  return { ...unsigned, artifactDigest: calibrationDigest(unsigned) };
}
