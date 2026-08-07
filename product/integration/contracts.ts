import type { ProductQuestionStatus } from "../questions/contracts";
import type {
  ProductAnswerOperationReceipt,
  ProductAnswerOperationResult,
  ProductAnswerProjection,
} from "../answers/contracts";
import type {
  ProductUnknownOperationReceipt,
  ProductUnknownProjection,
} from "../unknowns/contracts";
import type {
  ProductConfidenceImprovementOutcomeObservation,
  ProductConfidenceImprovementProposal,
  ProductConfidenceImprovementReceipt,
  ProductLocalInformationOperationResult,
  ProductConfidenceImprovementResult,
} from "../improvements";
import type { MaterialAcquisitionCandidateEnvelope } from "../acquisition";
import type {
  ProductObjectiveRecommendationEligibility,
  ProductUnderstandingRecommendation,
} from "../recommendations/contracts";
import type {
  ProductAnswer,
  ProductAnswerConfidence,
  ProductQuestionWorkspace,
} from "../workflow/contracts";
import type {
  ProductObjectiveContextResolution,
  ProductOptimizationContext,
  ProductOrganizationalObjective,
} from "../objectives";
import type {
  CanonicalEvidenceAdmissionOperationBatchV1,
  CanonicalEvidenceAdmissionOperationItemV1,
  CanonicalEvidenceScopeAdmission,
} from "../../engine/v3/governance/canonicalScopeLineage";

export type ProductQuestionSummary = {
  id: string;
  organizationId: string;
  title: string;
  status: ProductQuestionStatus;
  updatedAt: string;
  currentSupport: "no-answer" | "low" | "moderate" | "high";
  activeDecisionStatus: "none" | "draft" | "committed" | "monitoring";
  hasUnresolvedChange: boolean;
};

export type ProductQuestionAdoptionReceipt = {
  organizationId: string;
  questionId: string;
  sourceType: "legacy-investigation" | "legacy-product-record";
  sourceId: string;
  status: "adopted" | "already-adopted" | "partially-adopted" | "rejected";
  adoptedReferences: string[];
  unresolvedReferences: string[];
  reason: string | null;
};

export type ProductHistoricalAnswerResolution =
  | {
      status: "resolved";
      answerId: string;
      questionRevision: number;
      conclusion: string;
      confidence: ProductAnswerConfidence;
      principalLimiter: string;
      generatedAt: string;
      sourceReference: { type: "product-answer"; id: string };
    }
  | {
      status: "unavailable";
      answerId: string;
      questionRevision: number;
      reason:
        | "source-missing"
        | "source-incompatible"
        | "not-customer-safe"
        | "authorization-denied"
        | "relevance-not-proven";
    };

export type CanonicalWorkspaceReadResult = {
  workspace: ProductQuestionWorkspace;
  runtimeRevision: string;
};

export type CanonicalAnswerRefreshResult = {
  result: ProductAnswerOperationResult;
  receipt: ProductAnswerOperationReceipt;
  runtimeRevision: string;
};

export type CanonicalAnswerReadResult = {
  answer: ProductAnswerProjection | null;
  runtimeRevision: string;
};

export type CanonicalUnknownMutationResult = {
  unknown: ProductUnknownProjection;
  receipt: ProductUnknownOperationReceipt;
  runtimeRevision: string;
};

export type CanonicalUnknownReadResult = {
  unknowns: ProductUnknownProjection[];
  runtimeRevision: string;
};

export type CanonicalImprovementProposalResult = {
  result: ProductConfidenceImprovementResult;
  runtimeRevision: string;
};

export type CanonicalImprovementAuthorizationResult = {
  receipt: ProductConfidenceImprovementReceipt;
  unknown: ProductUnknownProjection;
  runtimeRevision: string;
};

export type CanonicalImprovementEnvelopeResult = {
  envelope: MaterialAcquisitionCandidateEnvelope;
  runtimeRevision: string;
};

export type CanonicalImprovementOutcomeResult = {
  observation: ProductConfidenceImprovementOutcomeObservation;
  idempotent: boolean;
  runtimeRevision: string;
};

export type CanonicalLocalInformationOperationResult = {
  result: ProductLocalInformationOperationResult;
  idempotent: boolean;
  runtimeRevision: string;
};

export type CanonicalImprovementProposalInput = ProductConfidenceImprovementProposal;

export type CanonicalUnderstandingRecommendationResult = {
  recommendations: ProductUnderstandingRecommendation[];
  proposalResult: ProductConfidenceImprovementResult;
  runtimeRevision: string;
};

export type CanonicalObjectiveRecommendationEligibilityResult = {
  eligibility: ProductObjectiveRecommendationEligibility;
  runtimeRevision: string;
};

export type CanonicalObjectiveMutationResult = {
  objective: ProductOrganizationalObjective;
  objectiveVersionRef: string;
  idempotent: boolean;
  runtimeRevision: string;
};

export type CanonicalOptimizationContextMutationResult = {
  optimizationContext: ProductOptimizationContext;
  optimizationContextVersionRef: string;
  idempotent: boolean;
  runtimeRevision: string;
};

export type CanonicalObjectiveContextResolutionResult = {
  resolution: ProductObjectiveContextResolution;
  runtimeRevision: string;
};

export type CanonicalEvidenceContribution = {
  sourceId: string;
  sourceType: "manual_upload" | "paste" | "authorized_records";
  content: string;
  contributedAt: string;
  idempotencyKey: string;
  priorIdempotencyKeys?: string[];
};

export type CanonicalInvestigationResult = {
  runtime: import("../../engine/v3/runtime/organizationRuntime").OrganizationRuntime;
  evidenceAccepted: boolean;
  canonicalEvidenceAdmissionBatch?: CanonicalEvidenceAdmissionOperationBatchV1;
};

export type CanonicalEvidenceAdmissionPreflight = CanonicalEvidenceScopeAdmission;

export type CanonicalEvidenceCognitionDisposition =
  | "executed"
  | "exact-operation-replay"
  | "no-new-canonical-input"
  | "historical-unavailable";

export type CanonicalEvidenceContributionOperationRecordV1 = {
  kind: "canonical-evidence-contribution-operation";
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  contributionOperationId: string;
  idempotencyKeyDigest: string;
  requestFingerprint: string;
  canonicalAdmissionBatch: CanonicalEvidenceAdmissionOperationBatchV1;
  cognitionDisposition?: Exclude<CanonicalEvidenceCognitionDisposition, "exact-operation-replay" | "historical-unavailable">;
  evidenceAccepted: boolean;
  productQuestionRevisionBefore: number;
  productQuestionRevisionAfter: number;
  recordedAt: string;
  recordDigest: string;
};

export type CanonicalEvidenceContributionOperationResultV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  contributionOperationId: string;
  operationDisposition: "admitted" | "partially-admitted" | "idempotent-replay" | "not-admitted";
  cognitionDisposition: CanonicalEvidenceCognitionDisposition;
  admissions: CanonicalEvidenceAdmissionOperationItemV1[];
  evidenceAccepted: boolean;
  runtimeRevisionBefore: string;
  runtimeRevisionAfter: string;
  productQuestionRevisionBefore: number;
  productQuestionRevisionAfter: number;
  canonicalResultDigest: string;
};

export type CanonicalEvidenceContributionMutationResultV1 = CanonicalWorkspaceReadResult & {
  contributionResult: CanonicalEvidenceContributionOperationResultV1;
};

export type HistoricalAnswerSource = Pick<
  ProductAnswer,
  "id" | "revision" | "conclusion" | "confidence" | "principalLimiter" | "generatedAt"
>;
