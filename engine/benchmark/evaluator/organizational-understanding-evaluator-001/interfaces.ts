import type { BlindedAdjudicationRequest, EvaluationLedger, GroundTruthPropositionGraph, ObservableUnderstandingPacket, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";

export type PropositionRecoveryPort = {
  recover(input: { groundTruthIdentity: Pick<GroundTruthPropositionGraph, "organizationId" | "caseId">; packet: ObservableUnderstandingPacket }): Promise<RecoveredPropositionGraph>;
};

export type SemanticCandidateGenerationPort = {
  generate(input: { groundTruth: GroundTruthPropositionGraph; recovered: RecoveredPropositionGraph }): Promise<Array<{ groundTruthPropositionId: string; recoveredPropositionId: string; signals: string[] }>>;
};

export type SemanticAdjudicationPort = {
  adjudicate(input: BlindedAdjudicationRequest): Promise<SemanticAdjudication[]>;
};

export type HumanAdjudicationImportPort = {
  importResolvedAdjudications(input: { requestHash: string; reviewerPacketHash: string; adjudications: SemanticAdjudication[] }): Promise<SemanticAdjudication[]>;
};

export type DeterministicScoringPort = {
  score(input: { groundTruth: GroundTruthPropositionGraph; recovered: RecoveredPropositionGraph; adjudications: SemanticAdjudication[]; inputHashes: string[] }): EvaluationLedger;
};

export function assertPhase1Scoreable(input: { groundTruth: GroundTruthPropositionGraph; recovered: RecoveredPropositionGraph; adjudications: SemanticAdjudication[] }): void {
  if (input.groundTruth.organizationId !== input.recovered.organizationId || input.groundTruth.caseId !== input.recovered.caseId) throw new Error("Evaluator identity mismatch.");
  if (!input.groundTruth.frozenBeforeTreatmentObservation || !input.groundTruth.graphHash) throw new Error("Ground-truth graph is not frozen.");
  const groundTruthIds = new Set(input.groundTruth.propositions.map((item) => item.id));
  const recoveredIds = new Set(input.recovered.propositions.map((item) => item.id));
  if (input.adjudications.some((item) => !groundTruthIds.has(item.groundTruthPropositionId) || (item.recoveredPropositionId && !recoveredIds.has(item.recoveredPropositionId)))) throw new Error("Adjudication references an unknown proposition.");
  const credited = input.adjudications.filter((item) => ["exact", "equivalent", "partial", "overgeneralized", "undergeneralized", "contradictory"].includes(item.classification));
  if (credited.some((item) => !item.recoveredPropositionId)) throw new Error("Material adjudication lacks a recovered proposition.");
  if (new Set(credited.map((item) => item.groundTruthPropositionId)).size !== credited.length || new Set(credited.map((item) => item.recoveredPropositionId)).size !== credited.length) throw new Error("One-to-one adjudication constraint violated.");
  const adjudicatedGroundTruthIds = new Set(input.adjudications.map((item) => item.groundTruthPropositionId));
  const missing = input.groundTruth.propositions.filter((item) => item.requiredForCoverage && !adjudicatedGroundTruthIds.has(item.id));
  if (missing.length) throw new Error("Required propositions lack adjudication.");
  if (input.adjudications.some((item) => item.classification === "ambiguous" || item.requiresHumanReview)) throw new Error("Material adjudication remains unresolved.");
  if (input.adjudications.some((item) => !item.adjudicatorRecordRef || !item.justification)) throw new Error("Adjudication audit record is incomplete.");
}

export const phase1UnavailableImplementations = Object.freeze({
  propositionRecovery: "not-implemented",
  semanticCandidateGeneration: "not-implemented",
  liveSemanticAdjudication: "not-implemented",
  deterministicScoring: "not-implemented",
  comparativeExecution: "prohibited",
} as const);
