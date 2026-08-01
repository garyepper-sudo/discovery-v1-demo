import { canonicalHash } from "../canonicalSerialization";
import { PROSPECTIVE_PHASE_2_IMPORT_VERSION, type AdjudicationRecord, type FrozenAdjudicationUnit, type GoldAdmissionDecisionReference, type GoldEligibilityAssessment, type ProspectivePhase2Import } from "./contracts";

export function mapEligibleAdjudicationToPhase2(input: {
  unit: FrozenAdjudicationUnit;
  record: AdjudicationRecord;
  eligibility: GoldEligibilityAssessment;
  admissionDecision: GoldAdmissionDecisionReference;
  reviewerProvenanceRefs: string[];
  existingImportIds: string[];
}): ProspectivePhase2Import {
  const { unit, record, eligibility, admissionDecision } = input;
  if (record.studyArm !== "H") throw new Error("Only Arm H is initially import-eligible.");
  if (eligibility.disposition !== "eligible-for-independent-admission-review") throw new Error("Independent admission-review eligibility required.");
  const { decisionHash: _decisionHash, decisionId: _decisionId, ...decisionBody } = admissionDecision;
  if (canonicalHash(decisionBody) !== admissionDecision.decisionHash || admissionDecision.decisionId !== `gold-admission-decision-${admissionDecision.decisionHash.slice(0, 24)}`) throw new Error("Independent admission decision integrity rejected.");
  if (admissionDecision.assessmentId !== eligibility.assessmentId || admissionDecision.assessmentHash !== eligibility.assessmentHash || admissionDecision.organizationId !== unit.organizationId || admissionDecision.caseId !== unit.caseId || admissionDecision.adjudicationRecordId !== record.recordId || admissionDecision.adjudicationRecordHash !== record.recordHash || admissionDecision.reliabilityReceiptId !== eligibility.reliabilityReceiptId || admissionDecision.reliabilityReceiptHash !== eligibility.reliabilityReceiptHash || !admissionDecision.authorityAuthorizationRef || !admissionDecision.admitted) throw new Error("Independent admission decision binding required.");
  if (record.packetHash === "" || record.unitHash !== unit.unitHash || record.organizationId !== unit.organizationId || record.caseId !== unit.caseId || record.candidateEdgeId !== unit.candidateEdgeId) throw new Error("Adjudication provenance mismatch.");
  if (["abstained", "insufficient-context", "packet-defect", "reviewer-conflict", "unresolved", "ambiguous"].includes(record.disposition)) throw new Error("Unresolved provenance cannot be imported.");
  const body = {
    version: PROSPECTIVE_PHASE_2_IMPORT_VERSION,
    organizationId: unit.organizationId,
    caseId: unit.caseId,
    candidateEdgeId: unit.candidateEdgeId,
    groundTruthPropositionId: unit.groundTruthPropositionId,
    recoveredPropositionId: unit.recoveredPropositionId,
    classification: record.disposition as ProspectivePhase2Import["classification"],
    adjudicationRecordId: record.recordId,
    adjudicationRecordHash: record.recordHash,
    goldEligibilityAssessmentId: eligibility.assessmentId,
    admissionDecisionId: admissionDecision.decisionId,
    protocolVersion: unit.rubricVersion,
    reviewerProvenanceRefs: [...input.reviewerProvenanceRefs].sort(),
    familyJudgments: record.familyJudgments,
    prospectiveOnly: true as const,
    assignmentPerformed: false as const,
    componentScores: null,
    compositeScore: null,
  };
  const importHash = canonicalHash(body);
  const importId = `prospective-phase2-import-${importHash.slice(0, 24)}`;
  if (input.existingImportIds.includes(importId)) throw new Error("Duplicate prospective Phase 2 import rejected.");
  return { ...body, importId, importHash };
}
