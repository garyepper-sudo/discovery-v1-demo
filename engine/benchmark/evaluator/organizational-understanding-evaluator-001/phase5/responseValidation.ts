import { canonicalHash } from "../canonicalSerialization";
import { normalizeConfidence } from "../confidenceNormalization";
import { PHASE_5_RESPONSE_VERSION, PHASE_5_STUDY_VERSION, requiredBlinding, type BlindedHumanStudyPacket, type HumanStudyResponse, type InvalidHumanResponse } from "./contracts";

export const humanResponseInputHash = (response: HumanStudyResponse) => canonicalHash({ studyVersion: response.studyVersion, packetId: response.packetId, packetHash: response.packetHash, reviewerId: response.reviewer.blindedReviewerId, importedAdjudicationHash: response.importedAdjudication.outputHash });
export const humanResponseOutputHash = (response: HumanStudyResponse) => { const { outputHash: _outputHash, ...content } = response; return canonicalHash(content); };

export function validateHumanStudyResponses(input: { packets: BlindedHumanStudyPacket[]; responses: HumanStudyResponse[]; preservedAt: string }) {
  const packetById = new Map(input.packets.map((packet) => [packet.packetId, packet]));
  const valid: HumanStudyResponse[] = [];
  const invalid: InvalidHumanResponse[] = [];
  const seenReviewerPacket = new Set<string>();
  for (const response of input.responses) {
    const reasons: string[] = [];
    const packet = packetById.get(response.packetId);
    const reviewerPacket = `${response.reviewer.blindedReviewerId}:${response.packetId}`;
    if (response.responseVersion !== PHASE_5_RESPONSE_VERSION || response.studyVersion !== PHASE_5_STUDY_VERSION) reasons.push("version mismatch");
    if (!packet || response.packetHash !== packet.packetHash) reasons.push("packet hash mismatch");
    if (!response.reviewer.blindedReviewerId || !response.reviewer.trainingCompleted || !response.reviewer.qualificationPassed || !response.reviewer.conflictAttestation || !response.reviewer.independenceAttestation || !response.reviewer.treatmentBlindingAttestation || response.reviewer.answerKeyAccessed !== false) reasons.push("reviewer eligibility, independence, or blinding incomplete");
    if (seenReviewerPacket.has(reviewerPacket)) reasons.push("duplicate reviewer identity for packet");
    if (response.importedAdjudication.confirmatory && Object.entries(requiredBlinding).some(([key, expected]) => response.importedAdjudication.blinding[key as keyof typeof requiredBlinding] !== expected)) reasons.push("treatment blinding incomplete");
    if (!response.justification || !Number.isFinite(response.meaningAgreement) || response.meaningAgreement < 0 || response.meaningAgreement > 1 || Date.parse(response.startedAt) > Date.parse(response.completedAt)) reasons.push("response fields or timestamps malformed");
    try { if (!normalizeConfidence(response.reviewerConfidence)) reasons.push("reviewer confidence absent"); } catch { reasons.push("reviewer confidence invalid"); }
    if (response.inputHash !== humanResponseInputHash(response) || response.outputHash !== humanResponseOutputHash(response)) reasons.push("response audit hash mismatch");
    if (reasons.length) invalid.push({ responseHash: response.outputHash, packetId: response.packetId, reviewerId: response.reviewer.blindedReviewerId, reasons: [...new Set(reasons)].sort(), preservedAt: input.preservedAt, excludedFromEvidence: true });
    else { valid.push(response); seenReviewerPacket.add(reviewerPacket); }
  }
  return { valid: valid.sort((a, b) => a.outputHash.localeCompare(b.outputHash)), invalid: invalid.sort((a, b) => (a.responseHash ?? "").localeCompare(b.responseHash ?? "")) };
}

