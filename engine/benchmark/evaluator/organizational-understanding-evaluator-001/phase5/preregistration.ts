import { canonicalHash } from "../canonicalSerialization";
import { SEMANTIC_ADJUDICATION_RUBRIC_VERSION } from "../phase4Contracts";
import { PHASE_5_STUDY_VERSION } from "./contracts";

export const phase5Preregistration = Object.freeze({
  studyVersion: PHASE_5_STUDY_VERSION,
  frozenBeforeGenuineResponses: true,
  reviewerEligibility: Object.freeze({ minimumInitialReviewersPerItem: 2, preferredInitialReviewersPerItem: 3, materialDisagreementRequiresIndependentThirdReviewerOrBlindedConsensus: true, discoveryExpertiseRequired: false, duplicateReviewerIdentityProhibited: true }),
  sample: Object.freeze({ externalComparativeValidation002OutputsProhibited: true, allTenFamiliesRequired: true, trainingSeparatedFromConfirmatory: true, protectedHoldoutRequired: true, answerKeysSeparated: true }),
  responseSchemaVersion: "oue-001-phase-5-human-response/v1",
  rubricVersion: SEMANTIC_ADJUDICATION_RUBRIC_VERSION,
  allowedReferences: Object.freeze(["frozen packet", "frozen rubric", "reviewer instructions"]),
  prohibitedReferences: Object.freeze(["treatment identity", "Discovery origin", "aggregate score", "other reviewer responses", "answer key"]),
  agreementMetrics: Object.freeze(["exact agreement", "adjacent agreement", "Cohen kappa", "Fleiss kappa", "Krippendorff alpha nominal", "class-specific agreement", "confusion matrix", "field agreement", "mean absolute difference", "intraclass correlation"]),
  thresholds: Object.freeze({ exactClassificationAgreementMinimum: 0.85, adjacentMaterialAgreementMinimum: 0.92, chanceCorrectedAgreementMinimum: 0.8, polarityAgreementMinimum: 0.98, modalityAgreementMinimum: 0.95, temporalAgreementMinimum: 0.95, causalAgreementMinimum: 0.9, contradictionEndpointAgreementMinimum: 0.95, highImportanceUnresolvedMaximum: 0.05, treatmentIdentityLeakageMaximum: 0, packetOrVersionMismatchAcceptedMaximum: 0, minimumConfirmatoryItemsForStableEstimate: 30 }),
  adjacentPairs: Object.freeze([Object.freeze(["exact", "equivalent"]), Object.freeze(["equivalent", "partial"]), Object.freeze(["partial", "undergeneralized"]), Object.freeze(["partial", "overgeneralized"])]),
  neverAdjacent: Object.freeze([Object.freeze(["equivalent", "contradictory"]), Object.freeze(["equivalent", "unsupported"]), Object.freeze(["exact", "irrelevant"])]),
  confidenceTreatment: Object.freeze({ confirmatoryMinimum: 0.75, lowConfidenceRequiresEscalation: true, confidenceNeverChangesSemanticCredit: true }),
  exclusionRules: Object.freeze(["missing provenance", "duplicate reviewer identity", "answer-key exposure", "treatment exposure", "packet mismatch", "rubric mismatch", "incomplete response", "malformed audit metadata"]),
  goldAdmission: Object.freeze(["packet integrity", "independence", "blinding", "complete fields", "resolved judgment", "confidence threshold", "no rubric defect", "no unresolved material disagreement", "complete lineage"]),
  classificationRules: Object.freeze({ noGenuineResponses: "STUDY READY — HUMAN RESPONSES NOT YET AVAILABLE", genuineResponsesAllGates: "PASS — Human semantic adjudication validated", insufficientSample: "inconclusive; thresholds may not be lowered" }),
});

export const phase5PreregistrationHash = canonicalHash(phase5Preregistration);

