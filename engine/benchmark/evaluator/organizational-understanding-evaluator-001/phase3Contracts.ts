import type {
  GroundTruthPropositionGraph,
  OrganizationalUnderstandingProposition,
  RecoveredProposition,
} from "./contracts";
import type { CollapsedRecoveredGraph } from "./phase2Contracts";

export const PHASE_3_CANDIDATE_GENERATOR_VERSION = "oue-001-phase-3-candidate-generator/v1" as const;
export const PHASE_3_INPUT_VERSION = "oue-001-phase-3-input/v1" as const;
export const PHASE_3_RESULT_VERSION = "oue-001-phase-3-result/v1" as const;
export const PHASE_3_LEDGER_VERSION = "oue-001-phase-3-ledger/v1" as const;
export const PHASE_3_FEATURE_VERSION = "oue-001-phase-3-features/v1" as const;
export const PHASE_3_CONFIGURATION_VERSION = "oue-001-phase-3-configuration/v1" as const;
export const PHASE_3_PREREGISTRATION_VERSION = "oue-001-phase-3-preregistration/v1" as const;
export const PHASE_3_CORPUS_SPLIT_VERSION = "oue-001-phase-3-corpus-split/v1" as const;
export const STRUCTURAL_COMPARISON_VERSION = "phase-2-structural-comparison/v1" as const;

export type Phase3Configuration = {
  version: typeof PHASE_3_CONFIGURATION_VERSION;
  maximumCandidatesPerRecovered: number;
  minimumFeatureScore: number;
};

export type Phase3StructuralReceipt = {
  evaluatorId: "organizational-understanding-evaluator-001";
  receiptId: string;
  structuralEvaluatorVersion: "oue-001-phase-2-structural/v1";
  structuralComparisonVersion: typeof STRUCTURAL_COMPARISON_VERSION;
  familyCompatibilityVersion: "proposition-family-compatibility/v1";
  duplicateCollapseVersion: "duplicate-collapse/v1";
  valid: true;
  organizationId: string;
  caseId: string;
  recoveredGraphHash: string;
  groundTruthGraphHash: string;
  receiptHash: string;
};

export type Phase3Input = {
  inputVersion: typeof PHASE_3_INPUT_VERSION;
  evaluatorId: "organizational-understanding-evaluator-001";
  organizationId: string;
  caseId: string;
  activeAuthorizationScopes: string[];
  groundTruth: GroundTruthPropositionGraph;
  collapsedRecovered: CollapsedRecoveredGraph;
  structuralReceipt: Phase3StructuralReceipt;
  configuration: Phase3Configuration;
  preregistrationVersion: typeof PHASE_3_PREREGISTRATION_VERSION;
  preregistrationHash: string;
  corpusSplitVersion: typeof PHASE_3_CORPUS_SPLIT_VERSION;
  corpusSplitHash: string;
  evaluatedAt: string;
};

export type Phase3FeatureObservation = {
  feature: "token-overlap" | "phrase-containment" | "predicate-overlap" | "entity-overlap" | "evidence-overlap" | "relationship-overlap" | "confidence-overlap" | "family-specific-overlap";
  featureVersion: typeof PHASE_3_FEATURE_VERSION;
  value: number;
  references: string[];
};

export type Phase3CandidateEdge = {
  candidateEdgeId: string;
  recoveredPropositionId: string;
  groundTruthPropositionId: string;
  organizationId: string;
  caseId: string;
  propositionFamily: OrganizationalUnderstandingProposition["family"];
  recoveredAuthorizationScope: string[];
  groundTruthAuthorizationScope: string[];
  candidateGeneratorVersion: typeof PHASE_3_CANDIDATE_GENERATOR_VERSION;
  recoveredGraphHash: string;
  groundTruthGraphHash: string;
  applicableStructuralGates: string[];
  featureObservations: Phase3FeatureObservation[];
  polarityCompatibility: "exact" | "partial";
  modalityCompatibility: "exact";
  temporalCompatibility: "exact" | "partial";
  candidateTier: number;
  featureScore: number;
  inclusionReasons: string[];
  evaluatedExclusionRules: string[];
  configurationId: string;
  configurationHash: string;
  canonicalEdgeHash: string;
};

export type Phase3RejectedEdge = {
  recoveredPropositionId: string;
  groundTruthPropositionId: string;
  rules: string[];
  edgeHash: string;
};

export type Phase3CandidateSet = {
  recoveredPropositionId: string;
  candidates: Phase3CandidateEdge[];
  disposition: "candidates" | "no-candidate" | "ambiguous" | "overflow";
  tiedCandidateIds: string[];
  overflowCandidateIds: string[];
};

export type Phase3DuplicateAncestry = {
  graph: "recovered" | "ground-truth";
  canonicalPropositionId: string;
  memberPropositionId: string;
  canonicalHash: string;
  memberHash: string;
};

export type Phase3FailureCode = "invalid-version" | "invalid-configuration" | "invalid-structural-receipt" | "organization-contamination" | "case-contamination" | "permission-leakage" | "invalid-graph-hash" | "invalid-proposition" | "invalid-reference";
export type Phase3Failure = { code: Phase3FailureCode; detail: string; propositionRefs: string[] };

export type Phase3Ledger = {
  ledgerVersion: typeof PHASE_3_LEDGER_VERSION;
  candidateGeneratorVersion: typeof PHASE_3_CANDIDATE_GENERATOR_VERSION;
  inputVersion: typeof PHASE_3_INPUT_VERSION;
  resultVersion: typeof PHASE_3_RESULT_VERSION;
  featureVersion: typeof PHASE_3_FEATURE_VERSION;
  configurationVersion: typeof PHASE_3_CONFIGURATION_VERSION;
  structuralEvaluatorVersion: Phase3StructuralReceipt["structuralEvaluatorVersion"];
  structuralComparisonVersion: typeof STRUCTURAL_COMPARISON_VERSION;
  familyCompatibilityVersion: Phase3StructuralReceipt["familyCompatibilityVersion"];
  duplicateCollapseVersion: Phase3StructuralReceipt["duplicateCollapseVersion"];
  canonicalSerializationVersion: "canonical-serialization/v1";
  preregistrationVersion: typeof PHASE_3_PREREGISTRATION_VERSION;
  preregistrationHash: string;
  corpusSplitVersion: typeof PHASE_3_CORPUS_SPLIT_VERSION;
  corpusSplitHash: string;
  structuralReceiptId: string;
  structuralReceiptHash: string;
  inputHash: string;
  configurationHash: string;
  resultHash: string;
  evaluatedAt: string;
  importedAdjudicationHash: null;
};

export type Phase3Result = {
  resultVersion: typeof PHASE_3_RESULT_VERSION;
  eligible: boolean;
  failures: Phase3Failure[];
  candidateSets: Phase3CandidateSet[];
  rejectedProhibitedEdges: Phase3RejectedEdge[];
  recoveredWithoutCandidate: string[];
  groundTruthWithoutCandidate: string[];
  ambiguousRecovered: string[];
  materiallyTiedRecovered: string[];
  overflowRecovered: string[];
  duplicateAncestry: Phase3DuplicateAncestry[];
  cartesianComparisonCount: number;
  structurallyEligibleComparisonCount: number;
  emittedCandidateCount: number;
  reductionRatio: number;
  candidateCountByFamily: Record<OrganizationalUnderstandingProposition["family"], number>;
  resultHash: string;
  ledger: Phase3Ledger | null;
  semanticAdjudicationPerformed: false;
  assignmentPerformed: false;
  componentScores: null;
  compositeScore: null;
};

export type Phase3FixtureCase = {
  id: string;
  split: "development" | "holdout" | "negative-control";
  input: Phase3Input;
  expectedCandidatePairs: Array<{ recoveredPropositionId: string; groundTruthPropositionId: string }>;
};

export type Phase3GroundTruthWithDuplicates = GroundTruthPropositionGraph & {
  propositions: OrganizationalUnderstandingProposition[];
};
export type Phase3Recovered = RecoveredProposition;

/** @deprecated Unreviewed downstream research compatibility only. */
export type CandidateGenerationInput = {
  candidateGeneratorVersion: typeof PHASE_3_CANDIDATE_GENERATOR_VERSION;
  groundTruth: GroundTruthPropositionGraph;
  recovered: import("./contracts").RecoveredPropositionGraph;
  activeAuthorizationScopes: string[];
  maximumCandidates?: number;
};
/** @deprecated Candidate retrieval compatibility view; not an adjudication. */
export type SemanticCandidate = { groundTruthPropositionId: string; retrievalReason: string; retrievalFeatureScore: number; supportingStructuralSignals: Phase3FeatureObservation[] };
/** @deprecated Candidate retrieval compatibility view; not an adjudication. */
export type RecoveredPropositionCandidateList = { recoveredPropositionId: string; candidates: SemanticCandidate[] };
/** @deprecated Unreviewed downstream research compatibility only. */
export type CandidateGenerationResult = {
  candidateGeneratorVersion: typeof PHASE_3_CANDIDATE_GENERATOR_VERSION;
  valid: boolean;
  failures: Phase3Failure[];
  candidateLists: RecoveredPropositionCandidateList[];
  outputHash: string;
  semanticAdjudicationPerformed: false;
  benchmarkCreditAssigned: false;
};
