import { canonicalHash } from "../canonicalSerialization";
import { generateDeterministicCandidates } from "../generateSemanticCandidates";
import { clonePhase3Input } from "../phase3CandidateFixtures";
import type { SemanticSide } from "./contracts";
import type { PacketBuildInput } from "./buildReviewerPacket";
import { STUDY_POLICY_VERSION } from "./contracts";

export const CONTROLLED_FIXTURE_CLASSIFICATION = "controlled structural fixture / non-human / non-model / non-evidentiary" as const;
export const PHASE_3_AUTHORITATIVE_RESULT_HASH = "5c4ddb823fe9a3b227b0b22a5f9459a1f49b6fd22506f9164a1fbd7944a5033a" as const;
export const PHASE_4_PROTOCOL_DOCUMENT_HASH = canonicalHash("PHASE_4_SEMANTIC_ADJUDICATION_PROTOCOL.md@6ded90823361678c706048b555199ec265f80732");
export const PHASE_4_PREREGISTRATION_DOCUMENT_HASH = canonicalHash("PHASE_4_SEMANTIC_ADJUDICATION_PREREGISTRATION.md@6ded90823361678c706048b555199ec265f80732");

const input = clonePhase3Input("phase3-development");
const result = generateDeterministicCandidates(input);
if (!result.eligible || !result.ledger) throw new Error("Controlled Phase 3 fixture must be valid.");
const edge = result.candidateSets.flatMap((item) => item.candidates)[0];
const recovered = input.collapsedRecovered.propositions.find((item) => item.id === edge.recoveredPropositionId)!;
const truth = input.groundTruth.propositions.find((item) => item.id === edge.groundTruthPropositionId)!;

const side = (kind: "recovered" | "truth"): SemanticSide => {
  const item = kind === "recovered" ? recovered : truth;
  return {
    sideRef: item.id,
    text: kind === "recovered" ? recovered.recoveredMeaning : truth.canonicalMeaning,
    polarity: item.polarity,
    modality: item.modality,
    temporalScope: item.temporality?.state ?? "unknown",
    permittedMetadata: { predicate: item.predicate, subjectRefs: [...item.subjectRefs].sort(), objectRefs: [...item.objectRefs].sort() },
    withheldFields: ["private-source-body"],
    unavailableFields: ["bounded-definition"],
  };
};

export const controlledPacketBuildInput: PacketBuildInput = {
  evaluatorId: "organizational-understanding-evaluator-001",
  organizationId: input.organizationId,
  caseId: input.caseId,
  activeAuthorizationScopes: [...input.activeAuthorizationScopes],
  edge,
  recovered: side("recovered"),
  groundTruth: side("truth"),
  structuralReceipt: input.structuralReceipt,
  phase3ResultId: "phase3-authoritative-validation-result",
  phase3ResultHash: PHASE_3_AUTHORITATIVE_RESULT_HASH,
  sourceRevisionIds: [canonicalHash(recovered), canonicalHash(truth)],
  rubricVersion: "semantic-adjudication-rubric/v1",
  studyPolicyId: "test-only-policy",
  studyPolicyVersion: STUDY_POLICY_VERSION,
  studySeedRef: canonicalHash("custodian-held-test-seed"),
  authorizationReceiptId: "controlled-authorization-receipt",
  disclosureReceiptId: "controlled-disclosure-receipt",
  rubricQuestions: ["Do both sides preserve the same material meaning?"],
  stageSeparation: "supported",
};

export const cloneControlledPacketInput = (): PacketBuildInput => structuredClone(controlledPacketBuildInput);
