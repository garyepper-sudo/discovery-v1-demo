import type { ConfidenceRepresentation, MatchClassification, PropositionFamily, SemanticAdjudication } from "./contracts";
import type { CandidateGenerationInput, CandidateGenerationResult } from "./phase3Contracts";
import type { Phase2EvaluationInput, Phase2ScoreResult } from "./phase2Contracts";

export const PHASE_4_ADJUDICATION_IMPORT_VERSION = "oue-001-phase-4-import/v1" as const;
export const SEMANTIC_ADJUDICATION_RUBRIC_VERSION = "oue-semantic-adjudication-rubric/v1" as const;
export const RECONCILIATION_POLICY_VERSION = "oue-semantic-reconciliation/v1" as const;
export const HUMAN_RESOLUTION_IMPORT_VERSION = "oue-human-resolution-import/v1" as const;
export const SEMANTIC_LEDGER_VERSION = "oue-semantic-ledger/v1" as const;

export type AdjudicatorBlinding = {
  treatmentIdentity: boolean;
  aggregateScore: boolean;
  otherTreatmentOutputs: boolean;
  expectedWinner: boolean;
  commercialImplications: boolean;
  discoveryOrigin: boolean;
  benchmarkClassification: boolean;
};

export type StructuredSemanticJustification = {
  summary: string;
  preservedElements: string[];
  omittedOrConflictingElements: string[];
  materialConflict?: string;
};

export type FamilyAdjudicationAssessment = {
  family: PropositionFamily;
  requiredElementsConsidered: string[];
  definingStructurePreserved: boolean;
  endpointFidelity?: number;
  causalAgreement?: boolean;
  unresolvedStatusPreserved?: boolean;
};

export type ImportedSemanticAdjudication = {
  importVersion: typeof PHASE_4_ADJUDICATION_IMPORT_VERSION;
  organizationId: string;
  caseId: string;
  treatmentRunId: string;
  evaluatorVersion: "oue-001-phase-1";
  recoveredPropositionId: string;
  groundTruthCandidatePropositionId: string;
  candidateGeneratorVersion: CandidateGenerationResult["candidateGeneratorVersion"];
  candidateSetHash: string;
  consideredCandidateIds: string[];
  adjudicatorId: string;
  adjudicationRubricVersion: typeof SEMANTIC_ADJUDICATION_RUBRIC_VERSION;
  adjudicatedAt: string;
  classification: MatchClassification;
  meaningAgreement: number;
  polarityAgreement: boolean;
  modalityAgreement: boolean;
  temporalAgreement: boolean;
  causalAgreement?: boolean;
  confidenceAgreement?: SemanticAdjudication["confidenceAgreement"];
  lineageAgreement?: number;
  adjudicatorConfidence: ConfidenceRepresentation;
  requiresHumanReview: boolean;
  confirmatory: boolean;
  blinding: AdjudicatorBlinding;
  familyAssessment: FamilyAdjudicationAssessment;
  justification: StructuredSemanticJustification;
  inputHash: string;
  outputHash: string;
};

export type HumanResolutionImport = {
  importVersion: typeof HUMAN_RESOLUTION_IMPORT_VERSION;
  reviewerIds: string[];
  blindingAttestations: AdjudicatorBlinding[];
  rubricVersion: typeof SEMANTIC_ADJUDICATION_RUBRIC_VERSION;
  evidencePacketHash: string;
  independentAdjudicationHashes: string[];
  disagreementRecord: string;
  finalResolution: ImportedSemanticAdjudication;
  rationale: string;
  confidence: ConfidenceRepresentation;
  startedAt: string;
  completedAt: string;
  inputHash: string;
  outputHash: string;
  fixtureAuthored: true;
};

export type ReconciliationRecord = {
  pairId: string;
  policyVersion: typeof RECONCILIATION_POLICY_VERSION;
  sourceAdjudicationHashes: string[];
  state: "accepted" | "bounded-reconciliation" | "escalation-required" | "human-resolved";
  selectedClassification?: MatchClassification;
  selectedAdjudicationHash?: string;
  reason: string;
};

export type Phase4FailureCode =
  | "invalid-import" | "candidate-binding-failure" | "organization-contamination"
  | "case-contamination" | "treatment-run-contamination" | "version-contamination"
  | "rubric-inconsistency" | "family-requirement-failure" | "independence-failure"
  | "low-adjudicator-confidence" | "unresolved-disagreement" | "invalid-human-resolution"
  | "incomplete-adjudication-set" | "duplicate-semantic-credit" | "treatment-identity-leakage";

export type Phase4Failure = { code: Phase4FailureCode; refs: string[]; detail: string };

export type Phase4Input = {
  candidateInput: CandidateGenerationInput;
  candidateResult: CandidateGenerationResult;
  phase2Template: Phase2EvaluationInput;
  importedAdjudications: ImportedSemanticAdjudication[];
  humanResolutions: HumanResolutionImport[];
};

export type SemanticAdjudicationLedger = {
  ledgerVersion: typeof SEMANTIC_LEDGER_VERSION;
  organizationId: string;
  caseId: string;
  treatmentRunId: string;
  observableInputHash: string;
  recoveredGraphHash: string;
  candidateGeneratorVersion: CandidateGenerationResult["candidateGeneratorVersion"];
  candidateSetHashes: string[];
  importedAdjudicationHashes: string[];
  reconciliations: ReconciliationRecord[];
  selectedAdjudications: SemanticAdjudication[];
  phase2LedgerHash?: string;
  dimensionScores?: Phase2ScoreResult["dimensions"];
  compositeScoreEligible: boolean;
  outputHash: string;
};

export type Phase4Result = {
  valid: boolean;
  failures: Phase4Failure[];
  reconciliations: ReconciliationRecord[];
  completedAdjudications: SemanticAdjudication[];
  scores?: Phase2ScoreResult;
  semanticLedger: SemanticAdjudicationLedger;
  humanReviewExecuted: false;
  liveSemanticAdjudicatorImplemented: false;
};

