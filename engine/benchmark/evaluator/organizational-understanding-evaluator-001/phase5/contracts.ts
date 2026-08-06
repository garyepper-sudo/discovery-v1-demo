import type { ConfidenceRepresentation, MatchClassification, PropositionFamily } from "../contracts";
import type { AdjudicatorBlinding, ImportedSemanticAdjudication } from "../phase4Contracts";

export const PHASE_5_STUDY_VERSION = "oue-001-phase-5-human-study/v1" as const;
export const PHASE_5_RESPONSE_VERSION = "oue-001-phase-5-human-response/v1" as const;
export const PHASE_5_LEDGER_VERSION = "oue-001-phase-5-study-ledger/v1" as const;

export type Difficulty = "clear" | "moderate" | "difficult" | "genuinely-ambiguous";
export type StudyPartition = "training" | "qualification" | "confirmatory" | "holdout";

export type ReviewerEligibilityRecord = {
  blindedReviewerId: string;
  experienceCategory: "organizational-analysis" | "structured-research" | "general-professional";
  trainingCompleted: boolean;
  qualificationPassed: boolean;
  conflictAttestation: boolean;
  priorDiscoveryExposure: boolean;
  priorBenchmarkExposure: boolean;
  independenceAttestation: boolean;
  treatmentBlindingAttestation: boolean;
  answerKeyAccessed: false;
  completedAt: string;
};

export type BlindedHumanStudyPacket = {
  studyVersion: typeof PHASE_5_STUDY_VERSION;
  packetId: string;
  partition: StudyPartition;
  family: PropositionFamily;
  difficulty: Difficulty;
  neutralLabelA: string;
  neutralLabelB: string;
  propositionA: string;
  propositionB: string;
  structuredContext: {
    polarity: string[];
    modality: string[];
    temporality: string[];
    supportingEvidence: string[];
    opposingEvidence: string[];
    relationshipContext: string[];
  };
  rubricVersion: string;
  requiredResponseFields: string[];
  displayOrderSeed: string;
  packetHash: string;
};

export type HumanStudyResponse = {
  responseVersion: typeof PHASE_5_RESPONSE_VERSION;
  studyVersion: typeof PHASE_5_STUDY_VERSION;
  packetId: string;
  packetHash: string;
  reviewer: ReviewerEligibilityRecord;
  importedAdjudication: ImportedSemanticAdjudication;
  classification: MatchClassification;
  meaningAgreement: number;
  polarityAgreement: boolean;
  modalityAgreement: boolean;
  temporalAgreement: boolean;
  causalAgreement?: boolean;
  endpointFidelity?: number;
  confidenceAgreement?: boolean;
  lineageAgreement?: number;
  escalationRequired: boolean;
  reviewerConfidence: ConfidenceRepresentation;
  justification: string;
  startedAt: string;
  completedAt: string;
  provenance: "genuine-human" | "synthetic-transport-fixture";
  inputHash: string;
  outputHash: string;
};

export type InvalidHumanResponse = { responseHash?: string; packetId?: string; reviewerId?: string; reasons: string[]; preservedAt: string; excludedFromEvidence: true };

export type AgreementAnalysis = {
  itemCount: number;
  reviewerCount: number;
  exactAgreement: number | null;
  adjacentAgreement: number | null;
  cohensKappa: number | null;
  fleissKappa: number | null;
  krippendorffsAlphaNominal: number | null;
  classSpecificAgreement: Record<string, number | null>;
  confusionMatrix: Record<string, Record<string, number>>;
  polarityAgreement: number | null;
  modalityAgreement: number | null;
  temporalAgreement: number | null;
  causalAgreement: number | null;
  endpointFidelityAgreement: number | null;
  escalationAgreement: number | null;
  meaningAgreementMeanAbsoluteDifference: number | null;
  intraclassCorrelation: number | null;
  prevalenceWarning?: string;
};

export type HumanGoldSetItem = {
  packetId: string;
  packetHash: string;
  family: PropositionFamily;
  difficulty: Difficulty;
  holdout: boolean;
  classification: MatchClassification;
  originalResponseHashes: string[];
  consensusProcess: string;
  rationale: string;
  rubricVersion: string;
  confidence: ConfidenceRepresentation;
  reviewerProvenance: string[];
  fixtureAuthored: false;
  itemHash: string;
};

export type Phase5StudyLedger = {
  ledgerVersion: typeof PHASE_5_LEDGER_VERSION;
  studyVersion: typeof PHASE_5_STUDY_VERSION;
  preregistrationHash: string;
  trainingPacketHashes: string[];
  qualificationPacketHashes: string[];
  confirmatoryPacketHashes: string[];
  holdoutPacketHashes: string[];
  validResponseHashes: string[];
  invalidResponseHashes: string[];
  genuineHumanResponseCount: number;
  syntheticTransportFixtureCount: number;
  agreementAnalysisHash?: string;
  goldSetHashes: string[];
  classification: "STUDY READY — HUMAN RESPONSES NOT YET AVAILABLE" | "PASS — Human semantic adjudication validated" | "BOUNDED PASS — Human semantic adjudication validated within declared bounds" | "FAIL — Human semantic adjudication insufficiently reliable" | "BLOCKED";
  outputHash: string;
};

export const requiredBlinding: AdjudicatorBlinding = Object.freeze({ treatmentIdentity: true, aggregateScore: true, otherTreatmentOutputs: true, expectedWinner: true, commercialImplications: true, discoveryOrigin: true, benchmarkClassification: true });

