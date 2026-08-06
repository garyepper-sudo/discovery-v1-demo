import { canonicalHash } from "../canonicalSerialization";
import { validPhase2Input } from "../phase2ValidationFixtures";
import { SEMANTIC_ADJUDICATION_RUBRIC_VERSION } from "../phase4Contracts";
import { PHASE_5_STUDY_VERSION, type BlindedHumanStudyPacket, type Difficulty, type StudyPartition } from "./contracts";

const partitionByIndex = (index: number): StudyPartition => index < 2 ? "training" : index < 4 ? "qualification" : index < 7 ? "confirmatory" : "holdout";
const difficultyByFamily: Record<string, Difficulty> = { finding: "clear", condition: "clear", constraint: "moderate", conclusion: "moderate", prediction: "difficult", contradiction: "difficult", mechanism: "difficult", uncertainty: "moderate", "evidence-gap": "difficult", implication: "moderate" };

const packetHash = (packet: Omit<BlindedHumanStudyPacket, "packetHash">) => canonicalHash(packet);

export const phase5Packets: BlindedHumanStudyPacket[] = validPhase2Input.groundTruth.propositions.map((truth, index) => {
  const recovered = validPhase2Input.recovered.propositions.find((item) => item.id === `recovered-${truth.id}`);
  if (!recovered) throw new Error(`Missing blinded packet pair for ${truth.id}.`);
  const partition = partitionByIndex(index);
  const base: Omit<BlindedHumanStudyPacket, "packetHash"> = {
    studyVersion: PHASE_5_STUDY_VERSION,
    packetId: `phase5-${partition}-${String(index + 1).padStart(2, "0")}`,
    partition,
    family: truth.family,
    difficulty: difficultyByFamily[truth.family],
    neutralLabelA: "Proposition A",
    neutralLabelB: "Proposition B",
    propositionA: truth.canonicalMeaning,
    propositionB: recovered.recoveredMeaning,
    structuredContext: { polarity: [truth.polarity, recovered.polarity], modality: [truth.modality, recovered.modality], temporality: [truth.temporality?.state ?? "unknown", recovered.temporality.state], supportingEvidence: [...new Set([...truth.supportingEvidenceRefs, ...recovered.supportingEvidenceRefs])].sort(), opposingEvidence: [...new Set([...truth.opposingEvidenceRefs, ...recovered.opposingEvidenceRefs])].sort(), relationshipContext: [...new Set([...truth.contradictionEndpointRefs, ...truth.competingPropositionRefs, ...recovered.relatedPropositionRefs])].sort() },
    rubricVersion: SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
    requiredResponseFields: ["classification", "meaning agreement", "polarity", "modality", "temporality", "causal agreement when applicable", "endpoint fidelity when applicable", "confidence agreement when applicable", "lineage agreement", "reviewer confidence", "escalation", "structured justification"],
    displayOrderSeed: canonicalHash({ packet: truth.id, partition }).slice(0, 16),
  };
  return { ...base, packetHash: packetHash(base) };
});

export const phase5PacketsByPartition = Object.freeze({
  training: phase5Packets.filter((packet) => packet.partition === "training"),
  qualification: phase5Packets.filter((packet) => packet.partition === "qualification"),
  confirmatory: phase5Packets.filter((packet) => packet.partition === "confirmatory"),
  holdout: phase5Packets.filter((packet) => packet.partition === "holdout"),
});

export const phase5SyntheticAnswerKey = Object.freeze(phase5Packets.map((packet) => Object.freeze({ packetId: packet.packetId, expectedClassification: "equivalent", transportValidationOnly: true, excludedFromHumanEvidence: true })));

