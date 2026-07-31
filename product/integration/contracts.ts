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
  ProductAnswer,
  ProductAnswerConfidence,
  ProductQuestionWorkspace,
} from "../workflow/contracts";

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
};

export type HistoricalAnswerSource = Pick<
  ProductAnswer,
  "id" | "revision" | "conclusion" | "confidence" | "principalLimiter" | "generatedAt"
>;
