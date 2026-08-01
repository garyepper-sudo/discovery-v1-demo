export const ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION = "oue-001-phase-1" as const;

export type PropositionFamily =
  | "finding" | "condition" | "constraint" | "conclusion" | "prediction"
  | "contradiction" | "mechanism" | "uncertainty" | "evidence-gap" | "implication";

export type PropositionPolarity = "affirmed" | "denied" | "mixed" | "unresolved";
export type PropositionModality = "observed" | "inferred" | "causal" | "predictive" | "hypothetical" | "unknown";
export type TemporalState = "current" | "historical" | "future" | "changing" | "unknown";

export type ConfidenceRange = { minimum: number; maximum: number; target?: number };
export type ConfidenceRepresentation =
  | { kind: "numeric"; value: number }
  | { kind: "percentage"; value: number }
  | { kind: "qualitative"; label: string }
  | { kind: "interval"; minimum: number; maximum: number }
  | { kind: "absent" };

export type OrganizationalUnderstandingProposition = {
  id: string;
  organizationId: string;
  caseId: string;
  family: PropositionFamily;
  canonicalMeaning: string;
  subjectRefs: string[];
  predicate: string;
  objectRefs: string[];
  polarity: PropositionPolarity;
  modality: PropositionModality;
  importance: number;
  decisionRelevance: number;
  expectedConfidence?: ConfidenceRange;
  supportingEvidenceRefs: string[];
  opposingEvidenceRefs: string[];
  contradictionEndpointRefs: string[];
  competingPropositionRefs: string[];
  temporality?: { validFrom?: string; validUntil?: string; state: TemporalState };
  authorizationScope: string[];
  requiredForCoverage: boolean;
  allowedEquivalentMeanings: string[];
  prohibitedInterpretations: string[];
};
export type GroundTruthPropositionGraph = {
  schemaVersion: "ground-truth-proposition-graph/v1";
  evaluatorVersion: typeof ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION;
  organizationId: string;
  caseId: string;
  frozenBeforeTreatmentObservation: true;
  propositions: OrganizationalUnderstandingProposition[];
  graphHash: string;
};

export type ObservableClaim = {
  id: string;
  statement: string;
  confidence: ConfidenceRepresentation;
  supportingEvidenceRefs: string[];
  opposingEvidenceRefs: string[];
  relatedClaimRefs: string[];
};

export type ObservableContradiction = ObservableClaim & { leftClaimRef: string; rightClaimRef: string; unresolved: boolean };
export type ObservableMechanism = ObservableClaim & { causeRefs: string[]; effectRefs: string[]; competingMechanismRefs: string[] };
export type ObservableUncertainty = ObservableClaim & { unresolvedClaimRefs: string[] };
export type ObservableEvidenceGap = ObservableClaim & { affectedClaimRefs: string[]; expectedUtility?: number };
export type ObservableLineage = { claimId: string; sourceRefs: string[]; authorizationScope: string[] };

export type ObservableUnderstandingPacket = {
  packetVersion: "observable-understanding-packet/v1";
  organizationId: string;
  caseId: string;
  treatmentRunId: string;
  findings: ObservableClaim[];
  conditions: ObservableClaim[];
  constraints: ObservableClaim[];
  conclusions: ObservableClaim[];
  predictions: ObservableClaim[];
  contradictions: ObservableContradiction[];
  mechanisms: ObservableMechanism[];
  uncertainties: ObservableUncertainty[];
  evidenceGaps: ObservableEvidenceGap[];
  implications: ObservableClaim[];
  sourceLineage: ObservableLineage[];
  metadata: { producedAt: string; contractVersion: string; treatmentIdentityRedactedForAdjudication: boolean };
};

export type RecoveredProposition = {
  id: string;
  sourceClaimRefs: string[];
  organizationId: string;
  caseId: string;
  family: PropositionFamily;
  recoveredMeaning: string;
  subjectRefs: string[];
  predicate: string;
  objectRefs: string[];
  polarity: PropositionPolarity;
  modality: PropositionModality;
  temporality: { state: TemporalState; validFrom?: string; validUntil?: string };
  normalizedConfidence: ConfidenceRange | null;
  supportingEvidenceRefs: string[];
  opposingEvidenceRefs: string[];
  relatedPropositionRefs: string[];
  authorizationScope: string[];
};

export type DuplicateMetadata = { canonicalRecoveredPropositionId: string; duplicateCount: number; duplicatedSurfaceForms: string[] };
export type RecoveredPropositionGraph = {
  schemaVersion: "recovered-proposition-graph/v1";
  evaluatorVersion: typeof ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION;
  organizationId: string;
  caseId: string;
  treatmentRunId: string;
  propositions: RecoveredProposition[];
  duplicates: DuplicateMetadata[];
  recoveryWarnings: string[];
  inputHash: string;
};

export type MatchClassification =
  | "exact" | "equivalent" | "partial" | "overgeneralized" | "undergeneralized"
  | "contradictory" | "unsupported" | "irrelevant" | "ambiguous" | "missing";

export type SemanticAdjudication = {
  adjudicationId: string;
  groundTruthPropositionId: string;
  recoveredPropositionId?: string;
  classification: MatchClassification;
  meaningAgreement: number;
  polarityAgreement: boolean;
  modalityAgreement: boolean;
  temporalAgreement: boolean;
  causalAgreement?: boolean;
  confidenceAgreement?: { overlap: number; absoluteError?: number; directionallyCorrect: boolean };
  lineageAgreement?: number;
  justification: string;
  adjudicatorConfidence: number;
  requiresHumanReview: boolean;
  adjudicatorRecordRef: string;
};

export type EvaluationPenalty = { code: string; propositionRefs: string[]; magnitude: number; justification: string };
export type EvaluationGateFailure = { code: string; blocking: true; propositionRefs: string[]; justification: string };
export type EvaluationDimension = "correctness" | "materialCoverage" | "contradictionQuality" | "causalQuality" | "confidenceCalibration" | "uncertaintyDiscipline" | "evidenceGapQuality" | "decisionRelevantUtility";

export type EvaluationLedger = {
  ledgerVersion: "evaluation-ledger/v1";
  caseId: string;
  organizationId: string;
  treatmentRunId: string;
  evaluatorVersion: typeof ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION;
  propositionAdjudications: SemanticAdjudication[];
  dimensionScores: Record<EvaluationDimension, number>;
  penalties: EvaluationPenalty[];
  blockingFailures: EvaluationGateFailure[];
  compositeScore?: number;
  classificationEligibility: boolean;
  inputHashes: string[];
  outputHash: string;
};

export type BlindedAdjudicationRequest = {
  evaluatorVersion: typeof ORGANIZATIONAL_UNDERSTANDING_EVALUATOR_PHASE_1_VERSION;
  caseId: string;
  groundTruth: OrganizationalUnderstandingProposition[];
  recovered: RecoveredProposition[];
  relevantEvidence: Array<{ id: string; content: string }>;
  rubricVersion: string;
  inputHash: string;
};
