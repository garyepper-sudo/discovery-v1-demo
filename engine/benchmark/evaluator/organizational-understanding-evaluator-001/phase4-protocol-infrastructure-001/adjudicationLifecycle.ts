import { canonicalHash } from "../canonicalSerialization";
import { ADJUDICATION_RECORD_VERSION, type AdjudicationRecord, type ReviewerEligibilityAssessment, type SealedStage1Record, type Stage2Packet } from "./contracts";

export type CreateAdjudicationInput = Omit<AdjudicationRecord, "version" | "recordId" | "revision" | "priorRecordHash" | "recordHash" | "eligibilityAssessmentId" | "sealedStage1Hash" | "stage2ReleaseHash" | "invalidatedReleaseHashes"> & {
  eligibility: ReviewerEligibilityAssessment;
  stage1: SealedStage1Record;
  stage2?: Stage2Packet;
};

export function createAdjudicationRecord(input: CreateAdjudicationInput): AdjudicationRecord {
  if (input.eligibility.disposition !== "eligible" || input.eligibility.reviewerId !== input.reviewerId) throw new Error("Eligible reviewer receipt required.");
  if (input.stage1.packetId !== input.packetId || input.stage1.packetHash !== input.packetHash || input.stage1.reviewerId !== input.reviewerId) throw new Error("Sealed Stage 1 binding rejected.");
  if (input.stage2 && (input.stage2.packetId !== input.packetId || input.stage2.packetHash !== input.packetHash || input.stage2.sealedStage1Hash !== input.stage1.recordHash)) throw new Error("Stage 2 binding rejected.");
  if (typeof input.reviewerSelfConfidence === "number" && (input.reviewerSelfConfidence < 0 || input.reviewerSelfConfidence > 1)) throw new Error("Reviewer self-confidence is invalid.");
  const { eligibility: _eligibility, stage1, stage2, ...rest } = input;
  const body = { ...rest, version: ADJUDICATION_RECORD_VERSION, revision: 1, priorRecordHash: null, eligibilityAssessmentId: input.eligibility.assessmentId, sealedStage1Hash: stage1.recordHash, stage2ReleaseHash: stage2?.releaseHash ?? null, invalidatedReleaseHashes: [] };
  const recordHash = canonicalHash(body);
  return { ...body, recordId: `adjudication-${recordHash.slice(0, 24)}`, recordHash };
}

export function correctAdjudicationRecord(current: AdjudicationRecord, expectedRecordHash: string, correction: Pick<AdjudicationRecord, "disposition" | "familyJudgments" | "rationale" | "citedPacketFields" | "uncertaintyReason">, replacementStage1: SealedStage1Record, actorId: string, recordedAt: string): AdjudicationRecord {
  if (current.recordHash !== expectedRecordHash) throw new Error("Stale adjudication correction rejected.");
  if (replacementStage1.packetId !== current.packetId || replacementStage1.packetHash !== current.packetHash || replacementStage1.reviewerId !== current.reviewerId || replacementStage1.relationship !== correction.disposition) throw new Error("Replacement Stage 1 binding rejected.");
  const body = { ...current, ...correction, revision: current.revision + 1, priorRecordHash: current.recordHash, sealedStage1Hash: replacementStage1.recordHash, stage2ReleaseHash: null, invalidatedReleaseHashes: [...current.invalidatedReleaseHashes, ...(current.stage2ReleaseHash ? [current.stage2ReleaseHash] : [])].sort(), correctedByActorId: actorId, recordedAt };
  const { recordId: _recordId, recordHash: _recordHash, ...content } = body;
  const recordHash = canonicalHash(content);
  return { ...content, recordId: `adjudication-${recordHash.slice(0, 24)}`, recordHash };
}

export type HumanLlmRecordSet = { preAssistanceHumanRecordHash: string; modelOutputRecordHash: string; postAssistanceHumanRecordHash: string };
export function validateHumanLlmSeparation(set: HumanLlmRecordSet): void {
  if (new Set(Object.values(set)).size !== 3 || Object.values(set).some((value) => !value)) throw new Error("Human–LLM records must remain distinct.");
}
