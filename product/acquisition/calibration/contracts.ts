import type { MaterialAcquisitionCandidateEnvelope, MaterialInformationAcquisitionInput, MaterialInformationAcquisitionResult } from "../contracts";
import type { ProductConfidenceImprovementGovernedEvent, ProductConfidenceImprovementOutcomeObservation } from "../../improvements/contracts";

export const CALIBRATION_MANIFEST_SCHEMA_VERSION = "2" as const;
export const CALIBRATION_PROGRAM_ID = "material-information-acquisition-independent-calibration-002" as const;

export type CalibrationPhase =
  | "draft" | "preregistered" | "human-choice-recorded" | "human-choice-reloaded"
  | "selector-compared" | "outcome-observed" | "closed" | "blocked";
export type DeclaredValue = string | { state: "not-applicable" | "unavailable" | "withheld" | "unmeasured" };
export type HumanDisposition = "authorize" | "decline" | "defer";
export type ExecutionAuthorization = "execute-existing-local-read-only-operation" | "do-not-execute" | "defer-execution";
export type CalibrationManifestClassification = "controlled-protocol-fixture" | "live-independent-calibration";
export type CalibrationPreparationResult =
  | { status: "eligible-live-independent-calibration"; manifestClassification: "live-independent-calibration" }
  | { status: "eligible-controlled-protocol-fixture"; manifestClassification: "controlled-protocol-fixture" }
  | { status: "ineligible"; reason: string }
  | { status: "blocked"; reason: string };

export type CalibrationSafetyGates = {
  validatedDevelopmentEnvironment: true;
  exactOrganizationAuthorization: true;
  canonicalQuestionAndUnknown: true;
  sameOrganizationReferences: true;
  selectorImportDeferred: true;
  runtimeWritesForbidden: true;
  connectorAndExternalActionForbidden: true;
  productionForbidden: true;
};

export type CalibrationPreregistrationManifest = {
  manifestSchemaVersion: typeof CALIBRATION_MANIFEST_SCHEMA_VERSION;
  calibrationProgramId: typeof CALIBRATION_PROGRAM_ID;
  caseId: string;
  proposedClassification: CalibrationManifestClassification;
  classificationRationale: string;
  phase: "preregistered";
  repositoryCommit: string;
  selector: { identity: "material-information-acquisition-shadow-selector-v1"; sourceHash: string };
  versions: {
    candidateEnvelopeSchema: "1";
    candidateEnvelopeProjector: "1";
    confidenceImprovementEvent: "3";
    outcomeObservation: "1";
  };
  frozenSourceHashes: Record<string, string>;
  organizationId: string;
  principal: { pseudonymousRef: string; authorityRef: string };
  question: { questionId: string; revision: number; exactText: string };
  unknown: { unknownId: string; revisionRef: string; exactText: string; whyItMatters: string };
  understandingRef: string;
  authorizedUnderstandingSummary: string;
  objectiveVersion: DeclaredValue;
  optimizationContextVersion: DeclaredValue;
  evidenceBoundaryDigest: string;
  sourceReferenceDigests: string[];
  candidateEnvelopes: Array<{ envelope: MaterialAcquisitionCandidateEnvelope; digest: string; candidateType: string; neutralDescription: string; limitations: string[] }>;
  neutralDisplayOrder: string[];
  candidateSetDigest: string;
  allowedHumanDispositions: HumanDisposition[];
  executionAuthorizationChoices: ExecutionAuthorization[];
  plannedComparisonMeasures: string[];
  plannedDisagreementClassifications: string[];
  holdoutStatus: "untouched" | "exposed" | "not-applicable";
  priorExposureStatus: "none" | "human-packet" | "selector-output";
  outcomeAvailability: "available" | "unavailable" | "not-applicable" | "unmeasured";
  missingOutcomeFields: string[];
  hardSafetyGates: CalibrationSafetyGates;
  preregisteredAt: string;
  manifestDigest: string;
};
export type CalibrationDraftManifest = Omit<CalibrationPreregistrationManifest, "phase" | "manifestDigest"> & { phase: "draft" };

export type HumanChoiceArtifact = {
  artifactVersion: "1"; phase: "human-choice-recorded"; caseId: string; organizationId: string;
  predecessorManifestDigest: string; disposition: HumanDisposition; executionAuthorization: ExecutionAuthorization;
  selectedCandidateId: string; rationale: string; recordedAt: string;
  canonicalEventSchemaVersion: "3";
  canonicalOwner: { identity: "product-confidence-improvement"; version: "3" };
  canonicalReceiptSnapshot: Omit<ProductConfidenceImprovementGovernedEvent, "kind" | "schemaVersion" | "operationFingerprint">;
  canonicalReceiptDigest: string;
  canonicalEventRef: string;
  idempotencyIdentity: string;
  runtimeRevision: string;
  artifactDigest: string;
};
export type HumanChoiceReloadVerification = {
  artifactVersion: "1"; phase: "human-choice-reloaded"; caseId: string; organizationId: string;
  predecessorChoiceDigest: string; canonicalReceiptDigest: string; canonicalEventRef: string;
  canonicalOperationId: string; reloadedRuntimeRevision: string; independentlyReloaded: true;
  verifiedAt: string; artifactDigest: string;
};
export type SelectorComparisonArtifact = {
  artifactVersion: "1"; phase: "selector-compared"; caseId: string; organizationId: string;
  predecessorReloadDigest: string; selectorResult: MaterialInformationAcquisitionResult;
  runtimeWriteCount: 0; comparedAt: string; artifactDigest: string;
};
export type OutcomeArtifact = {
  artifactVersion: "1"; phase: "outcome-observed"; caseId: string; organizationId: string;
  predecessorComparisonDigest: string; canonicalChoiceReceiptDigest: string;
  outcome:
    | { state: "unmeasured"; reason: string; missingOutcomeFields: string[] }
    | { state: "canonical-observation"; observationId: string; observationVersion: number; observationDigest: string; snapshot: ProductConfidenceImprovementOutcomeObservation };
  observedAt: string; artifactDigest: string;
};

export type CalibrationValidationContext = {
  repositoryCommit: string;
  sourceHashes: Record<string, string>;
  existingQuestions: Array<{ organizationId: string; questionId: string; revision: number }>;
  existingUnknowns: Array<{ organizationId: string; questionId: string; unknownId: string; revisionRef: string }>;
};

export type CalibrationComparisonInput = MaterialInformationAcquisitionInput;
