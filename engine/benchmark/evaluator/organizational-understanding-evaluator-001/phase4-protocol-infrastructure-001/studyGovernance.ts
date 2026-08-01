import { canonicalHash } from "../canonicalSerialization";
import { CORPUS_CUSTODY_VERSION, RELIABILITY_RECEIPT_VERSION, STUDY_POLICY_VERSION, type CorpusCustodyManifest, type ReliabilityGateReceipt, type StudyPolicy } from "./contracts";

const prohibitedCollisions: Array<[string, string]> = [
  ["candidate-generator-developer", "answer-key-custodian"],
  ["reviewer", "answer-key-custodian"],
  ["packet-builder", "confirmatory-truth-custodian"],
  ["phase2-score-operator", "adjudication-editor"],
  ["sole-original-adjudicator", "gold-admission-authority"],
];

export function validateCustodyManifest(manifest: Omit<CorpusCustodyManifest, "version" | "manifestHash">): CorpusCustodyManifest {
  for (const [left, right] of prohibitedCollisions) {
    const overlap = (manifest.roleAssignments[left] ?? []).filter((id) => (manifest.roleAssignments[right] ?? []).includes(id));
    if (overlap.length) throw new Error(`Prohibited custody collision: ${left}/${right}.`);
  }
  const body = { ...manifest, version: CORPUS_CUSTODY_VERSION };
  return { ...body, manifestHash: canonicalHash(body) };
}

export function createStudyPolicy(input: Omit<StudyPolicy, "version" | "policyHash">): StudyPolicy {
  if (input.status === "approved" && !input.testOnly && !input.powerAnalysisRef) throw new Error("Operational policy requires approved power analysis.");
  const body = { ...input, version: STUDY_POLICY_VERSION, goldEligibleArms: [...input.goldEligibleArms].sort() };
  return { ...body, policyHash: canonicalHash(body) };
}

export function assertPolicyExecutionAuthority(policy: StudyPolicy): void {
  if (policy.status !== "approved" || policy.testOnly) throw new Error("Study policy does not authorize execution.");
}

export function validateReliabilityReceipt(receipt: Omit<ReliabilityGateReceipt, "version" | "receiptHash">, policy: StudyPolicy): ReliabilityGateReceipt {
  if (receipt.approvedPolicyId !== policy.policyId || receipt.approvedPolicyHash !== policy.policyHash || policy.status !== "approved") throw new Error("Approved study policy required.");
  if (receipt.evidentiaryStatus === "operational" && policy.testOnly) throw new Error("Test policy cannot create operational reliability evidence.");
  const bounded = [receipt.exactAgreement, receipt.cohensKappa, receipt.gwetsAc1, receipt.abstentionRate, receipt.unresolvedRate, receipt.escalationRate, receipt.packetDefectRate, receipt.qualificationPassRate, ...Object.values(receipt.perFamilyAgreement)];
  if (bounded.some((value) => !Number.isFinite(value) || value < 0 || value > 1)) throw new Error("Reliability measure is invalid.");
  if (Object.values(receipt.familyCounts).reduce((sum, count) => sum + count, 0) !== receipt.sampleSize || receipt.sampleSize < 1) throw new Error("Reliability sample counts are invalid.");
  if (!receipt.powerAnalysisRef || !receipt.calculationVersion || !Object.keys(receipt.confidenceIntervals).length || Object.values(receipt.confidenceIntervals).some((interval) => interval.lower < 0 || interval.upper > 1 || interval.lower > interval.upper)) throw new Error("Reliability provenance or confidence interval is invalid.");
  const structurallyPasses = receipt.sampleSize >= policy.familySampleFloor && Object.entries(receipt.familyCounts).every(([family, count]) => count >= policy.familySampleFloor && (receipt.perFamilyAgreement[family] ?? -1) >= policy.exactAgreementThreshold) && receipt.exactAgreement >= policy.exactAgreementThreshold && receipt.cohensKappa >= policy.kappaThreshold && receipt.gwetsAc1 >= policy.ac1Threshold && receipt.unresolvedRate <= policy.unresolvedRateMaximum && receipt.packetDefectRate <= policy.packetDefectRateMaximum && receipt.safetyDefects <= policy.safetyDefectsMaximum;
  if (receipt.disposition === "pass" && !structurallyPasses) throw new Error("Reliability pass contradicts approved policy.");
  const body = { ...receipt, version: RELIABILITY_RECEIPT_VERSION };
  return { ...body, receiptHash: canonicalHash(body) };
}
