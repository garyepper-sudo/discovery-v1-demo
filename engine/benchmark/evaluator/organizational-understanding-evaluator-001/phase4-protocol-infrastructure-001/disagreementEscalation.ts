import { canonicalHash } from "../canonicalSerialization";
import { DISAGREEMENT_RECORD_VERSION, type AdjudicationRecord, type DisagreementRecord, type PairwiseDisposition, type ReviewerEligibilityAssessment } from "./contracts";
import { requireIndependentReviewers } from "./reviewerEligibility";

export function classifyDisagreement(left: AdjudicationRecord, right: AdjudicationRecord): DisagreementRecord["type"] | null {
  if (left.packetHash !== right.packetHash || left.candidateEdgeId !== right.candidateEdgeId) throw new Error("Disagreement records must bind the same immutable unit.");
  if (left.disposition === "abstained" || right.disposition === "abstained") return "abstention";
  if (left.disposition === "insufficient-context" || right.disposition === "insufficient-context") return "insufficient-context";
  if (left.disposition === "packet-defect" || right.disposition === "packet-defect") return "packet-defect";
  if (left.disposition !== right.disposition) return "categorical";
  if (left.rationale !== right.rationale && canonicalHash(left.familyJudgments) !== canonicalHash(right.familyJudgments)) return "incompatible-rationale";
  return null;
}

export function buildEscalationPacket(records: AdjudicationRecord[]): { packetHash: string; packetId: string; candidateEdgeId: string; packetIdRef: string } {
  if (records.length !== 2 || records[0].packetHash !== records[1].packetHash) throw new Error("Two same-packet records required.");
  const body = { candidateEdgeId: records[0].candidateEdgeId, packetIdRef: records[0].packetId, packetHashRef: records[0].packetHash, prohibitedPriorJudgmentFields: true };
  const packetHash = canonicalHash(body);
  return { ...body, packetId: `escalation-packet-${packetHash.slice(0, 24)}`, packetHash };
}

export function resolveDisagreement(input: {
  originalRecords: [AdjudicationRecord, AdjudicationRecord];
  reviewerAssessments: ReviewerEligibilityAssessment[];
  escalationPacketHash: string;
  thirdRecord?: AdjudicationRecord;
  packetDefect: boolean;
  blindingIntact: boolean;
  thirdSawPriorJudgments: boolean;
  rationale: string;
}): DisagreementRecord {
  const type = classifyDisagreement(...input.originalRecords);
  if (!type) throw new Error("No disagreement exists.");
  let outcome: DisagreementRecord["outcome"] = "unresolved";
  let finalDisposition: PairwiseDisposition | null = null;
  let eligible = false;
  if (input.packetDefect) outcome = "packet-defect";
  else if (input.originalRecords.some((item) => item.disposition === "insufficient-context")) outcome = "insufficient-context";
  else if (input.thirdRecord) {
    requireIndependentReviewers(input.reviewerAssessments, 3);
    if (!input.blindingIntact || input.thirdSawPriorJudgments) throw new Error("Third-review blinding failed.");
    const values = [...input.originalRecords, input.thirdRecord].map((item) => item.disposition).filter((item): item is PairwiseDisposition => !["abstained", "insufficient-context", "packet-defect", "reviewer-conflict", "unresolved"].includes(item));
    const winner = values.find((value) => values.filter((item) => item === value).length >= 2);
    if (winner) { outcome = "resolved-two-of-three"; finalDisposition = winner; eligible = true; }
  }
  const body = { version: DISAGREEMENT_RECORD_VERSION, originalRecordIds: input.originalRecords.map((item) => item.recordId).sort(), originalRecordHashes: input.originalRecords.map((item) => item.recordHash).sort(), type, trigger: type, escalationPacketHash: input.escalationPacketHash, thirdReviewRecordId: input.thirdRecord?.recordId ?? null, outcome, finalDisposition, additionalContextReleased: [], phase2ImportEligible: eligible, rationale: input.rationale };
  const recordHash = canonicalHash(body);
  return { ...body, disagreementId: `disagreement-${recordHash.slice(0, 24)}`, recordHash };
}
