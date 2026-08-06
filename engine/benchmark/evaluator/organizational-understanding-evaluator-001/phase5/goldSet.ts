import { canonicalHash } from "../canonicalSerialization";
import { normalizeConfidence } from "../confidenceNormalization";
import type { BlindedHumanStudyPacket, HumanGoldSetItem, HumanStudyResponse } from "./contracts";

export function admitHumanGoldSet(input: { packets: BlindedHumanStudyPacket[]; responses: HumanStudyResponse[]; consensusByPacket: Record<string, { classification: HumanStudyResponse["classification"]; rationale: string; confidence: HumanStudyResponse["reviewerConfidence"]; process: string; rubricDefect: boolean; unresolved: boolean }> }): { admitted: HumanGoldSetItem[]; rejected: Array<{ packetId: string; reasons: string[] }> } {
  const admitted: HumanGoldSetItem[] = []; const rejected: Array<{ packetId: string; reasons: string[] }> = [];
  for (const packet of input.packets.filter((item) => item.partition === "confirmatory" || item.partition === "holdout")) {
    const responses = input.responses.filter((item) => item.packetId === packet.packetId); const consensus = input.consensusByPacket[packet.packetId]; const reasons: string[] = [];
    if (responses.length < 2) reasons.push("fewer than two independent responses");
    if (responses.some((item) => item.provenance !== "genuine-human")) reasons.push("non-genuine response provenance");
    if (new Set(responses.map((item) => item.reviewer.blindedReviewerId)).size !== responses.length) reasons.push("reviewer independence failed");
    if (!consensus || consensus.unresolved) reasons.push("semantic judgment unresolved");
    if (consensus?.rubricDefect) reasons.push("rubric defect affected item");
    try { const confidence = consensus ? normalizeConfidence(consensus.confidence) : null; if (!confidence || confidence.minimum < 0.75) reasons.push("consensus confidence insufficient"); } catch { reasons.push("consensus confidence invalid"); }
    if (reasons.length || !consensus) { rejected.push({ packetId: packet.packetId, reasons: [...new Set(reasons)].sort() }); continue; }
    const base = { packetId: packet.packetId, packetHash: packet.packetHash, family: packet.family, difficulty: packet.difficulty, holdout: packet.partition === "holdout", classification: consensus.classification, originalResponseHashes: responses.map((item) => item.outputHash).sort(), consensusProcess: consensus.process, rationale: consensus.rationale, rubricVersion: packet.rubricVersion, confidence: consensus.confidence, reviewerProvenance: responses.map((item) => item.reviewer.blindedReviewerId).sort(), fixtureAuthored: false as const };
    admitted.push({ ...base, itemHash: canonicalHash(base) });
  }
  return { admitted: admitted.sort((a, b) => a.packetId.localeCompare(b.packetId)), rejected: rejected.sort((a, b) => a.packetId.localeCompare(b.packetId)) };
}

