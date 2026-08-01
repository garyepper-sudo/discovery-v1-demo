export const STUDY_OPERATIONS_VERSION = "oue-001-phase-4-study-operations/v1" as const;
export const POLICY_APPROVAL_REQUEST_VERSION = "oue-001-phase-4-policy-approval-request/v1" as const;
export const POLICY_APPROVAL_RECEIPT_VERSION = "oue-001-phase-4-policy-approval-receipt/v1" as const;
export const CUSTODIAN_APPOINTMENT_VERSION = "oue-001-phase-4-custodian-appointment/v1" as const;
export const CUSTODIAN_REVOCATION_VERSION = "oue-001-phase-4-custodian-revocation/v1" as const;
export const CORPUS_PARTITION_VERSION = "oue-001-phase-4-corpus-partition/v1" as const;
export const CASE_MANIFEST_VERSION = "oue-001-phase-4-case-manifest/v1" as const;
export const ANSWER_KEY_CUSTODY_VERSION = "oue-001-phase-4-answer-key-custody/v1" as const;
export const STUDY_SEED_CUSTODY_VERSION = "oue-001-phase-4-seed-custody/v1" as const;
export const TRAINING_PACKET_VERSION = "oue-001-phase-4-training-packet/v1" as const;
export const QUALIFICATION_PACKET_VERSION = "oue-001-phase-4-qualification-packet/v1" as const;
export const REVIEWER_ASSIGNMENT_VERSION = "oue-001-phase-4-reviewer-assignment/v1" as const;
export const RELEASE_AUTHORIZATION_VERSION = "oue-001-phase-4-release-authorization/v1" as const;
export const RELEASE_RECEIPT_VERSION = "oue-001-phase-4-release-receipt/v1" as const;
export const ACCESS_EVENT_VERSION = "oue-001-phase-4-access-event/v1" as const;
export const EXPOSURE_EVENT_VERSION = "oue-001-phase-4-exposure-event/v1" as const;
export const CONTAMINATION_EVENT_VERSION = "oue-001-phase-4-contamination-event/v1" as const;
export const CASE_INVALIDATION_VERSION = "oue-001-phase-4-case-invalidation/v1" as const;
export const PARTITION_INVALIDATION_VERSION = "oue-001-phase-4-partition-invalidation/v1" as const;
export const STUDY_FREEZE_VERSION = "oue-001-phase-4-study-freeze/v1" as const;
export const RESPONSE_TRANSPORT_VERSION = "oue-001-phase-4-response-transport/v1" as const;
export const INDEPENDENT_RELOAD_VERSION = "oue-001-phase-4-independent-reload/v1" as const;
export const READINESS_ASSESSMENT_VERSION = "oue-001-phase-4-readiness/v1" as const;
export const OPERATIONS_LEDGER_VERSION = "oue-001-phase-4-operations-ledger/v1" as const;

export const CONTROLLED_FIXTURE_LABELS = {
  fixtureClass: "controlled structural fixture",
  transportClass: "controlled transport fixture",
  humanStatus: "non-human",
  modelStatus: "non-model",
  evidentiaryStatus: "non-semantic-evidence",
  operationalStatus: "not operationally approved",
  confirmatoryStatus: "not confirmatory",
  goldStatus: "not gold-eligible",
} as const;

export type HashRecord = { id: string; hash: string };
export type PolicyState = "draft" | "test-only-non-operational-policy-approval" | "approved-operational" | "superseded" | "revoked";
export type PartitionPurpose = "training" | "qualification" | "protocol-development" | "confirmatory-holdout" | "negative-controls" | "ambiguity-controls" | "insufficient-context-controls";
export type CustodianRole =
  | "study-policy-authority" | "confirmatory-corpus-custodian" | "answer-key-custodian"
  | "study-seed-custodian" | "packet-release-custodian" | "reviewer-assignment-custodian"
  | "reviewer-training-custodian" | "reviewer-qualification-custodian"
  | "exposure-monitoring-custodian" | "adjudication-record-custodian"
  | "phase2-score-operator" | "gold-admission-authority" | "audit-authority"
  | "candidate-generator-developer" | "packet-builder" | "reviewer" | "ground-truth-author";

export type PolicyApprovalRequest = {
  version: typeof POLICY_APPROVAL_REQUEST_VERSION; requestId: string; policyId: string; policyHash: string;
  protocolHash: string; preregistrationHash: string; qualificationThresholds: HashRecord;
  reliabilityThresholds: HashRecord; confidenceIntervalRules: HashRecord; powerAnalysisRef: string;
  minimumSampleAndFamilyFloors: HashRecord; corpusPartitionPolicy: HashRecord; reviewerCountPolicy: HashRecord;
  escalationPolicy: HashRecord; confidentialityPolicy: HashRecord; custodyPolicy: HashRecord;
  goldMethodEligibility: HashRecord; stoppingAndInvalidationRules: HashRecord; requestedScope: string[];
  predecessorHash: string; requestHash: string;
};

export type PolicyApprovalReceipt = {
  version: typeof POLICY_APPROVAL_RECEIPT_VERSION; receiptId: string; requestId: string; requestHash: string;
  policyId: string; policyHash: string; protocolHash: string; preregistrationHash: string;
  approvingAuthority: string; approvalScope: string[]; approvedAt: string; state: PolicyState;
  supersedesReceiptHash: string | null; revokedByReceiptHash: string | null; operationalAuthorization: boolean;
  fixtureLabels?: typeof CONTROLLED_FIXTURE_LABELS; receiptHash: string;
};

export type CustodianAppointment = {
  version: typeof CUSTODIAN_APPOINTMENT_VERSION; appointmentId: string; studyId: string; organizationId: string;
  principalId: string; pseudonymous: true; role: CustodianRole; authorityRef: string; scope: string[];
  appointmentRevision: number; startsAt: string; endsAt: string | null; conflictDeclarations: string[];
  independenceDeclarations: string[]; priorAppointmentHash: string | null; supersededByHash: string | null;
  revokedByHash: string | null; fixtureOnly: boolean; appointmentHash: string;
};

export type CustodianRevocation = {
  version: typeof CUSTODIAN_REVOCATION_VERSION; revocationId: string; appointmentId: string;
  appointmentHash: string; authorityRef: string; reason: string; revokedAt: string; revocationHash: string;
};

export type CaseManifest = {
  version: typeof CASE_MANIFEST_VERSION; caseId: string; organizationId: string; caseHash: string;
  candidateEdges: HashRecord[]; sourceRevisions: HashRecord[]; propositionFamily: string; difficultyStratum: string;
  lexicalOverlapStratum: string; modalityStratum: string; polarityStratum: string; temporalStratum: string;
  priorExposure: "none" | "training" | "qualification" | "development" | "contaminated";
  fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS;
};

export type CorpusPartitionManifest = {
  version: typeof CORPUS_PARTITION_VERSION; manifestId: string; studyId: string; organizationId: string;
  partitionId: string; purpose: PartitionPurpose; cases: CaseManifest[]; propositionFamilyDistribution: Record<string, number>;
  answerKeyCustodyRef: string; authorizationScope: string[]; disclosureConstraints: string[]; frozen: boolean;
  predecessorHash: string; fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS; manifestHash: string;
};

export type AnswerKeyCustodyManifest = {
  version: typeof ANSWER_KEY_CUSTODY_VERSION; manifestId: string; studyId: string; partitionId: string;
  custodianAppointmentId: string; custodianAppointmentHash: string; caseIds: string[]; answerEntryDigests: string[];
  accessPolicyRef: string; permittedOperations: string[]; portableReleaseProhibited: true;
  exposureHistoryHash: string; frozenAt: string; predecessorHash: string;
  fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS; manifestHash: string;
};

export type StudySeedCustodyRecord = {
  version: typeof STUDY_SEED_CUSTODY_VERSION; seedId: string; seedDigest: string; studyId: string;
  custodianAppointmentId: string; custodianAppointmentHash: string; permittedAlgorithms: string[];
  assignmentAlgorithmVersion: string; portableReleaseProhibited: true; rotationRuleRef: string;
  supersedesSeedHash: string | null; exposureHistoryHash: string; fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS;
  recordHash: string;
};

export type PortableCase = { position: number; caseId: string; caseHash: string; candidateEdgeIds: string[]; promptFields: Record<string, string>; rubricRef: string };
export type StudyPacket = {
  packetVersion: typeof TRAINING_PACKET_VERSION | typeof QUALIFICATION_PACKET_VERSION; packetId: string;
  studyId: string; organizationId: string; partitionId: string; purpose: "training" | "qualification";
  cases: PortableCase[]; expectedAnswersVisible: boolean; feedbackPermitted: boolean; policyRef: string;
  prohibitedFields: string[]; predecessorHash: string; fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS; packetHash: string;
};

export type ReviewerAssignment = {
  version: typeof REVIEWER_ASSIGNMENT_VERSION; assignmentId: string; studyId: string; organizationId: string;
  packetId: string; packetHash: string; reviewerId: string; eligibilityReceiptId: string; eligibilityReceiptHash: string;
  assignmentCustodianId: string; assignmentCustodianHash: string; assignmentAlgorithmVersion: string;
  reviewerPosition: 1 | 2 | 3; releaseAuthorizationRef: string; assignedAt: string;
  prohibitedConflicts: string[]; priorJudgmentExposure: false; fixtureOnly: boolean; assignmentHash: string;
};

export type StudyFreezeReceipt = {
  version: typeof STUDY_FREEZE_VERSION; freezeId: string; studyId: string; state: "test-only-non-operational-study-freeze" | "operational";
  policyApprovalId: string; policyApprovalHash: string; protocolHash: string; preregistrationHash: string;
  powerAnalysisRef: string; partitionHashes: string[]; answerKeyCustodyHash: string; seedCustodyHash: string;
  custodianAppointmentHashes: string[]; packetVersions: string[]; rubricVersions: string[];
  reviewerEligibilityPolicyRef: string; assignmentAlgorithmVersion: string; releasePolicyRef: string;
  exposurePolicyRef: string; stoppingRulesRef: string; invalidationRulesRef: string; implementationVersions: string[];
  sourceCommit: string; frozenAt: string; fixtureOnly: boolean; predecessorHash: string; freezeHash: string;
};

export type PacketReleaseAuthorization = {
  version: typeof RELEASE_AUTHORIZATION_VERSION; authorizationId: string; studyId: string; packetId: string;
  packetHash: string; assignmentId: string; assignmentHash: string; policyApprovalHash: string; freezeHash: string;
  reviewerEligibilityHash: string; releaseCustodianAppointmentHash: string; noDisqualifyingExposure: boolean;
  fixtureOnly: boolean; operationalReleaseAuthorized: false; authorizationHash: string;
};

export type PacketReleaseReceipt = {
  version: typeof RELEASE_RECEIPT_VERSION; receiptId: string; authorizationId: string; authorizationHash: string;
  packetId: string; packetHash: string; assignmentId: string; releaseCustodianId: string; releasedAt: string;
  transportClass: "controlled-in-memory-transport"; accessExpirationRule: string; fixtureOnly: true;
  operationalRelease: false; receiptHash: string;
};

export type AccessKind = "packet" | "answer-key" | "study-seed";
export type ExposureKind = "expected-label" | "retrieval-score" | "other-reviewer-judgment" | "downstream-score" | "unauthorized-source-context" | "cross-organization-attempt" | "packet-mutation" | "rubric-drift" | "model-version-drift" | "source-revision-drift";
export type AccessEvent = { version: typeof ACCESS_EVENT_VERSION; eventId: string; sequence: number; studyId: string; organizationId: string; actorId: string; kind: AccessKind; artifactId: string; authorizationRef: string; occurredAt: string; priorEventHash: string; eventHash: string };
export type ExposureEvent = { version: typeof EXPOSURE_EVENT_VERSION; eventId: string; sequence: number; studyId: string; organizationId: string; actorId: string; kind: ExposureKind; caseId: string | null; partitionId: string | null; severity: "record-only" | "invalidate-case" | "invalidate-reviewer" | "invalidate-partition" | "invalidate-study"; occurredAt: string; priorEventHash: string; eventHash: string };
export type ContaminationEvent = { version: typeof CONTAMINATION_EVENT_VERSION; eventId: string; exposureEventId: string; exposureEventHash: string; affectedArtifactHashes: string[]; disposition: ExposureEvent["severity"]; eventHash: string };
export type InvalidationRecord = { version: typeof CASE_INVALIDATION_VERSION | typeof PARTITION_INVALIDATION_VERSION; invalidationId: string; studyId: string; affectedId: string; affectedHash: string; exposureOrDefectRef: string; authorityRef: string; scope: "case" | "partition"; reason: string; downstreamArtifactHashes: string[]; reviewerEffects: string[]; packetEffects: string[]; retrainingPermitted: boolean; replacementRequired: boolean; priorInvalidationHash: string | null; supersededByHash: string | null; invalidationHash: string };

export type HumanResponseTransportEnvelope = {
  version: typeof RESPONSE_TRANSPORT_VERSION; envelopeId: string; releaseReceiptId: string; releaseReceiptHash: string;
  packetId: string; packetHash: string; reviewerId: string; assignmentId: string; payloadSchemaVersion: string;
  submittedDisposition: string; rationale: string; citedPacketFields: string[]; abstentionReason: string | null;
  reviewerSelfConfidence: number | null; submittedAt: string; transportReceipt: string;
  fixtureLabels: typeof CONTROLLED_FIXTURE_LABELS; genuineAdjudication: false; envelopeHash: string;
};

export type IndependentReloadReceipt = { version: typeof INDEPENDENT_RELOAD_VERSION; receiptId: string; artifactType: string; artifactId: string; originalHash: string; reloadedHash: string; serializationVersion: "canonical-serialization/v1"; processClass: "independent-node-process"; verified: boolean; receiptHash: string };
export type ReadinessDisposition = "ready-for-independent-operational-review" | "not-ready" | "invalidated";
export type OperationsReadinessAssessment = { version: typeof READINESS_ASSESSMENT_VERSION; assessmentId: string; studyId: string; requiredGateResults: Record<string, boolean>; disposition: ReadinessDisposition; operationalAuthorization: false; prohibitedClaims: string[]; assessmentHash: string };
