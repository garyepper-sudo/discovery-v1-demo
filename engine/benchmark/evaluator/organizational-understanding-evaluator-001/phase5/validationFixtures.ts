import type { MatchClassification } from "../contracts";
import { createImportedAdjudication, validPhase4Input } from "../phase4ValidationFixtures";
import { PHASE_5_RESPONSE_VERSION, PHASE_5_STUDY_VERSION, type BlindedHumanStudyPacket, type HumanStudyResponse } from "./contracts";
import { phase5Packets } from "./packets";
import { humanResponseInputHash, humanResponseOutputHash } from "./responseValidation";

const truthByMeaning = new Map(validPhase4Input.phase2Template.groundTruth.propositions.map((item) => [item.canonicalMeaning, item]));
const recoveredByMeaning = new Map(validPhase4Input.phase2Template.recovered.propositions.map((item) => [item.recoveredMeaning, item]));

export function createSyntheticTransportResponse(packet: BlindedHumanStudyPacket, reviewerId: string, classification: MatchClassification = "equivalent", changes: Partial<HumanStudyResponse> = {}): HumanStudyResponse {
  const truth = truthByMeaning.get(packet.propositionA); const recovered = recoveredByMeaning.get(packet.propositionB); if (!truth || !recovered) throw new Error(`Missing transport fixture pair for ${packet.packetId}.`);
  const imported = createImportedAdjudication(recovered.id, truth.id, { adjudicatorId: reviewerId, classification });
  const base: HumanStudyResponse = { responseVersion: PHASE_5_RESPONSE_VERSION, studyVersion: PHASE_5_STUDY_VERSION, packetId: packet.packetId, packetHash: packet.packetHash, reviewer: { blindedReviewerId: reviewerId, experienceCategory: "structured-research", trainingCompleted: true, qualificationPassed: true, conflictAttestation: true, priorDiscoveryExposure: false, priorBenchmarkExposure: false, independenceAttestation: true, treatmentBlindingAttestation: true, answerKeyAccessed: false, completedAt: "2026-07-31T16:10:00.000Z" }, importedAdjudication: imported, classification, meaningAgreement: ["exact", "equivalent"].includes(classification) ? 1 : ["partial", "overgeneralized", "undergeneralized"].includes(classification) ? 0.5 : 0, polarityAgreement: classification !== "contradictory", modalityAgreement: true, temporalAgreement: true, ...(packet.family === "mechanism" ? { causalAgreement: true } : {}), ...(packet.family === "contradiction" ? { endpointFidelity: 1 } : {}), confidenceAgreement: true, lineageAgreement: 1, escalationRequired: classification === "ambiguous", reviewerConfidence: { kind: "numeric", value: 0.9 }, justification: "Synthetic transport fixture for analysis-code validation; not human evidence.", startedAt: "2026-07-31T16:00:00.000Z", completedAt: "2026-07-31T16:10:00.000Z", provenance: "synthetic-transport-fixture", inputHash: "", outputHash: "" };
  const response = { ...base, ...changes }; response.inputHash = changes.inputHash ?? humanResponseInputHash(response); response.outputHash = changes.outputHash ?? humanResponseOutputHash(response); return response;
}

export const syntheticPerfectAgreementResponses = phase5Packets.slice(0, 4).flatMap((packet) => [createSyntheticTransportResponse(packet, "synthetic-reviewer-a"), createSyntheticTransportResponse(packet, "synthetic-reviewer-b")]);
export const syntheticSystematicDisagreementResponses = phase5Packets.slice(0, 4).flatMap((packet) => [createSyntheticTransportResponse(packet, "synthetic-reviewer-a", "equivalent"), createSyntheticTransportResponse(packet, "synthetic-reviewer-b", "contradictory")]);

