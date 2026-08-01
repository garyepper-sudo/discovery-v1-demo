import { canonicalHash } from "../canonicalSerialization";
import {
  ANSWER_KEY_CUSTODY_VERSION, CASE_MANIFEST_VERSION, CONTROLLED_FIXTURE_LABELS,
  CORPUS_PARTITION_VERSION, STUDY_SEED_CUSTODY_VERSION,
  type AnswerKeyCustodyManifest, type CaseManifest, type CorpusPartitionManifest,
  type CustodianAppointment, type HashRecord, type PolicyApprovalReceipt,
  type PolicyApprovalRequest, type StudySeedCustodyRecord,
} from "./contracts";
import { appointCustodian, createPolicyApprovalReceipt, createPolicyApprovalRequest } from "./studyOperations";

export const STUDY_ID = "oue-001-phase-4-controlled-operations-fixture";
export const ORGANIZATION_ID = "oue-001-controlled-fixture-organization";
export const PROTOCOL_HASH = "e9e989b5ec50a4303bce1fb98949d9c00376398162a5ef190136d3e6625dd07a";
export const PREREGISTRATION_HASH = "52b255b595abc830dd82fce22e00e7442e6fbb5bc6676bceb13d1bec610a1921";
export const PHASE3_RESULT_HASH = "5c4ddb823fe9a3b227b0b22a5f9459a1f49b6fd22506f9164a1fbd7944a5033a";
export const PHASE4_INFRASTRUCTURE_RESULT_HASH = "381f88d74a84c336f8ddf1269c6c0200d70daba30f7d5dc8f6c3847e514136d1";
export const PHASE4_INFRASTRUCTURE_LEDGER_HASH = "8ad40fc64ff2cdd6e8ae33e8974983b5ed3495f3d810c501916f8f7f77b19ad1";

const ref = (id: string): HashRecord => ({ id, hash: canonicalHash({ id, fixture: true }) });

export function buildPolicyFixture(): { request: PolicyApprovalRequest; receipt: PolicyApprovalReceipt } {
  const request = createPolicyApprovalRequest({
    policyId: "controlled-test-policy/v1", policyHash: canonicalHash("controlled-test-policy/v1"),
    protocolHash: PROTOCOL_HASH, preregistrationHash: PREREGISTRATION_HASH,
    qualificationThresholds: ref("qualification-thresholds"), reliabilityThresholds: ref("reliability-thresholds"),
    confidenceIntervalRules: ref("confidence-interval-rules"), powerAnalysisRef: "controlled-power-analysis-reference",
    minimumSampleAndFamilyFloors: ref("sample-family-floors"), corpusPartitionPolicy: ref("partition-policy"),
    reviewerCountPolicy: ref("reviewer-count-policy"), escalationPolicy: ref("escalation-policy"),
    confidentialityPolicy: ref("confidentiality-policy"), custodyPolicy: ref("custody-policy"),
    goldMethodEligibility: ref("gold-method-eligibility"), stoppingAndInvalidationRules: ref("stopping-invalidation"),
    requestedScope: [STUDY_ID, ORGANIZATION_ID], predecessorHash: PHASE4_INFRASTRUCTURE_LEDGER_HASH,
  });
  const receipt = createPolicyApprovalReceipt({
    requestId: request.requestId, requestHash: request.requestHash, policyId: request.policyId, policyHash: request.policyHash,
    protocolHash: request.protocolHash, preregistrationHash: request.preregistrationHash,
    approvingAuthority: "controlled-policy-authority", approvalScope: [STUDY_ID, ORGANIZATION_ID],
    approvedAt: "2026-07-31T20:00:00.000Z", state: "test-only-non-operational-policy-approval",
    supersedesReceiptHash: null, revokedByReceiptHash: null, operationalAuthorization: false,
    fixtureLabels: CONTROLLED_FIXTURE_LABELS,
  }, request);
  return { request, receipt };
}

export function buildAppointmentFixtures(): CustodianAppointment[] {
  const roles: CustodianAppointment["role"][] = [
    "study-policy-authority", "confirmatory-corpus-custodian", "answer-key-custodian", "study-seed-custodian",
    "packet-release-custodian", "reviewer-assignment-custodian", "reviewer-training-custodian",
    "reviewer-qualification-custodian", "exposure-monitoring-custodian", "adjudication-record-custodian",
    "phase2-score-operator", "gold-admission-authority", "audit-authority",
  ];
  return roles.map((role, index) => appointCustodian({
    studyId: STUDY_ID, organizationId: ORGANIZATION_ID, principalId: `controlled-principal-${String(index + 1).padStart(2, "0")}`,
    pseudonymous: true, role, authorityRef: "controlled-test-policy-authority", scope: [STUDY_ID, ORGANIZATION_ID],
    appointmentRevision: 1, startsAt: "2026-07-31T20:00:00.000Z", endsAt: null,
    conflictDeclarations: ["no-known-controlled-fixture-conflict"], independenceDeclarations: ["independent-controlled-role"],
    priorAppointmentHash: null, supersededByHash: null, revokedByHash: null, fixtureOnly: true,
  }));
}

const caseFixture = (purpose: string, index: number, priorExposure: CaseManifest["priorExposure"] = "none"): CaseManifest => {
  const body = {
    version: CASE_MANIFEST_VERSION, caseId: `controlled-${purpose}-case-${index}`, organizationId: ORGANIZATION_ID,
    candidateEdges: [ref(`controlled-edge-${purpose}-${index}`)], sourceRevisions: [ref(`controlled-source-${purpose}-${index}`)],
    propositionFamily: index % 2 ? "finding" : "condition", difficultyStratum: index % 2 ? "bounded-low" : "bounded-medium",
    lexicalOverlapStratum: "controlled", modalityStratum: "asserted", polarityStratum: "positive", temporalStratum: "current",
    priorExposure, fixtureLabels: CONTROLLED_FIXTURE_LABELS,
  };
  return { ...body, caseHash: canonicalHash(body) };
};

export function buildPartitionFixture(purpose: CorpusPartitionManifest["purpose"], index: number, priorExposure: CaseManifest["priorExposure"] = "none"): CorpusPartitionManifest {
  const cases = [caseFixture(purpose, index, priorExposure), caseFixture(purpose, index + 1, priorExposure)];
  const body = {
    version: CORPUS_PARTITION_VERSION, studyId: STUDY_ID, organizationId: ORGANIZATION_ID,
    partitionId: `controlled-${purpose}`, purpose, cases,
    propositionFamilyDistribution: { condition: 1, finding: 1 }, answerKeyCustodyRef: "controlled-answer-key-custody",
    authorizationScope: [STUDY_ID, ORGANIZATION_ID].sort(), disclosureConstraints: ["no-answer-key", "no-retrieval-score"].sort(),
    frozen: true, predecessorHash: PHASE4_INFRASTRUCTURE_RESULT_HASH, fixtureLabels: CONTROLLED_FIXTURE_LABELS,
  };
  const manifestHash = canonicalHash(body);
  return { ...body, manifestId: `corpus-partition-${manifestHash.slice(0, 24)}`, manifestHash };
}

export function buildAllPartitions(): CorpusPartitionManifest[] {
  return [
    buildPartitionFixture("training", 1, "training"), buildPartitionFixture("qualification", 10, "qualification"),
    buildPartitionFixture("protocol-development", 20, "development"), buildPartitionFixture("confirmatory-holdout", 30),
    buildPartitionFixture("negative-controls", 40), buildPartitionFixture("ambiguity-controls", 50),
    buildPartitionFixture("insufficient-context-controls", 60),
  ];
}

export function buildCustodyFixtures(appointments: CustodianAppointment[], partitions: CorpusPartitionManifest[]): { answerKey: AnswerKeyCustodyManifest; seed: StudySeedCustodyRecord } {
  const answerCustodian = appointments.find((item) => item.role === "answer-key-custodian")!;
  const confirmatory = partitions.find((item) => item.purpose === "confirmatory-holdout")!;
  const answerBody = {
    version: ANSWER_KEY_CUSTODY_VERSION, studyId: STUDY_ID, partitionId: confirmatory.partitionId,
    custodianAppointmentId: answerCustodian.appointmentId, custodianAppointmentHash: answerCustodian.appointmentHash,
    caseIds: confirmatory.cases.map((item) => item.caseId).sort(), answerEntryDigests: confirmatory.cases.map((item) => canonicalHash({ opaqueTransportToken: item.caseId })).sort(),
    accessPolicyRef: "controlled-answer-key-access-policy", permittedOperations: ["digest-verification"], portableReleaseProhibited: true as const,
    exposureHistoryHash: canonicalHash([]), frozenAt: "2026-07-31T20:00:00.000Z", predecessorHash: confirmatory.manifestHash,
    fixtureLabels: CONTROLLED_FIXTURE_LABELS,
  };
  const answerHash = canonicalHash(answerBody);
  const seedCustodian = appointments.find((item) => item.role === "study-seed-custodian")!;
  const seedBody = {
    version: STUDY_SEED_CUSTODY_VERSION, seedId: "controlled-test-seed-identity", seedDigest: canonicalHash("controlled-test-seed-value-never-exported"), studyId: STUDY_ID,
    custodianAppointmentId: seedCustodian.appointmentId, custodianAppointmentHash: seedCustodian.appointmentHash,
    permittedAlgorithms: ["position-bound-canonical-assignment/v1"], assignmentAlgorithmVersion: "position-bound-canonical-assignment/v1",
    portableReleaseProhibited: true as const, rotationRuleRef: "controlled-seed-rotation/v1", supersedesSeedHash: null,
    exposureHistoryHash: canonicalHash([]), fixtureLabels: CONTROLLED_FIXTURE_LABELS,
  };
  return {
    answerKey: { ...answerBody, manifestId: `answer-key-custody-${answerHash.slice(0, 24)}`, manifestHash: answerHash },
    seed: { ...seedBody, recordHash: canonicalHash(seedBody) },
  };
}
