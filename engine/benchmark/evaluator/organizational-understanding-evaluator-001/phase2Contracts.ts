import type { CanonicalConfidenceInterval } from "./confidenceNormalization";
import type { EvaluationDimension, EvaluationGateFailure, EvaluationLedger, GroundTruthPropositionGraph, RecoveredProposition, RecoveredPropositionGraph, SemanticAdjudication } from "./contracts";

export const PHASE_2_STRUCTURAL_EVALUATOR_VERSION = "oue-001-phase-2-structural/v1" as const;
export const IMPORTED_RUBRIC_VERSION = "imported-rubric-judgment/v1" as const;

export type Phase2FailureCode =
  | "organization-contamination" | "case-contamination" | "cross-run-contamination"
  | "permission-leakage" | "invalid-identity" | "invalid-proposition"
  | "invalid-reference" | "invalid-confidence" | "invalid-family"
  | "invalid-polarity" | "invalid-modality" | "invalid-temporality"
  | "invalid-one-to-one-assignment" | "incompatible-evaluator-version"
  | "unfrozen-ground-truth" | "missing-audit-lineage"
  | "incomplete-adjudication" | "unresolved-material-ambiguity"
  | "graph-integrity-failure";

export type Phase2BlockingFailure = EvaluationGateFailure & { code: Phase2FailureCode };
export type EvidenceCatalogEntry = { id: string; organizationId: string; caseId: string; authorizationScope: string[] };
export type ExplicitDuplicateGroup = { canonicalRecoveredPropositionId: string; memberRecoveredPropositionIds: string[] };
export type Phase2ImportedRubricJudgment = {
  source: "imported";
  rubricVersion: typeof IMPORTED_RUBRIC_VERSION;
  recordHash: string;
  adjudicationId: string;
  contradiction?: { endpointFidelity: number; unresolvedStateFidelity: number; supportOppositionFidelity: number };
  causal?: { modalityAccuracy: number; competingMechanismPreservation: number; supportOppositionFidelity: number; causalOverclaim: boolean };
  uncertainty?: { appropriateAbstention: number; unresolvedStatePreservation: number; falseCertainty: boolean; unsupportedCertainty: boolean };
  evidenceGap?: { relevance: number; utilityAgreement: number; feasibilityAgreement: number; nonredundancy: number; rankAgreement: number };
  decisionUtility?: { frozenRubricAgreement: number };
};
export type Phase2GraphMetadata = {
  propositionId: string;
  mechanism?: { explanandumRefs: string[] };
  evidenceGap?: { priority: number; justification: string; expectedUtility?: number; feasibility: "feasible" | "infeasible" | "unknown" };
  prediction?: { evaluationStatus: "pending" | "confirmed" | "disconfirmed" | "unknown"; outcomeRef?: string };
};

export type Phase2EvaluationInput = {
  structuralEvaluatorVersion: typeof PHASE_2_STRUCTURAL_EVALUATOR_VERSION;
  groundTruth: GroundTruthPropositionGraph;
  recovered: RecoveredPropositionGraph;
  adjudications: SemanticAdjudication[];
  expectedTreatmentRunId: string;
  activeAuthorizationScopes: string[];
  evidenceCatalog: EvidenceCatalogEntry[];
  explicitDuplicateGroups: ExplicitDuplicateGroup[];
  importedRubricJudgments: Phase2ImportedRubricJudgment[];
  graphMetadata: Phase2GraphMetadata[];
};

export type CollapsedRecoveredGraph = RecoveredPropositionGraph & {
  propositions: RecoveredProposition[];
  collapsedMemberIds: string[];
  duplicateAuditAncestry: Array<{ canonicalRecoveredPropositionId: string; memberRecoveredPropositionId: string; basis: "explicit-group" | "exact-structured-equality"; canonicalSourceClaimRefs: string[]; memberSourceClaimRefs: string[]; canonicalPropositionHash: string; memberPropositionHash: string }>;
};

export type SelectedAdjudicationEdge = { adjudication: SemanticAdjudication; groundTruthPropositionId: string; recoveredPropositionId?: string; selected: boolean; rejectionReason?: string };

export type Phase2DimensionResult = { score: number; numerator: number; denominator: number; propositionRefs: string[]; limitation?: string };
export type Phase2ScoreResult = { dimensions: Record<EvaluationDimension, Phase2DimensionResult>; compositeScore: number; compositeActiveForCompletedImportedAdjudications: true };

export type Phase2StructuralResult = {
  valid: boolean;
  blockingFailures: Phase2BlockingFailure[];
  normalizedConfidenceByPropositionId: Record<string, CanonicalConfidenceInterval | null>;
  collapsedRecovered: CollapsedRecoveredGraph;
  assignment: SelectedAdjudicationEdge[];
};

export type Phase2ComponentVersions = {
  structuralValidator: string;
  confidenceNormalization: string;
  duplicateCollapse: string;
  familyCompatibility: string;
  assignment: string;
  graphIntegrity: string;
  importedRubric: string;
  componentScorers: Record<EvaluationDimension, string>;
  compositeWeights: string;
  serialization: string;
};

export type Phase2EvaluationLedger = EvaluationLedger & {
  phase2Audit: {
    componentVersions: Phase2ComponentVersions;
    componentVersionsHash: string;
    importedRubricRecordHashes: string[];
    duplicateAuditAncestryHash: string;
  };
};
