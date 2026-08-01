import { canonicalHash } from "../canonicalSerialization";
import {
  ACCESS_EVENT_VERSION, ANSWER_KEY_CUSTODY_VERSION, CASE_INVALIDATION_VERSION, CONTAMINATION_EVENT_VERSION,
  CORPUS_PARTITION_VERSION, CUSTODIAN_APPOINTMENT_VERSION, CUSTODIAN_REVOCATION_VERSION,
  EXPOSURE_EVENT_VERSION, INDEPENDENT_RELOAD_VERSION,
  PARTITION_INVALIDATION_VERSION, POLICY_APPROVAL_RECEIPT_VERSION, POLICY_APPROVAL_REQUEST_VERSION,
  QUALIFICATION_PACKET_VERSION, READINESS_ASSESSMENT_VERSION, RELEASE_AUTHORIZATION_VERSION,
  RELEASE_RECEIPT_VERSION, RESPONSE_TRANSPORT_VERSION, REVIEWER_ASSIGNMENT_VERSION,
  STUDY_FREEZE_VERSION, STUDY_SEED_CUSTODY_VERSION, TRAINING_PACKET_VERSION,
  type AccessEvent, type AnswerKeyCustodyManifest, type ContaminationEvent, type CorpusPartitionManifest,
  type CustodianAppointment, type CustodianRevocation, type ExposureEvent, type HashRecord,
  type HumanResponseTransportEnvelope, type IndependentReloadReceipt, type InvalidationRecord,
  type OperationsReadinessAssessment, type PacketReleaseAuthorization, type PacketReleaseReceipt,
  type PolicyApprovalReceipt, type PolicyApprovalRequest, type ReviewerAssignment, type StudyFreezeReceipt,
  type StudyPacket, type StudySeedCustodyRecord,
} from "./contracts";

const fail = (condition: boolean, message: string): void => { if (condition) throw new Error(message); };
const hashId = (prefix: string, hash: string): string => `${prefix}-${hash.slice(0, 24)}`;
const sorted = (values: string[]): string[] => [...new Set(values)].sort();
const requireRef = (value: string, label: string): void => fail(!value.trim(), `${label} required.`);

export function createPolicyApprovalRequest(input: Omit<PolicyApprovalRequest, "version" | "requestId" | "requestHash">): PolicyApprovalRequest {
  [input.policyId, input.policyHash, input.protocolHash, input.preregistrationHash, input.powerAnalysisRef, input.predecessorHash].forEach((value, index) => requireRef(value, `Policy request reference ${index}`));
  const refs: HashRecord[] = [input.qualificationThresholds, input.reliabilityThresholds, input.confidenceIntervalRules, input.minimumSampleAndFamilyFloors, input.corpusPartitionPolicy, input.reviewerCountPolicy, input.escalationPolicy, input.confidentialityPolicy, input.custodyPolicy, input.goldMethodEligibility, input.stoppingAndInvalidationRules];
  fail(refs.some((ref) => !ref.id || !/^[a-f0-9]{64}$/u.test(ref.hash)), "Policy request is incomplete.");
  const body = { ...input, version: POLICY_APPROVAL_REQUEST_VERSION, requestedScope: sorted(input.requestedScope) };
  const requestHash = canonicalHash(body);
  return { ...body, requestId: hashId("policy-approval-request", requestHash), requestHash };
}

export function createPolicyApprovalReceipt(input: Omit<PolicyApprovalReceipt, "version" | "receiptId" | "receiptHash">, request: PolicyApprovalRequest): PolicyApprovalReceipt {
  fail(input.requestId !== request.requestId || input.requestHash !== request.requestHash || input.policyId !== request.policyId || input.policyHash !== request.policyHash || input.protocolHash !== request.protocolHash || input.preregistrationHash !== request.preregistrationHash, "Policy approval binding rejected.");
  fail(input.state === "approved-operational", "Operational policy approval is forbidden in this infrastructure sprint.");
  fail(input.operationalAuthorization, "Test policy cannot authorize operations.");
  fail(input.state === "test-only-non-operational-policy-approval" && !input.fixtureLabels, "Test-only approval requires fixture labels.");
  const body = { ...input, version: POLICY_APPROVAL_RECEIPT_VERSION, approvalScope: sorted(input.approvalScope) };
  const receiptHash = canonicalHash(body);
  return { ...body, receiptId: hashId("policy-approval-receipt", receiptHash), receiptHash };
}

export function validatePolicyReceipt(receipt: PolicyApprovalReceipt, request: PolicyApprovalRequest): void {
  const { receiptId: _id, receiptHash: _hash, ...body } = receipt;
  fail(canonicalHash(body) !== receipt.receiptHash || receipt.receiptId !== hashId("policy-approval-receipt", receipt.receiptHash), "Altered policy receipt rejected.");
  fail(receipt.requestHash !== request.requestHash || receipt.policyHash !== request.policyHash, "Foreign policy receipt rejected.");
  fail(receipt.state !== "test-only-non-operational-policy-approval" || receipt.operationalAuthorization, "Policy is not a valid test-only receipt.");
}

export function appointCustodian(input: Omit<CustodianAppointment, "version" | "appointmentId" | "appointmentHash">): CustodianAppointment {
  fail(!input.pseudonymous || !input.principalId || !input.authorityRef || !input.scope.length, "Bounded pseudonymous appointment required.");
  fail(!input.fixtureOnly, "Real custodian appointment is forbidden.");
  const body = { ...input, version: CUSTODIAN_APPOINTMENT_VERSION, scope: sorted(input.scope), conflictDeclarations: sorted(input.conflictDeclarations), independenceDeclarations: sorted(input.independenceDeclarations) };
  const appointmentHash = canonicalHash(body);
  return { ...body, appointmentId: hashId("custodian-appointment", appointmentHash), appointmentHash };
}

export function revokeCustodian(input: Omit<CustodianRevocation, "version" | "revocationId" | "revocationHash">, appointment: CustodianAppointment): CustodianRevocation {
  fail(input.appointmentId !== appointment.appointmentId || input.appointmentHash !== appointment.appointmentHash, "Appointment revocation binding rejected.");
  const body = { ...input, version: CUSTODIAN_REVOCATION_VERSION };
  const revocationHash = canonicalHash(body);
  return { ...body, revocationId: hashId("custodian-revocation", revocationHash), revocationHash };
}

const prohibitedRolePairs: Array<[CustodianAppointment["role"], CustodianAppointment["role"]]> = [
  ["candidate-generator-developer", "answer-key-custodian"], ["packet-builder", "answer-key-custodian"],
  ["packet-builder", "confirmatory-corpus-custodian"], ["reviewer", "answer-key-custodian"],
  ["reviewer-assignment-custodian", "reviewer"], ["phase2-score-operator", "adjudication-record-custodian"],
  ["gold-admission-authority", "reviewer"],
];

export function validateRoleSeparation(appointments: CustodianAppointment[], revocations: CustodianRevocation[] = []): void {
  const revoked = new Set(revocations.map((item) => item.appointmentId));
  const active = appointments.filter((item) => !revoked.has(item.appointmentId) && !item.revokedByHash);
  const roles = new Map<string, Set<string>>();
  for (const item of active) roles.set(item.principalId, new Set([...(roles.get(item.principalId) ?? []), item.role]));
  for (const [principal, held] of roles) {
    fail(held.size >= 6, `Principal ${principal} holds excessive custody roles.`);
    for (const [left, right] of prohibitedRolePairs) fail(held.has(left) && held.has(right), `Prohibited role collision: ${left}/${right}.`);
  }
}

export function validatePartitionManifest(manifest: CorpusPartitionManifest, otherPartitions: CorpusPartitionManifest[] = []): void {
  const { manifestId: _id, manifestHash: _hash, ...body } = manifest;
  fail(canonicalHash(body) !== manifest.manifestHash || manifest.manifestId !== hashId("corpus-partition", manifest.manifestHash), "Corpus manifest identity rejected.");
  fail(!manifest.frozen || !manifest.cases.length, "Frozen partition must contain controlled cases.");
  fail(manifest.cases.some((item) => item.organizationId !== manifest.organizationId || item.fixtureLabels.confirmatoryStatus !== "not confirmatory"), "Only organization-scoped controlled fixtures are permitted.");
  const ids = new Set(manifest.cases.map((item) => item.caseId));
  for (const other of otherPartitions) {
    const overlap = other.cases.filter((item) => ids.has(item.caseId));
    fail(overlap.length > 0 && manifest.purpose !== other.purpose, "Cases cannot cross incompatible partitions.");
  }
  fail(manifest.purpose === "confirmatory-holdout" && manifest.cases.some((item) => item.priorExposure !== "none"), "Exposed case rejected from confirmatory partition.");
}

export function validateAnswerKeyCustody(manifest: AnswerKeyCustodyManifest): void {
  const { manifestId: _id, manifestHash: _hash, ...body } = manifest;
  fail(canonicalHash(body) !== manifest.manifestHash || !manifest.portableReleaseProhibited, "Answer-key custody integrity rejected.");
  fail(manifest.caseIds.length !== manifest.answerEntryDigests.length || manifest.answerEntryDigests.some((item) => !/^[a-f0-9]{64}$/u.test(item)), "Opaque answer-entry digests required.");
}

export function validateSeedCustody(record: StudySeedCustodyRecord): void {
  const { recordHash: _hash, ...body } = record;
  fail(canonicalHash(body) !== record.recordHash || !record.portableReleaseProhibited || !/^[a-f0-9]{64}$/u.test(record.seedDigest), "Study-seed custody integrity rejected.");
}

export function buildPacket(input: Omit<StudyPacket, "packetVersion" | "packetId" | "packetHash">): StudyPacket {
  fail(!input.fixtureLabels || input.fixtureLabels.evidentiaryStatus !== "non-semantic-evidence", "Controlled packet labels required.");
  fail(input.cases.some((item, index) => item.position !== index + 1), "Packet case order must be explicit and contiguous.");
  fail(input.purpose === "qualification" && (input.expectedAnswersVisible || input.feedbackPermitted), "Qualification answers and feedback must remain hidden.");
  const packetVersion = input.purpose === "training" ? TRAINING_PACKET_VERSION : QUALIFICATION_PACKET_VERSION;
  const body = { ...input, packetVersion, prohibitedFields: sorted(input.prohibitedFields) };
  const packetHash = canonicalHash(body);
  return { ...body, packetId: hashId(`${input.purpose}-packet`, packetHash), packetHash };
}

export function validatePacketSeparation(packet: StudyPacket, partitions: CorpusPartitionManifest[]): void {
  const own = partitions.find((item) => item.partitionId === packet.partitionId);
  fail(!own || own.purpose !== packet.purpose, "Packet partition purpose mismatch.");
  const protectedIds = new Set(partitions.filter((item) => item.purpose === "confirmatory-holdout").flatMap((item) => item.cases.map((entry) => entry.caseId)));
  fail(packet.cases.some((item) => protectedIds.has(item.caseId)), "Training or qualification case cannot become confirmatory.");
  const serialized = JSON.stringify(packet.cases);
  fail(/answerEntry|expectedDisposition|expectedRationale|retrievalScore|candidateTier|phase2|compositeScore/iu.test(serialized), "Portable packet contains prohibited answer or score data.");
}

export function createReviewerAssignment(input: Omit<ReviewerAssignment, "version" | "assignmentId" | "assignmentHash">, existing: ReviewerAssignment[], activeAppointments: CustodianAppointment[]): ReviewerAssignment {
  fail(!input.fixtureOnly, "Real reviewer assignment is forbidden.");
  fail(existing.some((item) => item.packetId === input.packetId && item.reviewerId === input.reviewerId), "Duplicate reviewer assignment rejected.");
  fail(existing.some((item) => item.packetId === input.packetId && item.reviewerPosition === input.reviewerPosition), "Reviewer position already assigned.");
  fail(input.priorJudgmentExposure, "Prior judgment exposure blocks assignment.");
  const reviewerAppointment = activeAppointments.find((item) => item.principalId === input.reviewerId && item.role === "reviewer" && !item.revokedByHash);
  fail(!reviewerAppointment || reviewerAppointment.organizationId !== input.organizationId || reviewerAppointment.studyId !== input.studyId, "Active organization-scoped reviewer appointment required.");
  const reviewerRoles = activeAppointments.filter((item) => item.principalId === input.reviewerId).map((item) => item.role);
  fail(reviewerRoles.includes("ground-truth-author") || reviewerRoles.includes("answer-key-custodian"), "Reviewer conflict rejected.");
  fail(reviewerRoles.includes("candidate-generator-developer"), "Candidate-generator developer cannot receive a confirmatory assignment.");
  if (input.reviewerPosition === 3) fail(existing.length < 2 || existing.some((item) => item.reviewerId === input.reviewerId), "Third review must be independent.");
  const body = { ...input, version: REVIEWER_ASSIGNMENT_VERSION, prohibitedConflicts: sorted(input.prohibitedConflicts) };
  const assignmentHash = canonicalHash(body);
  return { ...body, assignmentId: hashId("reviewer-assignment", assignmentHash), assignmentHash };
}

export function createStudyFreeze(input: Omit<StudyFreezeReceipt, "version" | "freezeId" | "freezeHash">, policy: PolicyApprovalReceipt, appointments: CustodianAppointment[], partitions: CorpusPartitionManifest[], answerKey: AnswerKeyCustodyManifest, seed: StudySeedCustodyRecord, exposures: ExposureEvent[]): StudyFreezeReceipt {
  fail(input.state === "operational", "Operational freeze is forbidden in this sprint.");
  validatePolicyReceipt(policy, { requestId: policy.requestId, requestHash: policy.requestHash, policyId: policy.policyId, policyHash: policy.policyHash } as PolicyApprovalRequest);
  fail(input.policyApprovalId !== policy.receiptId || input.policyApprovalHash !== policy.receiptHash || input.protocolHash !== policy.protocolHash || input.preregistrationHash !== policy.preregistrationHash, "Freeze policy, protocol, or preregistration binding rejected.");
  fail(!input.powerAnalysisRef || !input.answerKeyCustodyHash || !input.seedCustodyHash, "Freeze prerequisites missing.");
  validateAnswerKeyCustody(answerKey);
  validateSeedCustody(seed);
  fail(input.answerKeyCustodyHash !== answerKey.manifestHash || input.seedCustodyHash !== seed.recordHash, "Freeze custody binding rejected.");
  fail(input.sourceCommit !== "499b49371f97b7f86d1ac71f17f06d8dc537461e" || !input.implementationVersions.includes("oue-001-phase-4-study-operations/v1"), "Freeze source or implementation drift rejected.");
  validateRoleSeparation(appointments);
  const required = ["confirmatory-corpus-custodian", "answer-key-custodian", "study-seed-custodian", "packet-release-custodian", "reviewer-assignment-custodian", "exposure-monitoring-custodian"];
  fail(required.some((role) => !appointments.some((item) => item.role === role && !item.revokedByHash)), "Required custodian missing.");
  fail(partitions.some((item) => !item.frozen) || partitions.length < 4, "Complete frozen partitions required.");
  const confirmatoryIds = new Set(partitions.filter((item) => item.purpose === "confirmatory-holdout").map((item) => item.partitionId));
  fail(exposures.some((item) => item.partitionId && confirmatoryIds.has(item.partitionId)), "Confirmatory exposure blocks freeze.");
  const body = { ...input, version: STUDY_FREEZE_VERSION, partitionHashes: sorted(input.partitionHashes), custodianAppointmentHashes: sorted(input.custodianAppointmentHashes), packetVersions: sorted(input.packetVersions), rubricVersions: sorted(input.rubricVersions), implementationVersions: sorted(input.implementationVersions) };
  const freezeHash = canonicalHash(body);
  return { ...body, freezeId: hashId("study-freeze", freezeHash), freezeHash };
}

export function authorizePacketRelease(input: Omit<PacketReleaseAuthorization, "version" | "authorizationId" | "authorizationHash">, packet: StudyPacket, assignment: ReviewerAssignment, policy: PolicyApprovalReceipt, freeze: StudyFreezeReceipt, revokedAppointmentHashes: string[] = []): PacketReleaseAuthorization {
  fail(input.operationalReleaseAuthorized, "Operational packet release is forbidden.");
  const { freezeId: _freezeId, freezeHash: _freezeHash, ...freezeBody } = freeze;
  const { assignmentId: _assignmentId, assignmentHash: _assignmentHash, ...assignmentBody } = assignment;
  fail(canonicalHash(freezeBody) !== freeze.freezeHash || freeze.freezeId !== hashId("study-freeze", freeze.freezeHash), "Valid study freeze required.");
  fail(canonicalHash(assignmentBody) !== assignment.assignmentHash || assignment.assignmentId !== hashId("reviewer-assignment", assignment.assignmentHash), "Valid reviewer assignment required.");
  fail(input.packetHash !== packet.packetHash || input.assignmentHash !== assignment.assignmentHash || input.policyApprovalHash !== policy.receiptHash || input.freezeHash !== freeze.freezeHash, "Packet release predecessor binding rejected.");
  fail(!input.noDisqualifyingExposure || revokedAppointmentHashes.includes(input.releaseCustodianAppointmentHash), "Exposure or revoked authority blocks release.");
  fail(policy.state !== "test-only-non-operational-policy-approval" || !freeze.fixtureOnly || !input.fixtureOnly, "Only controlled test release may be exercised.");
  const body = { ...input, version: RELEASE_AUTHORIZATION_VERSION };
  const authorizationHash = canonicalHash(body);
  return { ...body, authorizationId: hashId("packet-release-authorization", authorizationHash), authorizationHash };
}

export function recordPacketRelease(input: Omit<PacketReleaseReceipt, "version" | "receiptId" | "receiptHash">, authorization: PacketReleaseAuthorization): PacketReleaseReceipt {
  fail(input.authorizationId !== authorization.authorizationId || input.authorizationHash !== authorization.authorizationHash || input.packetHash !== authorization.packetHash || input.operationalRelease, "Release receipt binding rejected.");
  const body = { ...input, version: RELEASE_RECEIPT_VERSION };
  const receiptHash = canonicalHash(body);
  return { ...body, receiptId: hashId("packet-release-receipt", receiptHash), receiptHash };
}

export function appendAccessEvent(input: Omit<AccessEvent, "version" | "eventId" | "eventHash">, existing: AccessEvent[]): AccessEvent {
  fail(input.sequence !== existing.length + 1 || input.priorEventHash !== (existing.at(-1)?.eventHash ?? "genesis"), "Access ledger is append-only.");
  const body = { ...input, version: ACCESS_EVENT_VERSION };
  const eventHash = canonicalHash(body);
  return { ...body, eventId: hashId("access-event", eventHash), eventHash };
}

export function appendExposureEvent(input: Omit<ExposureEvent, "version" | "eventId" | "eventHash">, existing: ExposureEvent[]): ExposureEvent {
  fail(input.sequence !== existing.length + 1 || input.priorEventHash !== (existing.at(-1)?.eventHash ?? "genesis"), "Exposure ledger is append-only.");
  fail(existing.some((item) => item.studyId !== input.studyId || item.organizationId !== input.organizationId), "Cross-organization exposure ledger write rejected.");
  const body = { ...input, version: EXPOSURE_EVENT_VERSION };
  const eventHash = canonicalHash(body);
  return { ...body, eventId: hashId("exposure-event", eventHash), eventHash };
}

export function recordContamination(exposure: ExposureEvent, affectedArtifactHashes: string[]): ContaminationEvent {
  const body = { version: CONTAMINATION_EVENT_VERSION, exposureEventId: exposure.eventId, exposureEventHash: exposure.eventHash, affectedArtifactHashes: sorted(affectedArtifactHashes), disposition: exposure.severity };
  const eventHash = canonicalHash(body);
  return { ...body, eventId: hashId("contamination-event", eventHash), eventHash };
}

export function invalidateArtifact(input: Omit<InvalidationRecord, "version" | "invalidationId" | "invalidationHash">): InvalidationRecord {
  const version = input.scope === "case" ? CASE_INVALIDATION_VERSION : PARTITION_INVALIDATION_VERSION;
  const body = { ...input, version, downstreamArtifactHashes: sorted(input.downstreamArtifactHashes), reviewerEffects: sorted(input.reviewerEffects), packetEffects: sorted(input.packetEffects) };
  const invalidationHash = canonicalHash(body);
  return { ...body, invalidationId: hashId(`${input.scope}-invalidation`, invalidationHash), invalidationHash };
}

export function createResponseEnvelope(input: Omit<HumanResponseTransportEnvelope, "version" | "envelopeId" | "envelopeHash">, release: PacketReleaseReceipt): HumanResponseTransportEnvelope {
  fail(input.genuineAdjudication || input.fixtureLabels.humanStatus !== "non-human" || input.fixtureLabels.evidentiaryStatus !== "non-semantic-evidence", "Only synthetic non-evidentiary transport is permitted.");
  fail(input.releaseReceiptId !== release.receiptId || input.releaseReceiptHash !== release.receiptHash || input.packetHash !== release.packetHash, "Valid release receipt required.");
  fail(input.reviewerSelfConfidence !== null && (input.reviewerSelfConfidence < 0 || input.reviewerSelfConfidence > 1), "Self-confidence out of range.");
  const body = { ...input, version: RESPONSE_TRANSPORT_VERSION, citedPacketFields: sorted(input.citedPacketFields) };
  const envelopeHash = canonicalHash(body);
  return { ...body, envelopeId: hashId("response-envelope", envelopeHash), envelopeHash };
}

export function verifyResponseEnvelope(envelope: HumanResponseTransportEnvelope): void {
  const { envelopeId: _id, envelopeHash: _hash, ...body } = envelope;
  fail(canonicalHash(body) !== envelope.envelopeHash || envelope.envelopeId !== hashId("response-envelope", envelope.envelopeHash), "Response envelope mutation rejected.");
}

export function createIndependentReloadReceipt(artifactType: string, artifact: Record<string, unknown>, reloaded: Record<string, unknown>): IndependentReloadReceipt {
  const originalHash = canonicalHash(artifact); const reloadedHash = canonicalHash(reloaded);
  const body = { version: INDEPENDENT_RELOAD_VERSION, artifactType, artifactId: String(artifact.id ?? artifact.packetId ?? artifact.envelopeId ?? "bounded-artifact"), originalHash, reloadedHash, serializationVersion: "canonical-serialization/v1" as const, processClass: "independent-node-process" as const, verified: originalHash === reloadedHash };
  const receiptHash = canonicalHash(body);
  return { ...body, receiptId: hashId("independent-reload", receiptHash), receiptHash };
}

export function assessOperationsReadiness(studyId: string, requiredGateResults: Record<string, boolean>, invalidated = false): OperationsReadinessAssessment {
  const disposition = invalidated ? "invalidated" as const : Object.values(requiredGateResults).every(Boolean) ? "ready-for-independent-operational-review" as const : "not-ready" as const;
  const body = { version: READINESS_ASSESSMENT_VERSION, studyId, requiredGateResults: Object.fromEntries(Object.entries(requiredGateResults).sort(([a], [b]) => a.localeCompare(b))), disposition, operationalAuthorization: false as const, prohibitedClaims: ["study-approved", "reviewers-authorized", "corpus-approved", "confirmatory-study-active", "semantic-evidence-valid", "gold-admitted"].sort() };
  const assessmentHash = canonicalHash(body);
  return { ...body, assessmentId: hashId("operations-readiness", assessmentHash), assessmentHash };
}
