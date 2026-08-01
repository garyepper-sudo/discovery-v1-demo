import { canonicalHash } from "../canonicalSerialization";
import { GOLD_ELIGIBILITY_VERSION, type AdjudicationRecord, type GoldEligibilityAssessment, type ReliabilityGateReceipt, type ReviewerEligibilityAssessment } from "./contracts";

export const initialGoldMethodEligible = (arm: "H" | "M" | "HM"): boolean => arm === "H";

export function assessGoldAdmissionEligibility(input: {
  records: AdjudicationRecord[];
  reviewers: ReviewerEligibilityAssessment[];
  reliabilityReceipt: ReliabilityGateReceipt;
  authorized: boolean;
  leakageDetected: boolean;
  packetDefect: boolean;
  reproducible: boolean;
  conflictDetected: boolean;
}): GoldEligibilityAssessment {
  const arm = input.records[0]?.studyArm ?? "M";
  const reasons = [
    !initialGoldMethodEligible(arm) && "initial-arm-gold-ineligible",
    input.records.some((item) => item.studyArm !== arm) && "mixed-study-arms",
    input.reviewers.some((item) => item.disposition !== "eligible") && "ineligible-reviewer",
    input.records.some((item) => ["abstained", "insufficient-context", "packet-defect", "reviewer-conflict", "unresolved", "ambiguous"].includes(item.disposition)) && "unresolved-adjudication",
    input.reliabilityReceipt.evidentiaryStatus !== "operational" && "non-evidentiary-reliability-receipt",
    input.reliabilityReceipt.disposition !== "pass" && "reliability-gate-not-passed",
    !input.authorized && "unauthorized-data",
    input.leakageDetected && "label-leakage",
    input.packetDefect && "packet-defect",
    !input.reproducible && "not-reproducible",
    input.conflictDetected && "reviewer-conflict",
  ].filter((value): value is string => Boolean(value)).sort();
  const disposition = reasons.length ? "ineligible" as const : "eligible-for-independent-admission-review" as const;
  const body = { version: GOLD_ELIGIBILITY_VERSION, adjudicationRecordIds: input.records.map((item) => item.recordId).sort(), studyArm: arm, disposition, reasons, reliabilityReceiptId: input.reliabilityReceipt.receiptId, reliabilityReceiptHash: input.reliabilityReceipt.receiptHash };
  const assessmentHash = canonicalHash(body);
  return { ...body, assessmentId: `gold-eligibility-${assessmentHash.slice(0, 24)}`, assessmentHash };
}
