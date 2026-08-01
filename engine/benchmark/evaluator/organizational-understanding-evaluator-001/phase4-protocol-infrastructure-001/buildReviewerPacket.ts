import { canonicalHash } from "../canonicalSerialization";
import type { Phase3CandidateEdge, Phase3StructuralReceipt } from "../phase3Contracts";
import {
  EVALUATOR_ID,
  PACKET_RELEASE_VERSION,
  PAIRWISE_DISPOSITIONS,
  PHASE_4_INFRASTRUCTURE_VERSION,
  REVIEWER_PACKET_VERSION,
  STUDY_POLICY_VERSION,
  type FrozenAdjudicationUnit,
  type ReviewerPacket,
  type SealedStage1Record,
  type SemanticSide,
  type Stage2Packet,
} from "./contracts";

export type PacketBuildInput = {
  evaluatorId: typeof EVALUATOR_ID;
  organizationId: string;
  caseId: string;
  activeAuthorizationScopes: string[];
  edge: Phase3CandidateEdge;
  recovered: SemanticSide;
  groundTruth: SemanticSide;
  structuralReceipt: Phase3StructuralReceipt;
  phase3ResultId: string;
  phase3ResultHash: string;
  sourceRevisionIds: string[];
  rubricVersion: string;
  studyPolicyId: string;
  studyPolicyVersion: typeof STUDY_POLICY_VERSION;
  studySeedRef: string;
  authorizationReceiptId: string;
  disclosureReceiptId: string;
  rubricQuestions: string[];
  stageSeparation: "supported" | "not-supported";
  stageSeparationReason?: string;
};

const fail = (condition: boolean, message: string) => { if (condition) throw new Error(message); };
const sameSet = (left: string[], right: string[]) => canonicalHash([...left].sort()) === canonicalHash([...right].sort());

export function bindFrozenAdjudicationUnit(input: PacketBuildInput): FrozenAdjudicationUnit {
  const { edge } = input;
  const { candidateEdgeId: _candidateEdgeId, canonicalEdgeHash: _canonicalEdgeHash, candidateTier: _candidateTier, ...edgeBody } = edge;
  fail(input.evaluatorId !== EVALUATOR_ID, "Foreign evaluator rejected.");
  fail(edge.organizationId !== input.organizationId, "Foreign organization rejected.");
  fail(edge.caseId !== input.caseId, "Foreign case rejected.");
  fail(edge.candidateGeneratorVersion !== "oue-001-phase-3-candidate-generator/v1", "Foreign generator rejected.");
  fail(canonicalHash(edgeBody) !== edge.canonicalEdgeHash || edge.candidateEdgeId !== `candidate-${edge.canonicalEdgeHash.slice(0, 24)}`, "Frozen candidate-edge identity or hash rejected.");
  fail(edge.recoveredPropositionId !== input.recovered.sideRef || edge.groundTruthPropositionId !== input.groundTruth.sideRef, "Candidate proposition binding rejected.");
  const authorized = new Set(input.activeAuthorizationScopes);
  fail(![...edge.recoveredAuthorizationScope, ...edge.groundTruthAuthorizationScope].every((scope) => authorized.has(scope)), "Authorization required before packet construction.");
  fail(!sameSet(edge.recoveredAuthorizationScope, edge.groundTruthAuthorizationScope), "Candidate scopes disagree.");
  const { receiptId: _receiptId, receiptHash: _receiptHash, ...receiptBody } = input.structuralReceipt;
  fail(input.structuralReceipt.evaluatorId !== input.evaluatorId || input.structuralReceipt.organizationId !== input.organizationId || input.structuralReceipt.caseId !== input.caseId || input.structuralReceipt.recoveredGraphHash !== edge.recoveredGraphHash || input.structuralReceipt.groundTruthGraphHash !== edge.groundTruthGraphHash || canonicalHash(receiptBody) !== input.structuralReceipt.receiptHash || input.structuralReceipt.receiptId !== `phase2-structural-${input.structuralReceipt.receiptHash.slice(0, 24)}`, "Foreign structural receipt rejected.");
  fail(input.phase3ResultId !== "phase3-authoritative-validation-result" || input.phase3ResultHash !== "5c4ddb823fe9a3b227b0b22a5f9459a1f49b6fd22506f9164a1fbd7944a5033a", "Foreign Phase 3 result rejected.");
  fail(edge.configurationId !== "oue-001-phase-3-configuration/v1" || !/^[a-f0-9]{64}$/u.test(edge.configurationHash), "Foreign Phase 3 configuration rejected.");
  fail(!input.rubricVersion || !input.studyPolicyId || input.studyPolicyVersion !== STUDY_POLICY_VERSION || !input.sourceRevisionIds.length, "Rubric, study policy, and source revisions are required.");
  const body = {
    infrastructureVersion: PHASE_4_INFRASTRUCTURE_VERSION,
    evaluatorId: EVALUATOR_ID,
    organizationId: input.organizationId,
    caseId: input.caseId,
    candidateEdgeId: edge.candidateEdgeId,
    candidateEdgeHash: edge.canonicalEdgeHash,
    recoveredPropositionId: edge.recoveredPropositionId,
    groundTruthPropositionId: edge.groundTruthPropositionId,
    propositionFamily: edge.propositionFamily,
    authorizationScopes: [...input.activeAuthorizationScopes].sort(),
    recoveredGraphHash: edge.recoveredGraphHash,
    groundTruthGraphHash: edge.groundTruthGraphHash,
    structuralReceiptId: input.structuralReceipt.receiptId,
    structuralReceiptHash: input.structuralReceipt.receiptHash,
    candidateGeneratorVersion: edge.candidateGeneratorVersion,
    configurationId: edge.configurationId,
    configurationHash: edge.configurationHash,
    phase3ResultId: input.phase3ResultId,
    phase3ResultHash: input.phase3ResultHash,
    sourceRevisionIds: [...input.sourceRevisionIds].sort(),
    rubricVersion: input.rubricVersion,
    reviewerPacketVersion: REVIEWER_PACKET_VERSION,
    studyPolicyId: input.studyPolicyId,
    studyPolicyVersion: input.studyPolicyVersion,
  };
  return { ...body, unitHash: canonicalHash(body) };
}

const portableSide = (side: SemanticSide): SemanticSide => ({
  ...side,
  permittedMetadata: Object.fromEntries(Object.entries(side.permittedMetadata).sort(([a], [b]) => a.localeCompare(b))),
  withheldFields: [...side.withheldFields].sort(),
  unavailableFields: [...side.unavailableFields].sort(),
});

export function buildReviewerPacket(input: PacketBuildInput): { unit: FrozenAdjudicationUnit; packet: ReviewerPacket; recoveredSide: "A" | "B" } {
  const unit = bindFrozenAdjudicationUnit(input);
  const recoveredFirst = Number.parseInt(canonicalHash({ unitHash: unit.unitHash, studySeedRef: input.studySeedRef, algorithm: "hash-parity/v1" }).slice(-1), 16) % 2 === 0;
  const recovered = portableSide({ ...input.recovered, sideRef: canonicalHash({ unitHash: unit.unitHash, role: "recovered" }).slice(0, 24) });
  const truth = portableSide({ ...input.groundTruth, sideRef: canonicalHash({ unitHash: unit.unitHash, role: "ground-truth" }).slice(0, 24) });
  const body = {
    packetVersion: REVIEWER_PACKET_VERSION,
    unitHash: unit.unitHash,
    propositionFamily: unit.propositionFamily,
    sideA: recoveredFirst ? recovered : truth,
    sideB: recoveredFirst ? truth : recovered,
    rubricQuestions: [...input.rubricQuestions].sort(),
    allowedDispositions: [...PAIRWISE_DISPOSITIONS].sort(),
    rationaleRequired: true as const,
    stageSeparation: input.stageSeparation,
    ...(input.stageSeparationReason ? { stageSeparationReason: input.stageSeparationReason } : {}),
    authorizationReceiptId: input.authorizationReceiptId,
    disclosureReceiptId: input.disclosureReceiptId,
  };
  const packetHash = canonicalHash(body);
  return { unit, packet: { ...body, packetId: `reviewer-packet-${packetHash.slice(0, 24)}`, packetHash }, recoveredSide: recoveredFirst ? "A" : "B" };
}

export function sealStage1(packet: ReviewerPacket, reviewerId: string, relationship: SealedStage1Record["relationship"] | "missing", rationale: string, sealedAt: string): SealedStage1Record {
  fail(relationship === "missing", "Pairwise missing is prohibited.");
  fail(!rationale.trim(), "Stage 1 rationale is required.");
  const body = { releaseVersion: PACKET_RELEASE_VERSION, packetId: packet.packetId, packetHash: packet.packetHash, reviewerId, relationship: relationship as SealedStage1Record["relationship"], rationale, sealedAt };
  return { ...body, recordHash: canonicalHash(body) };
}

export function buildStage2Packet(packet: ReviewerPacket, stage1: SealedStage1Record | null, recoveredSide: "A" | "B", directionQuestions: string[]): Stage2Packet {
  fail(!stage1, "Stage 2 requires sealed Stage 1.");
  fail(stage1!.packetId !== packet.packetId || stage1!.packetHash !== packet.packetHash, "Packet mutation invalidates Stage 1.");
  const body = { releaseVersion: PACKET_RELEASE_VERSION, packetId: packet.packetId, packetHash: packet.packetHash, sealedStage1Hash: stage1!.recordHash, recoveredSide, groundTruthSide: recoveredSide === "A" ? "B" as const : "A" as const, directionQuestions: [...directionQuestions].sort() };
  return { ...body, releaseHash: canonicalHash(body) };
}
