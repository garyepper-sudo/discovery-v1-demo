import { createHash } from "node:crypto";

import { validateOnboardingTestEnvironment } from "../../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId, onboardingTestOrganizationId } from "../../../lib/onboarding/testing/onboardingTestOrganization";
import { materialAcquisitionEnvelopeDigest } from "../../improvements/candidateEnvelope";
import {
  CALIBRATION_MANIFEST_SCHEMA_VERSION, CALIBRATION_PROGRAM_ID,
  type CalibrationPhase, type CalibrationPreregistrationManifest, type CalibrationValidationContext,
  type ExecutionAuthorization, type HumanDisposition,
} from "./contracts";

export function canonicalCalibrationJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalCalibrationJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalCalibrationJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function calibrationDigest(value: unknown): string {
  return createHash("sha256").update(canonicalCalibrationJson(value)).digest("hex");
}
export function generateCalibrationOrganizationId(input: { caseSeed: string; principalSeed: string; environment: Readonly<Record<string, string | undefined>> }): string {
  const summary = validateOnboardingTestEnvironment(input.environment);
  if (summary.environment !== "development") throw new Error("Calibration organization identity requires validated development.");
  if (!input.caseSeed.trim() || !input.principalSeed.trim()) throw new Error("Calibration identity seeds are required.");
  return onboardingTestOrganizationId({ consumerId: `calibration:${input.principalSeed}`, requestId: `case:${input.caseSeed}` });
}
export function candidateSetDigest(manifest: Pick<CalibrationPreregistrationManifest, "candidateEnvelopes">): string {
  return calibrationDigest(manifest.candidateEnvelopes.map((item) => item.digest).sort());
}
export function manifestDigest(manifest: Omit<CalibrationPreregistrationManifest, "manifestDigest">): string {
  return calibrationDigest(manifest);
}
const exact = (value: string, name: string) => { if (!value || value.trim() !== value || value === "*") throw new Error(`Calibration ${name} is invalid.`); };
const forbiddenKey = /selectorResult|predictedSelector|expectedWinner|credential|token|password|privateSource|withheldValue/i;

export function validatePreregistrationManifest(manifest: CalibrationPreregistrationManifest, context: CalibrationValidationContext): void {
  if (manifest.manifestSchemaVersion !== CALIBRATION_MANIFEST_SCHEMA_VERSION || manifest.calibrationProgramId !== CALIBRATION_PROGRAM_ID || manifest.phase !== "preregistered") throw new Error("Calibration manifest version or phase is invalid.");
  for (const [value, name] of [[manifest.caseId, "case ID"], [manifest.classificationRationale, "classification rationale"], [manifest.repositoryCommit, "repository commit"], [manifest.selector.sourceHash, "selector hash"], [manifest.organizationId, "organization ID"], [manifest.principal.pseudonymousRef, "principal"], [manifest.principal.authorityRef, "authority"], [manifest.question.questionId, "Question ID"], [manifest.question.exactText, "Question text"], [manifest.unknown.unknownId, "Unknown ID"], [manifest.unknown.revisionRef, "Unknown revision"], [manifest.unknown.exactText, "Unknown text"], [manifest.unknown.whyItMatters, "Unknown importance"], [manifest.understandingRef, "Understanding"], [manifest.authorizedUnderstandingSummary, "authorized Understanding summary"], [manifest.evidenceBoundaryDigest, "Evidence boundary digest"], [manifest.preregisteredAt, "timestamp"]] as const) exact(value, name);
  if (!isOnboardingTestOrganizationId(manifest.organizationId)) throw new Error("Calibration organization ID is not canonical development identity.");
  if (manifest.proposedClassification !== "live-independent-calibration" && manifest.proposedClassification !== "controlled-protocol-fixture") throw new Error("Calibration manifest classification is invalid.");
  if (manifest.repositoryCommit !== context.repositoryCommit) throw new Error("Calibration repository commit drifted.");
  if (manifest.selector.identity !== "material-information-acquisition-shadow-selector-v1" || manifest.versions.candidateEnvelopeSchema !== "1" || manifest.versions.candidateEnvelopeProjector !== "1" || manifest.versions.confidenceImprovementEvent !== "3" || manifest.versions.outcomeObservation !== "1") throw new Error("Calibration contract version mismatch.");
  const declared = [manifest.objectiveVersion, manifest.optimizationContextVersion];
  if (declared.some((value) => typeof value === "string" ? !value.trim() : !["not-applicable", "unavailable", "withheld", "unmeasured"].includes(value.state))) throw new Error("Calibration governed declaration is invalid.");
  if (declared.some((value) => typeof value !== "string" && value.state !== "not-applicable")) throw new Error("Calibration Objective and Context must use exact versions or explicit not-applicable.");
  if (!Number.isFinite(Date.parse(manifest.preregisteredAt))) throw new Error("Calibration preregistration timestamp is invalid.");
  const sourceEntries = Object.entries(manifest.frozenSourceHashes);
  if (!sourceEntries.length || sourceEntries.some(([path, hash]) => !path || context.sourceHashes[path] !== hash)) throw new Error("Calibration frozen source hash mismatch.");
  if (!Object.values(manifest.frozenSourceHashes).includes(manifest.selector.sourceHash)) throw new Error("Calibration selector source hash is not frozen.");
  const question = context.existingQuestions.find((item) => item.organizationId === manifest.organizationId && item.questionId === manifest.question.questionId && item.revision === manifest.question.revision);
  const unknown = context.existingUnknowns.find((item) => item.organizationId === manifest.organizationId && item.questionId === manifest.question.questionId && item.unknownId === manifest.unknown.unknownId && item.revisionRef === manifest.unknown.revisionRef);
  if (!question || !unknown) throw new Error("Calibration exact same-organization Question or Unknown is unavailable.");
  if (!manifest.understandingRef.startsWith(`organization:${manifest.organizationId}:`)) throw new Error("Calibration Understanding is cross-organization.");
  const envelopes = manifest.candidateEnvelopes;
  if (envelopes.length < 2 || envelopes.some(({ envelope, digest, candidateType, neutralDescription, limitations }) => !candidateType.trim() || !neutralDescription.trim() || !Array.isArray(limitations) || envelope.schemaVersion !== "1" || !envelope.envelopeId.trim() || envelope.organizationId !== manifest.organizationId || envelope.question.questionId !== manifest.question.questionId || envelope.question.revision !== manifest.question.revision || envelope.unknown.unknownId !== manifest.unknown.unknownId || envelope.unknown.unknownVersionRef !== manifest.unknown.revisionRef || materialAcquisitionEnvelopeDigest(envelope) !== digest)) throw new Error("Calibration candidate envelope is incomplete, mutated, or cross-organization.");
  const candidateIds = envelopes.map((item) => item.envelope.candidate.candidateId);
  const byId = new Map(envelopes.map((item) => [item.envelope.candidate.candidateId, item.envelope.candidate.actionType]));
  const neutral = [...candidateIds].sort((a, b) => byId.get(a)!.localeCompare(byId.get(b)!, "en") || a.localeCompare(b, "en"));
  if (new Set(candidateIds).size !== candidateIds.length || canonicalCalibrationJson(manifest.neutralDisplayOrder) !== canonicalCalibrationJson(neutral)) throw new Error("Calibration neutral display order is invalid.");
  if (candidateSetDigest(manifest) !== manifest.candidateSetDigest) throw new Error("Calibration candidate-set digest mismatch.");
  if (canonicalCalibrationJson(manifest.allowedHumanDispositions) !== canonicalCalibrationJson(["authorize", "decline", "defer"]) || canonicalCalibrationJson(manifest.executionAuthorizationChoices) !== canonicalCalibrationJson(["execute-existing-local-read-only-operation", "do-not-execute", "defer-execution"]) || !manifest.plannedComparisonMeasures.length || !manifest.plannedDisagreementClassifications.length) throw new Error("Calibration decision protocol is incomplete.");
  if (!manifest.sourceReferenceDigests.length || manifest.sourceReferenceDigests.some((item) => !item)) throw new Error("Calibration source-reference digests are incomplete.");
  if (!["untouched", "exposed", "not-applicable"].includes(manifest.holdoutStatus) || !["none", "human-packet", "selector-output"].includes(manifest.priorExposureStatus) || !["available", "unavailable", "not-applicable", "unmeasured"].includes(manifest.outcomeAvailability)) throw new Error("Calibration exposure or outcome declaration is invalid.");
  if (manifest.outcomeAvailability === "available" && manifest.missingOutcomeFields.length) throw new Error("Calibration outcome declaration contradicts missing fields.");
  if (!Object.values(manifest.hardSafetyGates).every(Boolean)) throw new Error("Calibration hard safety gate failed.");
  const portable = canonicalCalibrationJson(manifest);
  if (forbiddenKey.test(portable) || /(?:\/Users\/|[A-Za-z]:\\)/.test(portable)) throw new Error("Calibration manifest contains forbidden or machine-specific content.");
  const { manifestDigest: supplied, ...unsigned } = manifest;
  if (manifestDigest(unsigned) !== supplied) throw new Error("Calibration manifest digest mismatch.");
}

export function assertCalibrationDecisionConsistency(disposition: HumanDisposition, executionAuthorization: ExecutionAuthorization): void {
  if (!["authorize", "decline", "defer"].includes(disposition) || !["execute-existing-local-read-only-operation", "do-not-execute", "defer-execution"].includes(executionAuthorization)) {
    throw new Error("Calibration decision vocabulary is invalid.");
  }
  const valid = disposition === "authorize"
    || (disposition === "decline" && executionAuthorization === "do-not-execute")
    || (disposition === "defer" && executionAuthorization === "defer-execution");
  if (!valid) throw new Error(`Calibration ${disposition} disposition is inconsistent with ${executionAuthorization}.`);
}

const transitions: Record<CalibrationPhase, CalibrationPhase[]> = {
  draft: ["preregistered", "blocked"], preregistered: ["human-choice-recorded", "blocked"],
  "human-choice-recorded": ["human-choice-reloaded", "blocked"], "human-choice-reloaded": ["selector-compared", "blocked"],
  "selector-compared": ["outcome-observed", "closed", "blocked"], "outcome-observed": ["closed", "blocked"], closed: [], blocked: [],
};
export function assertCalibrationTransition(from: CalibrationPhase, to: CalibrationPhase): void {
  if (!transitions[from].includes(to)) throw new Error(`Calibration transition ${from} -> ${to} is forbidden.`);
}

export const CASE_001_TERMINAL_STATUS = Object.freeze({
  caseId: "case-001", phase: "blocked" as const, classification: "non-evaluative" as const,
  humanPacketDisplayed: true, humanResponseReceived: true, validCanonicalPreregistration: false,
  humanChoicePersisted: false, selectorImportedOrExecuted: false, operationExecuted: false,
  runtimeChangedAfterResponse: false, evidenceOrOutcomeRecorded: false, countsTowardLiveEvidenceGate: false,
  countsAsUntouchedHoldout: false, completedLiveCaseCount: 0,
});
