import type { MatchClassification, PropositionFamily } from "../contracts";

export const PHASE_4_INFRASTRUCTURE_VERSION = "oue-001-phase-4-protocol-infrastructure/v1" as const;
export const REVIEWER_PACKET_VERSION = "oue-001-phase-4-reviewer-packet/v1" as const;
export const PACKET_RELEASE_VERSION = "oue-001-phase-4-packet-release/v1" as const;
export const REVIEWER_ELIGIBILITY_VERSION = "oue-001-phase-4-reviewer-eligibility/v1" as const;
export const REVIEWER_QUALIFICATION_VERSION = "oue-001-phase-4-reviewer-qualification/v1" as const;
export const INDEPENDENCE_ATTESTATION_VERSION = "oue-001-phase-4-independence/v1" as const;
export const CONFLICT_ATTESTATION_VERSION = "oue-001-phase-4-conflict/v1" as const;
export const ADJUDICATION_RECORD_VERSION = "oue-001-phase-4-adjudication-record/v1" as const;
export const ADJUDICATION_CORRECTION_VERSION = "oue-001-phase-4-adjudication-correction/v1" as const;
export const DISAGREEMENT_RECORD_VERSION = "oue-001-phase-4-disagreement/v1" as const;
export const ESCALATION_RECORD_VERSION = "oue-001-phase-4-escalation/v1" as const;
export const STUDY_POLICY_VERSION = "oue-001-phase-4-study-policy/v1" as const;
export const RELIABILITY_RECEIPT_VERSION = "oue-001-phase-4-reliability-receipt/v1" as const;
export const CORPUS_CUSTODY_VERSION = "oue-001-phase-4-corpus-custody/v1" as const;
export const GOLD_ELIGIBILITY_VERSION = "oue-001-phase-4-gold-eligibility/v1" as const;
export const GOLD_DECISION_REFERENCE_VERSION = "oue-001-phase-4-gold-decision-reference/v1" as const;
export const PROSPECTIVE_PHASE_2_IMPORT_VERSION = "oue-001-phase-4-prospective-phase-2-import/v1" as const;
export const INFRASTRUCTURE_LEDGER_VERSION = "oue-001-phase-4-infrastructure-ledger/v1" as const;

export const EVALUATOR_ID = "organizational-understanding-evaluator-001" as const;
export const PAIRWISE_DISPOSITIONS = ["exact", "equivalent", "partial", "overgeneralized", "undergeneralized", "contradictory", "unsupported", "irrelevant", "ambiguous"] as const;
export type PairwiseDisposition = Exclude<MatchClassification, "missing">;
export type ProvenanceState = "abstained" | "insufficient-context" | "packet-defect" | "reviewer-conflict" | "unresolved";
export type StudyArm = "H" | "M" | "HM";

export type FrozenAdjudicationUnit = {
  infrastructureVersion: typeof PHASE_4_INFRASTRUCTURE_VERSION;
  evaluatorId: typeof EVALUATOR_ID;
  organizationId: string;
  caseId: string;
  candidateEdgeId: string;
  candidateEdgeHash: string;
  recoveredPropositionId: string;
  groundTruthPropositionId: string;
  propositionFamily: PropositionFamily;
  authorizationScopes: string[];
  recoveredGraphHash: string;
  groundTruthGraphHash: string;
  structuralReceiptId: string;
  structuralReceiptHash: string;
  candidateGeneratorVersion: "oue-001-phase-3-candidate-generator/v1";
  configurationId: string;
  configurationHash: string;
  phase3ResultId: string;
  phase3ResultHash: string;
  sourceRevisionIds: string[];
  rubricVersion: string;
  reviewerPacketVersion: typeof REVIEWER_PACKET_VERSION;
  studyPolicyId: string;
  studyPolicyVersion: typeof STUDY_POLICY_VERSION;
  unitHash: string;
};

export type SemanticSide = {
  sideRef: string;
  text: string;
  polarity: string;
  modality: string;
  temporalScope: string;
  permittedMetadata: Record<string, string | string[]>;
  withheldFields: string[];
  unavailableFields: string[];
};

export type ReviewerPacket = {
  packetVersion: typeof REVIEWER_PACKET_VERSION;
  packetId: string;
  unitHash: string;
  propositionFamily: PropositionFamily;
  sideA: SemanticSide;
  sideB: SemanticSide;
  rubricQuestions: string[];
  allowedDispositions: PairwiseDisposition[];
  rationaleRequired: true;
  stageSeparation: "supported" | "not-supported";
  stageSeparationReason?: string;
  authorizationReceiptId: string;
  disclosureReceiptId: string;
  packetHash: string;
};

export type SealedStage1Record = {
  releaseVersion: typeof PACKET_RELEASE_VERSION;
  packetId: string;
  packetHash: string;
  reviewerId: string;
  relationship: PairwiseDisposition | ProvenanceState;
  rationale: string;
  sealedAt: string;
  recordHash: string;
};

export type Stage2Packet = {
  releaseVersion: typeof PACKET_RELEASE_VERSION;
  packetId: string;
  packetHash: string;
  sealedStage1Hash: string;
  recoveredSide: "A" | "B";
  groundTruthSide: "A" | "B";
  directionQuestions: string[];
  releaseHash: string;
};

export type ReviewerEligibilityInput = {
  reviewerId: string;
  pseudonymous: true;
  qualificationPolicyVersion: string;
  trainingCompletionRef?: string;
  qualificationSetRef?: string;
  languageQualified: boolean;
  reasoningLiteracyQualified: boolean;
  confidentialityAttestationId?: string;
  independenceAttestationId?: string;
  conflictAttestationId?: string;
  authoredGroundTruthCase: boolean;
  candidateGeneratorDeveloper: boolean;
  soleConfirmatoryAuthority: boolean;
  organizationAuthorized: boolean;
  packetAuthorized: boolean;
  unresolvedConflict: boolean;
};

export type ReviewerEligibilityAssessment = ReviewerEligibilityInput & {
  assessmentVersion: typeof REVIEWER_ELIGIBILITY_VERSION;
  disposition: "eligible" | "ineligible";
  reasons: string[];
  assessmentId: string;
  assessmentHash: string;
};

export type StudyPolicy = {
  version: typeof STUDY_POLICY_VERSION;
  policyId: string;
  status: "draft" | "approved" | "superseded" | "revoked";
  testOnly: boolean;
  reviewerCount: number;
  qualificationThreshold: number;
  exactAgreementThreshold: number;
  kappaThreshold: number;
  ac1Threshold: number;
  confidenceIntervalsRequired: boolean;
  familySampleFloor: number;
  unresolvedRateMaximum: number;
  packetDefectRateMaximum: number;
  safetyDefectsMaximum: 0;
  powerAnalysisRef?: string;
  corpusSplitRef: string;
  holdoutPolicyRef: string;
  stoppingRulesRef: string;
  missingDataRulesRef: string;
  escalationPolicyRef: string;
  goldEligibleArms: StudyArm[];
  confidentialityPolicyRef: string;
  custodyPolicyRef: string;
  policyHash: string;
};

export type AdjudicationRecord = {
  version: typeof ADJUDICATION_RECORD_VERSION;
  recordId: string;
  revision: number;
  priorRecordHash: string | null;
  packetId: string;
  packetHash: string;
  unitHash: string;
  organizationId: string;
  caseId: string;
  candidateEdgeId: string;
  reviewerId: string;
  eligibilityAssessmentId: string;
  qualificationVersion: string;
  independenceAttestationId: string;
  conflictAttestationId: string;
  studyArm: StudyArm;
  sealedStage1Hash: string;
  stage2ReleaseHash: string | null;
  disposition: PairwiseDisposition | ProvenanceState;
  familyJudgments: Record<string, string | number | boolean>;
  rationale: string;
  citedPacketFields: string[];
  uncertaintyReason?: string;
  reviewerSelfConfidence?: number;
  authorizationReceiptId: string;
  recordedAt: string;
  correctedByActorId: string | null;
  invalidatedReleaseHashes: string[];
  recordHash: string;
};

export type DisagreementRecord = {
  version: typeof DISAGREEMENT_RECORD_VERSION;
  disagreementId: string;
  originalRecordIds: string[];
  originalRecordHashes: string[];
  type: "categorical" | "abstention" | "insufficient-context" | "incompatible-rationale" | "packet-defect" | "eligibility-impact";
  trigger: string;
  escalationPacketHash: string;
  thirdReviewRecordId: string | null;
  outcome: "resolved-two-of-three" | "packet-defect" | "insufficient-context" | "reviewer-conflict" | "unresolved";
  finalDisposition: PairwiseDisposition | null;
  additionalContextReleased: string[];
  phase2ImportEligible: boolean;
  rationale: string;
  recordHash: string;
};

export type CorpusCustodyManifest = {
  version: typeof CORPUS_CUSTODY_VERSION;
  roleAssignments: Record<string, string[]>;
  manifestHash: string;
};

export type ReliabilityGateReceipt = {
  version: typeof RELIABILITY_RECEIPT_VERSION;
  receiptId: string;
  studyId: string;
  approvedPolicyId: string;
  approvedPolicyHash: string;
  corpusPartition: string;
  sampleSize: number;
  familyCounts: Record<string, number>;
  exactAgreement: number;
  perFamilyAgreement: Record<string, number>;
  cohensKappa: number;
  gwetsAc1: number;
  confidenceIntervals: Record<string, { lower: number; upper: number }>;
  abstentionRate: number;
  unresolvedRate: number;
  escalationRate: number;
  packetDefectRate: number;
  qualificationPassRate: number;
  safetyDefects: number;
  powerAnalysisRef: string;
  calculationVersion: string;
  evidentiaryStatus: "operational" | "test-only-non-evidentiary";
  disposition: "pass" | "fail" | "indeterminate";
  receiptHash: string;
};

export type GoldEligibilityAssessment = {
  version: typeof GOLD_ELIGIBILITY_VERSION;
  assessmentId: string;
  adjudicationRecordIds: string[];
  studyArm: StudyArm;
  disposition: "eligible-for-independent-admission-review" | "ineligible" | "unresolved";
  reasons: string[];
  reliabilityReceiptId: string;
  reliabilityReceiptHash: string;
  assessmentHash: string;
};

export type GoldAdmissionDecisionReference = {
  version: typeof GOLD_DECISION_REFERENCE_VERSION;
  decisionId: string;
  assessmentId: string;
  assessmentHash: string;
  organizationId: string;
  caseId: string;
  adjudicationRecordId: string;
  adjudicationRecordHash: string;
  reliabilityReceiptId: string;
  reliabilityReceiptHash: string;
  independentAuthorityId: string;
  authorityAuthorizationRef: string;
  admitted: true;
  decisionHash: string;
};

export type ProspectivePhase2Import = {
  version: typeof PROSPECTIVE_PHASE_2_IMPORT_VERSION;
  importId: string;
  organizationId: string;
  caseId: string;
  candidateEdgeId: string;
  groundTruthPropositionId: string;
  recoveredPropositionId: string;
  classification: PairwiseDisposition;
  adjudicationRecordId: string;
  adjudicationRecordHash: string;
  goldEligibilityAssessmentId: string;
  admissionDecisionId: string;
  protocolVersion: string;
  reviewerProvenanceRefs: string[];
  familyJudgments: Record<string, string | number | boolean>;
  prospectiveOnly: true;
  assignmentPerformed: false;
  componentScores: null;
  compositeScore: null;
  importHash: string;
};
